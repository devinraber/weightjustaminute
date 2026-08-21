import { NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/firebase/admin";
import { lookupBarcode, searchOpenFoodFacts } from "@/lib/api/openFoodFacts";
import { searchUsda } from "@/lib/api/usda";
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
  return score;
}

/**
 * GET /api/food/search?q=chicken breast&barcode=0123456789012
 * Aggregates Open Food Facts (packaged) + USDA FDC (whole foods) results.
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

  const [offResults, usdaResults] = await Promise.allSettled([
    searchOpenFoodFacts(query),
    searchUsda(query),
  ]);

  const results = [
    ...(offResults.status === "fulfilled" ? offResults.value : []),
    ...(usdaResults.status === "fulfilled" ? usdaResults.value : []),
  ];

  const queryLower = query.trim().toLowerCase();
  results.sort((a, b) => relevanceScore(b, queryLower) - relevanceScore(a, queryLower));

  return NextResponse.json({ results: results.slice(0, 25) });
}
