import type { Story } from "./types";

/**
 * Sprint-1 hand-authored library (status: published_library = human-reviewed).
 * Urdu copy needs a native-speaker review pass before pilot.
 * From sprint 3 the AI pipeline (generate → moderate → approve) feeds this.
 */
export const SEED_STORIES: Story[] = [
  {
    id: "zee-learns-to-share",
    title: { en: "Zee Learns to Share", ur: "زی نے بانٹنا سیکھا" },
    theme: "sharing",
    ageBands: ["3-5", "6-8"],
    status: "published_library",
    coverScene: "zee-apples",
    pages: [
      {
        text: {
          en: "Zee the zebra found a tree full of red apples.",
          ur: "زی زیبرا کو سرخ سیبوں سے بھرا ایک درخت ملا۔",
        },
        art: { scene: "zee-apples" },
      },
      {
        text: {
          en: "“So many apples! I will eat them ALL alone,” thought Zee.",
          ur: "”اتنے سارے سیب! میں سب اکیلے کھاؤں گا،“ زی نے سوچا۔",
        },
        art: { scene: "zee-apples" },
      },
      {
        text: {
          en: "Then came Dada Kachwa, walking slowly. He looked tired and hungry.",
          ur: "پھر دادا کچھوا آہستہ آہستہ چلتے ہوئے آئے۔ وہ تھکے ہوئے اور بھوکے لگ رہے تھے۔",
        },
        art: { scene: "dada" },
      },
      {
        text: {
          en: "“Dada, would you like some apples?” asked Zee.",
          ur: "”دادا، کیا آپ سیب کھائیں گے؟“ زی نے پوچھا۔",
        },
        art: { scene: "zee-dada" },
      },
      {
        text: {
          en: "Zee shared the apples, and they ate together under the tree.",
          ur: "زی نے سیب بانٹے اور دونوں نے درخت کے نیچے مل کر کھائے۔",
        },
        art: { scene: "zee-dada" },
      },
      {
        text: {
          en: "Sharing made the apples taste even sweeter!",
          ur: "بانٹنے سے سیب اور بھی میٹھے ہو گئے!",
        },
        art: { scene: "zee" },
      },
    ],
  },
  {
    id: "dada-kachwa-and-the-truth",
    title: { en: "Dada Kachwa and the Truth", ur: "دادا کچھوا اور سچ" },
    theme: "honesty",
    ageBands: ["6-8", "9-12"],
    status: "published_library",
    coverScene: "dada",
    pages: [
      {
        text: {
          en: "One day, Zee bumped into Mano's clay pot by mistake. CRACK!",
          ur: "ایک دن زی سے غلطی سے مانو کا مٹی کا برتن ٹکرا کر ٹوٹ گیا۔ کھٹاک!",
        },
        art: { scene: "zee" },
      },
      {
        text: {
          en: "Zee was scared. “Maybe I should hide it and say nothing…”",
          ur: "زی ڈر گیا۔ ”شاید میں اسے چھپا دوں اور کچھ نہ کہوں…“",
        },
        art: { scene: "zee" },
      },
      {
        text: {
          en: "Dada Kachwa said softly, “The truth is like the sun, Zee. It always comes out.”",
          ur: "دادا کچھوا نے نرمی سے کہا، ”زی، سچ سورج کی طرح ہے۔ یہ ہمیشہ نکل آتا ہے۔“",
        },
        art: { scene: "dada" },
      },
      {
        text: {
          en: "Zee took a deep breath, told Mano the truth, and said sorry.",
          ur: "زی نے گہرا سانس لیا، مانو کو سچ بتایا اور معافی مانگی۔",
        },
        art: { scene: "mano" },
      },
      {
        text: {
          en: "Mano smiled. “Thank you for being honest, Zee. We can fix it together.”",
          ur: "مانو مسکرایا۔ ”سچ بولنے کا شکریہ، زی۔ ہم اسے مل کر ٹھیک کر لیں گے۔“",
        },
        art: { scene: "mano" },
      },
      {
        text: {
          en: "Telling the truth needs courage — and Zee had it!",
          ur: "سچ بولنے کے لیے ہمت چاہیے — اور زی میں ہمت تھی!",
        },
        art: { scene: "zee-dada" },
      },
    ],
  },
  {
    id: "sitara-counts-the-stars",
    title: { en: "Sitara Counts the Stars", ur: "ستارہ ستارے گنتی ہے" },
    theme: "counting",
    ageBands: ["3-5"],
    status: "published_library",
    coverScene: "sitara-stars",
    pages: [
      {
        text: {
          en: "At night, Sitara the snow leopard looks up at the big dark sky.",
          ur: "رات کو ستارہ برفانی چیتا بڑے اندھیرے آسمان کو دیکھتی ہے۔",
        },
        art: { scene: "sitara-stars", stars: 1, night: true },
      },
      {
        text: {
          en: "One star. Two stars. Three little stars!",
          ur: "ایک ستارہ۔ دو ستارے۔ تین چھوٹے ستارے!",
        },
        art: { scene: "sitara-stars", stars: 3, night: true },
      },
      {
        text: {
          en: "Four stars twinkle over the tall mountains.",
          ur: "چار ستارے اونچے پہاڑوں پر جگمگاتے ہیں۔",
        },
        art: { scene: "sitara-stars", stars: 4, night: true },
      },
      {
        text: {
          en: "FIVE stars! Can you count them too?",
          ur: "پانچ ستارے! کیا تم بھی گن سکتے ہو؟",
        },
        art: { scene: "sitara-stars", stars: 5, night: true },
      },
      {
        text: {
          en: "The sky is full of stars, like a big sparkly blanket.",
          ur: "آسمان ستاروں سے بھرا ہے، جیسے ایک بڑا چمکیلا کمبل۔",
        },
        art: { scene: "sitara-stars", stars: 9, night: true },
      },
      {
        text: {
          en: "Good night, Sitara. Good night, stars!",
          ur: "شب بخیر، ستارہ! شب بخیر، ستارو!",
        },
        art: { scene: "sitara-stars", stars: 2, night: true },
      },
    ],
  },
];
