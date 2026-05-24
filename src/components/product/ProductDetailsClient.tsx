"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Truck, Shield, Heart, Share2, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function ProductDetailsClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [activeVariant, setActiveVariant] = useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  
  const { user, userData } = useAuth();
  const isWishlisted = userData?.wishlist?.includes(product.id) || false;

  const [linkCopied, setLinkCopied] = useState(false);
  
  const { addItem, toggleCart } = useCart();
  const router = useRouter();

  // Determine active price based on variant
  const displayPrice = activeVariant && activeVariant.price ? activeVariant.price : product.price;
  
  // Use MRP from product or fallback
  const mrp = product.mrp || displayPrice * 1.2;
  const discountPercent = Math.round(((mrp - displayPrice) / mrp) * 100);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert("Please login to add to wishlist");
      router.push("/login");
      return;
    }
    
    try {
      const userRef = doc(db, "users", user.uid);
      if (isWishlisted) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(product.id)
        });
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(product.id)
        });
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
    }
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id + (activeVariant ? `-${activeVariant.name}` : ""),
      name: `${product.name} ${activeVariant ? `(${activeVariant.name})` : ""}`,
      price: displayPrice,
      quantity,
      image: product.images?.[0] || ""
    };
    addItem(itemToAdd);
    toggleCart();
  };

  const handleBuyNow = () => {
    const itemToAdd = {
      id: product.id + (activeVariant ? `-${activeVariant.name}` : ""),
      name: `${product.name} ${activeVariant ? `(${activeVariant.name})` : ""}`,
      price: displayPrice,
      quantity,
      image: product.images?.[0] || ""
    };
    addItem(itemToAdd);
    router.push("/checkout"); // Assuming there is a checkout route
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header Actions & Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {product.category}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors relative"
            >
              {linkCopied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-foreground/70" />}
            </button>
            <button 
              onClick={toggleWishlist}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors overflow-hidden relative group"
            >
              <motion.div
                initial={false}
                animate={isWishlisted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-foreground/70 group-hover:text-red-500"}`} />
              </motion.div>
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
          {product.name}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5) ? "fill-currentColor" : "text-foreground/20"}`} />
            ))}
          </div>
          <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
            {product.reviewsCount || 128} ratings
          </span>
        </div>
      </div>

      <div className="border-t border-bento-border pt-4">
        {/* Pricing */}
        <div className="flex items-end gap-3 mb-1">
          <span className="text-red-500 text-3xl font-light">-{discountPercent}%</span>
          <span className="text-4xl font-black flex items-start">
            <span className="text-lg mt-1 mr-1">₹</span>
            {displayPrice.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-foreground/60 font-medium">
          M.R.P.: <span className="line-through">₹{mrp.toFixed(2)}</span>
        </p>
        <p className="text-sm mt-1">Inclusive of all taxes</p>
      </div>

      {/* Variants Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-bento-border">
          <h3 className="font-bold text-sm">Select Option: <span className="font-medium text-foreground/70">{activeVariant?.name}</span></h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant: any, idx: number) => {
              const isActive = activeVariant?.name === variant.name;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveVariant(variant)}
                  className={`px-4 py-2 border-2 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400" 
                      : "border-bento-border hover:border-foreground/30"
                  }`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Policies / Features */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4 border-t border-bento-border">
        {!product.chargeShipping && (
          <div className="flex flex-col items-center justify-center p-3 text-center bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
            <Truck className="w-6 h-6 text-blue-500 mb-1" />
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Free Delivery</span>
          </div>
        )}
        {product.codEnabled && (
          <div className="flex flex-col items-center justify-center p-3 text-center bg-green-50/50 dark:bg-green-900/20 rounded-lg">
            <div className="w-6 h-6 border-2 border-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-[10px] font-black text-green-500">₹</span>
            </div>
            <span className="text-[10px] font-bold text-green-700 dark:text-green-300">Pay on Delivery</span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center p-3 text-center bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
          <Shield className="w-6 h-6 text-purple-500 mb-1" />
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
            {product.returnPolicy === "return 7 days" ? "7 Days Return" : 
             product.returnPolicy === "replacement 7 days" ? "7 Days Replacement" : "Non-Returnable"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-bento-card border border-bento-border rounded-xl shadow-[var(--shadow-bento)] space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">Quantity:</span>
          <div className="flex items-center bg-background border border-bento-border rounded-lg overflow-hidden">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-foreground/5 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-foreground/5 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleAddToCart}
            className="w-full py-3 rounded-full font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-black transition-colors shadow-sm"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="w-full py-3 rounded-full font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-bento-border">
        <h3 className="font-black text-lg mb-2">About this item</h3>
        <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
          {product.description}
        </p>
      </div>

      {/* Reviews */}
      <div className="pt-4 border-t border-bento-border">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          Customer Reviews <span className="text-sm font-medium text-foreground/50 bg-foreground/5 px-2 py-0.5 rounded-full">{product.reviews?.length || 0}</span>
        </h3>
        
        {!product.reviews || product.reviews.length === 0 ? (
          <div className="bg-bento-card border border-bento-border p-6 rounded-xl text-center">
            <Star className="w-8 h-8 text-foreground/20 mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground/50">No reviews yet.</p>
            <p className="text-xs text-foreground/40 mt-1">Buy this product and be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review: any, idx: number) => (
              <div key={idx} className="bg-bento-card border border-bento-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-sm">{review.userName || 'Anonymous'}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-foreground/20'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {review.date && (
                    <span className="text-xs text-foreground/50">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
