import { describe, expect, it } from "vitest";
import { moderateStory } from "./moderate";
import type { GeneratedStory } from "./generate";

// No OPENAI_API_KEY in the test env → the keyword $0 screen runs.
const story = (en: string): GeneratedStory => ({
  title: { en: "Title", ur: "عنوان" },
  coverScene: "zee",
  pages: [{ text: { en, ur: "اردو متن" }, art: { scene: "zee" } }],
  source: "template",
});

describe("keyword moderation ($0 fallback)", () => {
  it("passes wholesome content", async () => {
    const m = await moderateStory(story("Zee shared the sweet apples with a kind friend."));
    expect(m.source).toBe("keyword");
    expect(m.verdict).toBe("pass");
    expect(m.autoBlocked).toBe(false);
  });

  it("flags and auto-blocks content with banned words", async () => {
    const m = await moderateStory(story("The scary monster had a gun and wanted to kill."));
    expect(m.verdict).toBe("flagged");
    expect(m.autoBlocked).toBe(true);
    expect(m.flags.length).toBeGreaterThan(0);
  });
});
