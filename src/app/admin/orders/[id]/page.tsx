"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Package, Truck, User, CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [returnRequest, setReturnRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [status, setStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push("/");
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [userData, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        setOrder(null);
        return;
      }

      const orderData = { id: orderSnap.id, ...orderSnap.data() };
      setOrder(orderData);
      setStatus(orderData.status || "Pending");
      setTrackingId(orderData.trackingId || "");

      // Fetch user email
      if (orderData.userId) {
        const userRef = doc(db, "users", orderData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCustomerEmail(userSnap.data().email || "No email linked");
        }
      }

      // Check for active returns
      const returnsQ = query(collection(db, "returns"), where("orderId", "==", id));
      const returnsSnap = await getDocs(returnsQ);
      if (!returnsSnap.empty) {
        setReturnRequest({ id: returnsSnap.docs[0].id, ...returnsSnap.docs[0].data() });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
        trackingId: trackingId || null,
      });
      setOrder({ ...order, status, trackingId });
      alert("Order updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAction = async (actionType: string) => {
    if (!confirm(`Are you sure you want to ${actionType} this order?`)) return;
    setIsUpdating(true);
    try {
      let newStatus = "";
      
      if (actionType === "Reject Order") newStatus = "Rejected";
      else if (actionType === "Cancel Order") newStatus = "Cancelled";
      else if (actionType === "Accept Cancellation") newStatus = "Cancelled";
      else if (actionType === "Deny Cancellation") newStatus = "Pending"; // Or revert to previous
      
      if (newStatus) {
        await updateDoc(doc(db, "orders", id), { status: newStatus });
        setOrder({ ...order, status: newStatus });
        setStatus(newStatus);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturnAction = async (isApproved: boolean) => {
    setIsUpdating(true);
    try {
      const returnRef = doc(db, "returns", returnRequest.id);
      
      if (isApproved) {
        const newStatus = returnRequest.type === 'return' ? "Returned" : "Replaced";
        await updateDoc(returnRef, { status: "Approved" });
        await updateDoc(doc(db, "orders", id), { status: newStatus });
        setOrder({ ...order, status: newStatus });
        setStatus(newStatus);
        setReturnRequest({ ...returnRequest, status: "Approved" });
      } else {
        await updateDoc(returnRef, { status: "Denied" });
        await updateDoc(doc(db, "orders", id), { status: "Delivered" });
        setOrder({ ...order, status: "Delivered" });
        setStatus("Delivered");
        setReturnRequest({ ...returnRequest, status: "Denied" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/20" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-black mb-4">Order not found</h1>
        <Link href="/admin/orders" className="text-blue-500 font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const isReturnRequested = order.status === "Return Requested" || order.status === "Replacement Requested";
  const isCancelRequested = order.status === "Cancellation Requested";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Order #{order.id}</h1>
          <p className="text-sm text-foreground/60">Placed on {new Date(order.createdAt?.toDate()).toLocaleString()}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-black text-sm uppercase ${
          order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
          order.status === 'Cancelled' || order.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
          isReturnRequested || isCancelRequested ? 'bg-orange-500/10 text-orange-500' :
          'bg-blue-500/10 text-blue-500'
        }`}>
          {order.status}
        </div>
      </div>

      {/* Warnings for Requests */}
      {isCancelRequested && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-orange-500">Cancellation Requested</h3>
            <p className="text-sm text-orange-500/80">The customer has requested to cancel this order.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction("Deny Cancellation")} disabled={isUpdating} className="px-4 py-2 bg-background border border-bento-border rounded-lg font-bold text-sm">Deny</button>
            <button onClick={() => handleAction("Accept Cancellation")} disabled={isUpdating} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm">Accept Cancel</button>
          </div>
        </div>
      )}

      {isReturnRequested && returnRequest && returnRequest.status === "Pending" && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-orange-500 capitalize">{returnRequest.type} Requested</h3>
            <p className="text-sm font-bold mt-1 text-orange-500/80">Reason: {returnRequest.reason}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleReturnAction(false)} disabled={isUpdating} className="px-4 py-2 bg-background border border-bento-border rounded-lg font-bold text-sm">Deny</button>
            <button onClick={() => handleReturnAction(true)} disabled={isUpdating} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm">Approve</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Tracking & Status Box */}
          <div className="bg-bento-card border border-bento-border rounded-2xl shadow-[var(--shadow-bento)] p-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Update Tracking</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2">Order Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Pick Up From Store">Pick Up From Store</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option disabled>──────────</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2">Tracking ID (Optional)</label>
                <input 
                  type="text" 
                  value={trackingId} 
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. AWB123456789"
                  className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleUpdateTracking}
                disabled={isUpdating}
                className="bg-foreground text-background px-6 py-2 rounded-lg font-bold text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Save Status
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="bg-bento-card border border-bento-border rounded-2xl shadow-[var(--shadow-bento)] p-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Items Ordered</h2>
            
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center bg-background border border-bento-border p-3 rounded-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.id.split('-')[0]}`} className="font-bold text-sm hover:text-blue-500 line-clamp-1">{item.name}</Link>
                    <p className="text-xs text-foreground/60 mt-1">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="font-black">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Customer & Payment */}
        <div className="space-y-6">
          
          <div className="bg-bento-card border border-bento-border rounded-2xl shadow-[var(--shadow-bento)] p-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Customer</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Name</p>
                <p className="font-bold">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Email</p>
                <p className="font-medium">{customerEmail}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Phone</p>
                <p className="font-medium">{order.shippingAddress?.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Shipping Address</p>
                <p className="font-medium text-foreground/80 mt-1">
                  {order.shippingAddress?.flat}, {order.shippingAddress?.area}<br/>
                  {order.shippingAddress?.landmark && <>{order.shippingAddress?.landmark}<br/></>}
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-bento-card border border-bento-border rounded-2xl shadow-[var(--shadow-bento)] p-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Summary</h2>
            
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.appliedCoupon})</span>
                  <span>-₹{order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground/70">
                <span>Tax</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `₹${order.shipping?.toFixed(2)}`}</span>
              </div>
              <div className="pt-3 border-t border-bento-border flex justify-between items-end">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black">₹{order.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-bento-border text-sm">
              <p className="flex justify-between"><span className="text-foreground/60">Method:</span> <span className="font-bold uppercase">{order.paymentMethod}</span></p>
              <p className="flex justify-between mt-1"><span className="text-foreground/60">Status:</span> <span className="font-bold">{order.paymentStatus}</span></p>
              {order.paymentId && <p className="flex justify-between mt-1"><span className="text-foreground/60">Txn ID:</span> <span className="font-mono text-xs">{order.paymentId}</span></p>}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-bento-card border border-red-500/20 rounded-2xl shadow-[var(--shadow-bento)] p-6">
            <h2 className="text-lg font-black text-red-500 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5" /> Danger Zone</h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("Cancel Order")}
                disabled={isUpdating || order.status === 'Cancelled' || order.status === 'Rejected'}
                className="w-full text-left px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Force Cancel Order
              </button>
              <button 
                onClick={() => handleAction("Reject Order")}
                disabled={isUpdating || order.status === 'Rejected' || order.status === 'Cancelled'}
                className="w-full text-left px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Reject Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
