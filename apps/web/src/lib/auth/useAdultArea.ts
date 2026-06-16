"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFamily, useHydrated, CLOUD } from "@/lib/store/family";

/**
 * Guard for adult-only areas (parent dashboard, teacher tools). Mirrors the
 * /parent guard: signed-out (cloud) → /auth, no family → onboarding, locked →
 * home. Returns true only when the adult area may render.
 */
export function useAdultArea(): boolean {
  const hydrated = useHydrated();
  const router = useRouter();
  const family = useFamily((s) => s.family);
  const parentUnlocked = useFamily((s) => s.parentUnlocked);
  const userEmail = useFamily((s) => s.userEmail);

  useEffect(() => {
    if (!hydrated) return;
    if (CLOUD && !userEmail) router.replace("/auth");
    else if (!family) router.replace("/onboarding");
    else if (!parentUnlocked) router.replace("/");
  }, [hydrated, family, parentUnlocked, userEmail, router]);

  return hydrated && !!family && parentUnlocked;
}
