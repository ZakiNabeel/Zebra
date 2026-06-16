"use client";

import { useSchool } from "@/lib/store/school";
import { readyDeckById } from "@/lib/school/decks";
import type { SlidesInput } from "@/lib/school/slides-input";
import type { Presentation } from "@/lib/school/types";
import type { StoryLang } from "@/lib/content/types";

type SlidesResponse = {
  slides: Presentation["slides"];
  source: "ai" | "scaffold";
  moderation: { verdict: "pass" | "flagged"; autoBlocked: boolean; flags: string[]; source: string };
};

/** Generate a deck from a custom topic (server: AI or $0 scaffold), then store it. */
export async function createFromTopic(input: SlidesInput): Promise<{ id: string; blocked: boolean }> {
  const res = await fetch("/api/slides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`presentation generation failed (${res.status})`);
  const data = (await res.json()) as SlidesResponse;
  if (data.moderation?.autoBlocked) return { id: "", blocked: true };

  const p: Presentation = {
    id: crypto.randomUUID(),
    topic: input.topic,
    ageBand: input.ageBand,
    lang: input.lang,
    slides: data.slides,
    source: data.source,
    createdAt: Date.now(),
  };
  useSchool.getState().addPresentation(p);
  return { id: p.id, blocked: false };
}

/** Drop in a curated ready lesson (instant, no network) and store it. */
export function createFromReady(deckId: string, lang: StoryLang): string | null {
  const deck = readyDeckById(deckId);
  if (!deck) return null;
  const p: Presentation = {
    id: crypto.randomUUID(),
    topic: deck.title[lang],
    ageBand: deck.ageBand,
    lang,
    slides: deck.slides.map((s) => ({ ...s, bullets: [...s.bullets] })),
    source: "ready",
    createdAt: Date.now(),
  };
  useSchool.getState().addPresentation(p);
  return p.id;
}
