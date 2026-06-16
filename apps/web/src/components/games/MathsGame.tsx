"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameHeader, GameEnd } from "./GameChrome";
import { t, fontFor } from "@/lib/i18n";
import { mathsRound } from "@/lib/learn/maths";
import { useProgress } from "@/lib/store/progress";
import type { ChildProfile } from "@/lib/content/types";

/**
 * Maths drill: multiple-choice (no keyboard — invariant #3), difficulty by age
 * band. Star awarded only on a first-try-correct answer; wrong answers just let
 * the child try again (no pressure mechanic). Generated and scored entirely
 * client-side → zero backend cost at any scale.
 */
export function MathsGame({ profile, backHref }: { profile: ChildProfile; backHref: string }) {
  const lang = profile.language;
  const f = fontFor(lang);
  const addStars = useProgress((s) => s.addStars);

  const [round, setRound] = useState(() => mathsRound(profile.ageBand, 6));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [wrong, setWrong] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [done, setDone] = useState(false);

  const q = round[index];

  useEffect(() => {
    if (done) addStars(profile.id, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function choose(c: string) {
    if (complete) return;
    if (c === q.answer) {
      setComplete(true);
      if (firstTry) setScore((s) => s + 1);
    } else if (!wrong.includes(c)) {
      setWrong((w) => [...w, c]);
      setFirstTry(false);
    }
  }

  function next() {
    if (index >= round.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setFirstTry(true);
    setWrong([]);
    setComplete(false);
  }

  function replay() {
    setRound(mathsRound(profile.ageBand, 6));
    setIndex(0);
    setScore(0);
    setFirstTry(true);
    setWrong([]);
    setComplete(false);
    setDone(false);
  }

  if (done) {
    return (
      <main className="kid-surface flex flex-1 flex-col">
        <GameEnd lang={lang} stars={score} total={round.length} backHref={backHref} onReplay={replay} />
      </main>
    );
  }

  return (
    <main
      className={`kid-surface mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6 ${f}`}
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      <GameHeader lang={lang} backHref={backHref} current={index} total={round.length} score={score} />

      {/* Prompt */}
      <div className="flex flex-col items-center gap-4">
        {q.promptKey && <p className="text-2xl font-bold text-ink/70">{t(lang, q.promptKey)}</p>}
        {q.countN ? (
          <div className="flex max-w-md flex-wrap justify-center gap-2 text-5xl" dir="ltr">
            {Array.from({ length: q.countN }).map((_, i) => (
              <span key={i}>{q.emoji}</span>
            ))}
          </div>
        ) : (
          <div className="text-6xl font-extrabold" dir="ltr">
            {q.expr} {!q.promptKey && "= ?"}
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-4" dir="ltr">
        {q.choices.map((c) => {
          const isWrong = wrong.includes(c);
          const isAnswer = complete && c === q.answer;
          return (
            <button
              key={c}
              onClick={() => choose(c)}
              disabled={complete || isWrong}
              className={`flex h-20 items-center justify-center rounded-3xl text-3xl font-extrabold shadow-[0_5px_0_0_rgba(0,0,0,0.12)] transition active:translate-y-1 active:shadow-none ${
                isAnswer
                  ? "bg-leaf text-white"
                  : isWrong
                    ? "bg-rose/30 text-ink/40 shadow-none"
                    : "bg-white text-ink hover:bg-sunshine/30"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Result / next */}
      <div className="flex min-h-[4rem] items-center justify-center">
        {complete && (
          <div className="flex items-center gap-4">
            <span className="text-2xl font-extrabold text-leaf">✅ {t(lang, "gCorrect")}</span>
            <Button size="lg" onClick={next} className={f}>
              {t(lang, "gNext")} {lang === "ur" ? "◀" : "▶"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
