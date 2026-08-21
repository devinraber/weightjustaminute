"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { Loader2, Plus } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFoodSearch } from "@/hooks/useFoodSearch";

export default function FoodsPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [query, setQuery] = useState("");
  const { results, loading: searching } = useFoodSearch(query);
  const [showBuilder, setShowBuilder] = useState(false);

  if (!user) {
    return <p className="text-center text-slate-400">Sign in to search foods.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Foods</h1>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Custom food
        </button>
      </header>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search packaged & whole foods"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        {searching && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        )}
      </div>

      <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {results.map((food) => (
          <li key={food.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{food.name}</p>
              <p className="text-xs text-slate-400">
                {food.brand ? `${food.brand} · ` : ""}
                {food.source === "usda" ? "USDA" : food.source === "curated" ? "Common food" : "Open Food Facts"} ·{" "}
                {Math.round(food.nutritionPer100g.calories)} kcal/100g
              </p>
            </div>
          </li>
        ))}
        {results.length === 0 && query.trim().length < 2 && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">
            Search for a food to see results.
          </li>
        )}
        {results.length === 0 && query.trim().length >= 2 && !searching && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">No matches found.</li>
        )}
      </ul>

      {showBuilder && (
        <CustomFoodBuilder
          uid={user.uid}
          connections={profile?.connections ?? []}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}

function CustomFoodBuilder({
  uid,
  connections,
  onClose,
}: {
  uid: string;
  connections: string[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [sugar, setSugar] = useState("");
  const [servingLabel, setServingLabel] = useState("");
  const [servingSizeG, setServingSizeG] = useState("");
  const [shareWithConnections, setShareWithConnections] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    try {
      await addDoc(collection(getFirebaseDb(), "foods"), {
        source: "custom",
        name: name.trim(),
        nutritionPer100g: {
          calories: Number(calories) || 0,
          proteinG: Number(protein) || 0,
          carbsG: Number(carbs) || 0,
          fatG: Number(fat) || 0,
          sugarG: Number(sugar) || 0,
        },
        ...(servingLabel.trim() && Number(servingSizeG) > 0
          ? { servingLabel: servingLabel.trim(), servingSizeG: Number(servingSizeG) }
          : {}),
        createdByUid: uid,
        sharedWithUids: shareWithConnections ? connections : [],
        createdAt: now,
        updatedAt: now,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <h2 className="mb-3 text-lg font-semibold">New custom food</h2>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400">Nutrition per 100g:</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" placeholder="Calories" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" placeholder="Protein (g)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" placeholder="Carbs (g)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={fat} onChange={(e) => setFat(e.target.value)} type="number" placeholder="Fat (g)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={sugar} onChange={(e) => setSugar(e.target.value)} type="number" placeholder="Sugar (g)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-slate-400">Optional: define a serving so it&apos;s easier to log later (e.g. &quot;cup&quot; = 240g):</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={servingLabel} onChange={(e) => setServingLabel(e.target.value)} placeholder="Serving name (e.g. cup)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={servingSizeG} onChange={(e) => setServingSizeG(e.target.value)} type="number" placeholder="Grams per serving" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={shareWithConnections}
              onChange={(e) => setShareWithConnections(e.target.checked)}
            />
            Share with connected accounts
          </label>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
