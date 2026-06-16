/**
 * Data-driven black-and-white coloring pages. Each page is a list of fillable
 * regions over a shared viewBox; the child taps a region to flood it with the
 * selected color. Saved artwork is just a {regionId → color} map (a few hundred
 * bytes), never an image — so "My Gallery" costs effectively nothing to store
 * and the whole feature scales with zero backend load.
 */
const STAR = "M0,-10 L2.9,-3.1 10,-3.1 4.5,1.2 6.9,8.1 0,4 -6.9,8.1 -4.5,1.2 -10,-3.1 -2.9,-3.1 Z";

export type Region =
  | { id: string; kind: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { id: string; kind: "circle"; cx: number; cy: number; r: number }
  | { id: string; kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { id: string; kind: "path"; d: string; transform?: string }
  | { id: string; kind: "polygon"; points: string };

export type ColoringPage = {
  id: string;
  name: { en: string; ur: string };
  viewBox: string;
  regions: Region[]; // ordered back-to-front
};

export const PALETTE = [
  "#ff8a3d", "#ffd23f", "#2bb3a3", "#7ec8e3", "#7fb069",
  "#b388eb", "#ff6b8a", "#e86f1f", "#8a5a3b", "#2b3a67",
  "#ffffff", "#2d2a32",
];

export const COLORING_PAGES: ColoringPage[] = [
  {
    id: "zee",
    name: { en: "Zee the Zebra", ur: "زی زیبرا" },
    viewBox: "0 0 400 300",
    regions: [
      { id: "sky", kind: "rect", x: 0, y: 0, w: 400, h: 300 },
      { id: "ground", kind: "ellipse", cx: 200, cy: 320, rx: 360, ry: 90 },
      { id: "sun", kind: "circle", cx: 58, cy: 58, r: 34 },
      { id: "body", kind: "ellipse", cx: 185, cy: 185, rx: 92, ry: 60 },
      { id: "legFront", kind: "rect", x: 150, y: 230, w: 20, h: 46, rx: 8 },
      { id: "legBack", kind: "rect", x: 210, y: 230, w: 20, h: 46, rx: 8 },
      { id: "head", kind: "circle", cx: 300, cy: 140, r: 46 },
      { id: "mane", kind: "path", d: "M268,104 q14,-26 44,-22 q-4,16 6,20 q-22,8 -30,24 Z" },
    ],
  },
  {
    id: "flowers",
    name: { en: "Flower Garden", ur: "پھولوں کا باغ" },
    viewBox: "0 0 400 300",
    regions: [
      { id: "sky", kind: "rect", x: 0, y: 0, w: 400, h: 300 },
      { id: "grass", kind: "rect", x: 0, y: 215, w: 400, h: 85 },
      { id: "sun", kind: "circle", cx: 60, cy: 56, r: 30 },
      { id: "stem", kind: "rect", x: 192, y: 150, w: 16, h: 110, rx: 6 },
      { id: "leaf", kind: "ellipse", cx: 165, cy: 205, rx: 30, ry: 14 },
      { id: "petalTop", kind: "circle", cx: 200, cy: 112, r: 26 },
      { id: "petalRight", kind: "circle", cx: 232, cy: 140, r: 26 },
      { id: "petalBottom", kind: "circle", cx: 200, cy: 168, r: 26 },
      { id: "petalLeft", kind: "circle", cx: 168, cy: 140, r: 26 },
      { id: "center", kind: "circle", cx: 200, cy: 140, r: 22 },
    ],
  },
  {
    id: "night",
    name: { en: "Starry Night", ur: "ستاروں بھری رات" },
    viewBox: "0 0 400 300",
    regions: [
      { id: "sky", kind: "rect", x: 0, y: 0, w: 400, h: 300 },
      { id: "mountainLeft", kind: "polygon", points: "0,300 130,140 250,300" },
      { id: "mountainRight", kind: "polygon", points: "170,300 310,120 400,300" },
      { id: "moon", kind: "circle", cx: 320, cy: 70, r: 34 },
      { id: "star1", kind: "path", d: STAR, transform: "translate(70,70) scale(1.4)" },
      { id: "star2", kind: "path", d: STAR, transform: "translate(160,50) scale(1.1)" },
      { id: "star3", kind: "path", d: STAR, transform: "translate(120,130) scale(1.2)" },
    ],
  },
];

export function pageById(id: string): ColoringPage | undefined {
  return COLORING_PAGES.find((p) => p.id === id);
}
