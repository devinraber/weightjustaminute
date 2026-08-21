"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { buildWeightTrend } from "@/lib/utils/weightTrend";
import { kgToLb, lbToKg } from "@/lib/utils/units";
import WeightChart from "@/components/WeightChart";
import EditGoalModal from "@/components/EditGoalModal";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WeightPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { logs, logWeight } = useWeightLogs();
  const [weightInput, setWeightInput] = useState("");
  const [showEditGoal, setShowEditGoal] = useState(false);

  const trend = useMemo(
    () => buildWeightTrend(logs, profile?.targetWeightKg ?? 0, profile?.targetDate),
    [logs, profile],
  );

  const latest = logs[logs.length - 1];
  const isImperial = profile?.weightUnit === "lb";
  const unitLabel = isImperial ? "lb" : "kg";

  function displayWeight(kg: number): string {
    return (isImperial ? kgToLb(kg) : kg).toFixed(1);
  }

  async function handleLog() {
    const value = Number(weightInput);
    if (!Number.isFinite(value) || value <= 0) return;
    const weightKg = isImperial ? lbToKg(value) : value;
    await logWeight(todayIso(), weightKg);
    setWeightInput("");
  }

  if (!user) {
    return <p className="text-center text-slate-400">Sign in to log your weight.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Weight</h1>
          {profile && (
            <p className="text-sm text-slate-400">
              Starting {displayWeight(profile.startingWeightKg)} {unitLabel} → Target{" "}
              {displayWeight(profile.targetWeightKg)} {unitLabel}
              {profile.targetDate ? ` by ${profile.targetDate}` : ""}
            </p>
          )}
          {profile && (
            <p className="text-sm font-medium text-brand-700">{profile.calorieTarget} kcal/day target</p>
          )}
        </div>
        {profile && (
          <button
            onClick={() => setShowEditGoal(true)}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            <Pencil size={14} /> Edit goal
          </button>
        )}
      </header>

      <section className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLog()}
          type="number"
          step="0.1"
          placeholder={latest ? `Last: ${displayWeight(latest.weightKg)} ${unitLabel}` : `Enter weight (${unitLabel})`}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          onClick={handleLog}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Log Today
        </button>
      </section>

      {trend.length > 0 ? (
        <WeightChart points={trend} />
      ) : (
        <p className="text-center text-sm text-slate-400">Log your first weigh-in to see your trend.</p>
      )}

      {showEditGoal && profile && (
        <EditGoalModal
          profile={profile}
          currentWeightKg={latest?.weightKg ?? profile.startingWeightKg}
          onClose={() => setShowEditGoal(false)}
        />
      )}
    </div>
  );
}
