"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function LiveSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch products once for live search filtering
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllProducts(data);
      } catch (e) {
        console.error("Live search init error", e);
      }
    };
    fetchProducts();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = allProducts.filter((p: any) => 
        (p.name?.toLowerCase() || "").includes(q) || 
        (p.category?.toLowerCase() || "").includes(q) ||
        (p.description?.toLowerCase() || "").includes(q)
      ).slice(0, 5); // Limit to top 5 results for live dropdown
      
      setResults(filtered);
      setIsOpen(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-foreground/5 border border-transparent focus:bg-background focus:border-bento-border rounded-full pl-10 pr-4 py-2 text-sm outline-none transition-all"
        />
        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {isOpen && (query.trim().length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-2xl overflow-hidden z-50">
          {isSearching ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 p-3 hover:bg-foreground/5 transition-colors border-b border-bento-border/50 last:border-0"
                >
                  <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold truncate">{product.name}</span>
                    <span className="text-xs text-foreground/60 font-medium">₹{(product.price || 0).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
              <button
                onClick={(e) => handleSearch(e as any)}
                className="w-full p-3 text-sm font-bold text-center bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                View all results for "{query}"
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-foreground/60">
              No products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
