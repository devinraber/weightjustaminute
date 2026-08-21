"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { MealEntry, MealSlot } from "@/lib/types";
import QuickAddModal from "@/components/QuickAddModal";

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

interface MealSlotCardProps {
  slot: MealSlot;
  entries: MealEntry[];
  onAdd: (slot: MealSlot, entry: MealEntry) => void | Promise<void>;
  onRemove: (slot: MealSlot, entryId: string) => void | Promise<void>;
}

export default function MealSlotCard({ slot, entries, onAdd, onRemove }: MealSlotCardProps) {
  const [showModal, setShowModal] = useState(false);
  const slotCalories = entries.reduce((sum, e) => sum + e.nutrition.calories, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{SLOT_LABELS[slot]}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{Math.round(slotCalories)} kcal</span>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-brand-50 p-1.5 text-brand-600 hover:bg-brand-100"
            aria-label={`Add food to ${SLOT_LABELS[slot]}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">No items logged yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-slate-700">{entry.name}</p>
                <p className="text-xs text-slate-400">
                  {Math.round(entry.nutrition.calories)} kcal · P{Math.round(entry.nutrition.proteinG)}
                  g · C{Math.round(entry.nutrition.carbsG)}g · F{Math.round(entry.nutrition.fatG)}g · S
                  {Math.round(entry.nutrition.sugarG ?? 0)}g
                </p>
              </div>
              <button
                onClick={() => onRemove(slot, entry.id)}
                className="rounded-full p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                aria-label={`Remove ${entry.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <QuickAddModal
          slot={slot}
          onClose={() => setShowModal(false)}
          onAdd={async (entry) => {
            await onAdd(slot, entry);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
