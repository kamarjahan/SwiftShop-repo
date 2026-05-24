"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

function ShopPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(data);
        
        // Auto-adjust max price range based on fetched products
        if (data.length > 0) {
          const maxP = Math.max(...data.map(p => p.price || 0));
          if (maxP > 500) setMaxPrice(Math.ceil(maxP / 100) * 100);
        }
      } catch (e) {
        console.error("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch unique categories dynamically
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    products.forEach(p => {
      if (p.category) {
        catSet.add(p.category.trim());
      }
    });
    return Array.from(catSet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Handle URL categoryParam initialization
  useEffect(() => {
    if (categoryParam && products.length > 0) {
      const matched = products.find(p => p.category && slugify(p.category) === categoryParam);
      if (matched) {
        setSelectedCategories([matched.category]);
      } else {
        // Try exact match or direct parameter usage
        const exactMatch = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
        setSelectedCategories([exactMatch || categoryParam]);
      }
    }
  }, [categoryParam, products, categories]);

  // Filter & Sort Engine
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const pName = product.name?.toLowerCase() || "";
      const pDesc = product.description?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = pName.includes(query) || pDesc.includes(query);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = (product.price || 0) >= minPrice && (product.price || 0) <= maxPrice;
      const matchesRating = (product.rating || 0) >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    filtered.sort((a, b) => {
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "best_deals") {
        const dealA = a.mrp && a.price ? (a.mrp - a.price) / a.mrp : 0;
        const dealB = b.mrp && b.price ? (b.mrp - b.price) / b.mrp : 0;
        return dealB - dealA;
      }
      // "newest" by default
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [products, searchQuery, selectedCategories, minPrice, maxPrice, minRating, sortBy]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(100000);
    setMinRating(0);
    setSortBy("newest");
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl flex flex-col md:flex-row gap-8 items-start">
      
      {/* Mobile Filter Toggle */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="md:hidden w-full flex items-center justify-center gap-2 bg-bento-card border border-bento-border py-3 rounded-xl font-bold shadow-sm"
      >
        <SlidersHorizontal className="w-5 h-5" /> Filters & Sort
      </button>

      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-0 z-50 bg-background md:bg-transparent p-6 md:p-0 overflow-y-auto md:overflow-visible transition-transform duration-300
        ${isMobileFilterOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
        md:static md:w-1/4 flex-shrink-0 space-y-8
      `}>
        <div className="flex items-center justify-between md:hidden mb-6">
          <h2 className="text-2xl font-black">Filters</h2>
          <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-foreground/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Search</h3>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-bento-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <h3 className="font-bold text-lg mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.length === 0 && !loading ? (
              <p className="text-xs text-foreground/40">No categories found</p>
            ) : (
              categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-foreground border-foreground' : 'border-bento-border group-hover:border-foreground/50'}`}>
                    {selectedCategories.includes(cat) && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2.5 h-2.5 bg-background rounded-sm" />}
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{formatCategoryName(cat)}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Price Range</h3>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 text-xs">₹</span>
              <input 
                type="number" 
                min="0"
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
                className="w-full bg-background border border-bento-border rounded-lg pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 text-center font-medium"
              />
            </div>
            <span className="text-foreground/40 font-black">-</span>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 text-xs">₹</span>
              <input 
                type="number" 
                min={minPrice}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full bg-background border border-bento-border rounded-lg pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 text-center font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-foreground/60 flex justify-between">
              <span>Slide Max Price</span>
              <span className="font-bold text-foreground">₹{maxPrice}</span>
            </label>
            <input 
              type="range" 
              min={Math.max(100, minPrice)} 
              max="100000" 
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-foreground h-1.5 bg-bento-border rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <h3 className="font-bold text-lg mb-4">Minimum Rating</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button 
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`flex-1 py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${minRating === rating ? 'bg-foreground text-background border-foreground' : 'border-bento-border hover:bg-foreground/5'}`}
              >
                <span className="text-xs font-bold">{rating}+</span>
                <Star className={`w-3 h-3 ${minRating === rating ? 'fill-background' : 'fill-yellow-500 text-yellow-500'}`} />
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={clearFilters}
          className="w-full py-3 border border-bento-border rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          Clear All Filters
        </button>

      </aside>

      {/* Main Product Grid */}
      <section className="flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Explore Shop</h1>
            <p className="text-foreground/60 mt-1">Showing {filteredProducts.length} results</p>
          </div>
          <div className="flex items-center gap-2 bg-bento-card border border-bento-border px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm font-bold text-foreground/60 whitespace-nowrap">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_deals">Best Deals</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-bento-card border border-bento-border rounded-[var(--radius-bento)]">
            <Search className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-foreground/60">Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="mt-6 font-bold text-sm bg-foreground text-background px-6 py-2 rounded-full">Reset Filters</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Link href={`/product/${product.id}`} className="block h-full group bg-bento-card border border-bento-border rounded-[var(--radius-bento)] overflow-hidden shadow-sm hover:shadow-[var(--shadow-bento)] transition-all duration-300 relative">
                    {product.isTrending && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 uppercase tracking-widest">Trending</div>
                    )}
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
                        <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-slate-600 transition-colors">{product.name}</h3>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                           {product.mrp && (
                             <span className="text-xs text-foreground/40 line-through mr-2">₹{(product.mrp).toFixed(2)}</span>
                           )}
                           <span className="text-xl font-black">₹{(product.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
