import { z } from "zod";

/** Age bands per docs/plan/01-vision-and-market.md §3 */
export const AgeBandSchema = z.enum(["3-5", "6-8", "9-12"]);
export type AgeBand = z.infer<typeof AgeBandSchema>;

export const LangSchema = z.enum(["en", "ur"]);
export type StoryLang = z.infer<typeof LangSchema>;

/** Every text is bilingual; the profile's language picks which side renders. */
export const BilingualTextSchema = z.object({
  en: z.string(),
  ur: z.string(),
});
export type BilingualText = z.infer<typeof BilingualTextSchema>;

/**
 * Art is referenced by scene key (rendered by <StoryArt/>), not by URL —
 * sprint-1 placeholder system until generated illustrations land (sprint 3+).
 */
export const StoryPageSchema = z.object({
  text: BilingualTextSchema,
  art: z.object({
    scene: z.enum([
      "zee",
      "zee-apples",
      "dada",
      "zee-dada",
      "mano",
      "sitara-stars",
    ]),
    stars: z.number().int().min(0).max(9).optional(),
    night: z.boolean().optional(),
  }),
  /** Audio URLs per language — filled by the TTS pipeline in a later sprint. */
  audio: z.object({ en: z.string().optional(), ur: z.string().optional() }).optional(),
});
export type StoryPage = z.infer<typeof StoryPageSchema>;

/**
 * Content lifecycle — THE safety invariant lives here. A child may only ever
 * see `published_*` content. Enforced by RLS in Supabase mode (see
 * supabase/migrations/0001_init.sql) and by filter.ts in local mode.
 */
export const ContentStatusSchema = z.enum([
  "draft",
  "pending_review",
  "rejected",
  "published_library", // Zebra's reviewed global library
  "published_profile", // approved by a parent for one child profile
  "published_class", // approved by a teacher for one class (sprint 4+)
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const StorySchema = z.object({
  id: z.string(),
  title: BilingualTextSchema,
  theme: z.enum(["sharing", "honesty", "counting", "courage", "kindness"]),
  ageBands: z.array(AgeBandSchema).min(1),
  status: ContentStatusSchema,
  /** Set when status is published_profile — the only profile that can see it. */
  profileId: z.string().optional(),
  pages: z.array(StoryPageSchema).min(1),
  coverScene: z.enum(["zee", "zee-apples", "dada", "zee-dada", "mano", "sitara-stars"]),
});
export type Story = z.infer<typeof StorySchema>;

export const ChildProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(30),
  ageBand: AgeBandSchema,
  language: LangSchema,
  avatar: z.string(), // emoji for now; Rive character later
});
export type ChildProfile = z.infer<typeof ChildProfileSchema>;

export const FamilySchema = z.object({
  name: z.string().min(1).max(60),
  pinHash: z.string(),
  pinSalt: z.string(),
});
export type Family = z.infer<typeof FamilySchema>;
