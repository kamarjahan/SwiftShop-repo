"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { Loader2, UploadCloud, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Variant {
  id: string;
  name: string;
  price?: string;
  stock?: string;
}

export default function EditProductPage() {
  const { id } = useParams() as { id: string };
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // Selling Price
  const [mrp, setMrp] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // New Fields
  const [chargeShipping, setChargeShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("return 7 days");
  const [codEnabled, setCodEnabled] = useState(false);

  // Variants
  const [hasIndividualVariantPricing, setHasIndividualVariantPricing] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        // Fetch Categories
        const catSnap = await getDocs(collection(db, "products"));
        const catSet = new Set<string>();
        catSnap.docs.forEach(d => {
          if (d.data().category) catSet.add(d.data().category.toLowerCase());
        });
        setExistingCategories(Array.from(catSet));

        // Fetch Product
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setMrp(data.mrp?.toString() || "");
          setPrice(data.price?.toString() || "");
          setCostPrice(data.costPrice?.toString() || "");
          setCategory(data.category || "electronics");
          setDescription(data.description || "");
          setSku(data.sku || "");
          setTotalStock(data.totalStock?.toString() || "");
          setExistingImages(data.images || []);
          setChargeShipping(data.chargeShipping || false);
          setShippingCost(data.shippingCost?.toString() || "");
          setReturnPolicy(data.returnPolicy || "return 7 days");
          setCodEnabled(data.codEnabled || false);
          setHasIndividualVariantPricing(data.hasIndividualVariantPricing || false);
          
          if (data.variants) {
            setVariants(data.variants.map((v: any, idx: number) => ({
              id: Date.now().toString() + idx,
              name: v.name || "",
              price: v.price?.toString() || "",
              stock: v.stock?.toString() || ""
            })));
          }
        } else {
          alert("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProductAndCategories();
  }, [id, router]);

  const numPrice = parseFloat(price) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const profit = numPrice - numCost;
  const margin = numPrice > 0 ? ((profit / numPrice) * 100).toFixed(1) : "0.0";

  const handleImageUploads = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    const urls: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      urls.push(data.secure_url);
    }
    return urls;
  };

  const addVariant = () => {
    setVariants([...variants, { id: Date.now().toString(), name: "", price: "", stock: "" }]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImages = [...existingImages];
      
      if (imageFiles.length > 0) {
        const uploadedUrls = await handleImageUploads();
        if (uploadedUrls.length > 0) finalImages = [...finalImages, ...uploadedUrls];
      }
      
      // Fallback if completely empty
      if (finalImages.length === 0) {
        finalImages = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"];
      }

      const productData = {
        name,
        mrp: parseFloat(mrp) || 0,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice) || 0,
        category,
        description,
        images: finalImages,
        sku,
        totalStock: parseInt(totalStock) || 0,
        chargeShipping,
        shippingCost: chargeShipping ? parseFloat(shippingCost) || 0 : 0,
        returnPolicy,
        codEnabled,
        hasIndividualVariantPricing,
        variants: variants.map(v => ({
          name: v.name,
          price: hasIndividualVariantPricing ? (parseFloat(v.price!) || 0) : null,
          stock: hasIndividualVariantPricing ? (parseInt(v.stock!) || 0) : null,
        })),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, "products", id), productData);
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      
      <div>
        <h1 className="text-3xl font-black">Edit Product</h1>
        <p className="text-foreground/60">Modify existing product listing details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details */}
        <section className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-bento-border pb-2">
            <h2 className="text-xl font-bold">Basic Details</h2>
            {(price || costPrice) && (
              <div className={`text-sm font-bold px-3 py-1 rounded-full ${profit > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                Profit: ₹{profit.toFixed(2)} ({margin}%)
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold">Product Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Product Name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/60">M.R.P (₹)</label>
              <input required type="number" step="0.01" value={mrp} onChange={e => setMrp(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Selling Price (₹)</label>
              <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-bold text-blue-600" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/60">Cost Price (₹)</label>
              <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="0.00" />
              <p className="text-[10px] text-foreground/50">Hidden from customers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground/70 mb-2">Category</label>
              <input 
                type="text" 
                list="category-suggestions"
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="e.g. electronics or type a new one"
              />
              <datalist id="category-suggestions">
                {existingCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">SKU</label>
              <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="PROD-123" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Total Stock</label>
              <input type="number" required value={totalStock} onChange={e => setTotalStock(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Description</label>
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Detail the features and specifications..."></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold">Product Images</label>
            
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-4">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 border border-bento-border rounded-xl overflow-hidden group">
                    <img src={url} alt="product" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed border-bento-border rounded-xl cursor-pointer hover:bg-foreground/5 transition-colors p-4">
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-foreground/40 mb-2" />
                <p className="text-sm text-foreground/60 font-medium text-center">
                  {imageFiles.length > 0 
                    ? `${imageFiles.length} new file(s) selected to add` 
                    : "Click to upload more images via Cloudinary"}
                </p>
                {imageFiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {imageFiles.map((file, idx) => (
                      <span key={idx} className="text-xs bg-background border border-bento-border px-2 py-1 rounded truncate max-w-[150px]">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files) {
                  setImageFiles(Array.from(e.target.files));
                }
              }} />
            </label>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-bento-border pb-4 gap-4">
            <h2 className="text-xl font-bold">Variants</h2>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm bg-foreground/5 px-4 py-2 rounded-lg">
              <input type="checkbox" checked={hasIndividualVariantPricing} onChange={e => setHasIndividualVariantPricing(e.target.checked)} className="w-4 h-4 accent-foreground" />
              Individual Price & Stock
            </label>
          </div>

          <div className="space-y-4">
            {variants.map((variant) => (
              <div key={variant.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-background border border-bento-border p-4 rounded-xl relative">
                <button type="button" onClick={() => removeVariant(variant.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-bold text-foreground/60">Variant Name (e.g., Red, Large)</label>
                  <input type="text" required value={variant.name} onChange={e => updateVariant(variant.id, 'name', e.target.value)} className="w-full bg-foreground/5 border border-bento-border rounded-lg px-3 py-2 text-sm" placeholder="Name" />
                </div>
                {hasIndividualVariantPricing && (
                  <>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-bold text-foreground/60">Price (₹)</label>
                      <input type="number" required step="0.01" value={variant.price} onChange={e => updateVariant(variant.id, 'price', e.target.value)} className="w-full bg-foreground/5 border border-bento-border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-bold text-foreground/60">Stock</label>
                      <input type="number" required value={variant.stock} onChange={e => updateVariant(variant.id, 'stock', e.target.value)} className="w-full bg-foreground/5 border border-bento-border rounded-lg px-3 py-2 text-sm" placeholder="0" />
                    </div>
                  </>
                )}
              </div>
            ))}
            
            <button type="button" onClick={addVariant} className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-foreground/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Variant
            </button>
          </div>
        </section>

        {/* Shipping & Policies */}
        <section className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Shipping & Policies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border border-bento-border p-4 rounded-xl bg-background">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input type="checkbox" checked={chargeShipping} onChange={e => setChargeShipping(e.target.checked)} className="w-5 h-5 accent-foreground" />
                Charge Shipping
              </label>
              {chargeShipping && (
                <div className="space-y-2 pt-2 border-t border-bento-border">
                  <label className="text-sm font-bold">Shipping Cost (₹)</label>
                  <input required={chargeShipping} type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(e.target.value)} className="w-full bg-foreground/5 border border-bento-border rounded-lg px-4 py-2 focus:outline-none" placeholder="50.00" />
                </div>
              )}
            </div>

            <div className="space-y-4 border border-bento-border p-4 rounded-xl bg-background">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)} className="w-5 h-5 accent-foreground" />
                Enable Cash On Delivery (COD)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Return Policy</label>
            <select value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 appearance-none">
              <option value="return 7 days">7 Days Return</option>
              <option value="replacement 7 days">7 Days Replacement</option>
              <option value="no refund">No Refund</option>
            </select>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-foreground text-background px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-xl">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
