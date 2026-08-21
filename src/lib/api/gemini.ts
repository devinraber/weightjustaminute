import { GoogleGenAI, Type } from "@google/genai";
import type { AiFoodEstimate } from "@/lib/types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          estimatedGrams: { type: Type.NUMBER },
          calories: { type: Type.NUMBER },
          proteinG: { type: Type.NUMBER },
          carbsG: { type: Type.NUMBER },
          fatG: { type: Type.NUMBER },
          confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
        },
        required: ["name", "estimatedGrams", "calories", "proteinG", "carbsG", "fatG", "confidence"],
      },
    },
    disclaimer: { type: Type.STRING },
  },
  required: ["items"],
};

const PROMPT = `You are a nutrition estimation assistant. Analyze the meal photo and identify
each distinct food item visible. For each item, estimate:
- the portion weight in grams, based on typical plate/utensil scale references in the photo
- calories, protein (g), carbs (g), and fat (g) for that estimated portion
- your confidence in the estimate ("low", "medium", or "high")

Only include foods you can actually see. Be conservative with portion sizes. Return your
answer strictly as JSON matching the provided schema, with no extra commentary outside the
"disclaimer" field.`;

/**
 * Sends a meal photo to Gemini Flash (free tier) and returns a structured
 * calorie/macro breakdown. `imageBase64` should not include the data URL prefix.
 */
export async function estimateFoodFromPhoto(
  imageBase64: string,
  mimeType: string,
): Promise<AiFoodEstimate> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { inlineData: { data: imageBase64, mimeType } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");

  const parsed = JSON.parse(text) as AiFoodEstimate;
  return parsed;
}
