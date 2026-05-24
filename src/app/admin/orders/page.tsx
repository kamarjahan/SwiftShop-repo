"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Search, Loader2, Filter, ChevronRight, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push("/");
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData) {
      fetchOrdersAndUsers();
    }
  }, [userData]);

  const fetchOrdersAndUsers = async () => {
    setLoading(true);
    try {
      // Fetch users for email mapping
      const usersSnap = await getDocs(collection(db, "users"));
      const uMap: Record<string, any> = {};
      usersSnap.docs.forEach(d => {
        uMap[d.id] = d.data();
      });
      setUsersMap(uMap);

      // Fetch orders
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply Tab Filter
    if (activeTab === "On the Way") {
      result = result.filter(o => o.status === "Shipped" || o.status === "Out for Delivery" || o.status === "Pick Up From Store");
    } else if (activeTab === "Completed") {
      result = result.filter(o => o.status === "Delivered");
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => {
        const orderIdMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.shippingAddress?.fullName?.toLowerCase().includes(q);
        const userEmail = usersMap[o.userId]?.email?.toLowerCase() || "";
        const emailMatch = userEmail.includes(q);
        const productMatch = o.items?.some((i: any) => i.name?.toLowerCase().includes(q));
        
        return orderIdMatch || nameMatch || emailMatch || productMatch;
      });
    }

    return result;
  }, [orders, activeTab, searchQuery, usersMap]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/20" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Order Management</h1>
          <p className="text-foreground/60 text-sm mt-1">View and process customer orders.</p>
        </div>
      </div>

      <div className="bg-bento-card border border-bento-border rounded-2xl shadow-[var(--shadow-bento)] overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-bento-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {["All", "On the Way", "Completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? "bg-foreground text-background" 
                    : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search ID, Name, Email, Product..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-bento-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-foreground/5 border-b border-bento-border">
                <th className="px-6 py-4 font-bold text-foreground/70">Order ID</th>
                <th className="px-6 py-4 font-bold text-foreground/70">Date</th>
                <th className="px-6 py-4 font-bold text-foreground/70">Customer</th>
                <th className="px-6 py-4 font-bold text-foreground/70">Status</th>
                <th className="px-6 py-4 font-bold text-foreground/70">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bento-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/50">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-foreground/5 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium">#{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-foreground/70">
                      {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{order.shippingAddress?.fullName}</p>
                      <p className="text-xs text-foreground/60">{usersMap[order.userId]?.email || "Guest"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                        order.status?.includes('Requested') ? 'bg-orange-500/10 text-orange-500' :
                        order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-500 font-bold hover:underline"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
