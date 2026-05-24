import { MetadataRoute } from 'next';
import { mockProducts } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://swiftshop.com';

  const productUrls = mockProducts.map((product) => ({
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
