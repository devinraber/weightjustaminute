"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { buildWeightTrend } from "@/lib/utils/weightTrend";
import WeightChart from "@/components/WeightChart";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WeightPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { logs, logWeight } = useWeightLogs();
  const [weightInput, setWeightInput] = useState("");

  const trend = useMemo(
    () => buildWeightTrend(logs, profile?.targetWeightKg ?? 0, profile?.targetDate),
    [logs, profile],
  );

  const latest = logs[logs.length - 1];

  async function handleLog() {
    const value = Number(weightInput);
    if (!Number.isFinite(value) || value <= 0) return;
    await logWeight(todayIso(), value);
    setWeightInput("");
  }

  if (!user) {
    return <p className="text-center text-slate-400">Sign in to log your weight.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold">Weight</h1>
        <p className="text-sm text-slate-400">
          Starting {profile?.startingWeightKg ?? "-"} kg → Target {profile?.targetWeightKg ?? "-"} kg
          {profile?.targetDate ? ` by ${profile.targetDate}` : ""}
        </p>
      </header>

      <section className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLog()}
          type="number"
          step="0.1"
          placeholder={latest ? `Last: ${latest.weightKg} kg` : "Enter weight (kg)"}
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
    </div>
  );
}
