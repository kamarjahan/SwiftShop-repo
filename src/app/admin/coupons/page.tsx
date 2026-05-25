"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Trash2, Loader2, Tag, Percent, Search } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCoupons = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "coupons"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(items);
    } catch (error) {
      console.error("Error fetching coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon", error);
      alert("Failed to delete coupon.");
    }
  };

  const getDiscountDisplay = (coupon: any) => {
    if (coupon.discountType === "free_shipping") return "Free Shipping";
    if (coupon.discountType === "fixed") return `₹${coupon.discountValue}`;
    if (coupon.discountType === "percentage") return `${coupon.discountValue}%`;
    return "N/A";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Coupons</h1>
          <p className="text-foreground/60">Manage discount codes and promotions.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-bento-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <Link 
            href="/admin/coupons/new" 
            className="bg-foreground text-background px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-foreground/90 transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" /> Create Coupon
          </Link>
        </div>
      </div>

      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
            <Tag className="w-12 h-12 text-foreground/20 mb-4" />
            <p>No coupons found.</p>
            <p className="text-sm mt-2">Click "Add Coupon" to create your first promotion!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-foreground/5 border-b border-bento-border text-foreground/60 font-bold">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Applies To</th>
                  <th className="px-6 py-4">Uses</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons
                  .filter(c => (c.code?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
                  .map((coupon) => {
                  const now = new Date();
                  const start = new Date(coupon.startDate);
                  const end = new Date(coupon.endDate);
                  const isActive = now >= start && now <= end;

                  return (
                    <tr key={coupon.id} className="border-b border-bento-border/50 hover:bg-foreground/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold bg-foreground/10 px-2 py-1 rounded tracking-widest">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                        {getDiscountDisplay(coupon)}
                      </td>
                      <td className="px-6 py-4 capitalize">{coupon.appliesTo?.replace("_", " ")}</td>
                      <td className="px-6 py-4 text-foreground/60">
                        {coupon.maxUses === 0 ? "Unlimited" : `0 / ${coupon.maxUses}`}
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Active</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
