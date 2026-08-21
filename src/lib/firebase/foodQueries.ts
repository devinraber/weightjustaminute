import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { FoodItem } from "@/lib/types";

/**
 * Searches the user's own custom foods plus any shared with them by a connected
 * account. Firestore has no full-text search, so matching is done client-side
 * against the (small, personal-scale) set of custom foods already fetched.
 */
export async function searchCustomFoods(uid: string, queryText: string): Promise<FoodItem[]> {
  const db = getFirebaseDb();
  const foodsRef = collection(db, "foods");

  const [ownSnap, sharedSnap] = await Promise.all([
    getDocs(firestoreQuery(foodsRef, where("createdByUid", "==", uid))),
    getDocs(firestoreQuery(foodsRef, where("sharedWithUids", "array-contains", uid))),
  ]);

  const byId = new Map<string, FoodItem>();
  for (const docSnap of [...ownSnap.docs, ...sharedSnap.docs]) {
    byId.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() as Omit<FoodItem, "id">) });
  }

  const queryLower = queryText.toLowerCase();
  return [...byId.values()].filter((food) => food.name.toLowerCase().includes(queryLower));
}
