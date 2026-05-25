"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Package, ChevronDown, ChevronUp, Loader2, Star, RefreshCw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
  const { user, userData, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [returnType, setReturnType] = useState("return"); // return or replace
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else if (!loading) {
      setOrdersLoading(false);
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to request cancellation for this order?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "Cancellation Requested" });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Cancellation Requested" } : o));
      toast("Cancellation request sent.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to request cancellation.");
    }
  };

  const submitReview = async () => {
    if (!reviewProduct || !user) return;
    const productId = reviewProduct.id.split('-')[0]; // Remove variant from ID

    try {
      const newReview = {
        userId: user.uid,
        userName: userData?.displayName || user.displayName || "Anonymous",
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString()
      };

      const prodRef = doc(db, "products", productId);
      
      // Update the reviews array and potentially recalculate average rating
      // For simplicity, we just push to the array. A cloud function is better for aggregates.
      await updateDoc(prodRef, {
        reviews: arrayUnion(newReview)
      });

      toast.success("Review submitted successfully!");
      setReviewModalOpen(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review.");
    }
  };

  const submitReturn = async () => {
    if (!returnOrder || !user) return;
    try {
      // Create return document
      await addDoc(collection(db, "returns"), {
        orderId: returnOrder.id,
        userId: user.uid,
        type: returnType,
        reason: returnReason,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // Update order status
      const newStatus = returnType === "return" ? "Return Requested" : "Replacement Requested";
      await updateDoc(doc(db, "orders", returnOrder.id), { status: newStatus });
      
      setOrders(prev => prev.map(o => o.id === returnOrder.id ? { ...o, status: newStatus } : o));
      
      toast.success(`${returnType === 'return' ? 'Return' : 'Replacement'} requested successfully!`);
      setReturnModalOpen(false);
      setReturnReason("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process request.");
    }
  };

  if (loading || ordersLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground/20" /></div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black mb-4">Please log in</h1>
        <Link href="/login?redirect=/orders" className="text-blue-500 font-bold hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8 flex items-center gap-3">
        <Package className="w-8 h-8" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-12 text-center text-foreground/50">
          <Package className="w-12 h-12 text-foreground/20 mb-4 mx-auto" />
          <p className="text-lg">You haven't placed any orders yet.</p>
          <Link href="/shop" className="text-blue-500 font-bold hover:underline mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-bento-card border border-bento-border rounded-2xl overflow-hidden shadow-[var(--shadow-bento)]">
              {/* Order Header */}
              <div 
                className="p-4 sm:p-6 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:bg-foreground/5 transition-colors"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-bold font-mono text-sm">#{order.id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Date</p>
                  <p className="font-bold text-sm">{new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Total</p>
                  <p className="font-bold text-sm">₹{order.total?.toFixed(2)}</p>
                </div>
                <div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                    order.status?.includes('Requested') ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-600'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div>
                  {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5 text-foreground/50" /> : <ChevronDown className="w-5 h-5 text-foreground/50" />}
                </div>
              </div>

              {/* Order Details (Expanded) */}
              <AnimatePresence>
                {expandedOrderId === order.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-bento-border"
                  >
                    <div className="p-4 sm:p-6 bg-background/50">
                      
                      {/* Products List */}
                      <h4 className="font-black text-sm mb-4 uppercase tracking-wide">Items</h4>
                      <div className="space-y-4 mb-6">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center bg-background border border-bento-border p-3 rounded-xl">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <Link href={`/product/${item.id.split('-')[0]}`} className="font-bold text-sm hover:text-blue-500 line-clamp-1">{item.name}</Link>
                              <p className="text-xs text-foreground/60 mt-1">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                            </div>
                            
                            {/* Write Review Button */}
                            {order.status === 'Delivered' && (
                              <button 
                                onClick={() => { setReviewProduct(item); setReviewModalOpen(true); }}
                                className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-500/10 px-3 py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                              >
                                <Star className="w-3 h-3 fill-currentColor" /> Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Payment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-black text-sm mb-2 uppercase tracking-wide">Shipping Address</h4>
                          <div className="text-sm text-foreground/80 bg-background border border-bento-border p-4 rounded-xl">
                            <p className="font-bold">{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.flat}, {order.shippingAddress?.area}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                            <p className="mt-1">Phone: {order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-sm mb-2 uppercase tracking-wide">Payment Information</h4>
                          <div className="text-sm text-foreground/80 bg-background border border-bento-border p-4 rounded-xl">
                            <p>Method: <span className="font-bold uppercase">{order.paymentMethod}</span></p>
                            <p>Payment Status: <span className="font-bold">{order.paymentStatus}</span></p>
                            {order.paymentId && <p className="text-xs text-foreground/50 mt-1 truncate">Txn ID: {order.paymentId}</p>}
                            
                            <div className="mt-3 pt-3 border-t border-bento-border">
                              <p>Order Status: <span className="font-bold">{order.status}</span></p>
                              {order.trackingId && (
                                <p className="mt-1">Tracking ID: <span className="font-bold font-mono text-blue-500">{order.trackingId}</span></p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Level Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-bento-border">
                        {['Pending', 'Processing', 'Pending (COD)'].includes(order.status) && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Request Cancellation
                          </button>
                        )}
                        
                        {order.status === 'Delivered' && (
                          <button 
                            onClick={() => { setReturnOrder(order); setReturnModalOpen(true); }}
                            className="flex items-center gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" /> Return or Replace
                          </button>
                        )}
                        
                        <button className="flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-lg font-bold text-sm transition-colors ml-auto">
                          Download Invoice
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-black mb-4">Write a Review</h2>
            <div className="flex gap-4 items-center mb-6 bg-background border border-bento-border p-3 rounded-xl">
              <img src={reviewProduct.image} alt={reviewProduct.name} className="w-12 h-12 rounded object-cover" />
              <p className="font-bold text-sm line-clamp-2">{reviewProduct.name}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setReviewRating(star)}>
                    <Star className={`w-8 h-8 ${star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-foreground/20"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Comment</label>
              <textarea 
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="What did you like or dislike?"
                className="w-full bg-background border border-bento-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setReviewModalOpen(false)} className="px-4 py-2 font-bold rounded-lg hover:bg-foreground/5">Cancel</button>
              <button onClick={submitReview} className="px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90">Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* Return/Replace Modal */}
      {returnModalOpen && returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-bento-card border border-bento-border rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-black mb-4">Return / Replace Order</h2>
            <p className="text-sm font-bold text-foreground/60 mb-6">Order #{returnOrder.id}</p>
            
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-bold mb-2">Request Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="returnType" value="return" checked={returnType === 'return'} onChange={() => setReturnType('return')} className="w-4 h-4 accent-foreground" />
                  <span className="font-medium text-sm">Return & Refund</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="returnType" value="replace" checked={returnType === 'replace'} onChange={() => setReturnType('replace')} className="w-4 h-4 accent-foreground" />
                  <span className="font-medium text-sm">Replacement</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Reason for Request</label>
              <select 
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                className="w-full bg-background border border-bento-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 mb-3"
              >
                <option value="">Select a reason</option>
                <option value="Damaged/Defective">Product is damaged or defective</option>
                <option value="Wrong Item">Received wrong item</option>
                <option value="Quality Issue">Quality is not as expected</option>
                <option value="Size/Fit">Size or fit issue</option>
                <option value="Changed Mind">Changed my mind</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setReturnModalOpen(false)} className="px-4 py-2 font-bold rounded-lg hover:bg-foreground/5">Cancel</button>
              <button onClick={submitReturn} disabled={!returnReason} className="px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 disabled:opacity-50">Submit Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
