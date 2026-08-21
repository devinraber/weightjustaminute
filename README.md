# Weight Just A Minute

Free personal calorie & weight tracker built with Next.js (App Router), TypeScript, Tailwind, and Firebase.

## Works on both iPhone and Android
This is a responsive **installable PWA**, not two separate native apps — the same deployed URL works in Safari on iOS and Chrome on Android. Either partner can tap "Add to Home Screen" (iOS: Share → Add to Home Screen; Android: Chrome menu → Install app) to get an app-like icon and full-screen experience. The camera photo picker (`capture="environment"`) works identically on both platforms for the AI photo estimator.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Firebase project**
   - Create a project at https://console.firebase.google.com (free Spark plan).
   - Enable **Authentication** (Google sign-in provider), **Firestore**, and **Storage**.
   - Copy your web app config into `.env.local` (see `.env.local.example`).
   - Generate a service account key (Project Settings → Service Accounts) for `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY`.
   - Deploy security rules: `firebase deploy --only firestore:rules,storage`.

3. **Free API keys**
   - USDA FoodData Central: https://fdc.nal.usda.gov/api-key-signup.html → `USDA_FDC_API_KEY`.
   - Google Gemini (free tier): https://aistudio.google.com/apikey → `GEMINI_API_KEY`.
   - Open Food Facts requires no key.

4. **Run locally**
   ```
   npm run dev
   ```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the Firestore data model and sharing design.
