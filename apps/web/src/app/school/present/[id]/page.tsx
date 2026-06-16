"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SlideView } from "@/components/school/SlideView";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useAdultArea } from "@/lib/auth/useAdultArea";
import { useSchool } from "@/lib/store/school";
import type { Slide } from "@/lib/school/types";

export default function PresentEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ok = useAdultArea();
  const router = useRouter();
  const { lang } = useUiLang();
  const f = fontFor(lang);

  const presentation = useSchool((s) => s.presentations.find((p) => p.id === id));
  const update = useSchool((s) => s.updatePresentation);

  const [mode, setMode] = useState<"edit" | "present">("edit");
  const [cur, setCur] = useState(0);

  // Keyboard navigation while presenting.
  useEffect(() => {
    if (mode !== "present" || !presentation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCur((c) => Math.min(c + 1, presentation.slides.length - 1));
      else if (e.key === "ArrowLeft") setCur((c) => Math.max(c - 1, 0));
      else if (e.key === "Escape") setMode("edit");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, presentation]);

  if (!ok) return null;
  if (!presentation) {
    router.replace("/school/present");
    return null;
  }

  const deckLang = presentation.lang;
  const slides = presentation.slides;

  function setSlides(next: Slide[]) {
    update(id, { slides: next });
  }
  function editTitle(i: number, l: "en" | "ur", value: string) {
    setSlides(slides.map((s, idx) => (idx === i ? { ...s, title: { ...s.title, [l]: value } } : s)));
  }
  function editBullet(i: number, j: number, l: "en" | "ur", value: string) {
    setSlides(
      slides.map((s, idx) =>
        idx === i ? { ...s, bullets: s.bullets.map((b, bj) => (bj === j ? { ...b, [l]: value } : b)) } : s,
      ),
    );
  }
  function addBullet(i: number) {
    setSlides(slides.map((s, idx) => (idx === i ? { ...s, bullets: [...s.bullets, { en: "", ur: "" }] } : s)));
  }
  function removeBullet(i: number, j: number) {
    setSlides(slides.map((s, idx) => (idx === i ? { ...s, bullets: s.bullets.filter((_, bj) => bj !== j) } : s)));
  }

  // ---- Present mode (full screen) ----
  if (mode === "present") {
    const slide = slides[cur];
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-cream">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold text-ink/50">
            {t(lang, "pmSlideLabel")} {cur + 1} / {slides.length}
          </span>
          <Button variant="ghost" onClick={() => setMode("edit")} className={f}>
            ✕ {t(lang, "pmExit")}
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <SlideView slide={slide} lang={deckLang} className="max-w-2xl" />
        </div>
        <div className="flex items-center justify-between p-6">
          <Button size="xl" variant="ghost" onClick={() => setCur((c) => Math.max(c - 1, 0))} disabled={cur === 0}>
            {deckLang === "ur" ? "→" : "←"}
          </Button>
          <div className="flex gap-1.5" dir="ltr">
            {slides.map((_, i) => (
              <div key={i} className={`h-2.5 w-2.5 rounded-full ${i === cur ? "bg-mango" : "bg-ink/15"}`} />
            ))}
          </div>
          <Button
            size="xl"
            onClick={() => setCur((c) => Math.min(c + 1, slides.length - 1))}
            disabled={cur === slides.length - 1}
          >
            {deckLang === "ur" ? "←" : "→"}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Edit mode ----
  return (
    <>
      <main className={`no-print mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className={`text-2xl font-extrabold ${deckLang === "ur" ? "urdu" : ""}`}>{presentation.topic}</h1>
          <div className="flex gap-2">
            <Button onClick={() => { setCur(0); setMode("present"); }} className={f}>
              ▶ {t(lang, "pmPresent")}
            </Button>
            <Button variant="secondary" onClick={() => window.print()} className={f}>
              🖨️ {t(lang, "pmPrint")}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/school/present")} className={f}>
              {t(lang, "pmDone")}
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {slides.map((s, i) => (
            <div key={i} className="rounded-3xl bg-white p-4 border border-ink/10">
              <div className="mb-2 text-xs font-bold text-ink/40">
                {t(lang, "pmSlideLabel")} {i + 1}
              </div>
              <input
                value={s.title.en}
                onChange={(e) => editTitle(i, "en", e.target.value)}
                placeholder="Title (English)"
                className="mb-2 w-full rounded-xl border-2 border-ink/15 px-3 py-2 font-bold outline-none focus:border-teal"
              />
              <input
                value={s.title.ur}
                onChange={(e) => editTitle(i, "ur", e.target.value)}
                placeholder="عنوان (اردو)"
                dir="rtl"
                className="urdu mb-3 w-full rounded-xl border-2 border-ink/15 px-3 py-2 font-bold outline-none focus:border-teal"
              />
              <div className="flex flex-col gap-2">
                {s.bullets.map((bp, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="flex flex-1 flex-col gap-1">
                      <input
                        value={bp.en}
                        onChange={(e) => editBullet(i, j, "en", e.target.value)}
                        placeholder="• point (English)"
                        className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-teal"
                      />
                      <input
                        value={bp.ur}
                        onChange={(e) => editBullet(i, j, "ur", e.target.value)}
                        placeholder="• نکتہ (اردو)"
                        dir="rtl"
                        className="urdu w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-teal"
                      />
                    </div>
                    <button onClick={() => removeBullet(i, j)} className="text-sm font-bold text-rose">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={() => addBullet(i)} className="self-start text-sm font-bold text-teal">
                  ＋ {t(lang, "pmAddPoint")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Print / PDF layout — hidden on screen, one slide per page when printing. */}
      <div className="print-only">
        {slides.map((s, i) => (
          <div key={i} className="print-page">
            <SlideView slide={s} lang={deckLang} />
          </div>
        ))}
      </div>
    </>
  );
}
