import { describe, expect, it } from "vitest";
import { generateStory } from "./generate";
import { StoryPageSchema } from "@/lib/content/types";
import type { StoryPrompt } from "./prompt";

// No GEMINI_API_KEY in the test env → the deterministic $0 template path runs.
const base: StoryPrompt = { theme: "sharing", character: "zee", ageBand: "3-5", length: "short" };

describe("template story generator ($0 fallback)", () => {
  it("produces a bilingual, schema-valid short story", async () => {
    const s = await generateStory(base);
    expect(s.source).toBe("template");
    expect(s.pages.length).toBe(5);
    expect(s.title.en.length).toBeGreaterThan(0);
    expect(s.title.ur.length).toBeGreaterThan(0);
    for (const p of s.pages) {
      StoryPageSchema.parse(p); // throws on an invalid scene or shape
      expect(p.text.en.length).toBeGreaterThan(0);
      expect(p.text.ur.length).toBeGreaterThan(0);
    }
  });

  it("honors length=medium with more pages", async () => {
    const s = await generateStory({ ...base, length: "medium" });
    expect(s.pages.length).toBe(7);
  });

  it("substitutes a featured name when provided", async () => {
    const s = await generateStory({ ...base, theme: "kindness", childName: "Aliya" });
    const joined = s.pages.map((p) => p.text.en).join(" ");
    expect(joined).toContain("Aliya");
  });

  it("counting stories use the starry counting scene", async () => {
    const s = await generateStory({ ...base, theme: "counting" });
    for (const p of s.pages) expect(p.art.scene).toBe("sitara-stars");
  });

  it("covers every theme × character without throwing", async () => {
    const themes = ["sharing", "honesty", "counting", "courage", "kindness"] as const;
    const chars = ["zee", "mano", "sitara", "dada"] as const;
    for (const theme of themes) {
      for (const character of chars) {
        const s = await generateStory({ theme, character, ageBand: "6-8", length: "short" });
        expect(s.pages.length).toBeGreaterThanOrEqual(5);
        for (const p of s.pages) StoryPageSchema.parse(p);
      }
    }
  });
});
