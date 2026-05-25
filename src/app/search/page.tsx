"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { executeSmartSearch } from "@/lib/smartSearch";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (!query.trim()) {
          setResults([]);
          return;
        }

        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const smartResults = executeSmartSearch(data, query);
        setResults(smartResults);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="mb-8 border-b border-bento-border pb-6">
        <h1 className="text-3xl font-black">Search Results</h1>
        <p className="text-foreground/60 mt-2">
          {query ? (
            <>Showing results for <span className="font-bold text-foreground">"{query}"</span></>
          ) : (
            "Please enter a search term."
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-foreground/5 animate-pulse h-80 rounded-[var(--radius-bento)]"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center bg-bento-card border border-bento-border rounded-[var(--radius-bento)]">
          <Search className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-foreground/60">We couldn't find anything matching "{query}". Try different keywords.</p>
          <Link href="/shop" className="inline-block mt-6 font-bold text-sm bg-foreground text-background px-6 py-2 rounded-full hover:bg-foreground/90 transition-colors">
            Browse All Products
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {results.map(product => (
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

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="animate-pulse h-10 w-48 bg-foreground/10 rounded mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-foreground/5 animate-pulse h-80 rounded-[var(--radius-bento)]"></div>
          ))}
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
