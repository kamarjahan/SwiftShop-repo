import Link from "next/link";
import { ArrowLeft, FileText, Shield, RefreshCcw, DollarSign, Phone, HelpCircle } from "lucide-react";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { name: "Privacy Policy", href: "/policies/privacy", icon: Shield },
    { name: "Terms & Conditions", href: "/policies/terms", icon: FileText },
    { name: "Return & Cancellation", href: "/policies/return-cancellation", icon: RefreshCcw },
    { name: "Refund Policy", href: "/policies/refund", icon: DollarSign },
    { name: "Contact Us", href: "/policies/contact", icon: Phone },
    { name: "FAQ", href: "/policies/faq", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b border-bento-border bg-bento-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Link>
          <div className="mx-4 w-px h-4 bg-bento-border"></div>
          <span className="font-bold tracking-tight">Legal & Support Center</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="sticky top-28 space-y-1">
            <h3 className="px-4 text-xs font-black uppercase tracking-wider text-foreground/40 mb-4">Policies</h3>
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all group"
              >
                <link.icon className="w-5 h-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-bento-card border border-bento-border rounded-[32px] p-8 md:p-14 shadow-sm">
            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:border-b prose-h2:border-bento-border prose-h2:pb-4 prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-li:marker:text-foreground/40">
              {children}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
