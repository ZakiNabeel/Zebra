"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/reader/SpeakButton";
import { GameHeader, GameEnd } from "./GameChrome";
import { t, fontFor } from "@/lib/i18n";
import { letters, spellingRound } from "@/lib/learn/words";
import { useProgress } from "@/lib/store/progress";
import type { ChildProfile } from "@/lib/content/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Spelling: hear/see the word, then tap its letters in order. Bilingual — for
 * Urdu the answer area renders a real substring of the target word so Nastaliq
 * joining is always correct, while the tiles teach isolated letter shapes.
 * Runs 100% in the browser: no network, no per-play cost.
 */
export function SpellingGame({ profile, backHref }: { profile: ChildProfile; backHref: string }) {
  const lang = profile.language;
  const f = fontFor(lang);
  const addStars = useProgress((s) => s.addStars);

  const [round, setRound] = useState(() => spellingRound(profile.ageBand, lang, 5));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [filled, setFilled] = useState(0);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [done, setDone] = useState(false);

  const word = round[index];
  const target = word?.[lang] ?? "";
  const targetChars = useMemo(() => letters(target), [target]);
  const tiles = useMemo(
    () => shuffle(targetChars.map((ch, i) => ({ id: i, ch }))),
    // reshuffle only when the word changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, round],
  );

  useEffect(() => {
    if (done) addStars(profile.id, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!word && !done) return null;

  function tap(tile: { id: number; ch: string }) {
    if (complete || usedIds.includes(tile.id)) return;
    if (tile.ch === targetChars[filled]) {
      const nf = filled + 1;
      setFilled(nf);
      setUsedIds((u) => [...u, tile.id]);
      if (nf === targetChars.length) {
        setComplete(true);
        if (wrongTaps === 0) setScore((s) => s + 1);
      }
    } else {
      setWrongTaps((w) => w + 1);
      setWrongId(tile.id);
      setTimeout(() => setWrongId(null), 350);
    }
  }

  function nextWord() {
    if (index >= round.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setFilled(0);
    setUsedIds([]);
    setWrongTaps(0);
    setComplete(false);
  }

  function replay() {
    setRound(spellingRound(profile.ageBand, lang, 5));
    setIndex(0);
    setScore(0);
    setFilled(0);
    setUsedIds([]);
    setWrongTaps(0);
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

  const prefix = targetChars.slice(0, filled).join("");

  return (
    <main
      className={`kid-surface mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 ${f}`}
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      <GameHeader lang={lang} backHref={backHref} current={index} total={round.length} score={score} />

      {/* Cue */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-8xl">{word.emoji}</div>
        <SpeakButton key={`${index}-${lang}`} text={target} lang={lang} className={f} />
        <p className="text-lg font-bold text-ink/60">{t(lang, "spYourTurn")}</p>
      </div>

      {/* Answer area */}
      <div className="flex min-h-[5rem] items-center justify-center">
        {lang === "ur" ? (
          <div className="urdu text-5xl font-extrabold tracking-wide">
            {prefix || <span className="text-ink/25">…</span>}
            <span className="text-ink/20">{filled < targetChars.length ? " ـ".repeat(targetChars.length - filled) : ""}</span>
          </div>
        ) : (
          <div className="flex gap-2" dir="ltr">
            {targetChars.map((ch, i) => (
              <span
                key={i}
                className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-3xl font-extrabold uppercase ${
                  i < filled ? "border-leaf bg-leaf/15 text-ink" : "border-ink/15 text-ink/20"
                }`}
              >
                {i < filled ? ch : "_"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tiles */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tiles.map((tile) => {
          const used = usedIds.includes(tile.id);
          const wrong = wrongId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => tap(tile)}
              disabled={used}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.12)] transition active:translate-y-1 active:shadow-none ${
                lang === "ur" ? "urdu" : "uppercase"
              } ${
                used
                  ? "bg-ink/10 text-transparent shadow-none"
                  : wrong
                    ? "bg-rose text-white"
                    : "bg-white text-ink hover:bg-sunshine/30"
              }`}
            >
              {tile.ch}
            </button>
          );
        })}
      </div>

      {/* Result / next */}
      <div className="flex min-h-[4rem] items-center justify-center">
        {complete && (
          <div className="flex items-center gap-4">
            <span className="text-2xl font-extrabold text-leaf">✅ {t(lang, "gCorrect")}</span>
            <Button size="lg" onClick={nextWord} className={f}>
              {t(lang, "gNext")} {lang === "ur" ? "◀" : "▶"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
