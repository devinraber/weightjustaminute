import type { FoodItem, NutritionPer100g } from "@/lib/types";

/**
 * A hand-curated, always-available database of common foods with accurate
 * per-100g nutrition (sourced from USDA reference values). Merged into every
 * search alongside the live Open Food Facts / USDA API results so the most
 * commonly logged foods are never missing, even when those external APIs are
 * slow, rate-limited, or return oddly-ranked/foreign results.
 */
interface CuratedFoodDef {
  name: string;
  aliases?: string[];
  servingLabel?: string;
  servingSizeG?: number;
  n: NutritionPer100g;
}

const CURATED_FOOD_DEFS: CuratedFoodDef[] = [
  // Eggs & dairy
  { name: "Egg, whole, raw", aliases: ["egg", "eggs"], servingLabel: "1 large egg", servingSizeG: 50, n: { calories: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5, sugarG: 0.4 } },
  { name: "Egg white, raw", aliases: ["egg white"], servingLabel: "1 large egg white", servingSizeG: 33, n: { calories: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2, sugarG: 0.7 } },
  { name: "Milk, whole", aliases: ["milk", "whole milk"], servingLabel: "1 cup", servingSizeG: 240, n: { calories: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3, sugarG: 5.1 } },
  { name: "Milk, skim/nonfat", aliases: ["skim milk", "nonfat milk"], servingLabel: "1 cup", servingSizeG: 245, n: { calories: 34, proteinG: 3.4, carbsG: 5, fatG: 0.1, sugarG: 5 } },
  { name: "Greek yogurt, plain, nonfat", aliases: ["greek yogurt", "yogurt"], servingLabel: "1 cup", servingSizeG: 245, n: { calories: 59, proteinG: 10.2, carbsG: 3.6, fatG: 0.4, sugarG: 3.2 } },
  { name: "Cheddar cheese", aliases: ["cheddar", "cheese"], servingLabel: "1 slice", servingSizeG: 28, n: { calories: 403, proteinG: 24.9, carbsG: 1.3, fatG: 33.1, sugarG: 0.5 } },
  { name: "Mozzarella cheese, part-skim", aliases: ["mozzarella"], servingLabel: "1/4 cup shredded", servingSizeG: 28, n: { calories: 254, proteinG: 24.3, carbsG: 2.8, fatG: 15.9, sugarG: 1.2 } },
  { name: "Cottage cheese, low-fat", aliases: ["cottage cheese"], servingLabel: "1/2 cup", servingSizeG: 113, n: { calories: 81, proteinG: 11, carbsG: 4.3, fatG: 2.3, sugarG: 4.1 } },
  { name: "Butter", aliases: ["butter"], servingLabel: "1 tbsp", servingSizeG: 14, n: { calories: 717, proteinG: 0.9, carbsG: 0.1, fatG: 81.1, sugarG: 0.1 } },

  // Poultry, meat, seafood
  { name: "Chicken breast, boneless skinless, cooked", aliases: ["chicken breast", "chicken"], servingLabel: "1 breast", servingSizeG: 172, n: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, sugarG: 0 } },
  { name: "Chicken thigh, boneless skinless, cooked", aliases: ["chicken thigh"], servingLabel: "1 thigh", servingSizeG: 110, n: { calories: 209, proteinG: 26, carbsG: 0, fatG: 10.9, sugarG: 0 } },
  { name: "Ground beef, 85% lean, cooked", aliases: ["ground beef", "hamburger meat", "beef"], servingLabel: "3 oz", servingSizeG: 85, n: { calories: 250, proteinG: 25.6, carbsG: 0, fatG: 15.8, sugarG: 0 } },
  { name: "Turkey breast, cooked", aliases: ["turkey", "turkey breast"], servingLabel: "3 oz", servingSizeG: 85, n: { calories: 135, proteinG: 30.1, carbsG: 0, fatG: 0.7, sugarG: 0 } },
  { name: "Pork chop, cooked", aliases: ["pork chop", "pork"], servingLabel: "1 chop", servingSizeG: 145, n: { calories: 231, proteinG: 27.2, carbsG: 0, fatG: 12.7, sugarG: 0 } },
  { name: "Bacon, cooked", aliases: ["bacon"], servingLabel: "1 slice", servingSizeG: 8, n: { calories: 541, proteinG: 37, carbsG: 1.4, fatG: 42, sugarG: 0 } },
  { name: "Salmon, cooked", aliases: ["salmon"], servingLabel: "1 fillet", servingSizeG: 154, n: { calories: 208, proteinG: 22.1, carbsG: 0, fatG: 12.4, sugarG: 0 } },
  { name: "Tuna, canned in water", aliases: ["tuna", "canned tuna"], servingLabel: "1 can", servingSizeG: 142, n: { calories: 116, proteinG: 25.5, carbsG: 0, fatG: 0.8, sugarG: 0 } },
  { name: "Shrimp, cooked", aliases: ["shrimp"], servingLabel: "3 oz", servingSizeG: 85, n: { calories: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3, sugarG: 0 } },
  { name: "Tofu, firm", aliases: ["tofu"], servingLabel: "1/2 cup", servingSizeG: 126, n: { calories: 144, proteinG: 15.5, carbsG: 3.5, fatG: 8.7, sugarG: 0.6 } },

  // Grains, breads, pasta
  { name: "White rice, cooked", aliases: ["white rice", "rice"], servingLabel: "1 cup", servingSizeG: 158, n: { calories: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3, sugarG: 0.1 } },
  { name: "Brown rice, cooked", aliases: ["brown rice"], servingLabel: "1 cup", servingSizeG: 195, n: { calories: 112, proteinG: 2.3, carbsG: 23.5, fatG: 0.8, sugarG: 0.4 } },
  { name: "Oats, cooked (oatmeal)", aliases: ["oatmeal", "oats"], servingLabel: "1 cup", servingSizeG: 234, n: { calories: 71, proteinG: 2.5, carbsG: 12, fatG: 1.5, sugarG: 0.5 } },
  { name: "Quinoa, cooked", aliases: ["quinoa"], servingLabel: "1 cup", servingSizeG: 185, n: { calories: 120, proteinG: 4.4, carbsG: 21.3, fatG: 1.9, sugarG: 0.9 } },
  { name: "Whole wheat bread", aliases: ["whole wheat bread", "wheat bread"], servingLabel: "1 slice", servingSizeG: 28, n: { calories: 247, proteinG: 13, carbsG: 41, fatG: 3.4, sugarG: 6 } },
  { name: "White bread", aliases: ["white bread", "bread", "toast"], servingLabel: "1 slice", servingSizeG: 28, n: { calories: 265, proteinG: 9, carbsG: 49, fatG: 3.2, sugarG: 5.3 } },
  { name: "Pasta, cooked", aliases: ["pasta", "spaghetti", "noodles"], servingLabel: "1 cup", servingSizeG: 140, n: { calories: 131, proteinG: 5.1, carbsG: 25, fatG: 1.1, sugarG: 0.6 } },
  { name: "Flour tortilla", aliases: ["tortilla"], servingLabel: "1 tortilla", servingSizeG: 45, n: { calories: 304, proteinG: 8.2, carbsG: 50.4, fatG: 7.3, sugarG: 1.5 } },
  { name: "Bagel, plain", aliases: ["bagel"], servingLabel: "1 bagel", servingSizeG: 105, n: { calories: 257, proteinG: 10, carbsG: 50.6, fatG: 1.5, sugarG: 5.6 } },
  { name: "Cereal, corn flakes", aliases: ["corn flakes", "cereal"], servingLabel: "1 cup", servingSizeG: 28, n: { calories: 357, proteinG: 7.5, carbsG: 84, fatG: 0.4, sugarG: 8 } },
  { name: "Granola", aliases: ["granola"], servingLabel: "1/2 cup", servingSizeG: 61, n: { calories: 471, proteinG: 10, carbsG: 64, fatG: 20, sugarG: 24 } },

  // Fruits
  { name: "Banana, raw", aliases: ["banana"], servingLabel: "1 medium banana", servingSizeG: 118, n: { calories: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3, sugarG: 12.2 } },
  { name: "Apple, raw", aliases: ["apple"], servingLabel: "1 medium apple", servingSizeG: 182, n: { calories: 52, proteinG: 0.3, carbsG: 13.8, fatG: 0.2, sugarG: 10.4 } },
  { name: "Orange, raw", aliases: ["orange"], servingLabel: "1 medium orange", servingSizeG: 131, n: { calories: 47, proteinG: 0.9, carbsG: 11.8, fatG: 0.1, sugarG: 9.4 } },
  { name: "Strawberries, raw", aliases: ["strawberries", "strawberry"], servingLabel: "1 cup", servingSizeG: 152, n: { calories: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3, sugarG: 4.9 } },
  { name: "Blueberries, raw", aliases: ["blueberries", "blueberry"], servingLabel: "1 cup", servingSizeG: 148, n: { calories: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3, sugarG: 10 } },
  { name: "Grapes, raw", aliases: ["grapes"], servingLabel: "1 cup", servingSizeG: 151, n: { calories: 69, proteinG: 0.7, carbsG: 18.1, fatG: 0.2, sugarG: 15.5 } },
  { name: "Avocado, raw", aliases: ["avocado"], servingLabel: "1 avocado", servingSizeG: 150, n: { calories: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7, sugarG: 0.7 } },
  { name: "Applesauce, unsweetened", aliases: ["apple sauce", "applesauce"], servingLabel: "1/2 cup", servingSizeG: 122, n: { calories: 42, proteinG: 0.2, carbsG: 11.3, fatG: 0.1, sugarG: 9.4 } },

  // Vegetables
  { name: "Broccoli, cooked", aliases: ["broccoli"], servingLabel: "1 cup", servingSizeG: 156, n: { calories: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4, sugarG: 1.4 } },
  { name: "Spinach, raw", aliases: ["spinach"], servingLabel: "1 cup", servingSizeG: 30, n: { calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, sugarG: 0.4 } },
  { name: "Carrots, raw", aliases: ["carrots", "carrot"], servingLabel: "1 medium carrot", servingSizeG: 61, n: { calories: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2, sugarG: 4.7 } },
  { name: "Sweet potato, cooked", aliases: ["sweet potato"], servingLabel: "1 medium", servingSizeG: 151, n: { calories: 90, proteinG: 2, carbsG: 20.7, fatG: 0.2, sugarG: 6.5 } },
  { name: "Potato, baked", aliases: ["potato", "baked potato"], servingLabel: "1 medium", servingSizeG: 173, n: { calories: 93, proteinG: 2.5, carbsG: 21.2, fatG: 0.1, sugarG: 1.2 } },
  { name: "Green beans, cooked", aliases: ["green beans"], servingLabel: "1 cup", servingSizeG: 125, n: { calories: 35, proteinG: 2, carbsG: 8, fatG: 0.2, sugarG: 3.3 } },
  { name: "Tomato, raw", aliases: ["tomato"], servingLabel: "1 medium tomato", servingSizeG: 123, n: { calories: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2, sugarG: 2.6 } },
  { name: "Onion, raw", aliases: ["onion"], servingLabel: "1 medium onion", servingSizeG: 110, n: { calories: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1, sugarG: 4.2 } },
  { name: "Bell pepper, raw", aliases: ["bell pepper", "pepper"], servingLabel: "1 medium pepper", servingSizeG: 119, n: { calories: 31, proteinG: 1, carbsG: 6, fatG: 0.3, sugarG: 4.2 } },
  { name: "Corn, cooked", aliases: ["corn"], servingLabel: "1 cup", servingSizeG: 154, n: { calories: 96, proteinG: 3.4, carbsG: 21, fatG: 1.5, sugarG: 4.5 } },

  // Legumes, nuts, fats
  { name: "Black beans, cooked", aliases: ["black beans", "beans"], servingLabel: "1 cup", servingSizeG: 172, n: { calories: 132, proteinG: 8.9, carbsG: 23.7, fatG: 0.5, sugarG: 0.3 } },
  { name: "Chickpeas, cooked", aliases: ["chickpeas", "garbanzo beans"], servingLabel: "1 cup", servingSizeG: 164, n: { calories: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6, sugarG: 4.8 } },
  { name: "Lentils, cooked", aliases: ["lentils"], servingLabel: "1 cup", servingSizeG: 198, n: { calories: 116, proteinG: 9, carbsG: 20.1, fatG: 0.4, sugarG: 1.8 } },
  { name: "Peanut butter", aliases: ["peanut butter"], servingLabel: "2 tbsp", servingSizeG: 32, n: { calories: 588, proteinG: 25, carbsG: 20, fatG: 50, sugarG: 9 } },
  { name: "Almonds", aliases: ["almonds", "almond"], servingLabel: "1 oz (handful)", servingSizeG: 28, n: { calories: 579, proteinG: 21.2, carbsG: 21.6, fatG: 49.9, sugarG: 4.4 } },
  { name: "Peanuts", aliases: ["peanuts"], servingLabel: "1 oz (handful)", servingSizeG: 28, n: { calories: 567, proteinG: 25.8, carbsG: 16.1, fatG: 49.2, sugarG: 4.7 } },
  { name: "Olive oil", aliases: ["olive oil"], servingLabel: "1 tbsp", servingSizeG: 14, n: { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, sugarG: 0 } },

  // Beverages & snacks
  { name: "Orange juice", aliases: ["orange juice", "juice"], servingLabel: "1 cup", servingSizeG: 248, n: { calories: 45, proteinG: 0.7, carbsG: 10.4, fatG: 0.2, sugarG: 8.4 } },
  { name: "Coffee, black", aliases: ["coffee", "black coffee"], servingLabel: "1 cup", servingSizeG: 240, n: { calories: 2, proteinG: 0.3, carbsG: 0, fatG: 0, sugarG: 0 } },
  { name: "Potato chips", aliases: ["potato chips", "chips"], servingLabel: "1 oz (~15 chips)", servingSizeG: 28, n: { calories: 536, proteinG: 6.6, carbsG: 52.9, fatG: 34.6, sugarG: 0.3 } },
  { name: "Popcorn, air-popped", aliases: ["popcorn"], servingLabel: "1 cup", servingSizeG: 8, n: { calories: 387, proteinG: 12.9, carbsG: 77.9, fatG: 4.5, sugarG: 0.9 } },
  { name: "Dark chocolate", aliases: ["dark chocolate", "chocolate"], servingLabel: "1 oz", servingSizeG: 28, n: { calories: 546, proteinG: 4.9, carbsG: 61, fatG: 31, sugarG: 48 } },
  { name: "Honey", aliases: ["honey"], servingLabel: "1 tbsp", servingSizeG: 21, n: { calories: 304, proteinG: 0.3, carbsG: 82.4, fatG: 0, sugarG: 82.1 } },
];

const now = new Date().toISOString();

export const CURATED_FOODS: FoodItem[] = CURATED_FOOD_DEFS.map((def, i) => ({
  id: `curated_${i}`,
  source: "curated",
  name: def.name,
  servingLabel: def.servingLabel,
  servingSizeG: def.servingSizeG,
  nutritionPer100g: def.n,
  createdAt: now,
  updatedAt: now,
}));

/** Searches the curated list by name and common alias keywords (e.g. "egg" matches "Egg, whole, raw"). */
export function searchCuratedFoods(query: string): FoodItem[] {
  const queryLower = query.trim().toLowerCase();
  if (queryLower.length < 2) return [];

  return CURATED_FOOD_DEFS.reduce<FoodItem[]>((matches, def, i) => {
    const haystack = [def.name, ...(def.aliases ?? [])].join(" ").toLowerCase();
    if (haystack.includes(queryLower)) matches.push(CURATED_FOODS[i]);
    return matches;
  }, []);
}
