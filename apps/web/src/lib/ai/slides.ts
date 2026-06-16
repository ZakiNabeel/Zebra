// Server-only: imported solely by the /api/slides route handler.
import type { BilingualText } from "@/lib/content/types";
import type { SceneKey, Slide } from "@/lib/school/types";
import type { SlidesInput } from "@/lib/school/slides-input";
import { GEMINI_API_KEY, GEMINI_MODEL, isGeminiConfigured } from "./config";

const SCENES: SceneKey[] = ["zee-dada", "zee", "dada", "mano", "zee-apples", "sitara-stars"];
function safeScene(s: unknown, fallback: SceneKey): SceneKey {
  return (SCENES as string[]).includes(s as string) ? (s as SceneKey) : fallback;
}

export type GeneratedSlides = { slides: Slide[]; source: "ai" | "scaffold" };

export async function generateSlides(input: SlidesInput): Promise<GeneratedSlides> {
  if (isGeminiConfigured()) {
    try {
      return await withGemini(input);
    } catch (err) {
      console.error("[slides] Gemini failed, falling back to scaffold:", err);
    }
  }
  return scaffold(input);
}

// ---------- Gemini ----------
function buildPrompt(input: SlidesInput): string {
  return [
    `Create a ${input.count}-slide kid-friendly class presentation about "${input.topic}"`,
    `for children aged ${input.ageBand} in Pakistan.`,
    `Each slide: a short title and 1-3 very simple bullet points.`,
    `Every title and bullet must be fully BILINGUAL — natural English AND natural Urdu (Urdu script).`,
    `No violence, fear, romance, religion, politics, or brands. Warm and educational.`,
    `Return STRICT JSON ONLY: {"slides":[{"title":{"en":"..","ur":".."},"bullets":[{"en":"..","ur":".."}]}]}`,
  ].join("\n");
}

async function withGemini(input: SlidesInput): Promise<GeneratedSlides> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = JSON.parse(text) as {
    slides?: { title?: BilingualText; bullets?: BilingualText[] }[];
  };
  const slides: Slide[] = (parsed.slides ?? [])
    .filter((s) => s.title?.en && s.title?.ur)
    .map((s, i) => ({
      title: { en: String(s.title!.en), ur: String(s.title!.ur) },
      bullets: (s.bullets ?? [])
        .filter((b) => b?.en && b?.ur)
        .map((b) => ({ en: String(b.en), ur: String(b.ur) })),
      scene: SCENES[i % SCENES.length],
    }));
  if (slides.length === 0) throw new Error("Gemini returned no usable slides");
  return { slides, source: "ai" };
}

// ---------- Deterministic $0 bilingual scaffold ----------
const tpl = (en: string, ur: string): BilingualText => ({ en, ur });

const MIDDLE: { title: BilingualText; bullets: BilingualText[] }[] = [
  { title: tpl("What is {topic}?", "{topic} کیا ہے؟"), bullets: [tpl("Let's find out together", "آؤ مل کر جانیں"), tpl("Look, listen, and think", "دیکھو، سنو اور سوچو")] },
  { title: tpl("Why does {topic} matter?", "{topic} کیوں اہم ہے؟"), bullets: [tpl("It helps us every day", "یہ روز ہماری مدد کرتا ہے"), tpl("Talk about it with a friend", "کسی دوست سے بات کرو")] },
  { title: tpl("Fun facts about {topic}", "{topic} کے بارے میں دلچسپ باتیں"), bullets: [tpl("Did you know?", "کیا تم جانتے ہو؟"), tpl("Add your own fact here", "اپنی ایک بات یہاں لکھو")] },
  { title: tpl("Let's draw {topic}", "آؤ {topic} بنائیں"), bullets: [tpl("Make a picture", "ایک تصویر بناؤ"), tpl("Show your class", "اپنی جماعت کو دکھاؤ")] },
  { title: tpl("Talk about {topic}", "{topic} پر بات کریں"), bullets: [tpl("Share one idea", "ایک خیال بتاؤ"), tpl("Listen to your friends", "اپنے دوستوں کو سنو")] },
];

function fill(b: BilingualText, topic: string): BilingualText {
  return { en: b.en.replaceAll("{topic}", topic), ur: b.ur.replaceAll("{topic}", topic) };
}

function scaffold(input: SlidesInput): GeneratedSlides {
  const topic = input.topic;
  const slides: Slide[] = [];
  // Title
  slides.push({
    title: fill(tpl("{topic}", "{topic}"), topic),
    bullets: [fill(tpl("A lesson for our class", "ہماری جماعت کے لیے ایک سبق"), topic)],
    scene: "zee-dada",
  });
  // Middle (count - 2), cycling the pool
  for (let i = 0; i < input.count - 2; i++) {
    const frame = MIDDLE[i % MIDDLE.length];
    slides.push({
      title: fill(frame.title, topic),
      bullets: frame.bullets.map((b) => fill(b, topic)),
      scene: SCENES[(i + 1) % SCENES.length],
    });
  }
  // Closing
  slides.push({
    title: tpl("Let's Remember", "آؤ یاد کریں"),
    bullets: [tpl("What did we learn?", "ہم نے کیا سیکھا؟"), tpl("Great work today!", "آج بہت اچھا کام!")],
    scene: "sitara-stars",
  });
  return { slides: slides.map((s) => ({ ...s, scene: safeScene(s.scene, "zee") })), source: "scaffold" };
}
