import usdaBulkFoodsRaw from "@/lib/data/usdaBulkFoods.json";
import type { FoodItem, NutritionPer100g } from "@/lib/types";

interface BulkFoodEntry {
  id: string;
  name: string;
  n: NutritionPer100g;
}

const BULK_FOODS = usdaBulkFoodsRaw as BulkFoodEntry[];
const now = new Date().toISOString();

/**
 * Searches the full USDA Foundation + SR Legacy dataset (~7,900 whole/raw
 * foods), bundled locally so lookups are instant and never rate-limited.
 * Regenerate with `node scripts/generate-usda-database.mjs`.
 */
export function searchBulkUsdaFoods(query: string, limit = 25): FoodItem[] {
  const queryLower = query.trim().toLowerCase();
  if (queryLower.length < 2) return [];

  const matches: FoodItem[] = [];
  for (const entry of BULK_FOODS) {
    if (entry.name.toLowerCase().includes(queryLower)) {
      matches.push({
        id: entry.id,
        source: "usda",
        externalId: entry.id.replace("usda_", ""),
        name: entry.name,
        nutritionPer100g: entry.n,
        createdAt: now,
        updatedAt: now,
      });
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
