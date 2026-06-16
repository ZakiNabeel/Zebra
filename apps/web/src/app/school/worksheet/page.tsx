"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useAdultArea } from "@/lib/auth/useAdultArea";
import {
  spellingWorksheet,
  mathsWorksheet,
  type SpellingWorksheet,
  type MathsWorksheet,
} from "@/lib/school/worksheet";
import type { AgeBand, StoryLang } from "@/lib/content/types";

type Sheet = SpellingWorksheet | MathsWorksheet;

export default function WorksheetMaker() {
  const ok = useAdultArea();
  const { lang } = useUiLang();
  const f = fontFor(lang);

  const [kind, setKind] = useState<"spelling" | "maths">("spelling");
  const [ageBand, setAgeBand] = useState<AgeBand>("6-8");
  const [sheetLang, setSheetLang] = useState<StoryLang>(lang);
  const [count, setCount] = useState(10);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  if (!ok) return null;

  function make() {
    setShowAnswers(false);
    setSheet(kind === "spelling" ? spellingWorksheet(ageBand, sheetLang, count) : mathsWorksheet(ageBand, count));
  }

  const pill = (active: boolean, color: "mango" | "teal") => {
    const base = "rounded-2xl border-2 px-3 py-2 text-sm font-bold ";
    if (!active) return base + "border-ink/15";
    return base + (color === "mango" ? "border-mango bg-mango text-white" : "border-teal bg-teal text-white");
  };

  return (
    <main className={`mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
      {/* Controls (not printed) */}
      <div className="no-print">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">📝 {t(lang, "wsTitle")}</h1>
          <Link href="/school" className="rounded-2xl bg-white px-4 py-2 font-bold text-ink/60 border border-ink/10">
            ← {t(lang, "schoolTitle")}
          </Link>
        </header>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-5 border border-ink/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-ink/60">{t(lang, "wsType")}:</span>
            <button onClick={() => setKind("spelling")} className={pill(kind === "spelling", "teal")}>
              {t(lang, "wsSpelling")}
            </button>
            <button onClick={() => setKind("maths")} className={pill(kind === "maths", "teal")}>
              {t(lang, "wsMaths")}
            </button>
          </div>
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
          {kind === "spelling" && (
            <div className="flex flex-wrap items-center gap-2">
              {(["ur", "en"] as const).map((l) => (
                <button key={l} onClick={() => setSheetLang(l)} className={pill(sheetLang === l, "teal")}>
                  {t(lang, l === "ur" ? "urdu" : "english")}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink/60">{t(lang, "wsCount")}:</span>
            {[8, 10, 12].map((n) => (
              <button key={n} onClick={() => setCount(n)} className={pill(count === n, "mango")}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={make} className={f}>
              {t(lang, "wsGenerate")}
            </Button>
            {sheet && (
              <>
                <Button variant="secondary" onClick={() => window.print()} className={f}>
                  🖨️ {t(lang, "pmPrint")}
                </Button>
                {sheet.kind === "maths" && (
                  <Button variant="ghost" onClick={() => setShowAnswers((v) => !v)} className={f}>
                    {t(lang, "wsShowAnswers")}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sheet (previewed on screen, prints cleanly) */}
      {sheet && (
        <div className="print-page rounded-3xl bg-white p-6 border border-ink/10">
          <div className="mb-4 flex items-center justify-between border-b-2 border-ink/15 pb-3">
            <span className="text-xl font-extrabold">
              🦓 {t(lang, sheet.kind === "spelling" ? "wsSpelling" : "wsMaths")}
            </span>
            <span className="text-sm text-ink/60">
              {t(lang, "wsName")}: ____________ · {t(lang, "wsDate")}: ________
            </span>
          </div>

          {sheet.kind === "spelling" ? (
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sheet.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-3xl">{it.emoji}</span>
                  <span className={`w-20 text-lg font-bold ${sheetLang === "ur" ? "urdu" : ""}`} dir={sheetLang === "ur" ? "rtl" : "ltr"}>
                    {it.word}
                  </span>
                  <span className="flex-1 border-b-2 border-dotted border-ink/30">&nbsp;</span>
                </li>
              ))}
            </ol>
          ) : (
            <ol className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3" dir="ltr">
              {sheet.items.map((it, i) => (
                <li key={i} className="text-lg font-bold">
                  {i + 1}. {it.expr} = {showAnswers ? <span className="text-leaf">{it.answer}</span> : "____"}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </main>
  );
}
