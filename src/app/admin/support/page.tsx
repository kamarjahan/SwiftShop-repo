"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MessageSquare, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  
  // Chat
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filter, setFilter] = useState("Open");

  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeTicket) return;
    const q = query(collection(db, "support_tickets", activeTicket.id, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [activeTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || activeTicket.status === "Closed" || !user) return;
    
    const msg = newMessage;
    setNewMessage("");
    
    try {
      await addDoc(collection(db, "support_tickets", activeTicket.id, "messages"), {
        senderId: user.uid,
        senderRole: "admin",
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
    if (!activeTicket || !confirm("Close this ticket?")) return;
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

  const filteredTickets = tickets.filter(t => filter === "All" ? true : t.status === filter);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-500" /> Support Tickets
      </h1>

      <div className="flex-1 bg-bento-card border border-bento-border rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)] flex overflow-hidden">
        {/* Sidebar: Ticket List */}
        <div className={`w-full md:w-1/3 border-r border-bento-border flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-bento-border bg-foreground/5 flex items-center justify-between">
            <h2 className="font-bold">Inbox</h2>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs bg-background border border-bento-border rounded-full px-3 py-1 outline-none"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="All">All Tickets</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-8 text-foreground/50 text-sm">No tickets found.</div>
            ) : (
              <div className="divide-y divide-bento-border">
                {filteredTickets.map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className={`w-full text-left p-4 hover:bg-foreground/5 transition-colors ${activeTicket?.id === ticket.id ? 'bg-blue-500/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm line-clamp-1 flex-1 pr-2">{ticket.subject}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ticket.status === 'Open' ? 'bg-green-500/10 text-green-600' : 'bg-foreground/10 text-foreground/50'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground/80 mb-1">
                      {ticket.userName || 'Unknown'} <span className="font-normal opacity-60">({ticket.userEmail || 'Unknown'})</span>
                    </p>
                    <p className="text-xs text-foreground/60 line-clamp-2">{ticket.description}</p>
                    <p className="text-[10px] text-foreground/40 mt-2">
                      {ticket.updatedAt?.toDate ? new Date(ticket.updatedAt.toDate()).toLocaleString() : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Active Ticket Chat */}
        <div className={`flex-1 flex flex-col bg-background ${!activeTicket ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!activeTicket ? (
            <div className="text-center text-foreground/40">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-bold">Select a ticket to view conversation</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-bento-border bg-bento-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTicket(null)} className="md:hidden p-2 hover:bg-foreground/10 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-bold text-lg">{activeTicket.subject}</h2>
                    <p className="text-xs text-foreground/60">
                      From: <span className="font-bold text-foreground/80">{activeTicket.userName || 'Unknown'}</span> ({activeTicket.userEmail || 'Unknown'}) &bull; Ticket ID: {activeTicket.id}
                    </p>
                  </div>
                </div>
                {activeTicket.status === "Open" && (
                  <button onClick={handleCloseTicket} className="flex items-center gap-2 text-sm font-bold bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Close
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg: any) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${isAdmin ? "bg-blue-600 text-white rounded-br-none" : "bg-foreground/5 text-foreground border border-bento-border rounded-bl-none"}`}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <span className="text-[10px] opacity-60 mt-2 block text-right">
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-bento-border bg-bento-card">
                {activeTicket.status === "Open" ? (
                  <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a reply to the customer..."
                      className="flex-1 bg-background border border-bento-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="px-6 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                      <Send className="w-4 h-4 mr-2" /> Reply
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-sm text-foreground/50 font-bold p-2 bg-foreground/5 rounded-xl">
                    This ticket is closed. No further replies can be sent.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
