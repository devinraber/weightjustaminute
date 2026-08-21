"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { FoodItem, MealEntry, MealSlot } from "@/lib/types";
import { useFoodSearch } from "@/hooks/useFoodSearch";

interface QuickAddModalProps {
  slot: MealSlot;
  onClose: () => void;
  onAdd: (entry: MealEntry) => void | Promise<void>;
}

function scaleNutrition(food: FoodItem, grams: number) {
  const factor = grams / 100;
  return {
    calories: food.nutritionPer100g.calories * factor,
    proteinG: food.nutritionPer100g.proteinG * factor,
    carbsG: food.nutritionPer100g.carbsG * factor,
    fatG: food.nutritionPer100g.fatG * factor,
    sugarG: (food.nutritionPer100g.sugarG ?? 0) * factor,
  };
}

export default function QuickAddModal({ slot, onClose, onAdd }: QuickAddModalProps) {
  const [tab, setTab] = useState<"quick" | "search">("quick");

  // Quick-add state
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  // Search state
  const [query, setQuery] = useState("");
  const { results, loading: searching } = useFoodSearch(query);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");

  async function handleQuickAdd() {
    const kcal = Number(calories);
    if (!name.trim() || !Number.isFinite(kcal) || kcal <= 0) return;
    await onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      quickAddCalories: kcal,
      nutrition: { calories: kcal, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 },
      source: "custom",
      loggedAt: new Date().toISOString(),
    });
  }

  async function handleAddSelected() {
    if (!selected) return;
    const gramsNum = Number(grams);
    if (!Number.isFinite(gramsNum) || gramsNum <= 0) return;
    await onAdd({
      id: crypto.randomUUID(),
      foodId: selected.id,
      name: selected.name,
      grams: gramsNum,
      nutrition: scaleNutrition(selected, gramsNum),
      source: selected.source,
      loggedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">Add to {slot}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 flex gap-2 rounded-lg bg-slate-100 p-1 text-sm">
          <button
            onClick={() => setTab("quick")}
            className={`flex-1 rounded-md py-1.5 font-medium ${tab === "quick" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Quick Add
          </button>
          <button
            onClick={() => setTab("search")}
            className={`flex-1 rounded-md py-1.5 font-medium ${tab === "search" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Search Database
          </button>
        </div>

        {tab === "quick" ? (
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Food name"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Calories"
              type="number"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleQuickAdd}
              className="rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
                placeholder="Search foods (e.g. chicken breast)"
                autoFocus
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {searching && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                />
              )}
            </div>

            <div className="max-h-52 overflow-y-auto">
              {results.length === 0 && query.trim().length >= 2 && !searching && (
                <p className="px-3 py-4 text-center text-sm text-slate-400">No matches found.</p>
              )}
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelected(food)}
                  className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    selected?.id === food.id ? "bg-brand-50" : ""
                  }`}
                >
                  <span className="font-medium">{food.name}</span>
                  <span className="text-xs text-slate-400">
                    {food.brand ? `${food.brand} · ` : ""}
                    {Math.round(food.nutritionPer100g.calories)} kcal / 100g
                  </span>
                </button>
              ))}
            </div>

            {selected && (
              <div className="flex items-center gap-2">
                <input
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  type="number"
                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-500">grams</span>
                <button
                  onClick={handleAddSelected}
                  className="ml-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
