"use client";

import { useState } from "react";
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // percentage, fixed, free_shipping
  const [discountValue, setDiscountValue] = useState<number>(0);
  
  const [appliesTo, setAppliesTo] = useState("all"); // all, category, specific_product
  const [appliesToValue, setAppliesToValue] = useState(""); // Category name or Product ID
  
  const [minAmount, setMinAmount] = useState<number>(0);
  const [limitNewCustomer, setLimitNewCustomer] = useState(false);
  const [limitOnePerCustomer, setLimitOnePerCustomer] = useState(false);
  const [maxUses, setMaxUses] = useState<number>(0); // 0 means unlimited
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !startDate || !endDate) {
      toast.error("Please fill in the required fields (Code, Start Date, End Date).");
      return;
    }
    
    setLoading(true);
    try {
      const couponData = {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: discountType === "free_shipping" ? 0 : Number(discountValue),
        appliesTo,
        appliesToValue: appliesTo === "all" ? null : appliesToValue,
        minAmount: Number(minAmount),
        limitNewCustomer,
        limitOnePerCustomer,
        maxUses: Number(maxUses),
        startDate,
        endDate,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "coupons"), couponData);
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons" className="p-2 bg-bento-card border border-bento-border rounded-lg hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Create Coupon</h1>
            <p className="text-foreground/60">Generate a new promotional code.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] space-y-6">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">General Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER50"
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono tracking-widest uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Internal description for this coupon"
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] space-y-6">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Discount Rules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Discount Value</label>
              <input
                type="number"
                min="0"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                disabled={discountType === "free_shipping"}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:bg-foreground/5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Applies To</label>
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                <option value="all">All Products</option>
                <option value="category">Specific Category</option>
                <option value="specific_product">Specific Product (ID)</option>
              </select>
            </div>
            {appliesTo !== "all" && (
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">
                  {appliesTo === "category" ? "Category Name" : "Product ID"}
                </label>
                <input
                  type="text"
                  required
                  value={appliesToValue}
                  onChange={(e) => setAppliesToValue(e.target.value)}
                  placeholder={appliesTo === "category" ? "e.g. electronics" : "Product ID"}
                  className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] space-y-6">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Usage Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Minimum Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Maximum Total Uses (Across Store)</label>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                placeholder="0 for unlimited"
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <p className="text-xs text-foreground/50 mt-1">Leave as 0 for unlimited uses.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={limitNewCustomer}
                onChange={(e) => setLimitNewCustomer(e.target.checked)}
                className="w-4 h-4 accent-foreground"
              />
              <span className="text-sm font-bold text-foreground/80">Limit to New Customers Only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={limitOnePerCustomer}
                onChange={(e) => setLimitOnePerCustomer(e.target.checked)}
                className="w-4 h-4 accent-foreground"
              />
              <span className="text-sm font-bold text-foreground/80">Limit to one use per customer</span>
            </label>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] space-y-6">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Active Dates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/admin/coupons" 
            className="px-6 py-3 rounded-lg font-bold bg-foreground/10 hover:bg-foreground/20 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-foreground text-background px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Coupon
          </button>
        </div>
      </form>
    </div>
  );
}
