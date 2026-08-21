import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes the app installable ("Add to Home Screen") on both
 * iOS Safari and Android Chrome, so both partners get an app-like experience
 * from the same responsive web build (no separate iPhone/Android app needed).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weight Just A Minute",
    short_name: "WJAM",
    description: "Personal calorie and weight tracking for you and your partner.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
