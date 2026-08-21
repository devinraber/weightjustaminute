"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-brand-50 p-4 text-brand-600">
          <Scale size={32} />
        </div>
        <h1 className="text-2xl font-bold">Weight Just A Minute</h1>
        <p className="max-w-xs text-sm text-slate-500">
          Sign in to log meals, track your weight, and keep your own private data separate from
          anyone you connect with.
        </p>
      </div>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Sign in with Google
      </button>
    </div>
  );
}
