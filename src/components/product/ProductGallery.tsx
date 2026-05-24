"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const activeImage = images[activeIndex] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Thumbnails (Left side on desktop, bottom on mobile if we wanted, but let's stick to left for Amazon style) */}
      <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[500px] no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onMouseEnter={() => setActiveIndex(idx)}
            onClick={() => setActiveIndex(idx)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
              activeIndex === idx ? "border-foreground shadow-md" : "border-transparent hover:border-foreground/30"
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom */}
      <div 
        className="relative flex-1 bg-slate-50 dark:bg-slate-900 rounded-[var(--radius-bento)] overflow-hidden border border-bento-border shadow-[var(--shadow-bento)] order-1 md:order-2 aspect-square md:aspect-auto md:h-[500px] cursor-crosshair group"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={activeImage}
            alt="Product image"
            className={`w-full h-full object-contain ${isZooming ? "opacity-0" : "opacity-100"}`}
          />
        </AnimatePresence>

        {/* Zoomed Lens Image */}
        {isZooming && (
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: '250%', // Zoom level
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
    </div>
  );
}
