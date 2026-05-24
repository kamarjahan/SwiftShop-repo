import { mockProducts } from "@/lib/mockData";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Truck, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientAddToCart from "./ClientAddToCart";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = mockProducts.find(p => p.id === resolvedParams.id);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.name} | SwiftShop`,
    description: product.description,
  };
}

// Generate static params for mock data so it statically generates
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = mockProducts.find(p => p.id === resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-[var(--radius-bento)] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-bento-border shadow-[var(--shadow-bento)]">
            <Image 
              src={product.images[0]} 
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{product.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-currentColor" />
              <span className="font-bold text-foreground">{product.rating}</span>
            </div>
            <span className="text-foreground/50 text-sm">({product.reviewsCount} reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-black">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xl text-foreground/40 line-through mb-1">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-foreground/80 leading-relaxed mb-10 text-lg">
            {product.description}
          </p>

          <ClientAddToCart product={product} />

          <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-bento-border">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/70">
              <Truck className="w-5 h-5" /> Free Express Delivery
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/70">
              <Shield className="w-5 h-5" /> 1-Year Warranty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
