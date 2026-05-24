"use client";

import { useState, useMemo } from "react";
import { mockProducts, mockCategories } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import Link from "next/link";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter Engine
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= priceRange;
      const matchesRating = product.rating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [searchQuery, selectedCategories, priceRange, minRating]);

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
    setPriceRange(500);
    setMinRating(0);
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
            {mockCategories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.name)} onChange={() => toggleCategory(cat.name)} />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.name) ? 'bg-foreground border-foreground' : 'border-bento-border group-hover:border-foreground/50'}`}>
                  {selectedCategories.includes(cat.name) && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2.5 h-2.5 bg-background rounded-sm" />}
                </div>
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Max Price</h3>
            <span className="text-sm font-bold">${priceRange}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            step="10"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-foreground h-1.5 bg-bento-border rounded-lg appearance-none cursor-pointer"
          />
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Explore Shop</h1>
            <p className="text-foreground/60 mt-1">Showing {filteredProducts.length} results</p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
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
                           {product.originalPrice && (
                             <span className="text-xs text-foreground/40 line-through mr-2">${product.originalPrice.toFixed(2)}</span>
                           )}
                           <span className="text-xl font-black">${product.price.toFixed(2)}</span>
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
