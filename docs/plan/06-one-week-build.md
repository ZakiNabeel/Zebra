# 🦓 Zebra — One-Week Build Plan (with Claude Code)

> Part of the [Zebra Master Plan](../../README.md). Target: a deployed, school-demoable MVP in 7 days. Each day ends with something shippable. Last updated: 2026-06-11.

## 0. Scope honesty

One week gets a **strong MVP**, not the full catalog: kid mode + library + AI story creation with the approval gate + spelling & maths games + audio narration + coloring, deployed as a PWA, with Capacitor builds started. The school presentation maker and comics land in week 2 — pilots can be signed on the week-1 demo.

## 1. Pre-week checklist (do before Day 1 — half a day)

- [ ] Accounts + API keys: Supabase, Vercel, Google AI Studio (Gemini), Azure Speech, fal.ai or Replicate, OpenAI (moderation), PostHog. Put keys in a password manager; never in the repo.
- [ ] Google Play ($25) and Apple Developer ($99) registrations started — review queues take days.
- [ ] Google Stitch sessions: generate concepts for the 6 key screens (kid home, story reader, spelling game, coloring, parent dashboard + review queue, create-story wizard) in English and Urdu/RTL variants. Export references.
- [ ] Character cast v0: even placeholder model sheets for Zee + Dada Kachwa (2 characters are enough for MVP); commission proper sheets in parallel.
- [ ] Content seeds: 20 English + 20 Urdu age-banded word lists, 10 moral-story prompts, maths drill ranges per band. (Claude Code can draft; you review.)
- [ ] Archive the Flutter app to `legacy/` so the repo is clean.

## 2. The seven days

### Day 1 — Skeleton & identity
Monorepo scaffold (Next.js + TS + Tailwind + shadcn, Supabase migrations/RLS, packages per [03-tech-stack.md](03-tech-stack.md) §4). Auth (parent sign-up, login), child profiles (name, age band, language), **Kid Mode shell with PIN parental gate**, RTL + Urdu font pipeline, design tokens from Stitch concepts. Deploy to Vercel from hour one.
**Ship check:** a parent can sign up, create a child profile, enter locked Kid Mode in Urdu or English, and exit only via PIN — on a phone browser.

### Day 2 — Library & story reader
Content schema (story = pages of {text, image, audio} + tags + age band + language + status). Story reader: page-turn UI, image + text, audio playback with word highlighting (timed via TTS word boundaries). Library grid filtered by profile's age band via RLS. Seed 5 hand-finished stories (2 EN, 2 UR, 1 bilingual) using the generation pipeline offline.
**Ship check:** a 7-year-old can pick a story and read/listen to it end to end.

### Day 3 — The golden path: AI story creation + approval gate
Create-story wizard (theme, moral, age band, language, child's name, characters) → Edge Function: Gemini generation → moderation stack (OpenAI moderation + rule layer + LLM judge) → `pending_review` → parent review screen (edit text, regenerate page, approve/reject) → published to that child's library. Audit log on every step. **This is the product; spend the whole day on it.**
**Ship check:** the invariant holds — nothing reaches Kid Mode without moderation + approval, enforced by RLS (write a test that proves it).

### Day 4 — Audio + images join the path
Approval triggers render jobs: Azure TTS narration (per page, ur-PK/en voices) and FLUX illustrations (with character LoRA if trained; style-guide prompt otherwise), SafeSearch moderation on every image, assets to Supabase Storage, CDN-cached. Read-along highlighting wired to real timings.
**Ship check:** a custom story comes out fully illustrated and narrated for ≈ $0.10–0.25, automatically.

### Day 5 — Learn & play: spellings, maths, coloring
Spelling game (hear-and-arrange + picture-spell, EN + UR word lists), maths drills engine (counting/add/subtract/tables by band), stars + sticker rewards (simple), coloring canvas (flood fill, brushes, palette, save to gallery) over 10 pre-made line-art pages from our characters.
**Ship check:** a child can spell, do sums, and color on a touch device; parent sees progress counters.

### Day 6 — Offline, polish, safety pass
Service worker + IndexedDB downloads ("save this story"), low-end-device pass (image compression, bundle audit), screen-time limit enforcement, parent dashboard progress view, red-team prompt suite into CI, empty/error/loading states, Urdu copy review by a human.
**Ship check:** airplane-mode story reading works; red-team suite passes; app feels finished on a cheap Android.

### Day 7 — Packaging & demo
Capacitor wrap (Android first; iOS build started), store assets (icons, splash, screenshots, data-safety forms), landing page (Urdu/English) with the Safety Promise, a **school demo script** + a 90-second demo video (screen recording of the golden path), seed library expanded to 15+ stories via batch generation + your review.
**Ship check:** installable Android APK in hand; live URL you can put in front of a school principal on Day 8.

## 3. Cut lines (if a day runs over — cut in this order)

1. Capacitor/iOS packaging → PWA only for demo (works fine in a school).
2. Coloring → ship pre-made pages without the generator.
3. Read-along word highlighting → plain audio playback.
4. Motion stories, comics, presentation maker → already week 2.
5. **Never cut:** the moderation + approval gate, the PIN gate, RLS policies, Urdu support. These are the product.

## 4. Week 2–4 (so week 1 decisions don't paint us in)

- Week 2: **school workspace** — teacher roles, classes, share codes, presentation maker, printable PDFs. Sign 3–5 founding schools with the Day-7 demo meanwhile.
- Week 3: comics generator, motion stories (Remotion), Zebra Plus billing (IAP + Safepay/JazzCash).
- Week 4: pilot feedback loop, library to 50+ items, Play Store launch, iOS submission.

## 5. How to drive Claude Code through the week

- One feature branch per day-block; demand a passing `pnpm test && pnpm build` before merge; keep `CLAUDE.md` updated with stack conventions (RTL rules, RLS invariants, content schema) so every session starts smart.
- Write the safety invariant as an automated test on Day 3 and never let it go red.
- Batch content generation (stories, word lists, quizzes) is a great overnight Claude Code task — review queues in the morning.
