"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
          const productData: any = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          // Fetch recommended
          try {
            const q = query(
              collection(db, "products"), 
              where("category", "==", productData.category), 
              limit(5)
            );
            const recSnap = await getDocs(q);
            const recs = recSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id)
              .slice(0, 4);
            setRecommended(recs);
          } catch (e) {
            console.error("Error fetching recommended", e);
          }
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-foreground/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-black">Product Not Found</h1>
        <p className="text-foreground/60">The product you are looking for does not exist or was removed.</p>
        <Link href="/shop" className="bg-foreground text-background px-6 py-2 rounded-full font-bold mt-4">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Left: Amazon-style Image Gallery */}
        <div className="w-full md:w-1/2 lg:w-7/12">
          <ProductGallery images={product.images || []} />
        </div>

        {/* Right: Interactive Layout */}
        <div className="w-full md:w-1/2 lg:w-5/12">
          <ProductDetailsClient product={product} />
        </div>
      </div>

      {/* User Reviews */}
      <div className="mt-16 pt-8 border-t border-bento-border">
        <h2 className="text-2xl font-black mb-6">Customer Reviews</h2>
        <div className="bg-bento-card border border-bento-border p-8 rounded-xl shadow-[var(--shadow-bento)] text-center">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.slice(0, 5).map((r: any, idx: number) => (
                <div key={idx} className="border-b border-bento-border pb-4 last:border-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-sm">{r.userName || "Anonymous"}</div>
                    <div className="text-yellow-500 flex text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-currentColor" : "text-foreground/20"}`} />
                      ))}
                    </div>
                    {r.date && (
                      <span className="text-xs text-foreground/50 ml-auto">
                        {new Date(r.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 mt-2">{r.comment}</p>
                </div>
              ))}
              {product.reviews.length > 5 && (
                <button className="mt-6 px-6 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold rounded-full transition-colors text-sm">
                  See all {product.reviews.length} reviews
                </button>
              )}
            </div>
          ) : (
            <div className="py-8">
              <p className="text-foreground/60">No reviews yet.</p>
              <p className="text-sm text-foreground/40 mt-2">Real reviews from verified purchases will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <div className="mt-16 pt-8 border-t border-bento-border">
          <h2 className="text-2xl font-black mb-6">Recommended Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map(rec => (
              <Link href={`/product/${rec.id}`} key={rec.id} className="group bg-background border border-bento-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img src={rec.images?.[0] || ""} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">{rec.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">₹{(rec.price || 0).toFixed(2)}</span>
                    {rec.mrp && <span className="text-xs text-foreground/50 line-through">₹{(rec.mrp).toFixed(2)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
