import { describe, expect, it } from "vitest";
import { mathQuestion, mathsRound } from "./maths";
import type { AgeBand } from "@/lib/content/types";

const BANDS: AgeBand[] = ["3-5", "6-8", "9-12"];

describe("maths generator (client-side, $0)", () => {
  it("every question's correct answer is one of its choices, math is right", () => {
    for (const band of BANDS) {
      for (let i = 0; i < 300; i++) {
        const q = mathQuestion(band);
        expect(q.choices).toContain(q.answer);
        expect(new Set(q.choices).size).toBe(q.choices.length); // no duplicate options
        for (const c of q.choices) expect(Number(c)).toBeGreaterThanOrEqual(0); // never negative

        // Verify the arithmetic for expression questions.
        const m = q.expr.match(/^(\d+)\s*([+\-−×])\s*(\d+)$/);
        if (m) {
          const a = Number(m[1]);
          const b = Number(m[3]);
          const op = m[2];
          const expected = op === "+" ? a + b : op === "×" ? a * b : a - b;
          expect(Number(q.answer)).toBe(expected);
          if (op !== "+" && op !== "×") expect(expected).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("counting questions carry an emoji and a positive count", () => {
    let sawCount = false;
    for (let i = 0; i < 300; i++) {
      const q = mathQuestion("3-5");
      if (q.promptKey === "gmHowMany") {
        sawCount = true;
        expect(q.emoji).toBeTruthy();
        expect(q.countN ?? 0).toBeGreaterThan(0);
        expect(q.answer).toBe(String(q.countN));
      }
    }
    expect(sawCount).toBe(true);
  });

  it("returns a full round", () => {
    expect(mathsRound("6-8", 6)).toHaveLength(6);
  });
});
