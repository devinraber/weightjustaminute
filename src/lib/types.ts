/**
 * Core domain types shared across the app, API routes, and Firestore converters.
 * Firestore Timestamps are stored as ISO 8601 strings on the client-facing types
 * so they serialize cleanly through Server Components / API routes.
 */

// ---------------------------------------------------------------------------
// Users & connections (multi-user / shared library)
// ---------------------------------------------------------------------------

export type Sex = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type GoalDirection = "lose" | "maintain" | "gain";

/** Document at /users/{uid} */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  sex: Sex;
  birthYear: number;
  heightCm: number;
  activityLevel: ActivityLevel;

  /** Weight goal engine */
  startingWeightKg: number;
  startingWeightDate: string; // ISO date
  targetWeightKg: number;
  targetDate?: string; // ISO date, optional
  goalDirection: GoalDirection;

  /** Daily nutrition targets, either user-set or auto-calculated from TDEE */
  calorieTarget: number;
  macroTargets: MacroTargets;
  autoCalculateTargets: boolean;

  /** Unit preference so partners on different locales/devices see consistent units */
  weightUnit: "kg" | "lb";

  /** IDs of other users this account shares a food/recipe library with */
  connections: string[];
  /** Pending connection invites, keyed by the invited email */
  pendingInvites: string[];

  createdAt: string;
  updatedAt: string;
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
}

/** Document at /connectionInvites/{inviteId} - used to link two accounts for shared library */
export interface ConnectionInvite {
  id: string;
  fromUid: string;
  fromEmail: string;
  toEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Weight tracking
// ---------------------------------------------------------------------------

/** Document at /users/{uid}/weightLogs/{dateISO} - one entry per day, doc id = yyyy-MM-dd */
export interface WeightLogEntry {
  id: string; // yyyy-MM-dd
  uid: string;
  date: string; // ISO date (yyyy-MM-dd)
  weightKg: number;
  note?: string;
  loggedAt: string; // ISO datetime
}

/** Computed, not persisted - one point per day for the progress chart */
export interface WeightTrendPoint {
  date: string;
  actualWeightKg: number | null;
  emaWeightKg: number | null;
  projectedWeightKg: number | null;
}

// ---------------------------------------------------------------------------
// Food database
// ---------------------------------------------------------------------------

export type FoodSource = "openfoodfacts" | "usda" | "custom" | "ai_estimate";

/** Normalized nutrition, always per 100g so items from different sources are comparable */
export interface NutritionPer100g {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

/** Document at /foods/{foodId} - shared, read-only cache of external lookups + user-created items */
export interface FoodItem {
  id: string;
  source: FoodSource;
  /** Barcode for Open Food Facts items, FDC id for USDA items, undefined for custom/AI */
  externalId?: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  servingSizeG?: number;
  servingLabel?: string; // e.g. "1 slice (28g)"
  nutritionPer100g: NutritionPer100g;

  /** Ownership/sharing for custom foods and recipes */
  createdByUid?: string;
  sharedWithUids?: string[];
  isRecipe?: boolean;
  ingredients?: RecipeIngredient[];

  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  foodId: string;
  name: string;
  grams: number;
}

// ---------------------------------------------------------------------------
// Daily meal log
// ---------------------------------------------------------------------------

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

/** A single logged food entry within a meal slot */
export interface MealEntry {
  id: string;
  foodId?: string; // reference to /foods/{foodId} when linked to the database
  name: string;
  grams?: number; // present for detailed entries, absent for quick-add
  quickAddCalories?: number; // present for quick-add entries
  nutrition: NutritionPer100gScaled; // already scaled to the logged portion
  source: FoodSource;
  loggedAt: string;
}

/** Nutrition already scaled to the actual portion logged (not per-100g) */
export interface NutritionPer100gScaled {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
}

/** Document at /users/{uid}/dailyLogs/{dateISO} - doc id = yyyy-MM-dd */
export interface DailyLog {
  id: string; // yyyy-MM-dd
  uid: string;
  date: string;
  meals: Record<MealSlot, MealEntry[]>;
  totals: NutritionPer100gScaled;
  createdAt: string;
  updatedAt: string;
}

export function emptyDailyLog(uid: string, date: string): DailyLog {
  return {
    id: date,
    uid,
    date,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    totals: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// AI photo estimator
// ---------------------------------------------------------------------------

/** Structured response returned by the Gemini Flash Vision photo-log route */
export interface AiFoodEstimate {
  items: AiFoodEstimateItem[];
  /** Model's own confidence note / caveats surfaced to the user */
  disclaimer?: string;
}

export interface AiFoodEstimateItem {
  name: string;
  estimatedGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  confidence: "low" | "medium" | "high";
}
