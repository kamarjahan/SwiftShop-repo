"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserMetadata {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set an arbitrary cookie to tell Next.js middleware that the user is authed.
        // For production, use Firebase Session Cookies generated via Cloud Functions.
        document.cookie = `firebase-session=true; path=/; max-age=86400; secure; samesite=strict`;

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserMetadata);
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
      } else {
        setUserData(null);
        document.cookie = `firebase-session=; path=/; max-age=0;`; // Clear cookie
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
