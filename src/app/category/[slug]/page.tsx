"use client";

import { use, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Inbox, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatCategoryName = (name: string) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filter by slugified category
        const filtered = allProducts.filter((p: any) => 
          p.category && slugify(p.category) === slug
        );
        setProducts(filtered);
      } catch (e) {
        console.error("Error loading products for category", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  const categoryTitle = products.length > 0 
    ? formatCategoryName(products[0].category) 
    : formatCategoryName(slug.replace(/-/g, " "));

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="mb-8 border-b border-bento-border pb-6">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <h1 className="text-4xl font-black tracking-tight">{categoryTitle}</h1>
        <p className="text-foreground/60 mt-2">
          {products.length === 1 ? "1 product" : `${products.length} products`} available in this category
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-foreground/5 animate-pulse h-80 rounded-[var(--radius-bento)]"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-bento-card border border-bento-border rounded-[var(--radius-bento)]">
          <Inbox className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-foreground/60">There are currently no products listed under "{categoryTitle}".</p>
          <Link href="/shop" className="inline-block mt-6 font-bold text-sm bg-foreground text-background px-6 py-2 rounded-full hover:bg-foreground/90 transition-colors">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {products.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/product/${product.id}`} className="block h-full group bg-bento-card border border-bento-border rounded-[var(--radius-bento)] overflow-hidden shadow-sm hover:shadow-[var(--shadow-bento)] transition-all duration-300 relative">
                  <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.category}</span>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-currentColor" />
                          <span className="text-[10px] font-bold text-foreground/80">{product.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-slate-600 transition-colors">{product.name}</h3>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        {product.mrp && (
                          <span className="text-xs text-foreground/40 line-through mr-2">₹{(product.mrp).toFixed(2)}</span>
                        )}
                        <span className="text-lg font-black">₹{(product.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
