import { describe, expect, it } from "vitest";
import { storiesForProfile } from "./filter";
import { generateStory } from "@/lib/ai/generate";
import type { ChildProfile, Story } from "./types";

const kid = (over: Partial<ChildProfile> = {}): ChildProfile => ({
  id: "k1",
  name: "Aliya",
  ageBand: "3-5",
  language: "en",
  avatar: "🦓",
  ...over,
});

async function story(status: Story["status"], profileId?: string): Promise<Story> {
  const g = await generateStory({ theme: "courage", character: "mano", ageBand: "3-5", length: "short" });
  return {
    id: "gen-1",
    title: g.title,
    theme: "courage",
    ageBands: ["3-5"],
    status,
    profileId,
    coverScene: g.coverScene as Story["coverScene"],
    pages: g.pages,
  };
}

/**
 * Generated content must obey the SAME invariant as the rest: nothing reaches a
 * child until it is published_* for them. (Cloud mode mirrors this via RLS +
 * the approval-gate trigger; see verify-rls.mjs.)
 */
describe("generated content honors the safety invariant", () => {
  it("a pending generated story is invisible to its target child", async () => {
    const pending = await story("pending_review", "k1");
    expect(storiesForProfile([pending], kid())).toHaveLength(0);
  });

  it("becomes visible only to the approved child once published_profile", async () => {
    const published = await story("published_profile", "k1");
    expect(storiesForProfile([published], kid({ id: "k1" }))).toHaveLength(1);
    expect(storiesForProfile([published], kid({ id: "k2" }))).toHaveLength(0);
  });
});
