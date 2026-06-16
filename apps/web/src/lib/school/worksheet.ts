import type { AgeBand, StoryLang } from "@/lib/content/types";
import { WORDS } from "@/lib/learn/words";
import { mathQuestion } from "@/lib/learn/maths";

/**
 * Printable worksheet generators — pure, client-side, reusing the Sprint 4
 * learning engines. Rendered to a print-friendly view and exported to PDF via
 * the browser's own print dialog: no server, no cost, unlimited scale.
 */
export type SpellingWorksheet = { kind: "spelling"; items: { emoji: string; word: string }[] };
export type MathsWorksheet = { kind: "maths"; items: { expr: string; answer: string }[] };

export function spellingWorksheet(ageBand: AgeBand, lang: StoryLang, count = 10): SpellingWorksheet {
  const pool = WORDS[ageBand];
  const items = Array.from({ length: count }, (_, i) => {
    const w = pool[i % pool.length];
    return { emoji: w.emoji, word: w[lang] };
  });
  return { kind: "spelling", items };
}

export function mathsWorksheet(ageBand: AgeBand, count = 12): MathsWorksheet {
  const items: { expr: string; answer: string }[] = [];
  let guard = 0;
  while (items.length < count && guard++ < 800) {
    const q = mathQuestion(ageBand);
    // Keep only pure arithmetic (no counting / comparison) for a clean fill-in sheet.
    if (!q.promptKey && q.expr) items.push({ expr: q.expr, answer: q.answer });
  }
  return { kind: "maths", items };
}
