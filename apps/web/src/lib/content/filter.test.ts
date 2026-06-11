import { describe, expect, it } from "vitest";
import { storiesForProfile } from "./filter";
import { SEED_STORIES } from "./seed-stories";
import { StorySchema, type ChildProfile, type Story } from "./types";

const kid = (over: Partial<ChildProfile> = {}): ChildProfile => ({
  id: "kid-1",
  name: "Aliya",
  ageBand: "3-5",
  language: "ur",
  avatar: "🦓",
  ...over,
});

const story = (over: Partial<Story>): Story => ({
  ...SEED_STORIES[0],
  id: "test-story",
  ...over,
});

/**
 * THE SAFETY INVARIANT (docs/plan/04-safety-and-compliance.md §0):
 * a child must never see content that is not published. These tests are the
 * local-mode enforcement check; the Supabase RLS policies mirror them.
 * Never weaken these without a safety review.
 */
describe("safety invariant: child content visibility", () => {
  it("never shows draft, pending_review, or rejected content", () => {
    const dangerous: Story[] = [
      story({ id: "d1", status: "draft" }),
      story({ id: "d2", status: "pending_review" }),
      story({ id: "d3", status: "rejected" }),
    ];
    expect(storiesForProfile(dangerous, kid())).toHaveLength(0);
  });

  it("never shows another profile's approved content", () => {
    const privateStory = story({ id: "p1", status: "published_profile", profileId: "other-kid" });
    expect(storiesForProfile([privateStory], kid())).toHaveLength(0);
    expect(storiesForProfile([privateStory], kid({ id: "other-kid" }))).toHaveLength(1);
  });

  it("filters by age band", () => {
    const older = story({ id: "a1", ageBands: ["9-12"] });
    expect(storiesForProfile([older], kid({ ageBand: "3-5" }))).toHaveLength(0);
    expect(storiesForProfile([older], kid({ ageBand: "9-12" }))).toHaveLength(1);
  });

  it("shows library content matching the age band", () => {
    const visible = storiesForProfile(SEED_STORIES, kid({ ageBand: "3-5" }));
    expect(visible.length).toBeGreaterThan(0);
    for (const s of visible) {
      expect(s.status).toBe("published_library");
      expect(s.ageBands).toContain("3-5");
    }
  });
});

describe("seed library integrity", () => {
  it("every seed story validates against the schema and is bilingual", () => {
    for (const s of SEED_STORIES) {
      const parsed = StorySchema.parse(s); // throws on invalid
      expect(parsed.status).toBe("published_library");
      for (const page of parsed.pages) {
        expect(page.text.en.length).toBeGreaterThan(0);
        expect(page.text.ur.length).toBeGreaterThan(0);
      }
    }
  });
});
