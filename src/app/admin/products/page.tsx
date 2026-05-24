"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="text-foreground/60">Manage your product catalog.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-foreground text-background px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
            <Search className="w-12 h-12 text-foreground/20 mb-4" />
            <p>No products found.</p>
            <p className="text-sm mt-2">Click "Add Product" to create your first item!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-foreground/5 border-b border-bento-border text-foreground/60 font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-bento-border/50 hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden">
                        {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-bold">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-bold text-foreground/60">{product.category}</td>
                    <td className="px-6 py-4 font-bold">₹{Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{product.totalStock !== undefined ? product.totalStock : 'N/A'}</td>
                    <td className="px-6 py-4">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
