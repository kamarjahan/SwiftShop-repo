"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePathname } from "next/navigation";
import { Loader2, Wrench } from "lucide-react";

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "" });
  const pathname = usePathname();

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "home_page"));
        if (docSnap.exists() && docSnap.data().maintenance_mode) {
          setMaintenance(docSnap.data().maintenance_mode);
        }
      } catch (e) {
        console.error("Error fetching maintenance settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
      </div>
    );
  }

  // Allow access to admin panel even if maintenance mode is enabled
  if (maintenance.enabled && !pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <Wrench className="w-16 h-16 text-foreground/40 mb-6" />
        <h1 className="text-4xl md:text-5xl font-black mb-4">Under Maintenance</h1>
        <p className="text-xl text-foreground/60 max-w-lg">
          {maintenance.message || "We are currently updating our store to serve you better. Please check back soon!"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
