"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { doc, deleteField, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  calculateBmr,
  calculateCalorieTarget,
  calculateTdee,
  calorieTargetFromGoalDate,
  defaultMacroTargets,
} from "@/lib/utils/energyGoals";
import { kgToLb, lbToKg } from "@/lib/utils/units";
import type { GoalDirection, UserProfile } from "@/lib/types";

interface EditGoalModalProps {
  profile: UserProfile;
  currentWeightKg: number;
  onClose: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EditGoalModal({ profile, currentWeightKg, onClose }: EditGoalModalProps) {
  const isImperial = profile.weightUnit === "lb";
  const [targetWeightInput, setTargetWeightInput] = useState(
    String(isImperial ? Math.round(kgToLb(profile.targetWeightKg)) : profile.targetWeightKg),
  );
  const [targetDate, setTargetDate] = useState(profile.targetDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const targetWeightKg = isImperial ? lbToKg(Number(targetWeightInput)) : Number(targetWeightInput);
    if (!Number.isFinite(targetWeightKg) || targetWeightKg <= 0) {
      setError("Enter a valid goal weight.");
      return;
    }

    setSaving(true);
    try {
      const goalDirection: GoalDirection =
        targetWeightKg < currentWeightKg - 0.5 ? "lose" : targetWeightKg > currentWeightKg + 0.5 ? "gain" : "maintain";

      const age = new Date().getFullYear() - profile.birthYear;
      const bmr = calculateBmr({ sex: profile.sex, weightKg: currentWeightKg, heightCm: profile.heightCm, age });
      const tdee = calculateTdee(bmr, profile.activityLevel);

      const calorieTarget = targetDate
        ? calorieTargetFromGoalDate({ tdee, currentWeightKg, targetWeightKg, targetDate })
        : calculateCalorieTarget({ tdee, goalDirection });

      await setDoc(
        doc(getFirebaseDb(), "users", profile.uid),
        {
          targetWeightKg,
          targetDate: targetDate || deleteField(),
          goalDirection,
          calorieTarget,
          macroTargets: defaultMacroTargets(calorieTarget),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      onClose();
    } catch {
      setError("Couldn't save your goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit goal</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={targetWeightInput}
            onChange={(e) => setTargetWeightInput(e.target.value)}
            type="number"
            placeholder={`Goal weight (${isImperial ? "lb" : "kg"})`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="flex flex-col gap-1 text-sm text-slate-500">
            Goal date (optional)
            <input
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              type="date"
              min={todayIso()}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Recalculate & save"}
          </button>
        </div>
      </div>
    </div>
  );
}
