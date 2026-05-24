"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Script from "next/script";
import { Loader2, ArrowRight, ShieldCheck, Tag } from "lucide-react";

export default function CheckoutPage() {
  const { items, appliedCoupon, clearCart } = useCart();
  const { user, userData } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod or online

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
  });
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && userData?.address) {
      setAddress({
        fullName: userData.address.fullName || user.displayName || "",
        phone: userData.address.phone || "",
        pincode: userData.address.pincode || "",
        flat: userData.address.flat || "",
        area: userData.address.area || "",
        landmark: userData.address.landmark || "",
        city: userData.address.city || "",
        state: userData.address.state || "",
      });
    } else if (user) {
      setAddress(prev => ({ ...prev, fullName: user.displayName || "" }));
    }
  }, [user, userData]);

  if (!mounted) return null;

  if (items.length === 0 && !orderPlaced) {
    router.push("/cart");
    return null;
  }

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  let finalShipping = subtotal > 1000 ? 0 : 50;
  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === "free_shipping") {
      finalShipping = 0;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const total = subtotal + tax + finalShipping - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const saveOrderToFirestore = async (paymentStatus: string, paymentId?: string) => {
    const orderData = {
      userId: user?.uid || "guest",
      items,
      subtotal,
      tax,
      shipping: finalShipping,
      discountAmount,
      total,
      appliedCoupon: appliedCoupon?.code || null,
      shippingAddress: address,
      paymentMethod,
      paymentStatus,
      paymentId: paymentId || null,
      status: "Processing",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    // Save address if requested and user is logged in
    if (saveAddress && user) {
      await setDoc(doc(db, "users", user.uid), { address }, { merge: true });
    }

    return docRef.id;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);

    if (paymentMethod === "cod") {
      try {
        await saveOrderToFirestore("Pending (COD)");
        setOrderPlaced(true);
        clearCart();
        router.push("/checkout/success");
      } catch (err) {
        console.error(err);
        alert("Error placing order. Please try again.");
        setLoading(false);
      }
    } else {
      // Razorpay Flow
      try {
        const response = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });
        const orderData = await response.json();

        if (!orderData.id) throw new Error("Failed to create Razorpay order");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "SwiftShop",
          description: "Order Payment",
          order_id: orderData.id,
          handler: async function (res: any) {
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: res.razorpay_order_id,
                  razorpay_payment_id: res.razorpay_payment_id,
                  razorpay_signature: res.razorpay_signature,
                  items,
                  userId: user.uid
                }),
              });
              
              if (verifyRes.ok) {
                await saveOrderToFirestore("Paid", res.razorpay_payment_id);
                setOrderPlaced(true);
                clearCart();
                router.push("/checkout/success");
              } else {
                alert("Payment verification failed.");
                setLoading(false);
              }
            } catch (err) {
              console.error(err);
              alert("Error verifying payment.");
              setLoading(false);
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
            email: user.email || "",
          },
          theme: { color: "#000000" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           alert(response.error.description);
           setLoading(false);
        });
        rzp.open();
      } catch (error) {
        console.error(error);
        alert("Error initiating payment.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Forms */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-xl font-black mb-6">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground/80 mb-2">Full Name</label>
                <input required type="text" name="fullName" value={address.fullName} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground/80 mb-2">Mobile Number</label>
                <input required type="tel" name="phone" value={address.phone} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2">Pincode</label>
                <input required type="text" name="pincode" value={address.pincode} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2">Town / City</label>
                <input required type="text" name="city" value={address.city} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground/80 mb-2">Flat, House no., Building, Company, Apartment</label>
                <input required type="text" name="flat" value={address.flat} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground/80 mb-2">Area, Street, Sector, Village</label>
                <input required type="text" name="area" value={address.area} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2">Landmark</label>
                <input type="text" name="landmark" value={address.landmark} onChange={handleInputChange} placeholder="E.g. near apollo hospital" className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2">State</label>
                <input required type="text" name="state" value={address.state} onChange={handleInputChange} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
            </div>
            
            {user && (
              <label className="flex items-center gap-3 mt-6 cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 accent-foreground" />
                <span className="text-sm font-bold text-foreground/80">Save this address to my account for future use</span>
              </label>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-500" /> Payment Method</h2>
            
            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-foreground bg-foreground/5' : 'border-bento-border hover:border-foreground/30'}`}>
                <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 accent-foreground" />
                <div>
                  <h4 className="font-bold text-base">Pay Online (Razorpay)</h4>
                  <p className="text-xs text-foreground/60">Credit/Debit Card, NetBanking, UPI, Wallets</p>
                </div>
              </label>
              
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-foreground bg-foreground/5' : 'border-bento-border hover:border-foreground/30'}`}>
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-foreground" />
                <div>
                  <h4 className="font-bold text-base">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-foreground/60">Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </div>
          
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-xl font-black mb-6">Order Details</h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-start gap-4 text-sm border-b border-bento-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-3">
                    <span className="font-bold text-foreground/50">{item.quantity}x</span>
                    <span className="font-medium line-clamp-2">{item.name}</span>
                  </div>
                  <span className="font-bold whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm font-medium border-t border-bento-border pt-4">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Coupon ({appliedCoupon.code})
                  </span>
                  <span className="font-bold">
                    {appliedCoupon.discountType === "free_shipping" 
                      ? "Free Shipping" 
                      : `-₹${discountAmount.toFixed(2)}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-foreground/70">
                <span>Tax (8%)</span>
                <span className="font-bold text-foreground">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Shipping</span>
                <span className="font-bold text-foreground">
                  {finalShipping === 0 ? "Free" : `₹${finalShipping.toFixed(2)}`}
                </span>
              </div>

              <div className="pt-4 border-t border-bento-border flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="text-3xl font-black">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-foreground text-background py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center shadow-lg hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Place Order"}
            </button>
            <p className="text-center text-xs font-bold text-foreground/40 mt-4 px-4">
              By placing your order, you agree to SwiftShop's Terms of Use & Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
