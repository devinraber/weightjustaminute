import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Weight Just A Minute",
  description: "Personal calorie and weight tracking for you and your partner.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WJAM",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <AuthGate>
            <div className="mx-auto flex min-h-screen max-w-2xl flex-col pb-20">
              <main className="flex-1 px-4 pt-6">{children}</main>
              <NavBar />
            </div>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
