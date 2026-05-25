"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Star, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsSnap, productsSnap] = await Promise.all([
          getDoc(doc(db, "settings", "home_page")),
          getDocs(query(collection(db, "products"), limit(8)))
        ]);

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }

        const fetchedProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Removed loading block for instant model

  // Fallbacks if not set
  const hero = settings?.hero_banner || { enabled: false };
  const dealBanner = settings?.todays_deal_banner || { enabled: false };
  const offersCards = settings?.offers_cards || [];
  const categories = settings?.featured_categories || [];

  const featuredProduct = products.length > 0 ? products[0] : null;
  const trendingProduct = products.length > 1 ? products[1] : featuredProduct;

  const trendingList = products.slice(0, 4);
  const bestSellersList = products.length > 4 ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <main className="w-full">
      {/* Today's Deal Banner */}
      {dealBanner.enabled && (
        <div 
          className="w-full py-2 px-4 text-center text-sm font-bold shadow-sm z-40 relative"
          style={{ backgroundColor: dealBanner.bgColor, color: dealBanner.textColor }}
        >
          {dealBanner.text}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-min md:auto-rows-[250px]"
        >
          {/* Hero Banner */}
          {hero.enabled && (
            <motion.div
              variants={itemVariants}
              className="col-span-1 md:col-span-2 md:row-span-2 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-8 shadow-[var(--shadow-bento)] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent z-10 pointer-events-none"></div>
              <img src={hero.imageUrl} alt={hero.title} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700" />
              
              <div className="relative z-20 flex flex-col items-start gap-4 h-full justify-center max-w-sm">
                <span className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2 shadow-lg">
                  <Zap className="w-3 h-3 text-yellow-500" fill="currentColor" /> {hero.subtitle}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                  {hero.title}
                </h1>
                <Link href={hero.linkUrl || "/shop"} className="mt-4 px-6 py-3 bg-white text-black rounded-full flex items-center gap-2 font-bold hover:bg-slate-200 transition-all shadow-xl group/btn">
                  {hero.buttonText} <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Featured Product Spotlight */}
          {featuredProduct && (
            <Link href={`/product/${featuredProduct.id}`} className="contents">
              <motion.div
                variants={itemVariants}
                className="col-span-1 md:col-span-1 md:row-span-2 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] flex flex-col overflow-hidden group relative"
              >
                <div className="h-[60%] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={featuredProduct.images?.[0] || ""} 
                    alt={featuredProduct.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-foreground text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{featuredProduct.name}</h3>
                    <div className="flex items-center gap-1 mt-2 text-yellow-500">
                      <Star className="w-4 h-4 fill-currentColor" />
                      <span className="text-xs font-bold text-foreground/80">{featuredProduct.rating || "4.5"}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-black">₹{(featuredProduct.price || 0).toFixed(2)}</span>
                    <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Dynamic Categories */}
          {categories.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="col-span-1 md:col-span-1 md:row-span-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex flex-col"
            >
              <h3 className="font-bold mb-4 flex items-center justify-between">
                Categories <Link href="/shop" className="text-xs font-medium opacity-60 hover:opacity-100">View All</Link>
              </h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {categories.slice(0, 4).map((cat: any) => (
                  <Link href={`/category/${cat.slug}`} key={cat.id} className="relative overflow-hidden rounded-xl group">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                    <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold z-20 text-center leading-tight shadow-sm drop-shadow-md">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dynamic Offers Cards */}
          {offersCards.map((card: any, idx: number) => (
            <Link href={card.link || "/shop"} key={card.id || idx} className="contents">
              <motion.div
                variants={itemVariants}
                className="col-span-1 md:col-span-1 md:row-span-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-colors" />
                <img src={card.image} alt="Offer" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700" />
                <h3 className="relative z-20 font-black text-white text-xl text-center px-4 drop-shadow-lg leading-tight">
                  {card.text}
                </h3>
              </motion.div>
            </Link>
          ))}

          {/* Trending Product */}
          {trendingProduct && (
            <Link href={`/product/${trendingProduct.id}`} className="contents">
              <motion.div
                variants={itemVariants}
                className="col-span-1 md:col-span-2 md:row-span-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex items-center group overflow-hidden relative"
              >
                 <div className="flex-1 z-10 pr-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Trending Now</span>
                    <h3 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-slate-600 transition-colors">{trendingProduct.name}</h3>
                    <span className="text-lg font-black">₹{(trendingProduct.price || 0).toFixed(2)}</span>
                 </div>
                 <div className="w-1/3 h-full relative rounded-xl overflow-hidden shadow-inner bg-slate-100">
                   <img 
                     src={trendingProduct.images?.[0] || ""} 
                     alt={trendingProduct.name}
                     className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                   />
                 </div>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Trending Products */}
      {trendingList.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black">Trending Products</h2>
            <Link href="/shop" className="text-sm font-bold text-foreground/60 hover:text-foreground">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trendingList.map(prod => (
              <Link href={`/product/${prod.id}`} key={prod.id} className="group bg-bento-card border border-bento-border rounded-xl overflow-hidden hover:shadow-[var(--shadow-bento)] transition-all">
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img src={prod.images?.[0] || ""} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">{prod.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">₹{(prod.price || 0).toFixed(2)}</span>
                    {prod.mrp && <span className="text-xs text-foreground/50 line-through">₹{(prod.mrp).toFixed(2)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Best Sellers */}
      {bestSellersList.length > 0 && (
        <div className="container mx-auto px-4 py-8 mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black">Best Sellers</h2>
            <Link href="/shop" className="text-sm font-bold text-foreground/60 hover:text-foreground">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellersList.map(prod => (
              <Link href={`/product/${prod.id}`} key={prod.id} className="group bg-bento-card border border-bento-border rounded-xl overflow-hidden hover:shadow-[var(--shadow-bento)] transition-all">
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img src={prod.images?.[0] || ""} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">{prod.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">₹{(prod.price || 0).toFixed(2)}</span>
                    {prod.mrp && <span className="text-xs text-foreground/50 line-through">₹{(prod.mrp).toFixed(2)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
