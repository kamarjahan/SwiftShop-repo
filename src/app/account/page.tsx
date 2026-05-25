"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut, sendPasswordResetEmail, updateProfile as updateAuthProfile } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Package, Heart, LayoutDashboard, MapPin, Edit, Plus, Trash2, Loader2, AlertCircle, Award } from "lucide-react";
import Link from "next/link";
import SupportTab from "@/components/account/SupportTab";

export default function AccountPage() {
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard State
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);

  // Profile State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Addresses State
  const [editingAddressIdx, setEditingAddressIdx] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", pincode: "", city: "", flat: "", area: "", landmark: "", state: "", isDefault: false });

  // Wishlist State
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user && userData) {
      setProfileName(userData.displayName || user.displayName || "");
      setProfilePhone(userData.phone || "");
    }
  }, [user, userData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (user && activeTab === "dashboard") {
      fetchDashboardData();
    }
    if (user && activeTab === "wishlist") {
      fetchWishlistData();
    }
  }, [user, activeTab, userData?.wishlist]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // Get latest 3
      const qRecent = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(3));
      const snapRecent = await getDocs(qRecent);
      setRecentOrders(snapRecent.docs.map(d => ({ id: d.id, ...d.data() })));
      
      // Get total count (for large datasets use count(), but getDocs is fine here)
      const qTotal = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snapTotal = await getDocs(qTotal);
      setTotalOrders(snapTotal.size);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWishlistData = async () => {
    if (!user || !userData?.wishlist || userData.wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const prods = await Promise.all(
        userData.wishlist.map(async (id: string) => {
          const docSnap = await getDoc(doc(db, "products", id));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        })
      );
      setWishlistProducts(prods.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileUpdating(true);
    try {
      await updateAuthProfile(user, { displayName: profileName });
      await setDoc(doc(db, "users", user.uid), { displayName: profileName, phone: profilePhone }, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      console.error(error);
      toast.error("Error sending reset email.");
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    let currentAddresses = userData?.addresses || [];
    if (userData?.address && currentAddresses.length === 0) {
      // Migrate old format
      currentAddresses = [{ ...userData.address, isDefault: true }];
    }

    let newAddresses = [...currentAddresses];
    
    // Enforce max 2 rule for new addresses
    if (isAddingAddress && newAddresses.length >= 2) {
      toast("You can only have up to 2 addresses. Please edit or delete an existing one.");
      return;
    }

    if (addressForm.isDefault) {
      newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
    } else if (newAddresses.length === 0) {
      addressForm.isDefault = true;
    }

    if (isAddingAddress) {
      newAddresses.push({ ...addressForm });
    } else if (editingAddressIdx !== null) {
      newAddresses[editingAddressIdx] = { ...addressForm };
    }

    try {
      await updateDoc(doc(db, "users", user.uid), { addresses: newAddresses });
      setIsAddingAddress(false);
      setEditingAddressIdx(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save address.");
    }
  };

  const deleteAddress = async (idx: number) => {
    if (!user || !confirm("Delete this address?")) return;
    let currentAddresses = userData?.addresses || [];
    currentAddresses.splice(idx, 1);
    
    if (currentAddresses.length > 0 && !currentAddresses.find((a:any) => a.isDefault)) {
      currentAddresses[0].isDefault = true;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), { addresses: currentAddresses });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/20" />
      </div>
    );
  }

  if (!user) return null;

  const currentAddresses = userData?.addresses || (userData?.address ? [{ ...userData.address, isDefault: true }] : []);
  const defaultAddress = currentAddresses.find((a:any) => a.isDefault) || currentAddresses[0];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-foreground/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-foreground/40" />
              )}
            </div>
            <h3 className="font-bold text-lg">{userData?.displayName || user.displayName || "Shopper"}</h3>
            <p className="text-xs text-foreground/60">{user.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'profile', icon: User, label: 'Profile Details' },
              { id: 'addresses', icon: MapPin, label: 'Saved Addresses' },
              { id: 'wishlist', icon: Heart, label: 'Wishlist' },
              { id: 'support', icon: AlertCircle, label: 'Help & Support' },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsAddingAddress(false); setEditingAddressIdx(null); }}
                  className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-foreground text-background shadow-md' 
                      : 'text-foreground/70 hover:bg-foreground/5'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              )
            })}
            
            <Link 
              href="/orders"
              className="flex items-center gap-3 px-4 py-3 text-foreground/70 hover:bg-foreground/5 font-bold rounded-xl text-sm transition-all mt-2"
            >
              <Package className="w-4 h-4" /> All Orders
            </Link>

            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 font-bold rounded-xl text-sm transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 rounded-2xl shadow-[var(--shadow-bento)] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <h3 className="font-bold text-yellow-700 dark:text-yellow-400">Loyalty Points</h3>
                      <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <p className="text-3xl font-black text-yellow-800 dark:text-yellow-300 relative z-10">{userData?.loyaltyPoints || 0}</p>
                    <div className="mt-4 relative z-10">
                      <button disabled className="w-full text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                        Redeem Options Coming Soon
                      </button>
                    </div>
                  </div>
                  <div className="bg-bento-card border border-bento-border p-6 rounded-2xl shadow-[var(--shadow-bento)]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground/70">Total Orders</h3>
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black">{totalOrders}</p>
                  </div>
                  <div className="bg-bento-card border border-bento-border p-6 rounded-2xl shadow-[var(--shadow-bento)]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground/70">Wishlist Items</h3>
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-black">{userData?.wishlist?.length || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default Address */}
                  <div className="bg-bento-card border border-bento-border p-6 rounded-2xl shadow-[var(--shadow-bento)]">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Default Address</h3>
                    {defaultAddress ? (
                      <div className="text-sm space-y-1 text-foreground/80">
                        <p className="font-bold text-base">{defaultAddress.fullName}</p>
                        <p>{defaultAddress.flat}, {defaultAddress.area}</p>
                        <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}</p>
                        <p className="pt-2 text-foreground/60">Phone: {defaultAddress.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/50">No address saved yet.</p>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-bento-card border border-bento-border p-6 rounded-2xl shadow-[var(--shadow-bento)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Package className="w-5 h-5" /> Recent Orders</h3>
                      <Link href="/orders" className="text-xs font-bold text-blue-500 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                      {recentOrders.length > 0 ? recentOrders.map(order => (
                        <Link href={`/orders`} key={order.id} className="flex justify-between items-center group">
                          <div>
                            <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">Order #{order.id.slice(0,8)}</p>
                            <p className="text-xs text-foreground/50">{new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {order.status}
                          </span>
                        </Link>
                      )) : (
                        <p className="text-sm text-foreground/50">No recent orders.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] max-w-2xl">
                  <h2 className="text-2xl font-black mb-6">Profile Details</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={user.email || ""} 
                        disabled
                        className="w-full bg-foreground/5 border border-bento-border rounded-lg px-4 py-3 text-sm text-foreground/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-foreground/50 mt-1">Email address cannot be changed.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground/80 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-bento-border">
                      <button 
                        type="button"
                        onClick={handleSendResetEmail}
                        className="text-sm font-bold text-blue-500 hover:underline"
                      >
                        {resetSent ? "Reset link sent!" : "Send Password Reset Link"}
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={profileUpdating}
                        className="bg-foreground text-background px-6 py-2 rounded-lg font-bold hover:bg-foreground/90 transition-colors disabled:opacity-50"
                      >
                        {profileUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {!isAddingAddress && editingAddressIdx === null ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black">Saved Addresses</h2>
                      <button 
                        onClick={() => {
                          if (currentAddresses.length >= 2) {
                            toast("You can only have up to 2 addresses.");
                            return;
                          }
                          setIsAddingAddress(true);
                          setAddressForm({ fullName: "", phone: "", pincode: "", city: "", flat: "", area: "", landmark: "", state: "", isDefault: false });
                        }}
                        className="flex items-center gap-2 bg-foreground/10 hover:bg-foreground/20 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add New
                      </button>
                    </div>
                    <p className="text-sm text-foreground/60">You can save up to 2 addresses. ({currentAddresses.length}/2)</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentAddresses.map((addr: any, idx: number) => (
                        <div key={idx} className="bg-bento-card border border-bento-border p-6 rounded-2xl shadow-[var(--shadow-bento)] relative">
                          {addr.isDefault && <span className="absolute top-4 right-4 bg-green-500/10 text-green-600 text-[10px] font-black uppercase px-2 py-1 rounded">Default</span>}
                          
                          <div className="text-sm space-y-1 text-foreground/80 mb-6">
                            <p className="font-bold text-base text-foreground">{addr.fullName}</p>
                            <p>{addr.flat}, {addr.area}</p>
                            <p>{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className="pt-2">Phone: <span className="font-medium text-foreground">{addr.phone}</span></p>
                          </div>
                          
                          <div className="flex gap-2 border-t border-bento-border pt-4">
                            <button 
                              onClick={() => {
                                setEditingAddressIdx(idx);
                                setAddressForm({ ...addr });
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button 
                              onClick={() => deleteAddress(idx)}
                              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline ml-4"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)] max-w-2xl">
                    <h2 className="text-2xl font-black mb-6">{isAddingAddress ? "Add New Address" : "Edit Address"}</h2>
                    
                    <form onSubmit={saveAddress} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Full Name</label>
                          <input required type="text" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Mobile Number</label>
                          <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Pincode</label>
                          <input required type="text" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Town / City</label>
                          <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Flat, House no., Apartment</label>
                          <input required type="text" value={addressForm.flat} onChange={e => setAddressForm({...addressForm, flat: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Area, Street, Sector</label>
                          <input required type="text" value={addressForm.area} onChange={e => setAddressForm({...addressForm, area: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground/80 mb-2">Landmark</label>
                          <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground/80 mb-2">State</label>
                          <input required type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        </div>
                      </div>
                      
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 accent-foreground" />
                        <span className="text-sm font-bold text-foreground/80">Set as default address</span>
                      </label>
                      
                      <div className="flex gap-4 pt-4 border-t border-bento-border">
                        <button type="submit" className="bg-foreground text-background px-6 py-2 rounded-lg font-bold hover:bg-foreground/90 transition-colors">
                          Save Address
                        </button>
                        <button type="button" onClick={() => {setIsAddingAddress(false); setEditingAddressIdx(null)}} className="bg-foreground/10 px-6 py-2 rounded-lg font-bold hover:bg-foreground/20 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-2xl font-black mb-6">My Wishlist</h2>
                
                {wishlistLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/20" /></div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-12 text-center text-foreground/50 flex flex-col items-center">
                    <Heart className="w-12 h-12 text-foreground/20 mb-4" />
                    <p>Your wishlist is empty.</p>
                    <Link href="/shop" className="text-blue-500 font-bold hover:underline mt-2">Discover products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {wishlistProducts.map(product => (
                      <Link key={product.id} href={`/product/${product.id}`} className="bg-bento-card border border-bento-border rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-sm line-clamp-2 mb-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-lg">₹{(product.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SupportTab user={user} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
