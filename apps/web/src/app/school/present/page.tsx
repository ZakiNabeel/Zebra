"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StoryArt } from "@/components/art/StoryArt";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useAdultArea } from "@/lib/auth/useAdultArea";
import { useSchool } from "@/lib/store/school";
import { READY_DECKS } from "@/lib/school/decks";
import { createFromReady, createFromTopic } from "@/lib/data/school";
import type { AgeBand, StoryLang } from "@/lib/content/types";

export default function PresentList() {
  const ok = useAdultArea();
  const router = useRouter();
  const { lang } = useUiLang();
  const f = fontFor(lang);

  const presentations = useSchool((s) => s.presentations);
  const removePresentation = useSchool((s) => s.removePresentation);

  const [topic, setTopic] = useState("");
  const [deckLang, setDeckLang] = useState<StoryLang>(lang);
  const [ageBand, setAgeBand] = useState<AgeBand>("6-8");
  const [count, setCount] = useState(6);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  if (!ok) return null;

  function startReady(deckId: string) {
    const id = createFromReady(deckId, deckLang);
    if (id) router.push(`/school/present/${id}`);
  }

  async function generate() {
    setBusy(true);
    setBlocked(false);
    try {
      const res = await createFromTopic({ topic: topic.trim(), ageBand, lang: deckLang, count });
      if (res.blocked) setBlocked(true);
      else router.push(`/school/present/${res.id}`);
    } finally {
      setBusy(false);
    }
  }

  const pill = (active: boolean, color: "mango" | "teal") => {
    const base = "rounded-2xl border-2 px-3 py-2 text-sm font-bold ";
    if (!active) return base + "border-ink/15";
    return base + (color === "mango" ? "border-mango bg-mango text-white" : "border-teal bg-teal text-white");
  };

  return (
    <main className={`mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">🖥️ {t(lang, "pmTitle")}</h1>
        <Link href="/school" className="rounded-2xl bg-white px-4 py-2 font-bold text-ink/60 border border-ink/10">
          ← {t(lang, "schoolTitle")}
        </Link>
      </header>

      {/* Language for new decks */}
      <div className="mb-6 flex items-center gap-2">
        {(["ur", "en"] as const).map((l) => (
          <button key={l} onClick={() => setDeckLang(l)} className={pill(deckLang === l, "teal")}>
            {t(lang, l === "ur" ? "urdu" : "english")}
          </button>
        ))}
      </div>

      {/* Ready lessons */}
      <section className="mb-8">
        <h2 className="text-xl font-bold">📚 {t(lang, "pmReady")}</h2>
        <p className="mb-3 text-sm text-ink/60">{t(lang, "pmReadyHint")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {READY_DECKS.map((d) => (
            <button
              key={d.id}
              onClick={() => startReady(d.id)}
              className="overflow-hidden rounded-[1.5rem] bg-white text-start border-4 border-transparent transition hover:border-sunshine active:scale-95"
            >
              <StoryArt art={{ scene: d.cover, night: d.cover === "sitara-stars", stars: 5 }} className="rounded-b-none" />
              <div className="p-3">
                <div className={`font-bold ${lang === "ur" ? "urdu" : ""}`}>{d.title[lang]}</div>
                <div className="text-xs text-ink/50">{d.ageBand}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Custom topic */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">✨ {t(lang, "pmNewTopic")}</h2>
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 border border-ink/10">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t(lang, "pmTopicHint")}
            maxLength={80}
            className="rounded-2xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-teal"
          />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["3-5", "band35"],
                ["6-8", "band68"],
                ["9-12", "band912"],
              ] as const
            ).map(([band, key]) => (
              <button key={band} onClick={() => setAgeBand(band)} className={pill(ageBand === band, "mango")}>
                {t(lang, key)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink/60">{t(lang, "pmSlides")}:</span>
            {[5, 6, 8].map((n) => (
              <button key={n} onClick={() => setCount(n)} className={pill(count === n, "teal")}>
                {n}
              </button>
            ))}
          </div>
          <Button onClick={generate} disabled={busy || topic.trim().length === 0} className={f}>
            {busy ? `⏳ ${t(lang, "pmGenerating")}` : `✨ ${t(lang, "pmGenerate")}`}
          </Button>
          {blocked && <p className="rounded-2xl bg-rose/15 px-4 py-3 text-sm font-bold text-rose">{t(lang, "pmBlocked")}</p>}
        </div>
      </section>

      {/* Your presentations */}
      <section>
        <h2 className="mb-3 text-xl font-bold">🗂️ {t(lang, "pmYourDecks")}</h2>
        {presentations.length === 0 ? (
          <p className="rounded-3xl bg-white p-5 text-ink/60 border border-ink/10">{t(lang, "pmNoDecks")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {presentations.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-3xl bg-white p-4 border border-ink/10">
                <div className="flex-1">
                  <div className={`font-bold ${p.lang === "ur" ? "urdu" : ""}`}>{p.topic}</div>
                  <div className="text-xs text-ink/50">
                    {p.slides.length} {t(lang, "pmSlides")} · {p.ageBand}
                  </div>
                </div>
                <Link href={`/school/present/${p.id}`} className="font-bold text-teal underline">
                  {t(lang, "pmEdit")}
                </Link>
                <button onClick={() => removePresentation(p.id)} className="text-sm font-bold text-rose">
                  {t(lang, "delete")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
