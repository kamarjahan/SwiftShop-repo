"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save } from "lucide-react";

export default function HomeCustomization() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    maintenance_mode: { enabled: false, message: "We'll be back soon!" },
    todays_deal_banner: { enabled: true, text: "Flash Sale: Up to 50% Off", bgColor: "#ff0000", textColor: "#ffffff" },
    hero_banner: { enabled: true, title: "Elevate Your Everyday.", subtitle: "Discover the new collection.", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050", buttonText: "Shop Collection", linkUrl: "/shop" },
    offers_cards: [] as {id: string, image: string, text: string, link: string}[],
    featured_categories: [] as {id: string, name: string, slug: string, imageUrl: string}[]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "home_page");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "home_page"), settings, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground/40" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Home Page Settings</h1>
          <p className="text-foreground/60">Customize the appearance of your storefront.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-foreground text-background px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        {/* Maintenance Mode */}
        <section className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] space-y-4">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Maintenance Mode</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" checked={settings.maintenance_mode.enabled} onChange={e => setSettings({...settings, maintenance_mode: {...settings.maintenance_mode, enabled: e.target.checked}})} className="w-5 h-5 accent-foreground" />
              Enable Maintenance Mode
            </label>
          </div>
          {settings.maintenance_mode.enabled && (
            <div className="space-y-2">
              <label className="text-sm font-bold">Maintenance Message</label>
              <input type="text" value={settings.maintenance_mode.message} onChange={e => setSettings({...settings, maintenance_mode: {...settings.maintenance_mode, message: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20" />
            </div>
          )}
        </section>

        {/* Today's Deal Banner */}
        <section className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] space-y-4">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Top Banner (Today's Deal)</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" checked={settings.todays_deal_banner.enabled} onChange={e => setSettings({...settings, todays_deal_banner: {...settings.todays_deal_banner, enabled: e.target.checked}})} className="w-5 h-5 accent-foreground" />
              Show Top Banner
            </label>
          </div>
          {settings.todays_deal_banner.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Banner Text</label>
                <input type="text" value={settings.todays_deal_banner.text} onChange={e => setSettings({...settings, todays_deal_banner: {...settings.todays_deal_banner, text: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-bold">Background Color</label>
                  <input type="color" value={settings.todays_deal_banner.bgColor} onChange={e => setSettings({...settings, todays_deal_banner: {...settings.todays_deal_banner, bgColor: e.target.value}})} className="w-full h-10 rounded-lg cursor-pointer border border-bento-border" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-bold">Text Color</label>
                  <input type="color" value={settings.todays_deal_banner.textColor} onChange={e => setSettings({...settings, todays_deal_banner: {...settings.todays_deal_banner, textColor: e.target.value}})} className="w-full h-10 rounded-lg cursor-pointer border border-bento-border" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Hero Banner */}
        <section className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] space-y-4">
          <h2 className="text-xl font-bold border-b border-bento-border pb-2">Hero Banner</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Hero Title</label>
              <input type="text" value={settings.hero_banner.title} onChange={e => setSettings({...settings, hero_banner: {...settings.hero_banner, title: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Hero Subtitle</label>
              <input type="text" value={settings.hero_banner.subtitle} onChange={e => setSettings({...settings, hero_banner: {...settings.hero_banner, subtitle: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Hero Image URL</label>
              <input type="text" value={settings.hero_banner.imageUrl} onChange={e => setSettings({...settings, hero_banner: {...settings.hero_banner, imageUrl: e.target.value}})} placeholder="https://..." className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Button Text</label>
                <input type="text" value={settings.hero_banner.buttonText} onChange={e => setSettings({...settings, hero_banner: {...settings.hero_banner, buttonText: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Button Link URL</label>
                <input type="text" value={settings.hero_banner.linkUrl} onChange={e => setSettings({...settings, hero_banner: {...settings.hero_banner, linkUrl: e.target.value}})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-2" />
              </div>
            </div>
          </div>
        </section>

        {/* Offers Cards */}
        <section className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] space-y-4">
          <div className="flex items-center justify-between border-b border-bento-border pb-2">
            <h2 className="text-xl font-bold">Offers Cards</h2>
            <button onClick={() => setSettings({...settings, offers_cards: [...settings.offers_cards, { id: Date.now().toString(), image: "", text: "", link: "" }]})} className="text-sm font-bold bg-foreground/10 px-3 py-1 rounded-full hover:bg-foreground/20">Add Card</button>
          </div>
          <div className="space-y-4">
            {settings.offers_cards.map((card, index) => (
              <div key={card.id} className="p-4 border border-bento-border rounded-lg relative flex gap-4">
                <button onClick={() => {
                  const newCards = [...settings.offers_cards];
                  newCards.splice(index, 1);
                  setSettings({...settings, offers_cards: newCards});
                }} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded">X</button>
                <div className="flex-1 space-y-2">
                  <input type="text" placeholder="Image URL" value={card.image} onChange={e => {
                    const newCards = [...settings.offers_cards];
                    newCards[index].image = e.target.value;
                    setSettings({...settings, offers_cards: newCards});
                  }} className="w-full bg-background border border-bento-border rounded px-3 py-1 text-sm" />
                  <input type="text" placeholder="Deal Text" value={card.text} onChange={e => {
                    const newCards = [...settings.offers_cards];
                    newCards[index].text = e.target.value;
                    setSettings({...settings, offers_cards: newCards});
                  }} className="w-full bg-background border border-bento-border rounded px-3 py-1 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="bg-bento-card border border-bento-border p-6 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] space-y-4">
          <div className="flex items-center justify-between border-b border-bento-border pb-2">
            <h2 className="text-xl font-bold">Featured Categories</h2>
            <button onClick={() => setSettings({...settings, featured_categories: [...settings.featured_categories, { id: Date.now().toString(), name: "", slug: "", imageUrl: "" }]})} className="text-sm font-bold bg-foreground/10 px-3 py-1 rounded-full hover:bg-foreground/20">Add Category</button>
          </div>
          <div className="space-y-4">
            {settings.featured_categories.map((cat, index) => (
              <div key={cat.id} className="p-4 border border-bento-border rounded-lg relative flex gap-4">
                <button onClick={() => {
                  const newCats = [...settings.featured_categories];
                  newCats.splice(index, 1);
                  setSettings({...settings, featured_categories: newCats});
                }} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded">X</button>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Name" value={cat.name} onChange={e => {
                      const newCats = [...settings.featured_categories];
                      newCats[index].name = e.target.value;
                      setSettings({...settings, featured_categories: newCats});
                    }} className="flex-1 bg-background border border-bento-border rounded px-3 py-1 text-sm" />
                    <input type="text" placeholder="Slug" value={cat.slug} onChange={e => {
                      const newCats = [...settings.featured_categories];
                      newCats[index].slug = e.target.value;
                      setSettings({...settings, featured_categories: newCats});
                    }} className="flex-1 bg-background border border-bento-border rounded px-3 py-1 text-sm" />
                  </div>
                  <input type="text" placeholder="Image URL" value={cat.imageUrl} onChange={e => {
                    const newCats = [...settings.featured_categories];
                    newCats[index].imageUrl = e.target.value;
                    setSettings({...settings, featured_categories: newCats});
                  }} className="w-full bg-background border border-bento-border rounded px-3 py-1 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
