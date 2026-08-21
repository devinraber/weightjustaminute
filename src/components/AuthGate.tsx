"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login"];

/** Redirects unauthenticated visitors to /login, and away from /login once signed in. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [user, loading, isPublicRoute, router]);

  if (!loading && !user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
