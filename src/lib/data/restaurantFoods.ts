import restaurantFoodsRaw from "@/lib/data/restaurantFoods.json";
import type { FoodItem, NutritionPer100g } from "@/lib/types";

interface RestaurantFoodEntry {
  id: string;
  name: string;
  brand?: string;
  servingLabel?: string;
  servingSizeG?: number;
  n: NutritionPer100g;
}

const RESTAURANT_FOODS = restaurantFoodsRaw as RestaurantFoodEntry[];
const now = new Date().toISOString();

/**
 * Searches real restaurant menu items sourced from USDA's Branded Foods
 * dataset (chains that voluntarily publish nutrition data there).
 * Regenerate with `node scripts/generate-restaurant-database.mjs`.
 */
export function searchRestaurantFoods(query: string, limit = 15): FoodItem[] {
  const queryLower = query.trim().toLowerCase();
  if (queryLower.length < 2) return [];

  const matches: FoodItem[] = [];
  for (const entry of RESTAURANT_FOODS) {
    const haystack = `${entry.name} ${entry.brand ?? ""}`.toLowerCase();
    if (haystack.includes(queryLower)) {
      matches.push({
        id: entry.id,
        source: "usda",
        externalId: entry.id.replace("usda_", ""),
        name: entry.name,
        brand: entry.brand,
        servingLabel: entry.servingLabel,
        servingSizeG: entry.servingSizeG,
        nutritionPer100g: entry.n,
        createdAt: now,
        updatedAt: now,
      });
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
