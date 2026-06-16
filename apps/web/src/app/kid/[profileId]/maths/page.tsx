"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MathsGame } from "@/components/games/MathsGame";
import { useFamily, useHydrated } from "@/lib/store/family";

export default function MathsPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = use(params);
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useFamily((s) => s.profiles).find((p) => p.id === profileId);

  if (!hydrated) return null;
  if (!profile) {
    router.replace("/kid");
    return null;
  }
  return <MathsGame profile={profile} backHref={`/kid/${profile.id}`} />;
}
