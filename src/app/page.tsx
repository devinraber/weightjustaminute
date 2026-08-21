"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDailyLog } from "@/hooks/useDailyLog";
import CalorieRing from "@/components/CalorieRing";
import MealSlotCard from "@/components/MealSlotCard";
import { defaultMacroTargets } from "@/lib/utils/energyGoals";
import type { MealSlot } from "@/lib/types";

const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  const { log, addEntry, removeEntry } = useDailyLog();

  // AuthGate handles the redirect to /login; these are just loading-state guards.
  if (authLoading || !user) {
    return <p className="text-center text-slate-400">Loading...</p>;
  }

  const calorieTarget = profile?.calorieTarget ?? 2000;
  const macroTargets = { ...defaultMacroTargets(calorieTarget), ...profile?.macroTargets };
  const totals = log?.totals ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
        <CalorieRing label="Calories" consumed={totals.calories} target={calorieTarget} colorClass="text-brand-500" />
        <CalorieRing label="Protein" consumed={totals.proteinG} target={macroTargets.proteinG} unit="g" colorClass="text-rose-500" />
        <CalorieRing label="Carbs" consumed={totals.carbsG} target={macroTargets.carbsG} unit="g" colorClass="text-amber-500" />
        <CalorieRing label="Fat" consumed={totals.fatG} target={macroTargets.fatG} unit="g" colorClass="text-sky-500" />
        <CalorieRing label="Sugar" consumed={totals.sugarG} target={macroTargets.sugarG} unit="g" colorClass="text-purple-500" />
      </section>

      <section className="flex flex-col gap-3">
        {MEAL_SLOTS.map((slot) => (
          <MealSlotCard
            key={slot}
            slot={slot}
            entries={log?.meals[slot] ?? []}
            onAdd={addEntry}
            onRemove={removeEntry}
          />
        ))}
      </section>
    </div>
  );
}
