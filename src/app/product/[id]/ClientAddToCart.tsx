"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/mockData";
import { useCart } from "@/store/useCart";

export default function ClientAddToCart({ product }: { product: Product }) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAddToCart}
      className={`w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-colors ${
        isAdded 
          ? "bg-green-500 text-white" 
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      {isAdded ? "Added to Cart!" : "Add to Cart"}
    </motion.button>
  );
}
