"use client";

import { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, MessageSquare, Send, ArrowLeft } from "lucide-react";

export default function SupportTab({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  
  // New ticket form
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Chat
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "support_tickets"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeTicket) return;
    const q = query(collection(db, "support_tickets", activeTicket.id, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [activeTicket]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const ticketRef = await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        subject,
        description,
        status: "Open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Add initial message
      await addDoc(collection(db, "support_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderRole: "customer",
        message: description,
        createdAt: serverTimestamp()
      });
      
      setIsCreating(false);
      setSubject("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || activeTicket.status === "Closed") return;
    
    const msg = newMessage;
    setNewMessage("");
    
    try {
      await addDoc(collection(db, "support_tickets", activeTicket.id, "messages"), {
        senderId: user.uid,
        senderRole: "customer",
        message: msg,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "support_tickets", activeTicket.id), {
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket || !confirm("Are you sure you want to close this ticket?")) return;
    try {
      await updateDoc(doc(db, "support_tickets", activeTicket.id), {
        status: "Closed",
        updatedAt: serverTimestamp()
      });
      setActiveTicket({ ...activeTicket, status: "Closed" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-foreground/20" /></div>;
  }

  // Active Chat View
  if (activeTicket) {
    return (
      <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] flex flex-col h-[600px] shadow-[var(--shadow-bento)]">
        {/* Header */}
        <div className="p-4 border-b border-bento-border flex items-center justify-between bg-foreground/5 rounded-t-[var(--radius-bento)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTicket(null)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold">{activeTicket.subject}</h3>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${activeTicket.status === 'Open' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-foreground/50'}`}>
                {activeTicket.status}
              </span>
            </div>
          </div>
          {activeTicket.status === "Open" && (
            <button onClick={handleCloseTicket} className="text-sm font-bold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
              Close Ticket
            </button>
          )}
        </div>
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg: any) => {
            const isCustomer = msg.senderRole === "customer";
            return (
              <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isCustomer ? "bg-blue-600 text-white rounded-br-none" : "bg-foreground/10 text-foreground rounded-bl-none"}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <span className="text-[10px] opacity-60 mt-1 block text-right">
                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        {activeTicket.status === "Open" ? (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-bento-border flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background border border-bento-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-bento-border text-center text-sm text-foreground/50 font-bold bg-foreground/5 rounded-b-[var(--radius-bento)]">
            This ticket has been closed.
          </div>
        )}
      </div>
    );
  }

  // Ticket List / Create View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Help & Support</h2>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-bold text-sm hover:bg-foreground/90 transition-colors">
            <Plus className="w-4 h-4" /> Raise a Ticket
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-6 shadow-[var(--shadow-bento)]">
          <h3 className="text-lg font-bold mb-4">Raise a New Ticket</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Subject</label>
              <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Brief summary of your issue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">Description</label>
              <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-bento-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" placeholder="Provide detailed information..."></textarea>
            </div>
            <div className="flex gap-4 pt-2 border-t border-bento-border">
              <button type="submit" disabled={submitting} className="bg-foreground text-background px-6 py-2 rounded-lg font-bold hover:bg-foreground/90 transition-colors">
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="bg-foreground/10 px-6 py-2 rounded-lg font-bold hover:bg-foreground/20 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.length === 0 ? (
            <div className="bg-bento-card border border-bento-border rounded-[var(--radius-bento)] p-12 text-center text-foreground/50 flex flex-col items-center">
              <MessageSquare className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="font-bold text-lg text-foreground">No Support Tickets</p>
              <p className="mt-1">You haven't raised any support tickets yet.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button key={ticket.id} onClick={() => setActiveTicket(ticket)} className="bg-bento-card border border-bento-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-base group-hover:text-blue-500 transition-colors">{ticket.subject}</h3>
                  <p className="text-xs text-foreground/50 mt-1">Created on {ticket.createdAt?.toDate ? new Date(ticket.createdAt.toDate()).toLocaleDateString() : '...'}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${ticket.status === 'Open' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-foreground/50'}`}>
                  {ticket.status}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
