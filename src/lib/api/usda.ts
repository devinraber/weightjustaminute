import type { FoodItem, NutritionPer100g } from "@/lib/types";

const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

interface FdcNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
}

interface FdcFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: FdcNutrient[];
}

// USDA nutrient IDs (per 100g, consistent across whole-food entries).
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
};

function nutrientValue(nutrients: FdcNutrient[], id: number): number | undefined {
  return nutrients.find((n) => n.nutrientId === id)?.value;
}

function toNutritionPer100g(nutrients: FdcNutrient[]): NutritionPer100g {
  return {
    calories: nutrientValue(nutrients, NUTRIENT_IDS.calories) ?? 0,
    proteinG: nutrientValue(nutrients, NUTRIENT_IDS.protein) ?? 0,
    carbsG: nutrientValue(nutrients, NUTRIENT_IDS.carbs) ?? 0,
    fatG: nutrientValue(nutrients, NUTRIENT_IDS.fat) ?? 0,
    fiberG: nutrientValue(nutrients, NUTRIENT_IDS.fiber),
    sugarG: nutrientValue(nutrients, NUTRIENT_IDS.sugar),
    sodiumMg: nutrientValue(nutrients, NUTRIENT_IDS.sodium),
  };
}

function toFoodItem(food: FdcFood): FoodItem {
  const now = new Date().toISOString();
  return {
    id: `usda_${food.fdcId}`,
    source: "usda",
    externalId: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner,
    servingSizeG: food.servingSizeUnit === "g" ? food.servingSize : undefined,
    nutritionPer100g: toNutritionPer100g(food.foodNutrients ?? []),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Searches USDA FoodData Central for whole/raw foods (e.g. "chicken breast raw").
 * Requires a free API key from https://fdc.nal.usda.gov/api-key-signup.html,
 * used server-side only (called from an API route, never from the browser).
 */
export async function searchUsda(query: string, pageSize = 20): Promise<FoodItem[]> {
  const apiKey = process.env.USDA_FDC_API_KEY;
  if (!apiKey) {
    throw new Error("USDA_FDC_API_KEY is not configured");
  }

  const url = new URL(`${USDA_BASE_URL}/foods/search`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  // Prefer raw/whole-food data over branded/processed entries, which OFF already covers.
  url.searchParams.set("dataType", "Foundation,SR Legacy,Survey (FNDDS)");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`USDA search failed with status ${res.status}`);
  }

  const data = await res.json();
  const foods: FdcFood[] = data.foods ?? [];
  return foods.map(toFoodItem);
}
