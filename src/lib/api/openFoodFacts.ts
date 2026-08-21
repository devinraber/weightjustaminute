import type { FoodItem, NutritionPer100g } from "@/lib/types";

const OFF_BASE_URL = "https://world.openfoodfacts.org";

interface OffProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  serving_size?: string;
  nutriments?: Record<string, number>;
}

function toNutritionPer100g(nutriments: Record<string, number> = {}): NutritionPer100g {
  return {
    calories: nutriments["energy-kcal_100g"] ?? 0,
    proteinG: nutriments["proteins_100g"] ?? 0,
    carbsG: nutriments["carbohydrates_100g"] ?? 0,
    fatG: nutriments["fat_100g"] ?? 0,
    fiberG: nutriments["fiber_100g"],
    sugarG: nutriments["sugars_100g"],
    sodiumMg: nutriments["sodium_100g"] ? nutriments["sodium_100g"] * 1000 : undefined,
  };
}

function toFoodItem(product: OffProduct): FoodItem {
  const now = new Date().toISOString();
  return {
    id: `off_${product.code}`,
    source: "openfoodfacts",
    externalId: product.code,
    name: product.product_name || "Unknown product",
    brand: product.brands,
    imageUrl: product.image_url,
    servingLabel: product.serving_size,
    nutritionPer100g: toNutritionPer100g(product.nutriments),
    createdAt: now,
    updatedAt: now,
  };
}

/** Looks up a single packaged product by barcode (UPC/EAN). Free, no API key required. */
export async function lookupBarcode(barcode: string): Promise<FoodItem | null> {
  const res = await fetch(
    `${OFF_BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return toFoodItem({ code: barcode, ...data.product });
}

/** Free-text search across packaged products. */
export async function searchOpenFoodFacts(query: string, pageSize = 20): Promise<FoodItem[]> {
  const url = new URL(`${OFF_BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(pageSize));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();
  const products: OffProduct[] = data.products ?? [];
  return products
    .filter((p) => p.product_name && p.nutriments?.["energy-kcal_100g"] != null)
    .map(toFoodItem);
}
