"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, Loader2, Search } from "lucide-react";

interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
  image: string;
}

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const products = snap.docs.map(d => d.data());
        
        const catMap = new Map<string, CategoryInfo>();
        
        products.forEach((p: any) => {
          if (p.category) {
            const rawCat = p.category.trim();
            const lowerCat = rawCat.toLowerCase();
            const slug = slugify(rawCat);
            
            if (catMap.has(lowerCat)) {
              catMap.get(lowerCat)!.count++;
            } else {
              catMap.set(lowerCat, {
                name: formatCategoryName(rawCat),
                slug: slug,
                count: 1,
                image: p.images?.[0] || "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80" // default fallback
              });
            }
          }
        });
        
        setCategories(Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-bento-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Grid className="w-8 h-8" /> All Categories
          </h1>
          <p className="text-foreground/60 mt-2">Browse our wide range of product collections</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
          <input 
            type="text" 
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bento-card border border-bento-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-foreground/5 animate-pulse h-48 rounded-[var(--radius-bento)]"></div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 text-center bg-bento-card border border-bento-border rounded-[var(--radius-bento)]">
          <Search className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No categories found</h3>
          <p className="text-foreground/60">No categories match your search criteria.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/category/${cat.slug}`} className="block h-full group bg-bento-card border border-bento-border rounded-[var(--radius-bento)] overflow-hidden shadow-sm hover:shadow-[var(--shadow-bento)] transition-all duration-300 relative">
                  <div className="h-48 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute top-3 right-3 z-20 bg-background/90 backdrop-blur text-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      {cat.count} {cat.count === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-slate-600 transition-colors flex items-center justify-between">
                      {cat.name}
                      <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-sm font-black">&rarr;</span>
                    </h3>
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
