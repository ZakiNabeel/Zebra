import { describe, expect, it } from "vitest";
import { WORDS, letters, spellingRound } from "./words";
import type { AgeBand } from "@/lib/content/types";

const BANDS: AgeBand[] = ["3-5", "6-8", "9-12"];

describe("spelling word bank", () => {
  it("every word is bilingual and splits into clean letter tiles", () => {
    for (const band of BANDS) {
      expect(WORDS[band].length).toBeGreaterThanOrEqual(4);
      for (const w of WORDS[band]) {
        expect(w.en.length).toBeGreaterThanOrEqual(2);
        expect(letters(w.ur).length).toBeGreaterThanOrEqual(2);
        expect(w.emoji.length).toBeGreaterThan(0);
        // Re-joining the split letters reproduces the exact word (so the answer
        // area can render a correctly-joined Urdu substring as it's spelled).
        expect(letters(w.ur).join("")).toBe(w.ur);
        expect(letters(w.en).join("")).toBe(w.en);
      }
    }
  });

  it("a round returns spellable words for the chosen language", () => {
    const round = spellingRound("6-8", "ur", 5);
    expect(round.length).toBeGreaterThan(0);
    expect(round.length).toBeLessThanOrEqual(5);
    for (const w of round) expect(letters(w.ur).length).toBeGreaterThanOrEqual(2);
  });
});
