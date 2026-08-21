"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDailyLog } from "@/hooks/useDailyLog";
import type { AiFoodEstimate, AiFoodEstimateItem, MealSlot } from "@/lib/types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip the data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoLogPage() {
  const { user } = useAuth();
  const { addEntry } = useDailyLog();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<AiFoodEstimate | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<MealSlot>("lunch");
  const [addedIndexes, setAddedIndexes] = useState<Set<number>>(new Set());
  const [addingAll, setAddingAll] = useState(false);

  async function handleFile(file: File) {
    if (!user) return;
    setPreviewUrl(URL.createObjectURL(file));
    setEstimate(null);
    setError(null);
    setAddedIndexes(new Set());
    setAnalyzing(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const token = await user.getIdToken();
      const res = await fetch("/api/photo-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data: AiFoodEstimate = await res.json();
      setEstimate(data);
    } catch {
      setError("Couldn't analyze that photo. Try again with better lighting.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAddItem(item: AiFoodEstimateItem, index: number) {
    await addEntry(slot, {
      id: crypto.randomUUID(),
      name: item.name,
      grams: item.estimatedGrams,
      nutrition: {
        calories: item.calories,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
        sugarG: item.sugarG,
      },
      source: "ai_estimate",
      loggedAt: new Date().toISOString(),
    });
    setAddedIndexes((prev) => new Set(prev).add(index));
  }

  async function handleAddAll() {
    if (!estimate) return;
    setAddingAll(true);
    try {
      // Sequential, not parallel - the daily log transaction is per-write-safe, but
      // running them one at a time keeps the UI's "added" checkmarks accurate in order.
      for (let i = 0; i < estimate.items.length; i++) {
        if (addedIndexes.has(i)) continue;
        await handleAddItem(estimate.items[i], i);
      }
    } finally {
      setAddingAll(false);
    }
  }

  if (!user) {
    return <p className="text-center text-slate-400">Sign in to use the photo log.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold">Photo Log</h1>
        <p className="text-sm text-slate-400">Snap a photo of your meal for an instant estimate.</p>
      </header>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-slate-500 hover:border-brand-400 hover:text-brand-600">
        <Camera size={32} />
        <span className="text-sm font-medium">Take or choose a photo</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Meal preview" className="max-h-64 w-full rounded-xl object-cover" />
      )}

      {analyzing && (
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={18} /> Analyzing photo...
        </div>
      )}

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      {estimate && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">Add to:</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as MealSlot)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm capitalize"
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddAll}
              disabled={addingAll || addedIndexes.size === estimate.items.length}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {addingAll ? "Adding..." : "Add all"}
            </button>
          </div>

          <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {estimate.items.map((item, i) => {
              const added = addedIndexes.has(i);
              return (
                <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      ~{Math.round(item.estimatedGrams)}g · {Math.round(item.calories)} kcal · P
                      {Math.round(item.proteinG)}g · C{Math.round(item.carbsG)}g · F{Math.round(item.fatG)}g · S
                      {Math.round(item.sugarG)}g · {item.confidence} confidence
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddItem(item, i)}
                    disabled={added}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      added
                        ? "bg-slate-100 text-slate-400"
                        : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={12} /> Added
                      </>
                    ) : (
                      "Add"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {estimate.disclaimer && <p className="text-xs text-slate-400">{estimate.disclaimer}</p>}
        </section>
      )}
    </div>
  );
}
