// One-time generator script: fetches USDA FoodData Central's full Foundation +
// SR Legacy datasets via the official bulk /v1/foods/list endpoint and writes
// a normalized, per-100g nutrition JSON file bundled into the app. Re-run this
// manually if you want to refresh the dataset (USDA updates it periodically).
//
// Usage: node scripts/generate-usda-database.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/USDA_FDC_API_KEY=(.+)/);
const apiKey = apiKeyMatch?.[1]?.trim();
if (!apiKey) throw new Error("USDA_FDC_API_KEY not found in .env.local");

const NUTRIENT_NUMBERS = {
  calories: "208",
  protein: "203",
  carbs: "205",
  fat: "204",
  sugar: "269",
  fiber: "291",
  sodium: "307",
};

function nutrientValue(foodNutrients, number) {
  return foodNutrients.find((n) => n.number === number)?.amount;
}

async function fetchPage(pageNumber) {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/list");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("pageSize", "200");
  url.searchParams.set("pageNumber", String(pageNumber));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`USDA request failed: ${res.status}`);
  return res.json();
}

async function main() {
  const foods = [];
  let pageNumber = 1;

  while (true) {
    const page = await fetchPage(pageNumber);
    if (!Array.isArray(page) || page.length === 0) break;

    for (const food of page) {
      const calories = nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.calories);
      if (calories == null) continue; // skip incomplete entries

      foods.push({
        id: `usda_${food.fdcId}`,
        name: food.description,
        n: {
          calories: Math.round(calories * 10) / 10,
          proteinG: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.protein) ?? 0,
          carbsG: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.carbs) ?? 0,
          fatG: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.fat) ?? 0,
          sugarG: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.sugar) ?? 0,
          fiberG: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.fiber),
          sodiumMg: nutrientValue(food.foodNutrients, NUTRIENT_NUMBERS.sodium),
        },
      });
    }

    console.log(`Fetched page ${pageNumber} (${page.length} foods, ${foods.length} total kept)`);
    if (page.length < 200) break; // last page
    pageNumber++;
  }

  const outPath = path.join(__dirname, "..", "src", "lib", "data", "usdaBulkFoods.json");
  fs.writeFileSync(outPath, JSON.stringify(foods));
  console.log(`Wrote ${foods.length} foods to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
