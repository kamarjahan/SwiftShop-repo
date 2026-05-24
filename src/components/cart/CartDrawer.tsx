"use client";

import { useCart } from "@/store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-bento-card shadow-2xl border-l border-bento-border z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-bento-border flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> Your Cart
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-bold">Your cart is empty.</p>
                  <button onClick={() => setIsOpen(false)} className="mt-4 px-6 py-2 bg-foreground text-background rounded-full font-bold hover:bg-foreground/90 transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-background border border-bento-border p-3 rounded-2xl relative group">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative flex-shrink-0">
                      <img src={item.image || item.images?.[0] || ""} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1 pr-6">{item.name}</h4>
                      <p className="font-black text-sm mt-1">₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2 bg-foreground/5 w-fit rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-background rounded shadow-sm"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-background rounded shadow-sm"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-bento-border bg-foreground/5">
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-bento-border flex justify-between items-end">
                    <span className="font-bold">Estimated Total</span>
                    <span className="text-3xl font-black">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link 
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-foreground text-background py-4 rounded-xl font-black text-lg hover:bg-foreground/90 transition-colors flex justify-center items-center h-14"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
