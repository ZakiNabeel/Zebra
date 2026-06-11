# Zebra — Agent Conventions

Read `docs/plan/` before building anything. `README.md` is the index.

## What this is
Safe kids' (under-12) learning & stories app. Pakistan-first, **Urdu + English only**. Web-first Next.js PWA in `apps/web`, later wrapped with Capacitor. `legacy/flutter-app/` is dead code — never touch it.

## Hard invariants (never weaken; safety review required to change)
1. **A child never sees content that is not `published_*`.** Enforced in `apps/web/src/lib/content/filter.ts` (local mode) + `supabase/migrations/` RLS & triggers (cloud mode). Tests in `filter.test.ts` must stay green.
2. **Children never prompt AI.** Generation is adult-only: structured prompt → moderation stack → `pending_review` → adult approval → published.
3. **Kid Mode is a walled garden:** no external links, no ads/analytics/trackers, no free-text input, exit only via PIN parental gate.
4. **Urdu is first-class:** every screen works RTL (`dir`), Urdu text uses `.urdu` class (Noto Nastaliq, line-height ≥2). Every UI string goes in `src/lib/i18n/dictionaries.ts` — both languages, no hardcoded copy.

## Stack & layout
- Next.js 16 (App Router, Turbopack) + TS + Tailwind v4 (`@theme` tokens in `globals.css` — use `bg-mango`, `text-ink`, etc., never raw hex in components).
- **Next 16 gotchas:** `params` is a `Promise` (`use(params)` in client pages); read `node_modules/next/dist/docs/` when unsure — training data may be stale.
- State: zustand (persisted stores in `src/lib/store/`); content types & zod schemas in `src/lib/content/types.ts`.
- Local mode (localStorage) is the current data layer; Supabase adapter arrives sprint 2 behind the same store actions.
- Placeholder art: `src/components/art/StoryArt.tsx` (SVG cast). Real model sheets + Rive later.

## Workflow
- Work happens in `apps/web`: `npm run dev` / `npm test` / `npm run build`. **Both `npm test` and `npm run build` must pass before any commit.**
- After each sprint: write `docs/sprints/sprint-NN-<name>.md` (what was done, feature status table, what's next, what we need from Zakin) + `docs/sprints/sprint-NN-sequence-diagrams.md` (mermaid diagrams of flows actually implemented).
- Commit style: `feat:`/`fix:`/`docs:`/`chore:` + body. No pushes unless asked.
- Costs: default to cheapest AI model that passes review; generation results are cached/shared; no per-view AI calls (see docs/plan/05).

## Sprint sequence (docs/plan/06-one-week-build.md)
1 ✅ foundation (auth-local, profiles, kid mode, library, reader) · 2 Supabase + audio/TTS pipeline · 3 AI story generation + approval gate + illustrations · 4 games (spelling/maths) + coloring · 5 school workspace · 6 offline/PWA + polish · 7 Capacitor + store packaging.
