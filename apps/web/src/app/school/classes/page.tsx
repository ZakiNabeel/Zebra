"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useAdultArea } from "@/lib/auth/useAdultArea";
import { useSchool, makeClassCode } from "@/lib/store/school";
import type { AgeBand, StoryLang } from "@/lib/content/types";

export default function Classes() {
  const ok = useAdultArea();
  const { lang } = useUiLang();
  const f = fontFor(lang);

  const classes = useSchool((s) => s.classes);
  const addClass = useSchool((s) => s.addClass);
  const removeClass = useSchool((s) => s.removeClass);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<AgeBand>("6-8");
  const [classLang, setClassLang] = useState<StoryLang>(lang);

  if (!ok) return null;

  function create() {
    addClass({
      id: crypto.randomUUID(),
      name: name.trim(),
      grade,
      lang: classLang,
      code: makeClassCode(),
      createdAt: Date.now(),
    });
    setName("");
    setAdding(false);
  }

  const pill = (active: boolean, color: "mango" | "teal") => {
    const base = "rounded-2xl border-2 px-3 py-2 text-sm font-bold ";
    if (!active) return base + "border-ink/15";
    return base + (color === "mango" ? "border-mango bg-mango text-white" : "border-teal bg-teal text-white");
  };

  return (
    <main className={`mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">🏫 {t(lang, "clTitle")}</h1>
        <Link href="/school" className="rounded-2xl bg-white px-4 py-2 font-bold text-ink/60 border border-ink/10">
          ← {t(lang, "schoolTitle")}
        </Link>
      </header>

      {classes.length === 0 && !adding && (
        <p className="mb-4 rounded-3xl bg-white p-5 text-ink/60 border border-ink/10">{t(lang, "clNoClasses")}</p>
      )}

      <div className="mb-6 flex flex-col gap-3">
        {classes.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 border border-ink/10">
            <div className="flex-1">
              <div className="text-lg font-bold">{c.name}</div>
              <div className="text-sm text-ink/60">
                {c.grade} · {c.lang === "ur" ? t(lang, "urdu") : t(lang, "english")}
              </div>
            </div>
            <div className="text-end">
              <div className="text-xs text-ink/50">{t(lang, "clCode")}</div>
              <div className="rounded-xl bg-sunshine/30 px-3 py-1 font-extrabold tracking-wider" dir="ltr">
                {c.code}
              </div>
            </div>
            <button onClick={() => removeClass(c.id)} className="text-sm font-bold text-rose">
              {t(lang, "delete")}
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 border border-ink/10">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "clNamePlaceholder")}
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
              <button key={band} onClick={() => setGrade(band)} className={pill(grade === band, "mango")}>
                {t(lang, key)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["ur", "en"] as const).map((l) => (
              <button key={l} onClick={() => setClassLang(l)} className={pill(classLang === l, "teal")}>
                {t(lang, l === "ur" ? "urdu" : "english")}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/50">🔑 {t(lang, "clShareHint")}</p>
          <div className="flex gap-2">
            <Button disabled={name.trim().length === 0} onClick={create} className={f}>
              {t(lang, "clCreate")}
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)} className={f}>
              {t(lang, "cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className={f}>
          ＋ {t(lang, "clNewClass")}
        </Button>
      )}
    </main>
  );
}
