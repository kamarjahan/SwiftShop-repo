"use client";

import { useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Tag, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Coupons", href: "/admin/coupons", icon: Tag }, 
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Support", href: "/admin/support", icon: MessageSquare },
    { label: "Home Settings", href: "/admin/home-customization", icon: LayoutDashboard },
  ];

  // Check 2: Layout Level Routing Redirect
  useEffect(() => {
    if (!loading && user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check 3: Physical Render Guard
  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-bento-card border-r border-bento-border hidden md:flex flex-col">
        <div className="p-6 border-b border-bento-border">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Swift<span className="text-slate-500">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                  isActive 
                    ? "bg-foreground text-background" 
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-bento-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-foreground/10 overflow-hidden">
              {user?.photoURL && <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="text-sm font-bold line-clamp-1">{userData?.displayName || 'Admin'}</p>
              <p className="text-xs text-foreground/50 line-clamp-1">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col">
        <div className="md:hidden p-4 border-b border-bento-border bg-bento-card flex items-center justify-between">
          <span className="font-black">SwiftAdmin</span>
          {/* Mobile menu toggle would go here */}
        </div>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
