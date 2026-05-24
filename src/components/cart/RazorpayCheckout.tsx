"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CartItem } from "@/store/useCart";
import Script from "next/script";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutProps {
  total: number;
  items: CartItem[];
}

export default function RazorpayCheckout({ total, items }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    setLoading(true);

    try {
      // Create order on the server
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await response.json();

      if (!orderData.id) {
        throw new Error("Failed to create Razorpay order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SwiftShop",
        description: "Premium Order Payment",
        order_id: orderData.id,
        handler: async function (response: any) {
          // Send verification request to server
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items,
              userId: user.uid
            }),
          });
          
          if (verifyRes.ok) {
            alert("Payment successful! Order placed.");
            // In a real app: clearCart(), redirect to success page
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
         alert(response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Error initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <button 
        onClick={handlePayment}
        disabled={loading || items.length === 0}
        className="w-full bg-foreground text-background py-4 rounded-xl font-black text-lg hover:bg-foreground/90 transition-colors flex justify-center items-center h-14 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Checkout • ₹${total.toFixed(2)}`}
      </button>
    </>
  );
}
