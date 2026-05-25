"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    privacyPolicy: "",
    termsAndConditions: "",
    returnCancellation: "",
    refundPolicy: "",
    contactUs: "",
    faq: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "legal_pages");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            privacyPolicy: data.privacyPolicy || "",
            termsAndConditions: data.termsAndConditions || "",
            returnCancellation: data.returnCancellation || "",
            refundPolicy: data.refundPolicy || "",
            contactUs: data.contactUs || "",
            faq: data.faq || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "legal_pages"), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
      </div>
    );
  }

  const renderTextarea = (label: string, name: keyof typeof formData, description: string) => (
    <div className="space-y-3 border-b border-bento-border pb-8 last:border-0 last:pb-0">
      <label className="block font-black text-xl">{label}</label>
      <p className="text-sm text-foreground/60 mb-2">{description}</p>
      <textarea 
        name={name}
        value={formData[name]}
        onChange={handleChange}
        rows={10}
        className="w-full bg-background border border-bento-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono"
        placeholder={`Enter Markdown for ${label}...`}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-foreground" /> Page Settings
          </h1>
          <p className="text-foreground/60">Manage your legal policies and public pages using Markdown.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-8">
        <div className="bg-blue-500/10 text-blue-600 border border-blue-500/20 p-4 rounded-xl text-sm font-medium mb-6">
          <strong>Tip:</strong> You can use advanced Markdown formatting! Use <code className="bg-blue-500/20 px-1 rounded">#</code> for headers, <code className="bg-blue-500/20 px-1 rounded">**bold**</code> for bold text, and <code className="bg-blue-500/20 px-1 rounded">-</code> for bullet points.
        </div>
        
        {renderTextarea("Privacy Policy", "privacyPolicy", "Explain how you collect, use, and protect customer data.")}
        {renderTextarea("Terms & Conditions", "termsAndConditions", "Set the rules and guidelines that users must agree to in order to use your service.")}
        {renderTextarea("Return & Cancellation Policy", "returnCancellation", "Explain your rules for when customers want to cancel an order or return a product.")}
        {renderTextarea("Refund Policy", "refundPolicy", "Explain the conditions under which customers receive refunds, and how long it takes.")}
        {renderTextarea("Contact Us", "contactUs", "Enter your contact information, physical address, support email, and phone numbers.")}
        {renderTextarea("FAQ", "faq", "Frequently Asked Questions. Use headers (e.g., ### Question) and paragraphs for answers.")}
      </div>
    </div>
  );
}
