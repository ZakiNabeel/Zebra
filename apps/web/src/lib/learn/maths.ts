import type { AgeBand } from "@/lib/content/types";
import type { UiKey } from "@/lib/i18n";

/**
 * Deterministic maths drill generator — runs entirely in the browser. No backend,
 * no AI, no per-question cost; an arbitrary number of children can play
 * simultaneously with zero server load. Difficulty scales by age band.
 */
export type MathQuestion = {
  /** A language-neutral expression to show big, e.g. "7 + 5" (empty for visual Qs). */
  expr: string;
  /** Optional i18n prompt above the expression (counting / comparison). */
  promptKey?: UiKey;
  /** For counting questions: render this many emoji. */
  emoji?: string;
  countN?: number;
  choices: string[];
  answer: string;
};

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build 4 unique, non-negative options around a correct numeric answer. */
function numChoices(answer: number, spread: number): string[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const delta = rnd(-spread, spread);
    const cand = answer + delta;
    if (cand >= 0) set.add(cand);
  }
  while (set.size < 4) set.add(Math.max(0, answer) + set.size); // pad if needed
  return shuffle([...set].map(String));
}

const COUNT_EMOJI = ["🍎", "⭐", "🐟", "🌸", "🦓", "🎈", "🐢", "🍌"];

function countingQuestion(max: number): MathQuestion {
  const n = rnd(2, max);
  return {
    expr: "",
    promptKey: "gmHowMany",
    emoji: pick(COUNT_EMOJI),
    countN: n,
    choices: numChoices(n, 2),
    answer: String(n),
  };
}

function addQuestion(max: number): MathQuestion {
  const a = rnd(1, max);
  const b = rnd(1, Math.max(1, max - a));
  return { expr: `${a} + ${b}`, choices: numChoices(a + b, 3), answer: String(a + b) };
}

function subQuestion(max: number): MathQuestion {
  const a = rnd(2, max);
  const b = rnd(1, a); // never negative
  return { expr: `${a} − ${b}`, choices: numChoices(a - b, 3), answer: String(a - b) };
}

function mulQuestion(maxTable: number): MathQuestion {
  const a = rnd(2, maxTable);
  const b = rnd(2, 10);
  return { expr: `${a} × ${b}`, choices: numChoices(a * b, 6), answer: String(a * b) };
}

function compareQuestion(max: number): MathQuestion {
  let x = rnd(1, max);
  let y = rnd(1, max);
  while (y === x) y = rnd(1, max);
  const bigger = Math.max(x, y);
  return {
    expr: `${x}   |   ${y}`,
    promptKey: "gmWhichBigger",
    choices: shuffle([String(x), String(y)]),
    answer: String(bigger),
  };
}

/** One question appropriate to the age band. */
export function mathQuestion(ageBand: AgeBand): MathQuestion {
  if (ageBand === "3-5") {
    return pick([() => countingQuestion(10), () => addQuestion(5)])();
  }
  if (ageBand === "6-8") {
    return pick([() => addQuestion(20), () => subQuestion(20), () => compareQuestion(50)])();
  }
  return pick([() => addQuestion(100), () => subQuestion(100), () => mulQuestion(10)])();
}

export function mathsRound(ageBand: AgeBand, count = 6): MathQuestion[] {
  return Array.from({ length: count }, () => mathQuestion(ageBand));
}
