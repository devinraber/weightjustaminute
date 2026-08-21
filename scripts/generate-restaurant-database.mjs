// One-time generator: searches USDA FoodData Central for specific restaurant
// chains not already well-covered by the Foundation/SR Legacy bulk fetch, and
// writes a supplemental JSON file. Re-run manually to refresh/expand coverage.
//
// Usage: node scripts/generate-restaurant-database.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/USDA_FDC_API_KEY=(.+)/);
const apiKey = apiKeyMatch?.[1]?.trim();
if (!apiKey) throw new Error("USDA_FDC_API_KEY not found in .env.local");

// Chain name -> keyword(s) that must appear in the food description to keep a match.
const CHAINS = [
  "McDonald's", "Burger King", "Wendy's", "Taco Bell", "KFC", "Pizza Hut", "Subway",
  "Starbucks", "Chick-fil-A", "Chipotle", "Dairy Queen", "Domino's", "Popeyes",
  "Arby's", "Jack in the Box", "Panda Express", "Sonic", "Five Guys", "In-N-Out",
  "Whataburger", "Culver's", "Shake Shack", "Jimmy John's", "Papa John's",
  "Little Caesars", "Panera", "Dunkin", "Carl's Jr", "Hardee's", "White Castle",
  "Del Taco", "Qdoba", "Wingstop", "Buffalo Wild Wings", "Applebee's", "IHOP",
  "Denny's", "Cracker Barrel", "Olive Garden", "Red Lobster", "Outback Steakhouse",
  "Chili's", "TGI Friday", "Texas Roadhouse", "Chuck E Cheese", "Zaxby's", "Raising Cane",
];

const NUTRIENT_IDS = { calories: 1008, protein: 1003, carbs: 1005, fat: 1004, sugar: 2000 };

function nutrientValue(nutrients, id) {
  return nutrients.find((n) => n.nutrientId === id)?.value;
}

async function searchChain(chainName) {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", chainName);
  url.searchParams.set("dataType", "Branded");
  url.searchParams.set("pageSize", "200");

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`  Search failed for "${chainName}": ${res.status}`);
    return [];
  }
  const data = await res.json();
  const keyword = chainName.toLowerCase().replace(/['’]/g, "");
  return (data.foods ?? []).filter((f) =>
    f.description.toLowerCase().replace(/['’]/g, "").includes(keyword),
  );
}

async function main() {
  const outPath = path.join(__dirname, "..", "src", "lib", "data", "restaurantFoods.json");
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf-8")) : [];
  const seen = new Set(existing.map((f) => f.id));
  const foods = [...existing];

  for (const chain of CHAINS) {
    const matches = await searchChain(chain);
    let added = 0;
    for (const food of matches) {
      const id = `usda_${food.fdcId}`;
      if (seen.has(id)) continue;
      const calories = nutrientValue(food.foodNutrients ?? [], NUTRIENT_IDS.calories);
      if (calories == null) continue;
      seen.add(id);
      foods.push({
        id,
        name: food.description,
        brand: chain,
        servingLabel: food.householdServingFullText || undefined,
        servingSizeG: food.servingSizeUnit === "g" ? food.servingSize : undefined,
        n: {
          calories,
          proteinG: nutrientValue(food.foodNutrients, NUTRIENT_IDS.protein) ?? 0,
          carbsG: nutrientValue(food.foodNutrients, NUTRIENT_IDS.carbs) ?? 0,
          fatG: nutrientValue(food.foodNutrients, NUTRIENT_IDS.fat) ?? 0,
          sugarG: nutrientValue(food.foodNutrients, NUTRIENT_IDS.sugar) ?? 0,
        },
      });
      added++;
    }
    console.log(`${chain}: +${added} (total ${foods.length})`);
    // Be polite to the API between requests.
    await new Promise((r) => setTimeout(r, 350));
  }

  fs.writeFileSync(outPath, JSON.stringify(foods));
  console.log(`Wrote ${foods.length} restaurant foods to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
