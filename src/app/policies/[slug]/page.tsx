import { notFound } from 'next/navigation';

// This file exists temporarily to clear a Cloudflare caching bug.
// Cloudflare caches the old dynamic route and crashes when we delete it.
// By keeping it here but generating zero pages, it overrides the cache safely.
export function generateStaticParams() {
  return [];
}

export default function DummyPage() {
  notFound();
}
