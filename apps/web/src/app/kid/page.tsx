"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParentalGate } from "@/components/ParentalGate";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useFamily, useHydrated } from "@/lib/store/family";

/** Kid Mode entry: big-avatar profile picker. */
export default function ProfilePicker() {
  const hydrated = useHydrated();
  const router = useRouter();
  const lang = useUiLang((s) => s.lang);
  const profiles = useFamily((s) => s.profiles);
  const family = useFamily((s) => s.family);
  const lockParent = useFamily((s) => s.lockParent);
  const [showGate, setShowGate] = useState(false);
  const f = fontFor(lang);

  // Entering Kid Mode always locks the parent area behind the PIN again.
  useEffect(() => {
    lockParent();
  }, [lockParent]);

  useEffect(() => {
    if (hydrated && !family) router.replace("/onboarding");
  }, [hydrated, family, router]);

  if (!hydrated || !family) return null;

  return (
    <main className={`kid-surface flex flex-1 flex-col items-center justify-center gap-10 p-6 ${f}`}>
      <h1 className="text-4xl font-extrabold">🦓 {t(lang, "kidWho")}</h1>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={`/kid/${p.id}`}
            className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-[2.5rem] bg-white shadow-md border-4 border-transparent transition hover:border-sunshine active:scale-95"
          >
            <span className="text-6xl">{p.avatar}</span>
            <span className="text-xl font-bold">{p.name}</span>
          </Link>
        ))}
        {profiles.length === 0 && <p className="text-ink/60">{t(lang, "pdNoChildren")}</p>}
      </div>

      <button onClick={() => setShowGate(true)} className="mt-6 text-ink/40 font-bold">
        🔒 {t(lang, "forParents")}
      </button>

      {showGate && (
        <ParentalGate onSuccess={() => router.push("/parent")} onCancel={() => setShowGate(false)} />
      )}
    </main>
  );
}
