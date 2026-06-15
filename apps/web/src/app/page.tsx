"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ParentalGate } from "@/components/ParentalGate";
import { StoryArt } from "@/components/art/StoryArt";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useFamily, useHydrated, CLOUD } from "@/lib/store/family";

export default function LandingPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lang, toggle } = useUiLang();
  const family = useFamily((s) => s.family);
  const parentUnlocked = useFamily((s) => s.parentUnlocked);
  const [showGate, setShowGate] = useState(false);
  const f = fontFor(lang);

  function goParent() {
    if (parentUnlocked) router.push("/parent");
    else setShowGate(true);
  }

  return (
    <main className={`relative flex flex-1 flex-col items-center justify-center gap-8 p-6 ${f}`}>
      <button
        onClick={toggle}
        className="absolute top-4 end-4 rounded-2xl bg-white/80 px-4 py-2 font-bold border border-ink/10"
      >
        {t(lang, "language")}
      </button>

      <div className="text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">🦓 {t(lang, "appName")}</h1>
        <p className="mt-3 text-xl text-ink/70">{t(lang, "tagline")}</p>
        <p className="mt-1 text-ink/60">{t(lang, "heroLine")}</p>
      </div>

      <div className="w-full max-w-md">
        <StoryArt art={{ scene: "zee-dada" }} />
      </div>

      {!hydrated ? null : family ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/kid">
            <Button size="xl" className={`w-full ${f}`}>
              🧒 {t(lang, "kidMode")}
            </Button>
          </Link>
          <Button size="xl" variant="secondary" onClick={goParent} className={f}>
            🔒 {t(lang, "forParents")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Link href="/onboarding">
            <Button size="xl" className={f}>
              {t(lang, "getStarted")} →
            </Button>
          </Link>
          {CLOUD && (
            <Link href="/auth" className="font-bold text-teal underline">
              {t(lang, "haveAccount")} {t(lang, "signIn")}
            </Link>
          )}
        </div>
      )}

      {showGate && (
        <ParentalGate onSuccess={() => router.push("/parent")} onCancel={() => setShowGate(false)} />
      )}
    </main>
  );
}
