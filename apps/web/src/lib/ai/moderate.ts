// Server-only: the automated moderation pre-filter. Runs BEFORE a story enters
// the review queue. It is a gate that can only REJECT — it never approves; the
// human approval step is always still required (defense in depth, docs/plan/04).
import { OPENAI_API_KEY, isModerationConfigured } from "./config";
import type { GeneratedStory } from "./generate";

export type Moderation = {
  source: "openai" | "keyword";
  verdict: "pass" | "flagged";
  flags: string[];
  /** True when the automated layer blocked it outright (never reaches review). */
  autoBlocked: boolean;
};

/** Words that should never appear in under-12 content; the $0 fallback screen. */
const BANNED = [
  "kill", "blood", "gun", "weapon", "die", "death", "hate", "stupid", "idiot",
  "scary", "monster", "ghost", "demon", "drug", "alcohol", "sexy", "kiss",
];

function flatten(story: GeneratedStory): string {
  return [story.title.en, story.title.ur, ...story.pages.flatMap((p) => [p.text.en, p.text.ur])].join("\n");
}

/** Screen any block of text (stories, slides, teacher topics) the same way. */
export async function moderateText(text: string): Promise<Moderation> {
  if (isModerationConfigured()) {
    try {
      return await moderateWithOpenAI(text);
    } catch (err) {
      console.error("[moderate] OpenAI failed, falling back to keyword screen:", err);
    }
  }
  return moderateWithKeywords(text);
}

export async function moderateStory(story: GeneratedStory): Promise<Moderation> {
  return moderateText(flatten(story));
}

async function moderateWithOpenAI(text: string): Promise<Moderation> {
  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI moderation ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const result = data?.results?.[0];
  const flagged: boolean = !!result?.flagged;
  const flags: string[] = result?.categories
    ? Object.entries(result.categories)
        .filter(([, v]) => v === true)
        .map(([k]) => k)
    : [];
  return { source: "openai", verdict: flagged ? "flagged" : "pass", flags, autoBlocked: flagged };
}

function moderateWithKeywords(text: string): Moderation {
  const lower = text.toLowerCase();
  const flags = BANNED.filter((w) => lower.includes(w));
  const flagged = flags.length > 0;
  return { source: "keyword", verdict: flagged ? "flagged" : "pass", flags, autoBlocked: flagged };
}
