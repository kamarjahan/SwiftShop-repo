"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PolicyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(false);
      try {
        const docRef = doc(db, "settings", "legal_pages");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          switch (slug) {
            case "privacy":
              setTitle("Privacy Policy");
              setContent(data.privacyPolicy || "No content available.");
              break;
            case "terms":
              setTitle("Terms and Conditions");
              setContent(data.termsAndConditions || "No content available.");
              break;
            case "return-cancellation":
              setTitle("Return & Cancellation Policy");
              setContent(data.returnCancellation || "No content available.");
              break;
            case "refund":
              setTitle("Refund Policy");
              setContent(data.refundPolicy || "No content available.");
              break;
            case "contact":
              setTitle("Contact Us");
              setContent(data.contactUs || "No content available.");
              break;
            case "faq":
              setTitle("Frequently Asked Questions");
              setContent(data.faq || "No content available.");
              break;
            default:
              setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching policy:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPolicy();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-black mb-4">Page Not Found</h1>
        <p className="text-foreground/60 mb-8">The policy page you are looking for does not exist.</p>
        <Link href="/" className="bg-foreground text-background px-6 py-3 rounded-full font-bold">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">{title}</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-p:leading-relaxed prose-a:text-blue-500 hover:prose-a:text-blue-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
