# 🦓 Sprint 5 — School Workspace (the schools-first wedge)

> Date: 2026-06-16 · Status: **shipped** · Build ✅ · Tests ✅ 27/27
> Sequence diagrams: [sprint-05-sequence-diagrams.md](sprint-05-sequence-diagrams.md)

## What happened this sprint

Zebra now has a **Teacher Tools** workspace — the schools-first go-to-market wedge
(docs/plan/01). It lives behind the same adult guard as the parent dashboard
(`/school`, reachable from a card on the parent dashboard) and ships three tools:

1. **Presentation maker** — build a bilingual class slideshow, **present** it
   full-screen, and **export to PDF**.
2. **Worksheet maker** — generate printable spelling lists and maths drills.
3. **Classes** — lightweight class organization with shareable join codes.

### Held the scalability line
Per the standing rule, everything here is built to **zero marginal backend cost**:

- **PDF export is the browser's own print engine** (`window.print()` + a print
  stylesheet) — no server-side PDF rendering, no per-export cost, works everywhere.
- **Worksheets** are generated client-side, reusing the Sprint 4 word/maths engines.
- **Ready lessons** are curated static data — one tap, no network.
- **Decks & classes** persist to `localStorage` (the teacher store), so the tools
  work offline and add no DB load.
- The only server touch is **custom-topic AI generation** — adult-triggered, one call
  per deck (not per view), behind auth, and with a $0 fallback (below).

## The presentation maker

- **Two ways to start:** pick a **ready lesson** (3 curated bilingual decks — Solar
  System, Water Cycle, Mighty Indus), or **generate from your own topic**.
- **Custom topic → `/api/slides`** (server, adult-auth-gated). Uses Gemini when a key
  is present, otherwise a **deterministic bilingual scaffold** so it works at $0. The
  assembled deck text passes the **moderation screen** before it's returned (a teacher
  typing an inappropriate topic is blocked).
- **Edit** every slide's title and bullets in both languages.
- **Present** full-screen with arrow-key / button navigation (Esc to exit).
- **Print / Save PDF** — one slide per page via the print stylesheet.

## The worksheet maker

Pick a type (spelling list / maths drills), age band, language, and length → a
print-ready sheet with a name/date header. Spelling sheets pair each picture-word with
a copy line; maths sheets are fill-in problems with an optional **answer key** toggle.
Both reuse the Sprint 4 generators, so difficulty matches the games kids play.

## Classes

Create a class (name, grade, language) and get an auto-generated, human-friendly
**share code** (`ZEB-XXXX`, no ambiguous characters). Minimal by design this sprint —
full student rostering + per-student progress reports are deferred (see below).

## Feature status

| Feature | Status |
|---|---|
| Teacher Tools hub (`/school`), linked from parent dashboard | ✅ Done |
| Presentation maker: ready lessons + custom topic | ✅ Done |
| Slide generation (`/api/slides`): Gemini + $0 bilingual scaffold + moderation | ✅ Done (401 verified) |
| Slide editor (bilingual titles + bullets) | ✅ Done |
| Present mode (full-screen, keyboard nav) | ✅ Done |
| PDF export via browser print (slides + worksheets) | ✅ Done |
| Worksheet maker (spelling + maths, printable, answer key) | ✅ Done |
| Classes + share codes | ✅ Done (lightweight) |
| Per-student rosters & progress reports | ◑ Deferred (needs a student-identity model) |
| Cloud sync of decks/classes across devices | ◑ Deferred — local by design; opt-in later |

## What I need from you — nothing required

Runs with the keys you already have. Custom-topic presentations use the **$0 bilingual
scaffold** until a `GEMINI_API_KEY` is present (optional — same key as Sprint 3); ready
lessons and worksheets need no key at all. No DB step.

> **Try it:** Parent dashboard → **Teacher Tools** → Presentation maker → tap a ready
> lesson → **Present** (full-screen) or **Print / Save PDF**. Then Worksheets → make a
> maths sheet → **Print**.

## How to run it

```
cd apps/web
npm install
npm run dev
npm test    # 27 tests incl. slide scaffold, worksheet correctness, share-code format
npm run build
```
