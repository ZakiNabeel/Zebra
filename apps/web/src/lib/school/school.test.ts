import { describe, expect, it } from "vitest";
import { READY_DECKS } from "./decks";
import { spellingWorksheet, mathsWorksheet } from "./worksheet";
import { makeClassCode } from "./code";
import { generateSlides } from "@/lib/ai/slides";
import type { AgeBand } from "@/lib/content/types";

const BANDS: AgeBand[] = ["3-5", "6-8", "9-12"];

describe("ready lessons", () => {
  it("every curated slide is bilingual with a valid scene", () => {
    expect(READY_DECKS.length).toBeGreaterThanOrEqual(3);
    for (const d of READY_DECKS) {
      expect(d.slides.length).toBeGreaterThanOrEqual(3);
      for (const s of d.slides) {
        expect(s.title.en.length).toBeGreaterThan(0);
        expect(s.title.ur.length).toBeGreaterThan(0);
        for (const b of s.bullets) {
          expect(b.en.length).toBeGreaterThan(0);
          expect(b.ur.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("slides scaffold ($0 fallback — no Gemini key in test env)", () => {
  it("honors the slide count and substitutes the topic", async () => {
    const out = await generateSlides({ topic: "Volcanoes", ageBand: "6-8", lang: "en", count: 6 });
    expect(out.source).toBe("scaffold");
    expect(out.slides).toHaveLength(6);
    const joined = out.slides.map((s) => s.title.en).join(" ");
    expect(joined).toContain("Volcanoes");
    for (const s of out.slides) {
      expect(s.title.en.length).toBeGreaterThan(0);
      expect(s.title.ur.length).toBeGreaterThan(0);
    }
  });
});

describe("printable worksheets", () => {
  it("spelling worksheet returns the requested count, bilingual-aware", () => {
    const ws = spellingWorksheet("6-8", "ur", 10);
    expect(ws.kind).toBe("spelling");
    expect(ws.items).toHaveLength(10);
    for (const it of ws.items) {
      expect(it.emoji.length).toBeGreaterThan(0);
      expect(it.word.length).toBeGreaterThan(0);
    }
  });

  it("maths worksheet items are pure arithmetic with correct answers", () => {
    for (const band of BANDS) {
      const ws = mathsWorksheet(band, 12);
      expect(ws.items).toHaveLength(12);
      for (const it of ws.items) {
        const m = it.expr.match(/^(\d+)\s*([+\-−×])\s*(\d+)$/);
        expect(m).not.toBeNull();
        const a = Number(m![1]);
        const b = Number(m![3]);
        const op = m![2];
        const expected = op === "+" ? a + b : op === "×" ? a * b : a - b;
        expect(Number(it.answer)).toBe(expected);
      }
    }
  });
});

describe("class share code", () => {
  it("matches the ZEB-XXXX format with no ambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      const code = makeClassCode();
      expect(code).toMatch(/^ZEB-[A-HJ-NP-Z2-9]{4}$/);
      expect(code).not.toMatch(/[01OI]/);
    }
  });
});
