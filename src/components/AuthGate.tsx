"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const PUBLIC_ROUTES = ["/login"];
const ONBOARDING_ROUTE = "/onboarding";

/**
 * Redirects unauthenticated visitors to /login, signed-in visitors with no
 * profile yet to /onboarding, and away from those pages once both are done.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname === ONBOARDING_ROUTE;
  const needsOnboarding = !!user && !profileLoading && !profile;

  useEffect(() => {
    if (authLoading) return;
    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }
    if (user && needsOnboarding && !isOnboardingRoute) {
      router.replace(ONBOARDING_ROUTE);
      return;
    }
    if (user && !needsOnboarding && !profileLoading && isOnboardingRoute) {
      router.replace("/");
    }
  }, [user, authLoading, isPublicRoute, needsOnboarding, isOnboardingRoute, profileLoading, router]);

  if (!authLoading) {
    if (!user && !isPublicRoute) return null;
    if (user && needsOnboarding && !isOnboardingRoute) return null;
    if (user && !needsOnboarding && !profileLoading && isOnboardingRoute) return null;
  }

  return <>{children}</>;
}

