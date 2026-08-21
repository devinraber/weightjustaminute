import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only Firebase Admin instance, used by API routes to verify the
 * caller's ID token before proxying requests to paid/rate-limited APIs
 * (USDA, Gemini) so those keys are never exposed to the browser.
 */
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/** Verifies the Firebase ID token sent in an `Authorization: Bearer <token>` header. */
export async function verifyRequestAuth(request: Request): Promise<string> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing Authorization bearer token");
  }
  const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
  return decoded.uid;
}
