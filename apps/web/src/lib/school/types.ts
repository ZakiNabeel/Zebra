import type { AgeBand, BilingualText, StoryLang } from "@/lib/content/types";

/** Cast scenes reused as slide/lesson illustrations (rendered by StoryArt). */
export type SceneKey = "zee" | "zee-apples" | "dada" | "zee-dada" | "mano" | "sitara-stars";

export type Slide = {
  title: BilingualText;
  bullets: BilingualText[];
  scene: SceneKey;
};

export type Presentation = {
  id: string;
  topic: string;
  ageBand: AgeBand;
  lang: StoryLang; // the teacher's primary presenting language
  slides: Slide[];
  source: "ready" | "ai" | "scaffold";
  createdAt: number;
};

export type ClassRoom = {
  id: string;
  name: string;
  grade: AgeBand;
  lang: StoryLang;
  code: string; // share code, e.g. ZEB-7Q2K
  createdAt: number;
};
