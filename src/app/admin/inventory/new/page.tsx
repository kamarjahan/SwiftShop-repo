"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30"; // Fallback
      
      if (imageFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        category,
        description,
        images: [imageUrl],
        rating: 0,
        reviewsCount: 0,
        createdAt: new Date().toISOString()
      });

      router.push("/admin/inventory");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/inventory" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>
      
      <div>
        <h1 className="text-3xl font-black">Add New Product</h1>
        <p className="text-foreground/60">Create a new product listing in your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Product Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Premium Headphones" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Price ($)</label>
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="299.99" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 appearance-none">
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Product Image</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-bento-border rounded-xl cursor-pointer hover:bg-foreground/5 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 text-foreground/40 mb-2" />
              <p className="text-sm text-foreground/60 font-medium">
                {imageFile ? imageFile.name : "Click to upload an image via Cloudinary"}
              </p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Description</label>
          <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Detail the features and specifications..."></textarea>
        </div>

        <div className="pt-4 border-t border-bento-border flex justify-end">
          <button type="submit" disabled={loading} className="bg-foreground text-background px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-colors">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
