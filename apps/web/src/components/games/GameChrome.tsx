"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { t, fontFor, type Lang } from "@/lib/i18n";

/** Top bar shared by the games: exit, progress dots, live star count. */
export function GameHeader({
  lang,
  backHref,
  current,
  total,
  score,
}: {
  lang: Lang;
  backHref: string;
  current: number;
  total: number;
  score: number;
}) {
  return (
    <header className="flex items-center justify-between">
      <Link
        href={backHref}
        className="rounded-2xl bg-white/80 px-4 py-2 font-bold text-ink/60 border border-ink/10"
      >
        ← {t(lang, "kidExit")}
      </Link>
      <div className="flex gap-1.5" dir="ltr">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-3 w-3 rounded-full ${i < current ? "bg-mango" : "bg-ink/15"}`} />
        ))}
      </div>
      <div className="rounded-2xl bg-sunshine/40 px-3 py-2 font-bold">⭐ {score}</div>
    </header>
  );
}

/** Celebration screen at the end of a round. */
export function GameEnd({
  lang,
  stars,
  total,
  backHref,
  onReplay,
}: {
  lang: Lang;
  stars: number;
  total: number;
  backHref: string;
  onReplay: () => void;
}) {
  const f = fontFor(lang);
  return (
    <div className={`flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center ${f}`}>
      <div className="text-7xl">🎉</div>
      <h1 className="text-4xl font-extrabold">{t(lang, "gRoundDone")}</h1>
      <p className="text-2xl">
        ⭐ <span className="font-extrabold text-mango">{stars}</span> / {total} {t(lang, "gStarsEarned")}
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={onReplay} className={f}>
          🔁 {t(lang, "gPlayAgain")}
        </Button>
        <Link href={backHref}>
          <Button size="lg" variant="secondary" className={f}>
            🏠 {t(lang, "kidExit")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
