// Server-only: imported solely by the /api/generate route handler. Reads
// non-NEXT_PUBLIC secrets, which Next never inlines into client bundles.
import type { StoryPage } from "@/lib/content/types";
import {
  CHARACTERS,
  PAGE_COUNT,
  THEME_LESSON,
  buildGeminiPrompt,
  type StoryPrompt,
} from "./prompt";
import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  isGeminiConfigured,
} from "./config";

/** The content a generator returns; the route wraps it with id/status/age/etc. */
export type GeneratedStory = {
  title: { en: string; ur: string };
  coverScene: string;
  pages: StoryPage[];
  source: "gemini" | "template";
};

const ALLOWED_SCENES = ["zee", "zee-apples", "dada", "zee-dada", "mano", "sitara-stars"] as const;
type Scene = (typeof ALLOWED_SCENES)[number];
function safeScene(s: unknown, fallback: Scene): Scene {
  return (ALLOWED_SCENES as readonly string[]).includes(s as string) ? (s as Scene) : fallback;
}

/**
 * Generate a bilingual story from a STRUCTURED prompt. Uses Gemini when a key is
 * present, otherwise a deterministic template — either way the result still has
 * to pass moderation and human approval before a child can see it.
 */
export async function generateStory(input: StoryPrompt): Promise<GeneratedStory> {
  if (isGeminiConfigured()) {
    try {
      return await generateWithGemini(input);
    } catch (err) {
      console.error("[generate] Gemini failed, falling back to template:", err);
    }
  }
  return generateFromTemplate(input);
}

// ---------- Gemini ----------
async function generateWithGemini(input: StoryPrompt): Promise<GeneratedStory> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildGeminiPrompt(input) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = JSON.parse(text) as {
    title?: { en?: string; ur?: string };
    coverScene?: string;
    pages?: { text?: { en?: string; ur?: string }; art?: { scene?: string } }[];
  };
  const heroScene = safeScene(CHARACTERS[input.character].scene, "zee");
  const pages: StoryPage[] = (parsed.pages ?? [])
    .filter((p) => p.text?.en && p.text?.ur)
    .map((p) => ({
      text: { en: String(p.text!.en), ur: String(p.text!.ur) },
      art: { scene: safeScene(p.art?.scene, heroScene) },
    }));
  if (pages.length === 0) throw new Error("Gemini returned no usable pages");
  return {
    title: {
      en: parsed.title?.en?.trim() || fallbackTitle(input).en,
      ur: parsed.title?.ur?.trim() || fallbackTitle(input).ur,
    },
    coverScene: safeScene(parsed.coverScene, heroScene),
    pages,
    source: "gemini",
  };
}

// ---------- Deterministic $0 template ----------
function fallbackTitle(input: StoryPrompt) {
  const hero = CHARACTERS[input.character].name;
  const t: Record<StoryPrompt["theme"], { en: string; ur: string }> = {
    sharing: { en: `${hero.en} Learns to Share`, ur: `${hero.ur} نے بانٹنا سیکھا` },
    honesty: { en: `${hero.en} and the Truth`, ur: `${hero.ur} اور سچ` },
    counting: { en: `${hero.en} Counts Along`, ur: `${hero.ur} گنتی کرتا ہے` },
    courage: { en: `${hero.en} Finds Courage`, ur: `${hero.ur} میں ہمت آئی` },
    kindness: { en: `${hero.en} and a Kind Day`, ur: `${hero.ur} اور مہربانی کا دن` },
  };
  return t[input.theme];
}

function generateFromTemplate(input: StoryPrompt): GeneratedStory {
  const hero = CHARACTERS[input.character];
  const heroScene = safeScene(hero.scene, "zee");
  const wisdomScene: Scene = input.character === "dada" ? "dada" : input.character === "zee" ? "zee-dada" : heroScene;
  const lesson = THEME_LESSON[input.theme];
  const friend = input.childName?.trim();

  const beats = THEME_BEATS[input.theme];
  const sub = (s: { en: string; ur: string }) => ({
    en: s.en.replaceAll("{hero}", hero.name.en).replaceAll("{friend}", friend || "a friend"),
    ur: s.ur.replaceAll("{hero}", hero.name.ur).replaceAll("{friend}", friend || "ایک دوست"),
  });

  const pages: StoryPage[] = [
    { text: sub(INTRO), art: { scene: heroScene } },
    { text: sub(beats.setup), art: { scene: heroScene } },
    { text: sub(beats.problem), art: { scene: heroScene } },
    { text: sub(beats.lesson), art: { scene: wisdomScene } },
    { text: sub(beats.resolve), art: { scene: heroScene } },
  ];

  if (input.length === "medium") {
    pages.splice(3, 0, { text: sub(beats.middle), art: { scene: heroScene } });
    pages.push({
      text: {
        en: `And so ${hero.name.en} remembered: ${lesson.en}.`,
        ur: `اور یوں ${hero.name.ur} کو یاد رہا: ${lesson.ur}۔`,
      },
      art: { scene: heroScene },
    });
  }

  // Counting stories get a starry scene with a growing count, when available.
  if (input.theme === "counting") {
    pages.forEach((p, i) => {
      p.art = { scene: "sitara-stars", stars: Math.min(i + 1, 9), night: true };
    });
  }

  return { title: fallbackTitle(input), coverScene: pages[0].art.scene, pages, source: "template" };
}

const INTRO = {
  en: "In a green valley in the mountains, {hero} woke up ready for a brand new day.",
  ur: "پہاڑوں کی ایک ہری وادی میں، {hero} ایک نئے دن کے لیے بیدار ہوا۔",
};

const THEME_BEATS: Record<
  StoryPrompt["theme"],
  { setup: B; problem: B; middle: B; lesson: B; resolve: B }
> = {
  sharing: {
    setup: { en: "{hero} found a basket full of sweet, ripe fruit.", ur: "{hero} کو میٹھے پکے پھلوں سے بھری ایک ٹوکری ملی۔" },
    problem: { en: "“Should I keep it all for myself?” {hero} wondered.", ur: "”کیا میں یہ سب اپنے لیے رکھ لوں؟“ {hero} نے سوچا۔" },
    middle: { en: "Just then {friend} came along, looking hungry and tired.", ur: "تبھی {friend} آیا، جو بھوکا اور تھکا ہوا لگ رہا تھا۔" },
    lesson: { en: "Dada Kachwa smiled, “Joy grows bigger when we share it.”", ur: "دادا کچھوا مسکرائے، ”خوشی بانٹنے سے اور بڑھ جاتی ہے۔“" },
    resolve: { en: "{hero} shared the fruit, and it tasted sweeter than ever.", ur: "{hero} نے پھل بانٹے، اور وہ پہلے سے بھی میٹھے لگے۔" },
  },
  honesty: {
    setup: { en: "By mistake, {hero} broke a little clay pot. CRACK!", ur: "غلطی سے {hero} سے مٹی کا چھوٹا برتن ٹوٹ گیا۔ کھٹاک!" },
    problem: { en: "“Maybe I can hide it and say nothing,” {hero} thought, scared.", ur: "”شاید میں اسے چھپا دوں اور کچھ نہ کہوں،“ {hero} نے ڈرتے ہوئے سوچا۔" },
    middle: { en: "But hiding it made {hero}'s tummy feel heavy and sad.", ur: "لیکن چھپانے سے {hero} کا دل بوجھل اور اداس ہو گیا۔" },
    lesson: { en: "Dada Kachwa said softly, “The truth is like the sun — it always comes out.”", ur: "دادا کچھوا نے نرمی سے کہا، ”سچ سورج کی طرح ہے — یہ ہمیشہ نکل آتا ہے۔“" },
    resolve: { en: "{hero} told the truth and said sorry. Everyone smiled.", ur: "{hero} نے سچ بولا اور معافی مانگی۔ سب مسکرا دیے۔" },
  },
  counting: {
    setup: { en: "{hero} looked up at the wide night sky full of stars.", ur: "{hero} نے ستاروں سے بھرے کھلے رات کے آسمان کو دیکھا۔" },
    problem: { en: "“How many stars can I count tonight?” {hero} asked.", ur: "”آج رات میں کتنے ستارے گن سکتا ہوں؟“ {hero} نے پوچھا۔" },
    middle: { en: "One, two, three… the stars twinkled one by one.", ur: "ایک، دو، تین… ستارے ایک ایک کر کے جگمگائے۔" },
    lesson: { en: "Counting slowly and carefully, {hero} did not miss a single star.", ur: "آہستہ اور دھیان سے گنتے ہوئے، {hero} نے ایک بھی ستارہ نہ چھوڑا۔" },
    resolve: { en: "The sky was full of stars, like a sparkly counting blanket!", ur: "آسمان ستاروں سے بھرا تھا، جیسے گنتی کا چمکیلا کمبل!" },
  },
  courage: {
    setup: { en: "A tall hill stood ahead, and {hero}'s heart went thump-thump.", ur: "سامنے ایک اونچی پہاڑی تھی، اور {hero} کا دل دھک دھک کرنے لگا۔" },
    problem: { en: "“It looks so big. What if I cannot do it?” {hero} worried.", ur: "”یہ تو بہت بڑی ہے۔ اگر میں نہ کر سکا تو؟“ {hero} پریشان ہوا۔" },
    middle: { en: "{hero} took one small, brave step, and then another.", ur: "{hero} نے ایک چھوٹا، بہادر قدم اٹھایا، پھر ایک اور۔" },
    lesson: { en: "Dada Kachwa nodded, “Being brave means trying, even when you feel afraid.”", ur: "دادا کچھوا نے سر ہلایا، ”بہادری یہ ہے کہ ڈر کے باوجود کوشش کرو۔“" },
    resolve: { en: "Step by step, {hero} reached the top and cheered!", ur: "قدم بہ قدم، {hero} چوٹی پر پہنچ گیا اور خوشی سے جھوم اٹھا!" },
  },
  kindness: {
    setup: { en: "{hero} saw {friend} sitting all alone, feeling a little sad.", ur: "{hero} نے دیکھا کہ {friend} اکیلا بیٹھا، تھوڑا اداس ہے۔" },
    problem: { en: "“What could make this day better?” {hero} wondered.", ur: "”اس دن کو بہتر کیسے بنایا جائے؟“ {hero} نے سوچا۔" },
    middle: { en: "{hero} offered a warm smile and a helping hand.", ur: "{hero} نے ایک پیاری مسکراہٹ اور مدد کا ہاتھ پیش کیا۔" },
    lesson: { en: "Dada Kachwa said, “Small kindnesses make a big, big difference.”", ur: "دادا کچھوا نے کہا، ”چھوٹی مہربانیاں بہت بڑا فرق پیدا کرتی ہیں۔“" },
    resolve: { en: "Soon {friend} was smiling too, and the whole valley felt warmer.", ur: "جلد ہی {friend} بھی مسکرا رہا تھا، اور پوری وادی گرم جوش ہو گئی۔" },
  },
};

type B = { en: string; ur: string };
