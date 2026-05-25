"use client";

import { Suspense, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Prevent redirect loops by setting cookie before navigating
      const encodedEmail = email ? btoa(email) : "true";
      document.cookie = `firebase-session=${encodedEmail}; path=/; max-age=86400; samesite=strict`;
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      // Prevent redirect loops by setting cookie before navigating
      // Google popup does not expose the email immediately without assigning the result.
      // It will fallback to "true" momentarily until AuthContext updates it, but we can capture it.
      const result = await signInWithPopup(auth, googleProvider);
      const encodedEmail = result.user.email ? btoa(result.user.email) : "true";
      document.cookie = `firebase-session=${encodedEmail}; path=/; max-age=86400; samesite=strict`;
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Google sign in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bento-card border border-bento-border p-8 rounded-[var(--radius-bento)] shadow-[var(--shadow-bento)]"
      >
        <h1 className="text-3xl font-black mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="text-foreground/60 mb-8">{isLogin ? "Sign in to access your orders and wishlist." : "Join us to experience premium shopping."}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black border border-gray-200 hover:bg-gray-50 py-3 rounded-full font-bold transition-colors mb-6 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-bento-border"></div>
          <span className="flex-shrink-0 mx-4 text-foreground/40 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-bento-border"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-bento-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 rounded-full font-bold transition-colors mt-6 flex justify-center items-center h-12"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-foreground/60">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-foreground hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
