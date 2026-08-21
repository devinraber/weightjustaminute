import type { FoodItem } from "@/lib/types";

export interface ServingUnit {
  /** Singular label, e.g. "cup", "breast", "slice". Pluralized automatically when needed. */
  label: string;
  gramsPerUnit: number;
}

/**
 * Approximate gram weights for common whole/prepared foods that don't come with
 * their own serving size from USDA/OFF (raw whole foods rarely do). Matched by
 * keyword against the food name. These are estimates for people who don't weigh
 * their food - precision can always be adjusted via the quantity multiplier.
 */
const COMMON_FOOD_UNITS: { keywords: string[]; unit: ServingUnit }[] = [
  { keywords: ["chicken breast"], unit: { label: "breast", gramsPerUnit: 174 } },
  { keywords: ["chicken thigh"], unit: { label: "thigh", gramsPerUnit: 110 } },
  { keywords: ["egg"], unit: { label: "egg", gramsPerUnit: 50 } },
  { keywords: ["banana"], unit: { label: "banana", gramsPerUnit: 118 } },
  { keywords: ["apple"], unit: { label: "apple", gramsPerUnit: 182 } },
  { keywords: ["orange"], unit: { label: "orange", gramsPerUnit: 131 } },
  { keywords: ["slice of bread", "bread, white", "bread, whole", "toast"], unit: { label: "slice", gramsPerUnit: 28 } },
  { keywords: ["bagel"], unit: { label: "bagel", gramsPerUnit: 105 } },
  { keywords: ["tortilla"], unit: { label: "tortilla", gramsPerUnit: 45 } },
  { keywords: ["cereal", "oatmeal", "rice", "pasta", "granola"], unit: { label: "cup", gramsPerUnit: 120 } },
  { keywords: ["milk", "juice", "soup", "broth"], unit: { label: "cup", gramsPerUnit: 240 } },
  { keywords: ["yogurt"], unit: { label: "cup", gramsPerUnit: 245 } },
  { keywords: ["potato"], unit: { label: "potato", gramsPerUnit: 173 } },
  { keywords: ["avocado"], unit: { label: "avocado", gramsPerUnit: 150 } },
  { keywords: ["almond", "nut", "cashew"], unit: { label: "handful", gramsPerUnit: 28 } },
];

const FRACTION_MULTIPLIERS = [
  { value: 0.25, label: "¼" },
  { value: 0.33, label: "⅓" },
  { value: 0.5, label: "½" },
  { value: 0.75, label: "¾" },
  { value: 1, label: "1" },
  { value: 1.5, label: "1½" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

/** Determines the best natural serving unit for a food: its own data, a common-food heuristic, or a generic fallback. */
export function getServingUnit(food: FoodItem): ServingUnit {
  if (food.servingSizeG && food.servingSizeG > 0) {
    return { label: food.servingLabel || "serving", gramsPerUnit: food.servingSizeG };
  }

  const nameLower = food.name.toLowerCase();
  const match = COMMON_FOOD_UNITS.find((entry) => entry.keywords.some((kw) => nameLower.includes(kw)));
  if (match) return match.unit;

  return { label: "serving (100g)", gramsPerUnit: 100 };
}

/** Builds the quantity chip options (¼, ½, 1, 1½, 2, 3...) for a given serving unit. */
export function buildServingOptions(unit: ServingUnit): { label: string; grams: number }[] {
  return FRACTION_MULTIPLIERS.map((f) => ({
    label: `${f.label} ${pluralizeUnit(unit.label, f.value)}`,
    grams: Math.round(unit.gramsPerUnit * f.value),
  }));
}

function pluralizeUnit(label: string, quantity: number): string {
  if (quantity <= 1 || label.endsWith("s") || label.includes("(")) return label;
  return `${label}s`;
}
