"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Clock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mockCategories, mockProducts } from "@/lib/mockData";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredProduct = mockProducts.find(p => p.isFeatured) || mockProducts[0];
  const trendingProduct = mockProducts.find(p => p.isTrending) || mockProducts[1];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]"
      >
        {/* Card A: Hero Banner (2x2) */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-2 md:row-span-2 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-8 shadow-[var(--shadow-bento)] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent z-0"></div>
          <div className="relative z-10 flex flex-col items-start gap-4 h-full justify-center max-w-sm">
            <span className="px-3 py-1 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
              <Zap className="w-3 h-3" fill="currentColor" /> New Arrival
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Elevate Your Everyday.
            </h1>
            <p className="text-foreground/70 font-medium">
              Discover the new collection. Engineered for excellence.
            </p>
            <Link href={`/product/${trendingProduct.id}`} className="mt-4 flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
              Shop Collection <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[80%] opacity-80 mix-blend-multiply dark:mix-blend-lighten transform group-hover:scale-105 transition-transform duration-700 ease-out z-0 pointer-events-none">
             <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 rounded-full blur-3xl"></div>
          </div>
        </motion.div>

        {/* Card B: Flash Sale Timer */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-1 md:row-span-1 bg-foreground text-background border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex flex-col justify-center items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
        >
          <Clock className="w-8 h-8 mb-4 opacity-80" />
          <h3 className="font-bold text-lg mb-2">Flash Sale Ends In</h3>
          <div className="flex gap-3 text-2xl font-black font-mono">
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] font-sans font-medium uppercase tracking-widest opacity-60">Hrs</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] font-sans font-medium uppercase tracking-widest opacity-60">Min</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] font-sans font-medium uppercase tracking-widest opacity-60">Sec</span>
            </div>
          </div>
        </motion.div>

        {/* Card D: Featured Product Spotlight */}
        <Link href={`/product/${featuredProduct.id}`} className="contents">
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-1 md:row-span-2 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] flex flex-col overflow-hidden group relative"
          >
            <div className="h-[60%] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img 
                src={featuredProduct.images[0]} 
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
                  <span className="text-xs font-bold text-foreground/80">{featuredProduct.rating}</span>
                </div>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-2xl font-black">${featuredProduct.price.toFixed(2)}</span>
                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Card C: Category Quick-Links */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-1 md:row-span-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex flex-col"
        >
          <h3 className="font-bold mb-4 flex items-center justify-between">
            Categories <Link href="/categories" className="text-xs font-medium opacity-60 hover:opacity-100">View All</Link>
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {mockCategories.slice(0, 4).map((cat) => (
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

        {/* Card E: Trending Product */}
        <Link href={`/product/${trendingProduct.id}`} className="contents">
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 md:row-span-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex items-center group overflow-hidden relative"
          >
             <div className="flex-1 z-10 pr-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Trending Now</span>
                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-slate-600 transition-colors">{trendingProduct.name}</h3>
                <span className="text-lg font-black">${trendingProduct.price.toFixed(2)}</span>
             </div>
             <div className="w-1/3 h-full relative rounded-xl overflow-hidden shadow-inner">
               <img 
                 src={trendingProduct.images[0]} 
                 alt={trendingProduct.name}
                 className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
               />
             </div>
          </motion.div>
        </Link>
      </motion.div>
    </main>
  );
}
