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
 *
 * USDA names are comma-separated (e.g. "Chicken, broiler, breast, cooked, roasted")
 * rather than natural phrases, so each keyword's words are matched independently
 * anywhere in the name rather than as an exact adjacent phrase.
 */
const COMMON_FOOD_UNITS: { keywords: string[]; unit: ServingUnit }[] = [
  // Poultry & meat cuts
  { keywords: ["chicken breast"], unit: { label: "breast", gramsPerUnit: 174 } },
  { keywords: ["chicken thigh"], unit: { label: "thigh", gramsPerUnit: 110 } },
  { keywords: ["chicken wing"], unit: { label: "wing", gramsPerUnit: 30 } },
  { keywords: ["chicken drumstick", "chicken leg"], unit: { label: "drumstick", gramsPerUnit: 76 } },
  { keywords: ["turkey breast"], unit: { label: "slice", gramsPerUnit: 85 } },
  { keywords: ["pork chop"], unit: { label: "chop", gramsPerUnit: 145 } },
  { keywords: ["bacon"], unit: { label: "slice", gramsPerUnit: 8 } },
  { keywords: ["sausage link"], unit: { label: "link", gramsPerUnit: 68 } },
  { keywords: ["ham slice", "ham steak"], unit: { label: "slice", gramsPerUnit: 85 } },
  { keywords: ["hot dog", "frankfurter"], unit: { label: "hot dog", gramsPerUnit: 57 } },
  { keywords: ["hamburger patty", "beef patty", "ground beef"], unit: { label: "patty (4 oz)", gramsPerUnit: 113 } },
  { keywords: ["steak"], unit: { label: "steak (6 oz)", gramsPerUnit: 170 } },
  { keywords: ["rib"], unit: { label: "rib", gramsPerUnit: 90 } },
  { keywords: ["lamb chop"], unit: { label: "chop", gramsPerUnit: 100 } },

  // Fish & seafood
  { keywords: ["salmon"], unit: { label: "fillet", gramsPerUnit: 154 } },
  { keywords: ["tuna"], unit: { label: "can", gramsPerUnit: 142 } },
  { keywords: ["shrimp"], unit: { label: "handful (6 shrimp)", gramsPerUnit: 85 } },
  { keywords: ["cod", "tilapia", "halibut", "haddock", "fish fillet"], unit: { label: "fillet", gramsPerUnit: 130 } },
  { keywords: ["crab"], unit: { label: "serving (3 oz)", gramsPerUnit: 85 } },

  // Eggs & dairy
  { keywords: ["egg"], unit: { label: "egg", gramsPerUnit: 50 } },
  { keywords: ["cheese slice"], unit: { label: "slice", gramsPerUnit: 28 } },
  { keywords: ["cheese"], unit: { label: "serving (1 oz)", gramsPerUnit: 28 } },
  { keywords: ["cottage cheese"], unit: { label: "cup", gramsPerUnit: 226 } },
  { keywords: ["yogurt"], unit: { label: "cup", gramsPerUnit: 245 } },
  { keywords: ["sour cream"], unit: { label: "tbsp", gramsPerUnit: 12 } },
  { keywords: ["butter"], unit: { label: "tbsp", gramsPerUnit: 14 } },
  { keywords: ["cream cheese"], unit: { label: "tbsp", gramsPerUnit: 15 } },

  // Grains, breads, starches
  { keywords: ["bread"], unit: { label: "slice", gramsPerUnit: 28 } },
  { keywords: ["toast"], unit: { label: "slice", gramsPerUnit: 28 } },
  { keywords: ["bagel"], unit: { label: "bagel", gramsPerUnit: 105 } },
  { keywords: ["tortilla"], unit: { label: "tortilla", gramsPerUnit: 45 } },
  { keywords: ["cereal"], unit: { label: "cup", gramsPerUnit: 30 } },
  { keywords: ["oatmeal", "oats"], unit: { label: "cup", gramsPerUnit: 234 } },
  { keywords: ["rice"], unit: { label: "cup", gramsPerUnit: 158 } },
  { keywords: ["pasta", "spaghetti", "noodle", "macaroni"], unit: { label: "cup", gramsPerUnit: 140 } },
  { keywords: ["quinoa"], unit: { label: "cup", gramsPerUnit: 185 } },
  { keywords: ["cracker"], unit: { label: "cracker", gramsPerUnit: 4 } },
  { keywords: ["cookie"], unit: { label: "cookie", gramsPerUnit: 16 } },
  { keywords: ["muffin"], unit: { label: "muffin", gramsPerUnit: 113 } },
  { keywords: ["pancake"], unit: { label: "pancake", gramsPerUnit: 38 } },
  { keywords: ["waffle"], unit: { label: "waffle", gramsPerUnit: 35 } },

  // Fruits
  { keywords: ["banana"], unit: { label: "banana", gramsPerUnit: 118 } },
  { keywords: ["apple"], unit: { label: "apple", gramsPerUnit: 182 } },
  { keywords: ["orange"], unit: { label: "orange", gramsPerUnit: 131 } },
  { keywords: ["grapefruit"], unit: { label: "grapefruit half", gramsPerUnit: 123 } },
  { keywords: ["pear"], unit: { label: "pear", gramsPerUnit: 178 } },
  { keywords: ["peach"], unit: { label: "peach", gramsPerUnit: 150 } },
  { keywords: ["plum"], unit: { label: "plum", gramsPerUnit: 66 } },
  { keywords: ["mango"], unit: { label: "cup, sliced", gramsPerUnit: 165 } },
  { keywords: ["pineapple"], unit: { label: "cup, chunks", gramsPerUnit: 165 } },
  { keywords: ["strawberr"], unit: { label: "cup", gramsPerUnit: 152 } },
  { keywords: ["blueberr"], unit: { label: "cup", gramsPerUnit: 148 } },
  { keywords: ["raspberr"], unit: { label: "cup", gramsPerUnit: 123 } },
  { keywords: ["grape"], unit: { label: "cup", gramsPerUnit: 151 } },
  { keywords: ["watermelon", "cantaloupe", "melon"], unit: { label: "cup, diced", gramsPerUnit: 160 } },
  { keywords: ["cherries", "cherry"], unit: { label: "cup", gramsPerUnit: 138 } },
  { keywords: ["kiwi"], unit: { label: "kiwi", gramsPerUnit: 69 } },
  { keywords: ["avocado"], unit: { label: "avocado", gramsPerUnit: 150 } },
  { keywords: ["apple sauce", "applesauce"], unit: { label: "cup", gramsPerUnit: 244 } },

  // Vegetables
  { keywords: ["potato"], unit: { label: "potato", gramsPerUnit: 173 } },
  { keywords: ["sweet potato", "yam"], unit: { label: "sweet potato", gramsPerUnit: 151 } },
  { keywords: ["broccoli"], unit: { label: "cup", gramsPerUnit: 91 } },
  { keywords: ["carrot"], unit: { label: "carrot", gramsPerUnit: 61 } },
  { keywords: ["spinach"], unit: { label: "cup", gramsPerUnit: 30 } },
  { keywords: ["lettuce"], unit: { label: "cup, shredded", gramsPerUnit: 47 } },
  { keywords: ["tomato"], unit: { label: "tomato", gramsPerUnit: 123 } },
  { keywords: ["cucumber"], unit: { label: "cup, sliced", gramsPerUnit: 119 } },
  { keywords: ["bell pepper", "sweet pepper"], unit: { label: "pepper", gramsPerUnit: 119 } },
  { keywords: ["onion"], unit: { label: "onion", gramsPerUnit: 110 } },
  { keywords: ["corn"], unit: { label: "cup", gramsPerUnit: 154 } },
  { keywords: ["green bean"], unit: { label: "cup", gramsPerUnit: 125 } },
  { keywords: ["mushroom"], unit: { label: "cup, sliced", gramsPerUnit: 70 } },
  { keywords: ["zucchini", "squash"], unit: { label: "cup, sliced", gramsPerUnit: 124 } },
  { keywords: ["cauliflower"], unit: { label: "cup", gramsPerUnit: 107 } },

  // Legumes, nuts, condiments
  { keywords: ["black bean", "kidney bean", "pinto bean", "bean"], unit: { label: "cup", gramsPerUnit: 172 } },
  { keywords: ["chickpea", "garbanzo"], unit: { label: "cup", gramsPerUnit: 164 } },
  { keywords: ["lentil"], unit: { label: "cup", gramsPerUnit: 198 } },
  { keywords: ["peanut butter"], unit: { label: "tbsp", gramsPerUnit: 16 } },
  { keywords: ["almond", "cashew", "walnut", "pecan", "pistachio", "peanut"], unit: { label: "handful (1 oz)", gramsPerUnit: 28 } },
  { keywords: ["olive oil", "vegetable oil", "oil"], unit: { label: "tbsp", gramsPerUnit: 14 } },
  { keywords: ["ketchup", "mustard", "mayonnaise", "salsa"], unit: { label: "tbsp", gramsPerUnit: 15 } },
  { keywords: ["honey", "syrup", "jam", "jelly"], unit: { label: "tbsp", gramsPerUnit: 21 } },

  // Beverages & sweets
  { keywords: ["milk"], unit: { label: "cup", gramsPerUnit: 240 } },
  { keywords: ["juice"], unit: { label: "cup", gramsPerUnit: 248 } },
  { keywords: ["soup", "broth"], unit: { label: "cup", gramsPerUnit: 240 } },
  { keywords: ["coffee"], unit: { label: "cup", gramsPerUnit: 240 } },
  { keywords: ["soda", "cola"], unit: { label: "can (12 oz)", gramsPerUnit: 355 } },
  { keywords: ["beer"], unit: { label: "can (12 oz)", gramsPerUnit: 355 } },
  { keywords: ["wine"], unit: { label: "glass (5 oz)", gramsPerUnit: 148 } },
  { keywords: ["chocolate"], unit: { label: "oz", gramsPerUnit: 28 } },
  { keywords: ["ice cream"], unit: { label: "cup", gramsPerUnit: 132 } },
  { keywords: ["chips"], unit: { label: "oz (~15 chips)", gramsPerUnit: 28 } },
  { keywords: ["popcorn"], unit: { label: "cup", gramsPerUnit: 8 } },
];

/** Broader category fallbacks when nothing specific matches (better than a bare "100g"). */
const CATEGORY_FALLBACKS: { keywords: string[]; unit: ServingUnit }[] = [
  { keywords: ["chicken", "turkey", "beef", "pork", "lamb", "duck", "veal", "meat"], unit: { label: "serving (3 oz)", gramsPerUnit: 85 } },
  { keywords: ["fish", "seafood"], unit: { label: "fillet (4 oz)", gramsPerUnit: 113 } },
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

/** True if every word in `phrase` appears somewhere in `nameLower` (USDA names are comma-separated, not natural phrases). */
function wordsAllPresent(nameLower: string, phrase: string): boolean {
  return phrase.split(" ").every((word) => nameLower.includes(word));
}

function findMatch(
  nameLower: string,
  table: { keywords: string[]; unit: ServingUnit }[],
): ServingUnit | undefined {
  return table.find((entry) => entry.keywords.some((kw) => wordsAllPresent(nameLower, kw)))?.unit;
}

/** Determines the best natural serving unit for a food: its own data, a common-food heuristic, or a generic fallback. */
export function getServingUnit(food: FoodItem): ServingUnit {
  if (food.servingSizeG && food.servingSizeG > 0) {
    return { label: food.servingLabel || "serving", gramsPerUnit: food.servingSizeG };
  }

  const nameLower = food.name.toLowerCase();
  return (
    findMatch(nameLower, COMMON_FOOD_UNITS) ??
    findMatch(nameLower, CATEGORY_FALLBACKS) ?? { label: "serving (100g)", gramsPerUnit: 100 }
  );
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
