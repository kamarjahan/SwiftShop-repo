"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const mockSalesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

const mockRevenueData = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 480 },
  { name: 'Fri', revenue: 700 },
  { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 850 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black">Dashboard Overview</h1>
        <p className="text-foreground/60">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+20.1%" },
          { label: "Sales", value: "+2350", icon: ShoppingBag, trend: "+15.2%" },
          { label: "Active Users", value: "+12,234", icon: Users, trend: "+5.1%" },
          { label: "Conversion Rate", value: "3.2%", icon: TrendingUp, trend: "+1.2%" },
        ].map((kpi, i) => (
          <div key={i} className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)]">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-foreground/60">{kpi.label}</span>
              <div className="p-2 bg-foreground/5 rounded-lg"><kpi.icon className="w-5 h-5 text-foreground/80" /></div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black">{kpi.value}</span>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)]">
          <h3 className="font-bold text-lg mb-6">Monthly Sales</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="sales" fill="currentColor" className="text-foreground" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)]">
          <h3 className="font-bold text-lg mb-6">Weekly Revenue</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} className="text-foreground" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
