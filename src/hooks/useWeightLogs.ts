"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import type { WeightLogEntry } from "@/lib/types";

export function useWeightLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WeightLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const q = query(collection(getFirebaseDb(), "users", user.uid, "weightLogs"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => d.data() as WeightLogEntry));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const logWeight = useCallback(
    async (date: string, weightKg: number, note?: string) => {
      if (!user) return;
      const entry: WeightLogEntry = {
        id: date,
        uid: user.uid,
        date,
        weightKg,
        note,
        loggedAt: new Date().toISOString(),
      };
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "weightLogs", date), entry);
    },
    [user],
  );

  return { logs, loading, logWeight };
}
