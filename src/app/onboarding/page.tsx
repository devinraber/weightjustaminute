"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { calculateBmr, calculateCalorieTarget, calorieTargetFromGoalDate, calculateTdee, defaultMacroTargets } from "@/lib/utils/energyGoals";
import { feetInchesToCm, lbToKg } from "@/lib/utils/units";
import type { ActivityLevel, GoalDirection, Sex, UserProfile } from "@/lib/types";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little to no exercise)" },
  { value: "light", label: "Light (exercise 1-3 days/week)" },
  { value: "moderate", label: "Moderate (exercise 3-5 days/week)" },
  { value: "active", label: "Active (exercise 6-7 days/week)" },
  { value: "very_active", label: "Very active (hard exercise + physical job)" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");

  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const [weightKg, setWeightKg] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [targetWeightKgInput, setTargetWeightKgInput] = useState("");
  const [targetWeightLbInput, setTargetWeightLbInput] = useState("");

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("light");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user) return;
    setError(null);

    const ageNum = Number(age);
    const resolvedHeightCm = unit === "metric" ? Number(heightCm) : feetInchesToCm(Number(heightFt) || 0, Number(heightIn) || 0);
    const resolvedStartWeightKg = unit === "metric" ? Number(weightKg) : lbToKg(Number(weightLb));
    const resolvedTargetWeightKg = unit === "metric" ? Number(targetWeightKgInput) : lbToKg(Number(targetWeightLbInput));

    if (!Number.isFinite(ageNum) || ageNum < 13 || ageNum > 120) {
      setError("Enter a valid age (13-120).");
      return;
    }
    if (!Number.isFinite(resolvedHeightCm) || resolvedHeightCm < 100 || resolvedHeightCm > 250) {
      setError("Enter a valid height.");
      return;
    }
    if (!Number.isFinite(resolvedStartWeightKg) || resolvedStartWeightKg <= 0) {
      setError("Enter a valid current weight.");
      return;
    }
    if (!Number.isFinite(resolvedTargetWeightKg) || resolvedTargetWeightKg <= 0) {
      setError("Enter a valid goal weight.");
      return;
    }

    setSaving(true);
    try {
      const goalDirection: GoalDirection =
        resolvedTargetWeightKg < resolvedStartWeightKg - 0.5
          ? "lose"
          : resolvedTargetWeightKg > resolvedStartWeightKg + 0.5
            ? "gain"
            : "maintain";

      const birthYear = new Date().getFullYear() - ageNum;
      const bmr = calculateBmr({ sex, weightKg: resolvedStartWeightKg, heightCm: resolvedHeightCm, age: ageNum });
      const tdee = calculateTdee(bmr, activityLevel);

      const calorieTarget = targetDate
        ? calorieTargetFromGoalDate({
            tdee,
            currentWeightKg: resolvedStartWeightKg,
            targetWeightKg: resolvedTargetWeightKg,
            targetDate,
          })
        : calculateCalorieTarget({ tdee, goalDirection });

      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? undefined,
        sex,
        birthYear,
        heightCm: Math.round(resolvedHeightCm),
        activityLevel,
        startingWeightKg: resolvedStartWeightKg,
        startingWeightDate: todayIso(),
        targetWeightKg: resolvedTargetWeightKg,
        targetDate: targetDate || undefined,
        goalDirection,
        calorieTarget,
        macroTargets: defaultMacroTargets(calorieTarget),
        autoCalculateTargets: true,
        weightUnit: unit === "metric" ? "kg" : "lb",
        connections: [],
        pendingInvites: [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(getFirebaseDb(), "users", user.uid), profile);
      // Also log today's starting weight so the progress chart has a first data point.
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "weightLogs", todayIso()), {
        id: todayIso(),
        uid: user.uid,
        date: todayIso(),
        weightKg: resolvedStartWeightKg,
        loggedAt: now,
      });

      router.replace("/");
    } catch {
      setError("Something went wrong saving your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pb-10">
      <header>
        <h1 className="text-xl font-bold">Let&apos;s set up your goals</h1>
        <p className="text-sm text-slate-500">
          We use this to calculate your daily calorie target and track your progress.
        </p>
      </header>

      <div className="flex gap-2 rounded-lg bg-slate-100 p-1 text-sm">
        <button
          onClick={() => setUnit("imperial")}
          className={`flex-1 rounded-md py-1.5 font-medium ${unit === "imperial" ? "bg-white shadow-sm" : "text-slate-500"}`}
        >
          lb / ft-in
        </button>
        <button
          onClick={() => setUnit("metric")}
          className={`flex-1 rounded-md py-1.5 font-medium ${unit === "metric" ? "bg-white shadow-sm" : "text-slate-500"}`}
        >
          kg / cm
        </button>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">About you</h2>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            type="number"
            placeholder="Age"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        {unit === "metric" ? (
          <input
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            type="number"
            placeholder="Height (cm)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              type="number"
              placeholder="Height (ft)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              type="number"
              placeholder="Height (in)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        )}

        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {ACTIVITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Your goal</h2>
        {unit === "metric" ? (
          <>
            <input
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              type="number"
              placeholder="Current weight (kg)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={targetWeightKgInput}
              onChange={(e) => setTargetWeightKgInput(e.target.value)}
              type="number"
              placeholder="Goal weight (kg)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </>
        ) : (
          <>
            <input
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              type="number"
              placeholder="Current weight (lb)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={targetWeightLbInput}
              onChange={(e) => setTargetWeightLbInput(e.target.value)}
              type="number"
              placeholder="Goal weight (lb)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </>
        )}
        <label className="flex flex-col gap-1 text-sm text-slate-500">
          Goal date (optional - leave blank for a steady 500 kcal/day pace)
          <input
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            type="date"
            min={todayIso()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
          />
        </label>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Calculate my calorie target"}
      </button>
    </div>
  );
}
