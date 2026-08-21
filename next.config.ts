import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.openfoodfacts.org" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  // Every page here is per-user/auth-gated - nothing should ever be served from a
  // shared HTML cache (App Hosting's CDN was caching stale builds for up to a year).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
