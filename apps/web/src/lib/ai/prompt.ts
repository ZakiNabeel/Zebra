import { z } from "zod";
import { AgeBandSchema } from "@/lib/content/types";

/**
 * The ONLY way a story is requested: a STRUCTURED prompt of constrained choices,
 * built by an adult in the parent dashboard. There is no free-text-to-model path
 * and children never reach this — invariants #2 and #3. The optional `childName`
 * is adult-entered (to personalise the hero) and length-capped; it is also run
 * through the moderation layer before anything is stored.
 */
export const StoryThemeSchema = z.enum([
  "sharing",
  "honesty",
  "counting",
  "courage",
  "kindness",
]);
export type StoryTheme = z.infer<typeof StoryThemeSchema>;

export const CharacterSchema = z.enum(["zee", "mano", "sitara", "dada"]);
export type CharacterKey = z.infer<typeof CharacterSchema>;

export const StoryPromptSchema = z.object({
  childName: z.string().trim().max(30).optional(),
  theme: StoryThemeSchema,
  character: CharacterSchema,
  ageBand: AgeBandSchema,
  length: z.enum(["short", "medium"]).default("short"),
});
export type StoryPrompt = z.infer<typeof StoryPromptSchema>;

/** Cast: bilingual names, the SVG scene that depicts them, and a wisdom partner. */
export const CHARACTERS: Record<
  CharacterKey,
  { name: { en: string; ur: string }; scene: string; species: string }
> = {
  zee: { name: { en: "Zee the zebra", ur: "زی زیبرا" }, scene: "zee", species: "zebra" },
  mano: { name: { en: "Mano the markhor", ur: "مانو مارخور" }, scene: "mano", species: "markhor" },
  sitara: {
    name: { en: "Sitara the snow leopard", ur: "ستارہ برفانی چیتا" },
    scene: "sitara-stars",
    species: "snow leopard",
  },
  dada: {
    name: { en: "Dada Kachwa the tortoise", ur: "دادا کچھوا" },
    scene: "dada",
    species: "tortoise",
  },
};

const THEME_LESSON: Record<StoryTheme, { en: string; ur: string }> = {
  sharing: { en: "sharing makes everything sweeter", ur: "بانٹنے سے ہر چیز اور میٹھی ہو جاتی ہے" },
  honesty: { en: "the truth always shines through", ur: "سچ ہمیشہ روشن ہو کر سامنے آتا ہے" },
  counting: { en: "counting can be a fun adventure", ur: "گنتی ایک مزے دار کھیل ہو سکتی ہے" },
  courage: { en: "being brave means trying even when you are scared", ur: "بہادری یہ ہے کہ ڈر کے باوجود کوشش کرو" },
  kindness: { en: "small kindnesses make a big difference", ur: "چھوٹی چھوٹی مہربانیاں بڑا فرق پیدا کرتی ہیں" },
};

const PAGE_COUNT = { short: 5, medium: 7 } as const;

/** The instruction we send Gemini. Output is strict bilingual JSON we validate. */
export function buildGeminiPrompt(input: StoryPrompt): string {
  const hero = CHARACTERS[input.character];
  const childLine = input.childName
    ? `Optionally feature a kind child named "${input.childName}" as the hero's friend.`
    : "";
  const lesson = THEME_LESSON[input.theme].en;
  const pages = PAGE_COUNT[input.length];
  const allowedScenes = ["zee", "zee-apples", "dada", "zee-dada", "mano", "sitara-stars"];
  return [
    `You write gentle, wholesome stories for children aged ${input.ageBand} in Pakistan.`,
    `The hero is ${hero.name.en} (a ${hero.species}). Theme: ${input.theme}. Moral: ${lesson}.`,
    childLine,
    `Write EXACTLY ${pages} short pages. Each page: one or two simple sentences.`,
    `Every page must be fully BILINGUAL: natural English AND natural Urdu (Urdu script).`,
    `Absolutely no violence, fear, romance, religion, politics, brands, or scary content.`,
    `For each page choose an "art.scene" from this exact list: ${allowedScenes.join(", ")}.`,
    `Return STRICT JSON ONLY, no markdown, matching:`,
    `{"title":{"en":"...","ur":"..."},"coverScene":"<scene>","pages":[{"text":{"en":"...","ur":"..."},"art":{"scene":"<scene>"}}]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export { THEME_LESSON, PAGE_COUNT };
