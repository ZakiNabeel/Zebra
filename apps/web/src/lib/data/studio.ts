"use client";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useStudio } from "@/lib/store/studio";
import * as cloud from "@/lib/data/cloud";
import type { Story } from "@/lib/content/types";
import type { StoryPrompt } from "@/lib/ai/prompt";

/**
 * Dual-mode adult creation pipeline (mirrors lib/content/library.ts). The parent
 * UI calls only this module; it hides whether we're persisting to Supabase
 * (cloud) or the local studio store. A child is NEVER reachable from here — and
 * nothing returned by createStory is published; it lands in the review queue.
 */
const CLOUD = isSupabaseConfigured();

export type Moderation = {
  source: string;
  verdict: "pass" | "flagged";
  flags: string[];
  autoBlocked: boolean;
};

export type CreateResult = {
  story: Story;
  moderation: Moderation;
  persisted: boolean;
  /** Which generator produced it: "gemini" or "template". */
  source: string;
};

type GenResponse = {
  story: {
    title: { en: string; ur: string };
    coverScene: Story["coverScene"];
    pages: Story["pages"];
    theme: Story["theme"];
    source: string;
  };
  moderation: Moderation;
  prompt: StoryPrompt;
};

/** Structured prompt → generate+moderate (server) → store as pending (or block). */
export async function createStory(prompt: StoryPrompt, profileId: string): Promise<CreateResult> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt),
  });
  if (!res.ok) throw new Error(`generation failed (${res.status})`);
  const data = (await res.json()) as GenResponse;

  const base: Story = {
    id: crypto.randomUUID(),
    title: data.story.title,
    theme: data.story.theme,
    ageBands: [prompt.ageBand],
    status: data.moderation.autoBlocked ? "rejected" : "pending_review",
    profileId,
    coverScene: data.story.coverScene,
    pages: data.story.pages,
  };

  // Auto-blocked content is never stored or shown — the parent just sees it failed.
  if (data.moderation.autoBlocked) {
    return { story: base, moderation: data.moderation, persisted: false, source: data.story.source };
  }

  let stored: Story;
  if (CLOUD) {
    stored = await cloud.createPendingStory(base, { moderation: data.moderation, prompt });
  } else {
    useStudio.getState().add(base);
    stored = base;
  }
  return { story: stored, moderation: data.moderation, persisted: true, source: data.story.source };
}

export async function listPending(): Promise<Story[]> {
  if (CLOUD) return cloud.listPendingStories();
  return useStudio.getState().stories.filter((s) => s.status === "pending_review");
}

/** Approve for ONE child profile → published_profile (the only profile that sees it). */
export async function approve(storyId: string, profileId: string): Promise<void> {
  if (CLOUD) await cloud.approveStory(storyId, profileId);
  else useStudio.getState().setStatus(storyId, "published_profile", { profileId });
}

export async function reject(storyId: string): Promise<void> {
  if (CLOUD) await cloud.rejectStory(storyId);
  else useStudio.getState().setStatus(storyId, "rejected");
}
