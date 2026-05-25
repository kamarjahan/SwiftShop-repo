"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export interface Address {
  fullName: string;
  phone: string;
  pincode: string;
  city: string;
  flat: string;
  area: string;
  landmark?: string;
  state: string;
  isDefault: boolean;
}

export interface UserMetadata {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: string;
  phone?: string;
  wishlist?: string[];
  addresses?: Address[];
  address?: Address;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: UserMetadata | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userData: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set an arbitrary cookie to tell Next.js middleware that the user is authed.
        // For production, use Firebase Session Cookies generated via Cloud Functions.
        const encodedEmail = firebaseUser.email ? btoa(firebaseUser.email) : "true";
        document.cookie = `firebase-session=${encodedEmail}; path=/; max-age=86400; samesite=strict`;

        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserMetadata);
          } else {
            const newUserData: UserMetadata = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: "customer",
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUserData);
              setUserData(newUserData);
            } catch (error) {
              console.error("Error creating user doc", error);
            }
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        document.cookie = `firebase-session=; path=/; max-age=0;`; // Clear cookie
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
