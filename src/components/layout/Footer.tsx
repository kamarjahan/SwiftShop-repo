"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-bento-border bg-bento-card py-12 md:py-16 mt-auto pb-24 md:pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-black tracking-tighter">
              Swift<span className="text-slate-500">Shop</span>
            </Link>
            <p className="mt-4 text-sm text-foreground/60 leading-relaxed">
              Curated premium goods delivered with speed. Experience the future of e-commerce.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/shop" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/categories/electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link href="/categories/fashion" className="hover:text-foreground transition-colors">Fashion</Link></li>
              <li><Link href="/deals" className="hover:text-foreground transition-colors">Flash Sales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-foreground transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-foreground transition-colors">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-bento-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-foreground/40 w-full">
            &copy; {new Date().getFullYear()} SwiftShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
