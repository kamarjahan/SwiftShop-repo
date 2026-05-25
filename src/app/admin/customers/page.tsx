"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Search, Users } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(items);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    const name = c.displayName?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="w-8 h-8" /> Customers
          </h1>
          <p className="text-foreground/60">View and search your registered customers.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-bento-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
            <Users className="w-12 h-12 text-foreground/20 mb-4" />
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-foreground/5 border-b border-bento-border text-foreground/60 font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-bento-border/50 hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-black/5">
                        {customer.photoURL ? (
                          <img src={customer.photoURL} alt={customer.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-foreground/10 text-foreground font-bold">
                            {(customer.displayName || customer.email || "U")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-bold">{customer.displayName || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">{customer.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${customer.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-foreground/5'}`}>
                        {customer.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/60 text-xs">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
