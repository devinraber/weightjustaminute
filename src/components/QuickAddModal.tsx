"use client";

import { useState } from "react";
import { X, Loader2, Barcode } from "lucide-react";
import dynamic from "next/dynamic";
import { addDoc, collection } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import type { FoodItem, MealEntry, MealSlot } from "@/lib/types";
import { useFoodSearch } from "@/hooks/useFoodSearch";
import { buildServingOptions, getServingUnit } from "@/lib/utils/servingUnits";

// The barcode decoder library is large - only load it when the scanner is actually opened.
const BarcodeScannerModal = dynamic(() => import("@/components/BarcodeScannerModal"), { ssr: false });

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
  const { user } = useAuth();
  const [tab, setTab] = useState<"quick" | "search">("quick");

  // Quick-add state
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [saveForNextTime, setSaveForNextTime] = useState(true);

  // Search state
  const [query, setQuery] = useState("");
  const { results, loading: searching } = useFoodSearch(query);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [selectedGrams, setSelectedGrams] = useState<number | null>(null);
  const [showCustomGrams, setShowCustomGrams] = useState(false);
  const [customGrams, setCustomGrams] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  function selectFood(food: FoodItem) {
    setSelected(food);
    const options = buildServingOptions(getServingUnit(food));
    setSelectedGrams(options[4]?.grams ?? options[0]?.grams ?? 100); // default to "1x" option
    setShowCustomGrams(false);
    setCustomGrams("");
  }

  async function handleBarcodeDetected(barcode: string) {
    setShowScanner(false);
    if (!user) return;
    setScanning(true);
    setScanError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/food/search?barcode=${encodeURIComponent(barcode)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const food: FoodItem | undefined = data.results?.[0];
      if (!food) {
        setScanError(`No product found for barcode ${barcode}.`);
        return;
      }
      setTab("search");
      setQuery(food.name);
      selectFood(food);
    } catch {
      setScanError("Couldn't look up that barcode. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  async function handleQuickAdd() {
    const kcal = Number(calories);
    if (!name.trim() || !Number.isFinite(kcal) || kcal <= 0) return;

    if (saveForNextTime && user) {
      // Store as a reusable custom food so it shows up in future searches.
      const now = new Date().toISOString();
      await addDoc(collection(getFirebaseDb(), "foods"), {
        source: "custom",
        name: name.trim(),
        nutritionPer100g: { calories: kcal, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 },
        servingLabel: "1 item",
        createdByUid: user.uid,
        sharedWithUids: [],
        createdAt: now,
        updatedAt: now,
      });
    }

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
    const gramsNum = showCustomGrams ? Number(customGrams) : selectedGrams;
    if (!gramsNum || !Number.isFinite(gramsNum) || gramsNum <= 0) return;
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
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={saveForNextTime}
                onChange={(e) => setSaveForNextTime(e.target.checked)}
              />
              Save for next time (appears in Search next time)
            </label>
            <button
              onClick={handleQuickAdd}
              className="rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
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
                {(searching || scanning) && (
                  <Loader2
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                  />
                )}
              </div>
              <button
                onClick={() => setShowScanner(true)}
                aria-label="Scan barcode"
                className="rounded-lg bg-slate-100 px-3 text-slate-600 hover:bg-slate-200"
              >
                <Barcode size={18} />
              </button>
            </div>

            {scanError && <p className="text-xs text-red-500">{scanError}</p>}

            <div className="max-h-52 overflow-y-auto">
              {results.length === 0 && query.trim().length >= 2 && !searching && (
                <p className="px-3 py-4 text-center text-sm text-slate-400">No matches found.</p>
              )}
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => selectFood(food)}
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
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-500">How much did you have?</p>
                <div className="flex flex-wrap gap-2">
                  {buildServingOptions(getServingUnit(selected)).map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setSelectedGrams(opt.grams);
                        setShowCustomGrams(false);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        !showCustomGrams && selectedGrams === opt.grams
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomGrams(true)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      showCustomGrams
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Enter grams
                  </button>
                </div>

                {showCustomGrams && (
                  <input
                    value={customGrams}
                    onChange={(e) => setCustomGrams(e.target.value)}
                    type="number"
                    placeholder="Grams"
                    autoFocus
                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                )}

                <button
                  onClick={handleAddSelected}
                  className="rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showScanner && (
        <BarcodeScannerModal onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
