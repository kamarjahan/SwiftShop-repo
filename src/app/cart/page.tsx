"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/useCart";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, appliedCoupon, setAppliedCoupon } = useCart();
  const { user } = useAuth();
  
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const baseShipping = subtotal > 1000 ? 0 : 50;

  // Calculate Discount
  let discountAmount = 0;
  let finalShipping = baseShipping;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === "free_shipping") {
      finalShipping = 0;
    }
    // ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const total = subtotal + tax + finalShipping - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    
    try {
      const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setCouponError("Invalid coupon code.");
        setCouponLoading(false);
        return;
      }

      const coupon = snap.docs[0].data();
      const now = new Date();
      const start = new Date(coupon.startDate);
      const end = new Date(coupon.endDate);

      if (now < start || now > end) {
        setCouponError("This coupon is expired or not active yet.");
        setCouponLoading(false);
        return;
      }

      if (coupon.minAmount > 0 && subtotal < coupon.minAmount) {
        setCouponError(`Minimum order amount of ₹${coupon.minAmount} required.`);
        setCouponLoading(false);
        return;
      }

      // Check max uses if we tracked them, skipping for now unless we implement order incrementing
      // Check limitNewCustomer would require checking past orders. Skipping for brevity unless strict.

      setAppliedCoupon(coupon);
      setCouponCode("");
    } catch (err) {
      console.error(err);
      setCouponError("Error validating coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-foreground/20" />
        </div>
        <h1 className="text-4xl font-black mb-4">Your Cart is Empty</h1>
        <p className="text-foreground/60 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest products and deals!
        </p>
        <Link 
          href="/shop" 
          className="bg-foreground text-background px-8 py-4 rounded-full font-black text-lg hover:bg-foreground/90 transition-all flex items-center gap-2"
        >
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8" /> Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart Items List */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 md:gap-6 items-center border-b border-bento-border/50 pb-6 last:border-0 last:pb-0">
                <Link href={`/product/${item.id.split('-')[0]}`} className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image || item.images?.[0] || ""} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Link href={`/product/${item.id.split('-')[0]}`} className="font-bold text-lg hover:text-blue-500 transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xl font-black mt-2">₹{item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-background border border-bento-border rounded-lg overflow-hidden shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-3 hover:bg-foreground/5 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3 hover:bg-foreground/5 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="p-3 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex flex-col items-center justify-center group"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-xl font-black mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Coupon ({appliedCoupon.code})
                  </span>
                  <span className="font-bold">
                    {appliedCoupon.discountType === "free_shipping" 
                      ? "Free Shipping Applied" 
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

            {/* Coupon Entry */}
            {!appliedCoupon && (
              <div className="mt-6 pt-6 border-t border-bento-border">
                <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Apply Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-foreground text-background px-6 font-bold rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
              </div>
            )}
            
            {appliedCoupon && (
              <div className="mt-6 pt-6 border-t border-bento-border">
                <button 
                  onClick={() => setAppliedCoupon(null)}
                  className="w-full py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove Coupon
                </button>
              </div>
            )}

            <Link 
              href="/checkout"
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center shadow-lg hover:shadow-orange-500/25 block text-center"
            >
              Proceed to Buy
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bento-card border border-bento-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl mb-1">🔒</span>
              <span className="text-xs font-bold text-foreground/70">Secure Payment</span>
            </div>
            <div className="bg-bento-card border border-bento-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl mb-1">📦</span>
              <span className="text-xs font-bold text-foreground/70">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
