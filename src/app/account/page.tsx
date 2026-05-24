"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { User, LogOut, Package, Heart } from "lucide-react";

export default function AccountPage() {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full bg-foreground/20"></div>
      </div>
    );
  }

  // If user is somehow null here, middleware should have caught it, but we render a fallback just in case
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] mb-4 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-foreground/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-foreground/40" />
              )}
            </div>
            <h3 className="font-bold text-lg">{userData?.displayName || "Shopper"}</h3>
            <p className="text-xs text-foreground/60">{user.email}</p>
            {userData?.role === 'admin' && (
              <span className="mt-2 px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase rounded">Admin</span>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 bg-foreground/5 text-foreground font-bold rounded-xl text-sm">
              <User className="w-4 h-4" /> Profile Details
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:bg-foreground/5 hover:text-foreground font-medium rounded-xl text-sm transition-colors">
              <Package className="w-4 h-4" /> My Orders
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:bg-foreground/5 hover:text-foreground font-medium rounded-xl text-sm transition-colors">
              <Heart className="w-4 h-4" /> Wishlist
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 font-medium rounded-xl text-sm transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-8 shadow-[var(--shadow-bento)]"
          >
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-1">Full Name</label>
                <div className="font-medium text-lg">{userData?.displayName || "Not set"}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-1">Email Address</label>
                <div className="font-medium text-lg">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-1">Account Role</label>
                <div className="font-medium text-lg capitalize">{userData?.role || "Customer"}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-1">Member Since</label>
                <div className="font-medium text-lg">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Just now"}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-bento-border">
              <button className="bg-foreground text-background px-6 py-2 rounded-full font-bold text-sm hover:bg-foreground/90 transition-colors">
                Edit Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
