import { notFound } from 'next/navigation';

export const runtime = 'edge';

// This file exists temporarily to clear a Cloudflare caching bug.
// Cloudflare caches the old dynamic route and crashes when we delete it.
export function generateStaticParams() {
  return [];
}

export default function DummyPage() {
  notFound();
}
