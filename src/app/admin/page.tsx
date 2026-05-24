"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, XCircle, RefreshCw, 
  Package, Box, Calendar, Loader2
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Utility to get start of day
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function AdminDashboard() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [dateFilter, setDateFilter] = useState("all"); // 'today', 'yesterday', '1w', '1m', '1y', 'all', 'custom'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push("/");
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "users"))
      ]);

      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized Derived Data based on Filter
  const { 
    filteredOrders, 
    totalSales, 
    totalOrders, 
    avgOrderValue,
    cancelledOrders,
    returnedOrders,
    replacedOrders,
    profitAndLoss,
    inventoryAmount,
    activeUsers,
    conversionRatio,
    chartData,
    statusData,
    topProducts
  } = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    let filterStart: number | null = null;
    let filterEnd: number | null = null;

    if (dateFilter === "today") {
      filterStart = today.getTime();
    } else if (dateFilter === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      filterStart = y.getTime();
      filterEnd = today.getTime() - 1;
    } else if (dateFilter === "1w") {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      filterStart = w.getTime();
    } else if (dateFilter === "1m") {
      const m = new Date(today);
      m.setMonth(m.getMonth() - 1);
      filterStart = m.getTime();
    } else if (dateFilter === "1y") {
      const y = new Date(today);
      y.setFullYear(y.getFullYear() - 1);
      filterStart = y.getTime();
    } else if (dateFilter === "custom" && customStart && customEnd) {
      filterStart = new Date(customStart).getTime();
      filterEnd = new Date(customEnd).getTime() + 86400000; // Include end day
    }

    // 1. Filter Orders
    const fOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const t = o.createdAt.toDate().getTime();
      if (filterStart && t < filterStart) return false;
      if (filterEnd && t > filterEnd) return false;
      return true;
    });

    // Valid Orders for revenue (completed or on the way, not cancelled/rejected/returned)
    const validOrders = fOrders.filter(o => 
      !['Cancelled', 'Rejected', 'Returned', 'Refunded'].includes(o.status)
    );

    // Metrics
    const tSales = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const tOrders = fOrders.length;
    const aov = validOrders.length ? tSales / validOrders.length : 0;

    const cancelled = fOrders.filter(o => o.status === 'Cancelled' || o.status === 'Cancellation Requested').length;
    const returned = fOrders.filter(o => o.status === 'Returned' || o.status === 'Return Requested').length;
    const replaced = fOrders.filter(o => o.status === 'Replaced' || o.status === 'Replacement Requested').length;

    // Inventory Value
    const invAmount = products.reduce((sum, p) => sum + ((p.totalStock || 0) * (p.costPrice || p.price || 0)), 0);

    // Profit & Loss
    let totalCogs = 0;
    let returnLosses = 0;

    validOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        // Find product to get cost price
        const prod = products.find(p => p.id === item.id.split('-')[0]);
        const cost = prod?.costPrice || (item.price * 0.6); // Fallback to 60% margin if no cost price
        totalCogs += cost * item.quantity;
      });
    });

    // For returns, we might lose shipping or the item itself. Let's subtract 10% of returned order value as "return loss"
    const returnedOrdersList = fOrders.filter(o => o.status === 'Returned');
    returnLosses = returnedOrdersList.reduce((sum, o) => sum + ((o.total || 0) * 0.1), 0);

    const pl = tSales - totalCogs - returnLosses;

    // Users & Conversion
    const aUsers = users.length;
    // Users who have at least one valid order
    const orderingUsers = new Set(validOrders.map(o => o.userId));
    const cRatio = aUsers ? (orderingUsers.size / aUsers) * 100 : 0;

    // Chart Data (Group by Day)
    const chartMap: Record<string, number> = {};
    validOrders.forEach(o => {
      const d = o.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartMap[d] = (chartMap[d] || 0) + (o.total || 0);
    });
    const cData = Object.keys(chartMap).slice(-14).map(k => ({ name: k, sales: chartMap[k] }));

    // Status Pie Data
    const statusMap: Record<string, number> = {};
    fOrders.forEach(o => {
      const s = o.status || 'Pending';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const sData = Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] }));

    // Top Products
    const prodMap: Record<string, { name: string, qty: number, revenue: number, image: string }> = {};
    validOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        const pId = item.id.split('-')[0];
        if (!prodMap[pId]) {
          prodMap[pId] = { name: item.name, qty: 0, revenue: 0, image: item.image };
        }
        prodMap[pId].qty += item.quantity;
        prodMap[pId].revenue += item.price * item.quantity;
      });
    });
    const tProducts = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    return {
      filteredOrders: fOrders,
      totalSales: tSales,
      totalOrders: tOrders,
      avgOrderValue: aov,
      cancelledOrders: cancelled,
      returnedOrders: returned,
      replacedOrders: replaced,
      profitAndLoss: pl,
      inventoryAmount: invAmount,
      activeUsers: aUsers,
      conversionRatio: cRatio,
      chartData: cData,
      statusData: sData,
      topProducts: tProducts
    };
  }, [orders, products, users, dateFilter, customStart, customEnd]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Dashboard Analytics</h1>
          <p className="text-foreground/60 text-sm">Real-time overview of your store's performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-background border border-bento-border rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-foreground/50" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="1w">Last 7 Days</option>
              <option value="1m">Last 30 Days</option>
              <option value="1y">Last 1 Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                className="bg-background border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <span className="text-foreground/50">-</span>
              <input 
                type="date" 
                value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-background border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/50 uppercase">Total Sales</p>
              <h3 className="text-2xl font-black mt-1">₹{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/50 uppercase">Profit & Loss</p>
              <h3 className={`text-2xl font-black mt-1 ${profitAndLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profitAndLoss >= 0 ? '+' : '-'}₹{Math.abs(profitAndLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/50 uppercase">Total Orders</p>
              <h3 className="text-2xl font-black mt-1">{totalOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/50 uppercase">Avg Order Value</p>
              <h3 className="text-2xl font-black mt-1">₹{avgOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-background border border-bento-border rounded-xl p-4 text-center">
          <XCircle className="w-5 h-5 mx-auto text-red-500 mb-2" />
          <p className="text-xs font-bold text-foreground/60 uppercase">Cancelled</p>
          <p className="text-xl font-black">{cancelledOrders}</p>
        </div>
        <div className="bg-background border border-bento-border rounded-xl p-4 text-center">
          <RefreshCw className="w-5 h-5 mx-auto text-yellow-500 mb-2" />
          <p className="text-xs font-bold text-foreground/60 uppercase">Returned</p>
          <p className="text-xl font-black">{returnedOrders}</p>
        </div>
        <div className="bg-background border border-bento-border rounded-xl p-4 text-center">
          <RefreshCw className="w-5 h-5 mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-bold text-foreground/60 uppercase">Replaced</p>
          <p className="text-xl font-black">{replacedOrders}</p>
        </div>
        <div className="bg-background border border-bento-border rounded-xl p-4 text-center">
          <Users className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
          <p className="text-xs font-bold text-foreground/60 uppercase">Active Users</p>
          <p className="text-xl font-black">{activeUsers}</p>
        </div>
        <div className="bg-background border border-bento-border rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-foreground/60 uppercase">Conv. Ratio</p>
          <p className="text-xl font-black">{conversionRatio.toFixed(1)}%</p>
        </div>
      </div>

      {/* Inventory & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
          <h2 className="text-lg font-black mb-6">Sales Analytics</h2>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground/40 font-bold">No sales data for this period</div>
            )}
          </div>
        </div>

        {/* Inventory Value & Order Status */}
        <div className="space-y-6">
          <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-lg font-black mb-2 flex items-center gap-2"><Box className="w-5 h-5" /> Total Inventory Value</h2>
            <p className="text-3xl font-black text-indigo-500">₹{inventoryAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-foreground/50 mt-1">Based on current stock × cost price</p>
          </div>

          <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
            <h2 className="text-lg font-black mb-4">Order Status Distribution</h2>
            <div className="h-48">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground/40 font-bold">No orders</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Top Selling Products */}
      <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-[var(--shadow-bento)]">
        <h2 className="text-lg font-black mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-foreground/5 border-b border-bento-border">
                <th className="px-4 py-3 font-bold text-foreground/70">Product</th>
                <th className="px-4 py-3 font-bold text-foreground/70">Quantity Sold</th>
                <th className="px-4 py-3 font-bold text-foreground/70">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bento-border">
              {topProducts.length === 0 ? (
                <tr><td colSpan={3} className="py-8 text-center text-foreground/40">No sales data</td></tr>
              ) : (
                topProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-bento-border" />
                      <span className="font-bold">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 font-black">{product.qty} units</td>
                    <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">₹{product.revenue.toFixed(2)}</td>
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
