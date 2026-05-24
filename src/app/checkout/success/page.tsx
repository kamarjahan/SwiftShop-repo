"use client";

import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fire confetti on successful mount
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f97316', '#eab308', '#22c55e']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f97316', '#eab308', '#22c55e']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl scale-150" />
        <CheckCircle className="w-24 h-24 text-green-500 relative z-10" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Order Placed Successfully!</h1>
      <p className="text-foreground/70 mb-8 text-lg">
        Thank you for shopping with SwiftShop. Your order is being processed and you will receive a confirmation email shortly.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/shop" 
          className="bg-foreground text-background px-8 py-4 rounded-xl font-black text-lg hover:bg-foreground/90 transition-all flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" /> Continue Shopping
        </Link>
        <Link 
          href="/" 
          className="bg-bento-card border border-bento-border px-8 py-4 rounded-xl font-bold text-lg hover:bg-foreground/5 transition-all flex items-center justify-center"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
