# Firebase Architecture — Weight Just A Minute

## Services used (all free-tier)
- **Firebase Authentication** — email/link + Google sign-in.
- **Cloud Firestore** — primary data store (Spark free plan: 1 GiB storage, 50K reads/20K writes per day — plenty for a personal/couple app).
- **Cloud Storage for Firebase** — meal photo uploads for the AI estimator (5 GB free).

## Firestore collection layout

```
/users/{uid}                          UserProfile
/users/{uid}/weightLogs/{yyyy-MM-dd}  WeightLogEntry
/users/{uid}/dailyLogs/{yyyy-MM-dd}   DailyLog   (embeds meals as a map of arrays)

/foods/{foodId}                       FoodItem   (shared collection: cached OFF/USDA lookups + custom foods/recipes)

/connectionInvites/{inviteId}         ConnectionInvite
```

### Why this shape
- **Per-day docs** (`weightLogs`, `dailyLogs`) keyed by ISO date give O(1) reads for "today" and cheap range queries (`where(date, >=, start).where(date, <=, end)`) for charts/history, without needing a composite index on a subcollection of individual food entries.
- **Meals embedded in the daily log doc** (map of `breakfast/lunch/dinner/snacks` arrays) avoids per-entry documents — a day's log is small (well under the 1 MiB doc limit) and reads/writes as a single round trip, which matters on the free read/write quota.
- **`/foods` is a single top-level collection** shared by all users so Open Food Facts / USDA lookups are cached once and reused (`externalId` is the barcode or FDC id, used as a dedupe key). Custom foods/recipes live in the same collection with `createdByUid` + `sharedWithUids` for the shared-library feature, instead of a separate per-user subcollection, so two connected accounts can query the same doc.

## Security rules model (`firestore.rules`)
- Users can only read/write their own `/users/{uid}` doc and its `weightLogs`/`dailyLogs` subcollections (`request.auth.uid == uid`).
- `/foods/{foodId}`: readable by anyone signed in (so shared/cached items are visible); writable only by the creator (`createdByUid`), or by users listed in `sharedWithUids` for updates to a shared recipe.
- `/connectionInvites/{id}`: the sender can create; only the recipient (matched by email via a Firestore rule that checks `request.auth.token.email == resource.data.toEmail`) can update status.

## Shared library (multi-user) flow
1. User A sends a `ConnectionInvite` (`toEmail` = User B's email).
2. User B (on any device — the app is a responsive PWA so it works the same on her iPhone Safari and his Android Chrome) accepts from `/connections`.
3. On accept, both `UserProfile.connections` arrays are updated (Cloud Function or client-side batched write) to include each other's `uid`.
4. When either user saves a custom food/recipe, they can toggle "share with connections", which sets `sharedWithUids` to their `connections` array. Both accounts' food search then includes `where('sharedWithUids', 'array-contains', uid)` alongside their own `createdByUid` items.

## Cross-platform note (iPhone + Android)
The app is a installable **PWA** (`src/app/manifest.ts` + Next.js) rather than a native app, so the same Next.js/Firebase deployment works identically in Safari on iOS and Chrome on Android — no App Store/Play Store builds needed. Camera capture for the AI photo estimator uses a standard `<input type="file" accept="image/*" capture="environment">`, which both platforms support for taking a photo directly from the browser.

## Storage layout
```
/mealPhotos/{uid}/{timestamp}.jpg
```
Uploaded client-side via the Firebase SDK, then the download URL is sent to the `/api/photo-log` route for Gemini analysis (kept server-side so the Gemini API key never reaches the browser).
