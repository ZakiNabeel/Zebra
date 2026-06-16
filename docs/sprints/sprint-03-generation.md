# 🦓 Sprint 3 — AI Story Generation Behind the Approval Gate (+ TTS)

> Date: 2026-06-16 · Status: **shipped, $0 with zero keys** · Build ✅ · Tests ✅ 17/17
> Sequence diagrams: [sprint-03-sequence-diagrams.md](sprint-03-sequence-diagrams.md)

## What happened this sprint

Zebra can now **create stories** — and it does so behind the safety model we built in
Sprints 1–2, not around it. An adult fills a **structured form** (child, lesson,
character, length), the system generates a bilingual story, runs it through an
**automated moderation screen**, and parks it in a **review queue**. Nothing a child
can see appears until the parent taps **Approve**. Invariants #2 ("children never
prompt AI") and #3 ("no free-text in Kid Mode") hold: generation lives only in the
PIN-gated parent dashboard, and in cloud mode the API route refuses any request
without a signed-in parent session (verified: unauthenticated `POST /api/generate`
→ `401`).

It runs at **$0 with no AI keys**. Every provider has a permanent-free real version
*and* a deterministic local fallback:

| Need | Real provider (free tier) | $0 fallback when no key |
|---|---|---|
| Story text | Google Gemini Flash | Deterministic bilingual **story templates** (5 themes × 4 characters) |
| Moderation | OpenAI Moderation (free) | **Keyword screen** (banned-word list) |
| Narration | Azure Speech F0 | Browser **Web Speech API** (read-along, no key) |
| Illustration | (Cloudflare Flux — seam only) | The existing **SVG cast** scenes |

Adding a key flips that row to the real provider with no code change — same switch
pattern as `isSupabaseConfigured()`.

## The pipeline (generate → moderate → review → approve → publish)

1. **Structured prompt only.** `StoryPromptSchema` (zod) — child, theme, character,
   length, optional featured name (adult-entered, length-capped, also moderated).
   There is no free-text-to-model path.
2. **Generate** (`/api/generate`, server). Gemini when keyed, else templates. Output
   is validated: scenes must be one of the allowed cast scenes or they're replaced.
3. **Moderate** (server). An automated screen that can only **reject** — it never
   approves. A flagged story is auto-blocked and never stored or shown.
4. **Pending review.** A passing story is stored as `pending_review` (cloud: in
   Postgres under the parent, RLS-scoped; local: in the studio store). A child still
   can't see it — `pending_review` is not `published_*`.
5. **Human approval gate.** The parent previews and taps **Approve** → the story
   becomes `published_profile` for *that one child*. Parents never publish to the
   global library. In cloud mode the DB **approval-gate trigger** still independently
   requires an approval timestamp + moderation verdict, so this can't be bypassed.

Two automated layers and one human layer, exactly as in docs/plan/04 — the human is
always the final gate, even when (especially when) the $0 fallbacks are in use.

## Read-along narration (TTS)

Every reader page now has a **🔊 Listen** button. With no key it uses the browser's
Web Speech API (picks an `ur-PK` / `en` voice when the device has one); when Azure
audio is later pre-generated into `page.audio[lang]`, the same button plays that
instead. Narration stops automatically on page-turn and exit.

## Feature status

| Feature | Status |
|---|---|
| Structured (no-free-text) generation prompt | ✅ Done |
| `/api/generate` route, parent-auth-gated in cloud mode | ✅ Done (401 verified) |
| Gemini text generation + deterministic $0 template fallback | ✅ Done |
| Moderation screen (OpenAI + keyword fallback), auto-block on flag | ✅ Done |
| Pending review queue (cloud + local), dual-mode | ✅ Done |
| Parent approval → `published_profile` (per child) | ✅ Done |
| DB approval-gate trigger still enforces publish (cloud) | ✅ From Sprint 2, exercised here |
| Read-along narration (Web Speech now, Azure-ready) | ✅ Done |
| Illustrations | ◑ SVG cast scenes (Flux raster seam deferred — keeps $0/offline) |
| Generated content obeys the visibility invariant | ✅ Tested (`generated.test.ts`) |

## What I need from you — nothing required; keys optional

Sprint 3 works **right now with the keys you already added** (Supabase) and nothing
else — generation uses the built-in templates and browser narration. To turn on the
real AI providers (all permanent-free), drop any of these into `apps/web/.env.local`:

- `GEMINI_API_KEY` — Google AI Studio (aistudio.google.com) → "Get API key". Free.
- `OPENAI_API_KEY` — platform.openai.com. The moderation endpoint is free.
- `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` — Azure Speech, F0 tier. Free.

Add them one at a time or all at once — each independently upgrades its row in the
table above. No DB step this sprint (the schema from Sprint 2 already has the
`pending_review` / approval columns).

> **Try it now:** Parent dashboard → "Create a story with AI" → pick a child + lesson
> → **Create story** → it appears under "Review & approve" → **Approve** → open Kid
> Mode as that child and the new story is there, with a Listen button.

## How to run it

```
cd apps/web
npm install
npm run dev        # cloud mode (your Supabase keys); templates + browser TTS until AI keys added
npm test           # 17 tests incl. generator, moderation, and the generated-content invariant
npm run build
```
