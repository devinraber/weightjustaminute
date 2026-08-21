import { NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/firebase/admin";
import { lookupBarcode, searchOpenFoodFacts } from "@/lib/api/openFoodFacts";
import { searchUsda } from "@/lib/api/usda";

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

  return NextResponse.json({ results });
}
