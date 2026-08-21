import { NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/firebase/admin";
import { lookupBarcode, searchOpenFoodFacts } from "@/lib/api/openFoodFacts";
import { searchCuratedFoods } from "@/lib/data/commonFoods";
import { searchBulkUsdaFoods } from "@/lib/data/usdaBulkFoods";
import { searchRestaurantFoods } from "@/lib/data/restaurantFoods";
import type { FoodItem } from "@/lib/types";

/** Ranks results so exact/prefix name matches for the query surface first. */
function relevanceScore(food: FoodItem, queryLower: string): number {
  const nameLower = food.name.toLowerCase();
  let score = 0;
  if (nameLower === queryLower) score += 100;
  else if (nameLower.startsWith(queryLower)) score += 60;
  else if (nameLower.includes(queryLower)) score += 30;
  // Shorter, plainer names are usually the more "generic"/likely match for a query.
  score -= nameLower.length * 0.1;
  // Curated entries are hand-verified and always available - prioritize them
  // over live API results, which can be slow, rate-limited, or oddly ranked.
  if (food.source === "curated") score += 200;
  return score;
}

/**
 * GET /api/food/search?q=chicken breast&barcode=0123456789012
 * Aggregates a curated common-foods database with live Open Food Facts
 * (packaged) + USDA FDC (whole foods) results.
 */
export async function GET(request: Request) {
  try {
    await verifyRequestAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");
  const query = searchParams.get("q");

  if (barcode) {
    const product = await lookupBarcode(barcode);
    return NextResponse.json({ results: product ? [product] : [] });
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  const curatedResults = searchCuratedFoods(query);
  const bulkUsdaResults = searchBulkUsdaFoods(query);
  const restaurantResults = searchRestaurantFoods(query);
  const offResults = await searchOpenFoodFacts(query).catch(() => []);

  const results = [...curatedResults, ...restaurantResults, ...bulkUsdaResults, ...offResults];

  const queryLower = query.trim().toLowerCase();
  results.sort((a, b) => relevanceScore(b, queryLower) - relevanceScore(a, queryLower));

  return NextResponse.json({ results: results.slice(0, 30) });
}
