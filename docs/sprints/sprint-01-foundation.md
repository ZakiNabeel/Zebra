# 🦓 Sprint 1 — Foundation (Web Skeleton, Kid Mode, Library)

> Date: 2026-06-11 · Status: **shipped** · Build: ✅ `npm run build` clean · Tests: ✅ 8/8 passing
> Sequence diagrams: [sprint-01-sequence-diagrams.md](sprint-01-sequence-diagrams.md)

## What happened this sprint

The Flutter codebase was archived to `legacy/flutter-app/` and Zebra was rebuilt from zero on the new stack: **Next.js 16 + TypeScript + Tailwind v4** in `apps/web`, exactly per [docs/plan/03-tech-stack.md](../plan/03-tech-stack.md). The app runs fully **local-first** (no accounts or API keys needed yet — everything persists in the browser), which means you can demo it today on any laptop, tablet, or phone browser.

What a parent can do right now:
1. Open the app → onboard: family name, app language (English/اردو), a 4-digit parent PIN (set + confirm), and a first child profile (name, age band, story language, avatar).
2. Land on the **Parent Dashboard**: manage child profiles, see the library count, see what's coming next.
3. Hand the device to a child in **Kid Mode**: profile picker → child's own library (filtered to their age band and language) → full-screen story reader with page-by-page art, progress dots, and a celebration screen at the end.
4. The child cannot get out: leaving Kid Mode or reaching anything adult requires the **PIN parental gate**. Entering Kid Mode re-locks the parent area automatically.

Three original-cast stories ship as the seed library, fully bilingual (English + Urdu, proper Nastaliq rendering, RTL layout):
- *Zee Learns to Share / زی نے بانٹنا سیکھا* (sharing, ages 3–8)
- *Dada Kachwa and the Truth / دادا کچھوا اور سچ* (honesty, ages 6–12)
- *Sitara Counts the Stars / ستارہ ستارے گنتی ہے* (counting, ages 3–5)

Characters appear as hand-drawn placeholder SVG scenes (Zee, Dada Kachwa, Mano, Sitara) — to be replaced by real model-sheet art and Rive animation.

## The safety invariant is already enforced and tested

`storiesForProfile()` is the single gate deciding what a child sees: only `published_*` content, scoped to their profile and age band — even deep links to a story URL pass through it. The test suite ([filter.test.ts](../../apps/web/src/lib/content/filter.test.ts)) proves draft/pending/rejected/foreign-profile content is invisible, and CI-blocking is planned. The matching **Supabase schema + RLS policies + a database trigger that refuses to publish anything without an approver and a moderation verdict** is already written in [supabase/migrations/0001_init.sql](../../supabase/migrations/0001_init.sql), ready for sprint 2.

## Feature status

| Feature (plan ref) | Status |
|---|---|
| Repo restructure, Flutter archived | ✅ Done |
| Next.js app scaffold, brand theme, kid-friendly design system | ✅ Done |
| Urdu/English UI with RTL + Nastaliq | ✅ Done (Urdu copy needs native-speaker review) |
| Onboarding (family, PIN, first child) | ✅ Done |
| Parent dashboard (profiles CRUD, library overview) | ✅ Done |
| PIN parental gate + Kid Mode lockdown | ✅ Done (local mode) |
| Story library + reader (text + art, bilingual) | ✅ Done |
| Seed stories (3, original cast) | ✅ Done |
| Safety filter + tests | ✅ Done (8/8 green) |
| Supabase schema + RLS + approval-gate trigger | ✅ Written, ⏳ not yet deployed (needs your Supabase project) |
| Audio narration (TTS) | ⏳ Sprint 2 — needs Azure key |
| AI story generation + approval queue | ⏳ Sprint 3 — needs Gemini + OpenAI keys |
| Spelling/maths games, coloring | ⏳ Sprint 4 |
| School workspace | ⏳ Sprint 5 |
| PWA offline, Capacitor builds | ⏳ Sprints 6–7 |

## Decisions made (and why)

- **Local-first sprint 1:** zero keys → demoable immediately, and it becomes the permanent offline/demo path. Supabase slots in behind the same store actions.
- **Profile-based language, not URL locales:** a parent browsing in Urdu can have one child reading in English and another in Urdu — language lives on the profile/app state, not the route.
- **Placeholder SVG cast now:** keeps the reader beautiful enough to demo while real character design happens in parallel; the art system swaps per-scene without touching stories.

## What I need from you (Zakin)

1. **Supabase project** (free tier) — create at supabase.com, send URL + anon key + service-role key → unlocks sprint 2.
2. **API keys when ready:** Google AI Studio (Gemini), Azure Speech (ur-PK voices), fal.ai or Replicate, OpenAI (moderation only). See [apps/web/.env.example](../../apps/web/.env.example).
3. **Character art:** approve/adjust the cast names ([docs/plan/02-features.md](../plan/02-features.md) §6) and commission model sheets — the single best money you can spend this month.
4. **Urdu review:** 30 minutes from a native speaker over `dictionaries.ts` and the three seed stories.
5. **Store accounts:** start Google Play ($25) and Apple Developer ($99) registrations now — review queues take days.

## How to run it

```
cd apps/web
npm install
npm run dev    # http://localhost:3000
npm test       # safety + PIN suite
```
