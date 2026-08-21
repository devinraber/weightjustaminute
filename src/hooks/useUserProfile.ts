"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/lib/types";

/** Live-subscribes to the signed-in user's profile document (targets, goals, unit prefs). */
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const ref = doc(getFirebaseDb(), "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return { profile, loading };
}
