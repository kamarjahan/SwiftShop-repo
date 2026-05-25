"use client";

import { Suspense, useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// Helper function to convert firebase error codes to user friendly messages
const getAuthErrorMessage = (error: any) => {
  const code = error?.code || "";
  if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
    return "Invalid email or password. Please try again.";
  }
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Please use a stronger password.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many failed attempts. Please try again later.";
  }
  return error?.message || "Authentication failed. Please try again.";
};

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  // Reset fields when switching modes
  useEffect(() => {
    setPassword("");
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
      }
      
      const encodedEmail = email ? btoa(email) : "true";
      document.cookie = `firebase-session=${encodedEmail}; path=/; max-age=86400; samesite=strict`;
      
      // Force a hard redirect to ensure the browser strictly fetches the new state,
      // resolving the Cloudflare caching/slow redirect loop bug.
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const encodedEmail = result.user.email ? btoa(result.user.email) : "true";
      document.cookie = `firebase-session=${encodedEmail}; path=/; max-age=86400; samesite=strict`;
      
      toast.success("Signed in with Google!");
      window.location.href = redirectUrl;
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Pane - Branding & Image */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white">
            Swift<span className="text-slate-400">Shop</span>
          </Link>
        </div>
        
        <div className="relative z-10 max-w-lg mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black mb-6 leading-tight"
          >
            Curated premium goods, <br/>delivered with speed.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300 text-lg"
          >
            Join thousands of shoppers who trust SwiftShop for their daily premium needs.
          </motion.p>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-background">
        
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 md:hidden">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Swift<span className="text-slate-500">Shop</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-12 md:mt-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tight mb-3">
                  {isLogin ? "Welcome back" : "Create an account"}
                </h1>
                <p className="text-foreground/60">
                  {isLogin ? "Enter your details to access your account." : "Enter your details below to create your account and get started."}
                </p>
              </div>

              <button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-black border border-gray-200 hover:bg-gray-50 hover:shadow-sm py-3.5 rounded-2xl font-bold transition-all mb-8 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-bento-border"></div>
                <span className="flex-shrink-0 mx-4 text-foreground/40 text-xs font-bold uppercase tracking-wider">Or continue with email</span>
                <div className="flex-grow border-t border-bento-border"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-foreground/40" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-foreground/5 border-transparent focus:border-foreground/20 focus:bg-background rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none ring-2 ring-transparent focus:ring-foreground/10 transition-all font-medium"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1 flex justify-between">
                    Password
                    {isLogin && <button type="button" className="text-blue-500 hover:underline text-xs">Forgot?</button>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-foreground/40" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-foreground/5 border-transparent focus:border-foreground/20 focus:bg-background rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none ring-2 ring-transparent focus:ring-foreground/10 transition-all font-medium"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-2xl font-bold transition-all mt-8 flex justify-center items-center gap-2 disabled:opacity-70 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center text-sm font-medium text-foreground/60">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-foreground hover:underline font-bold"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
