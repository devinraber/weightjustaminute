import type { ActivityLevel, GoalDirection, MacroTargets, Sex } from "@/lib/types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor BMR formula. */
export function calculateBmr(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78; // midpoint offset for "other"
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/** 1 kg of body fat ~= 7700 kcal. A 500 kcal/day deficit/surplus targets ~0.45 kg/week. */
const KCAL_PER_KG = 7700;
const DAILY_ADJUSTMENT_FOR_GOAL: Record<GoalDirection, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateCalorieTarget(params: {
  tdee: number;
  goalDirection: GoalDirection;
}): number {
  return Math.round(params.tdee + DAILY_ADJUSTMENT_FOR_GOAL[params.goalDirection]);
}

/** Estimates kcal/day needed to reach targetWeightKg by targetDate from currentWeightKg. */
export function calorieTargetFromGoalDate(params: {
  tdee: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDate: string;
  today?: Date;
}): number {
  const { tdee, currentWeightKg, targetWeightKg, targetDate, today = new Date() } = params;
  const daysRemaining = Math.max(
    1,
    Math.round((new Date(targetDate).getTime() - today.getTime()) / 86_400_000),
  );
  const totalKcalDelta = (targetWeightKg - currentWeightKg) * KCAL_PER_KG;
  const dailyDelta = totalKcalDelta / daysRemaining;
  // Never recommend an unsafe crash-diet calorie level, regardless of how aggressive the goal date is.
  const MIN_SAFE_CALORIES = 1200;
  return Math.max(MIN_SAFE_CALORIES, Math.round(tdee + dailyDelta));
}

/** Default macro split: 30% protein, 40% carbs, 30% fat (4 kcal/g protein & carbs, 9 kcal/g fat). */
export function defaultMacroTargets(calorieTarget: number): MacroTargets {
  return {
    proteinG: Math.round((calorieTarget * 0.3) / 4),
    carbsG: Math.round((calorieTarget * 0.4) / 4),
    fatG: Math.round((calorieTarget * 0.3) / 9),
    // WHO guidance: keep added sugar under ~10% of total calories (4 kcal/g).
    sugarG: Math.round((calorieTarget * 0.1) / 4),
  };
}
