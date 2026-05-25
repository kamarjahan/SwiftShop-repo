"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    legal: "",
    privacyPolicy: "",
    termsAndConditions: "",
    contactUs: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "legal_pages");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({
            legal: docSnap.data().legal || "",
            privacyPolicy: docSnap.data().privacyPolicy || "",
            termsAndConditions: docSnap.data().termsAndConditions || "",
            contactUs: docSnap.data().contactUs || "",
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
    setSuccessMsg("");
    try {
      await setDoc(doc(db, "settings", "legal_pages"), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-foreground" /> Page Settings
          </h1>
          <p className="text-foreground/60">Manage your legal, privacy, terms, and contact content.</p>
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

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500 text-green-600 px-4 py-3 rounded-xl font-bold">
          {successMsg}
        </div>
      )}

      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] p-6 md:p-8 space-y-8">
        
        <div className="space-y-3">
          <label className="block font-bold text-lg">Contact Us</label>
          <p className="text-xs text-foreground/60">Enter your contact information, physical address, support email, and phone numbers.</p>
          <textarea 
            name="contactUs"
            value={formData.contactUs}
            onChange={handleChange}
            rows={5}
            className="w-full bg-background border border-bento-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="E.g., Contact us at support@swiftshop.com..."
          />
        </div>

        <div className="space-y-3">
          <label className="block font-bold text-lg">Privacy Policy</label>
          <p className="text-xs text-foreground/60">Explain how you collect, use, and protect customer data.</p>
          <textarea 
            name="privacyPolicy"
            value={formData.privacyPolicy}
            onChange={handleChange}
            rows={8}
            className="w-full bg-background border border-bento-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Your privacy policy content here..."
          />
        </div>

        <div className="space-y-3">
          <label className="block font-bold text-lg">Terms and Conditions</label>
          <p className="text-xs text-foreground/60">Set the rules and guidelines that users must agree to in order to use your service.</p>
          <textarea 
            name="termsAndConditions"
            value={formData.termsAndConditions}
            onChange={handleChange}
            rows={8}
            className="w-full bg-background border border-bento-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Your terms and conditions content here..."
          />
        </div>

        <div className="space-y-3">
          <label className="block font-bold text-lg">Legal / Other Policies</label>
          <p className="text-xs text-foreground/60">Any other legal disclaimers, refund policies, or shipping policies.</p>
          <textarea 
            name="legal"
            value={formData.legal}
            onChange={handleChange}
            rows={8}
            className="w-full bg-background border border-bento-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Legal information or refund policy..."
          />
        </div>

      </div>
    </div>
  );
}
