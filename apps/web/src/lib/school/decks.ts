import type { AgeBand, BilingualText } from "@/lib/content/types";
import type { SceneKey, Slide } from "./types";

/**
 * Curated, human-written bilingual lessons. Teachers can drop one in with one
 * tap and edit from there — so the presentation maker is genuinely useful at $0
 * (no AI key needed). Urdu copy needs a native review pass before pilot.
 */
export type ReadyDeck = {
  id: string;
  title: BilingualText;
  ageBand: AgeBand;
  cover: SceneKey;
  slides: Slide[];
};

const b = (en: string, ur: string): BilingualText => ({ en, ur });

export const READY_DECKS: ReadyDeck[] = [
  {
    id: "solar-system",
    title: b("The Solar System", "نظامِ شمسی"),
    ageBand: "6-8",
    cover: "sitara-stars",
    slides: [
      { title: b("The Solar System", "نظامِ شمسی"), bullets: [b("Our home in space", "خلا میں ہمارا گھر")], scene: "sitara-stars" },
      {
        title: b("The Sun", "سورج"),
        bullets: [b("A giant ball of hot light", "گرم روشنی کا بہت بڑا گولا"), b("It gives us light and warmth", "یہ ہمیں روشنی اور گرمی دیتا ہے")],
        scene: "sitara-stars",
      },
      {
        title: b("Eight Planets", "آٹھ سیارے"),
        bullets: [b("Planets travel around the Sun", "سیارے سورج کے گرد گھومتے ہیں"), b("Earth is our planet", "زمین ہمارا سیارہ ہے")],
        scene: "sitara-stars",
      },
      {
        title: b("The Moon", "چاند"),
        bullets: [b("It travels around the Earth", "یہ زمین کے گرد گھومتا ہے"), b("We see it shine at night", "ہم اسے رات کو چمکتے دیکھتے ہیں")],
        scene: "sitara-stars",
      },
      {
        title: b("Let's Remember", "آؤ یاد کریں"),
        bullets: [b("Sun, planets, and Moon", "سورج، سیارے اور چاند"), b("We all live in space!", "ہم سب خلا میں رہتے ہیں!")],
        scene: "sitara-stars",
      },
    ],
  },
  {
    id: "water-cycle",
    title: b("The Water Cycle", "پانی کا چکر"),
    ageBand: "6-8",
    cover: "dada",
    slides: [
      { title: b("The Water Cycle", "پانی کا چکر"), bullets: [b("How water travels around us", "پانی ہمارے ارد گرد کیسے سفر کرتا ہے")], scene: "dada" },
      {
        title: b("Evaporation", "بخارات"),
        bullets: [b("The sun warms the water", "سورج پانی کو گرم کرتا ہے"), b("Water rises as vapour", "پانی بھاپ بن کر اوپر اٹھتا ہے")],
        scene: "zee",
      },
      { title: b("Clouds", "بادل"), bullets: [b("Vapour cools and forms clouds", "بھاپ ٹھنڈی ہو کر بادل بناتی ہے")], scene: "zee" },
      { title: b("Rain", "بارش"), bullets: [b("Clouds grow heavy and rain falls", "بادل بھاری ہو کر بارش برساتے ہیں")], scene: "zee" },
      {
        title: b("Back to the Rivers", "واپس دریاؤں میں"),
        bullets: [b("Rain fills rivers and the sea", "بارش دریا اور سمندر بھرتی ہے"), b("And the cycle begins again", "اور چکر دوبارہ شروع ہوتا ہے")],
        scene: "dada",
      },
    ],
  },
  {
    id: "mighty-indus",
    title: b("The Mighty Indus", "عظیم دریائے سندھ"),
    ageBand: "9-12",
    cover: "mano",
    slides: [
      { title: b("The Mighty Indus", "عظیم دریائے سندھ"), bullets: [b("Pakistan's great river", "پاکستان کا عظیم دریا")], scene: "mano" },
      {
        title: b("Where It Begins", "یہ کہاں سے شروع ہوتا ہے"),
        bullets: [b("High in the mountains", "اونچے پہاڑوں سے"), b("Fed by snow and glaciers", "برف اور گلیشیئر سے")],
        scene: "mano",
      },
      { title: b("Its Journey", "اس کا سفر"), bullets: [b("It flows through all of Pakistan", "یہ پورے پاکستان سے گزرتا ہے")], scene: "mano" },
      {
        title: b("Why It Matters", "یہ کیوں اہم ہے"),
        bullets: [b("Water for farms and cities", "کھیتوں اور شہروں کے لیے پانی"), b("Home to the Indus dolphin", "انڈس ڈولفن کا گھر")],
        scene: "dada",
      },
      { title: b("Let's Protect It", "آؤ اس کی حفاظت کریں"), bullets: [b("Keep our rivers clean", "اپنے دریاؤں کو صاف رکھیں")], scene: "mano" },
    ],
  },
];

export function readyDeckById(id: string): ReadyDeck | undefined {
  return READY_DECKS.find((d) => d.id === id);
}
