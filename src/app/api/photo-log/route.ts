import { NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/firebase/admin";
import { estimateFoodFromPhoto } from "@/lib/api/gemini";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/photo-log
 * Body: { imageBase64: string (no data URL prefix), mimeType: string }
 * Returns a structured AiFoodEstimate for the uploaded meal photo.
 */
export async function POST(request: Request) {
  try {
    await verifyRequestAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "imageBase64 and mimeType are required" }, { status: 400 });
  }
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "mimeType must be an image type" }, { status: 400 });
  }
  // Rough size check on the base64 payload (base64 is ~4/3 the size of the raw bytes).
  if (imageBase64.length * 0.75 > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
  }

  try {
    const estimate = await estimateFoodFromPhoto(imageBase64, mimeType);
    return NextResponse.json(estimate);
  } catch (err) {
    console.error("Gemini photo estimate failed", err);
    return NextResponse.json({ error: "Failed to analyze photo" }, { status: 502 });
  }
}
