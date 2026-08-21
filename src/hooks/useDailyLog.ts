"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import {
  emptyDailyLog,
  type DailyLog,
  type MealEntry,
  type MealSlot,
  type NutritionPer100gScaled,
} from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function sumTotals(meals: DailyLog["meals"]): NutritionPer100gScaled {
  return Object.values(meals)
    .flat()
    .reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.nutrition.calories,
        proteinG: acc.proteinG + entry.nutrition.proteinG,
        carbsG: acc.carbsG + entry.nutrition.carbsG,
        fatG: acc.fatG + entry.nutrition.fatG,
        // Legacy entries logged before sugar tracking may not have this field.
        sugarG: acc.sugarG + (entry.nutrition.sugarG ?? 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 },
    );
}

/** Live-subscribes to today's daily log and exposes helpers to add/remove meal entries. */
export function useDailyLog(date: string = todayIso()) {
  const { user } = useAuth();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLog(null);
      setLoading(false);
      return;
    }
    const ref = doc(getFirebaseDb(), "users", user.uid, "dailyLogs", date);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setLog(snap.exists() ? (snap.data() as DailyLog) : emptyDailyLog(user.uid, date));
      setLoading(false);
    });
    return unsubscribe;
  }, [user, date]);

  const addEntry = useCallback(
    async (slot: MealSlot, entry: MealEntry) => {
      if (!user) return;
      const base = log ?? emptyDailyLog(user.uid, date);
      const meals = { ...base.meals, [slot]: [...base.meals[slot], entry] };
      const updated: DailyLog = {
        ...base,
        meals,
        totals: sumTotals(meals),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "dailyLogs", date), updated);
    },
    [user, log, date],
  );

  const removeEntry = useCallback(
    async (slot: MealSlot, entryId: string) => {
      if (!user || !log) return;
      const meals = {
        ...log.meals,
        [slot]: log.meals[slot].filter((e) => e.id !== entryId),
      };
      const updated: DailyLog = {
        ...log,
        meals,
        totals: sumTotals(meals),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "dailyLogs", date), updated);
    },
    [user, log, date],
  );

  return { log, loading, addEntry, removeEntry };
}
