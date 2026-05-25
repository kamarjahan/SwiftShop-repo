import PolicyClient from "./PolicyClient";

export function generateStaticParams() {
  return [
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'return-cancellation' },
    { slug: 'refund' },
    { slug: 'contact' },
    { slug: 'faq' }
  ];
}

export default function PolicyPage() {
  return <PolicyClient />;
}
