import { MetadataRoute } from 'next';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://swiftshop.com';

  let products: any[] = [];
  try {
    const snap = await getDocs(collection(db, "products"));
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Sitemap fetch failed", e);
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ];
}
