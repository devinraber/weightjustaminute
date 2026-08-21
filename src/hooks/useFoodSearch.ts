"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { searchCustomFoods } from "@/lib/firebase/foodQueries";
import type { FoodItem } from "@/lib/types";

const DEBOUNCE_MS = 350;

/** Debounced, cancel-safe live search against /api/food/search as the user types. */
export function useFoodSearch(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!user || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const token = await user.getIdToken();
        const [customFoods, apiResults] = await Promise.all([
          searchCustomFoods(user.uid, trimmed).catch(() => []),
          fetch(`/api/food/search?q=${encodeURIComponent(trimmed)}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }).then((res) => res.json()),
        ]);
        // Your own saved/shared foods surface first - they're what you're most likely to want again.
        setResults([...customFoods, ...(apiResults.results ?? [])]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, user]);

  return { results, loading };
}
