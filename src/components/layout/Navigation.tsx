"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, Home, User, Heart } from 'lucide-react';
import { useCart } from "@/store/useCart";

export default function Navigation() {
  const { toggleCart, items } = useCart();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-bento-border/50 items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Swift<span className="text-slate-500">Shop</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-foreground/80">
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
            <Link href="/deals" className="hover:text-foreground transition-colors">Deals</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer">
            <Search className="w-5 h-5 text-foreground/60 group-hover:text-foreground transition-colors" />
          </div>
          <Link href="/account" className="relative group">
            <User className="w-5 h-5 text-foreground/60 group-hover:text-foreground transition-colors" />
          </Link>
          <button onClick={toggleCart} className="relative group flex items-center">
            <ShoppingCart className="w-5 h-5 text-foreground/60 group-hover:text-foreground transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden flex sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-bento-border/50 items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tighter">
          Swift<span className="text-slate-500">Shop</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Search className="w-5 h-5 text-foreground/80" />
          <button onClick={toggleCart} className="relative">
            <ShoppingCart className="w-5 h-5 text-foreground/80" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-bento-border pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <Link href="/" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
