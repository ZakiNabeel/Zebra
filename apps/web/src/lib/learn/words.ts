import type { AgeBand, StoryLang } from "@/lib/content/types";

/**
 * Curated, age-banded spelling words — bilingual, picture-cued. Generated 100%
 * client-side into the spelling game (no network, no AI, no per-play cost — this
 * is what lets games scale to unlimited concurrent kids at $0).
 *
 * Urdu words are chosen WITHOUT diacritics so [...word] splits into clean,
 * teachable base letters; the answer area re-renders a real substring of the
 * word so Nastaliq joining always stays correct. Urdu copy needs a native
 * review pass before pilot (tracked in the sprint doc).
 */
export type WordItem = { emoji: string; en: string; ur: string };

export const WORDS: Record<AgeBand, WordItem[]> = {
  "3-5": [
    { emoji: "🐱", en: "cat", ur: "بلی" },
    { emoji: "☀️", en: "sun", ur: "سورج" },
    { emoji: "⭐", en: "star", ur: "تارا" },
    { emoji: "🌙", en: "moon", ur: "چاند" },
    { emoji: "🐦", en: "bird", ur: "چڑیا" },
    { emoji: "🏠", en: "home", ur: "گھر" },
    { emoji: "📖", en: "book", ur: "کتاب" },
    { emoji: "💧", en: "water", ur: "پانی" },
  ],
  "6-8": [
    { emoji: "🦓", en: "zebra", ur: "زیبرا" },
    { emoji: "🌳", en: "tree", ur: "درخت" },
    { emoji: "🐟", en: "fish", ur: "مچھلی" },
    { emoji: "🌧️", en: "rain", ur: "بارش" },
    { emoji: "🏔️", en: "hill", ur: "پہاڑ" },
    { emoji: "🐢", en: "turtle", ur: "کچھوا" },
    { emoji: "🍎", en: "apple", ur: "سیب" },
    { emoji: "🌸", en: "flower", ur: "پھول" },
  ],
  "9-12": [
    { emoji: "🐆", en: "leopard", ur: "چیتا" },
    { emoji: "🌊", en: "river", ur: "دریا" },
    { emoji: "🪐", en: "planet", ur: "سیارہ" },
    { emoji: "🏫", en: "school", ur: "اسکول" },
    { emoji: "🌍", en: "world", ur: "دنیا" },
    { emoji: "🦅", en: "eagle", ur: "عقاب" },
    { emoji: "📚", en: "library", ur: "کتب خانہ" },
    { emoji: "⛰️", en: "mountain", ur: "پہاڑی" },
  ],
};

/** Split a word into its rendered code points (one tile per letter). */
export function letters(word: string): string[] {
  return [...word];
}

/** A shuffled spelling round for a profile's age band + language. */
export function spellingRound(ageBand: AgeBand, lang: StoryLang, count = 5): WordItem[] {
  const pool = [...WORDS[ageBand]];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Keep only words that have at least 2 letters in the target language.
  return pool.filter((w) => letters(w[lang]).length >= 2).slice(0, count);
}
