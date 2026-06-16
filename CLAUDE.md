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
- **Next 16 gotchas:** `params` is a `Promise` (`use(params)` in client pages); **middleware is renamed `proxy.ts`** (we use `src/proxy.ts` for Supabase session refresh); read `node_modules/next/dist/docs/` when unsure — training data may be stale.
- State: zustand (persisted stores in `src/lib/store/`); content types & zod schemas in `src/lib/content/types.ts`.
- **Dual data mode:** `isSupabaseConfigured()` switches everything. Cloud mode = Supabase Auth + Postgres + RLS (real accounts); local mode = localStorage (no keys, offline/demo, used by tests). Same store actions (`useFamily`) and same Kid loader (`loadKidStories`) drive both. Cloud ops live in `src/lib/data/cloud.ts`; Kid Mode reads ONLY via the `kid_library()` RPC. Never let a child-facing path query the `stories` table directly.
- **AI pipeline (`src/lib/ai/`):** same fallback pattern as data mode — each provider has a real free-tier version AND a deterministic $0 fallback, switched by `isGeminiConfigured()`/`isModerationConfigured()`/`isAzureSpeechConfigured()`. Generation is server-only via `src/app/api/generate/route.ts` (parent-auth-gated in cloud mode); the adult studio calls `src/lib/data/studio.ts` (dual-mode persist). Flow: structured prompt (no free-text-to-model) → generate → moderate (can only reject) → `pending_review` → **human approve** → `published_profile`. Parents publish per-child only, never to `published_library`. Never add a free-text path from a child to a model.
- Placeholder art: `src/components/art/StoryArt.tsx` (SVG cast). Real model sheets + Rive later. Generated stories reference the same SVG scene keys (raster image-gen is a deferred seam).
- **Scalability is a hard requirement.** Default every feature to zero marginal backend cost. The activity layer (games in `src/lib/learn/`, coloring in `src/lib/art/`) is 100% client-side: questions are generated in-browser, rewards/saved art persist to localStorage (`store/progress.ts`, `store/gallery.ts`) — no per-play API call, no per-answer DB write, no image uploads (coloring saves a `{region→color}` fill-map, not a PNG). Keep it that way; never add a server round-trip to a per-interaction path. AI/cloud work stays adult-triggered, cached, and never per-view.

## Workflow
- Work happens in `apps/web`: `npm run dev` / `npm test` / `npm run build`. **Both `npm test` and `npm run build` must pass before any commit.**
- After each sprint: write `docs/sprints/sprint-NN-<name>.md` (what was done, feature status table, what's next, what we need from Zakin) + `docs/sprints/sprint-NN-sequence-diagrams.md` (mermaid diagrams of flows actually implemented).
- Commit style: `feat:`/`fix:`/`docs:`/`chore:` + body. No pushes unless asked.
- Costs: default to cheapest AI model that passes review; generation results are cached/shared; no per-view AI calls (see docs/plan/05).

## Sprint sequence (docs/plan/06-one-week-build.md)
1 ✅ foundation (auth-local, profiles, kid mode, library, reader) · 2 ✅ Supabase live (cloud auth, RLS, approval-gate trigger, kid_library RPC) · 3 ✅ AI story generation + approval gate + TTS (structured prompt → generate → moderate → review → approve; $0 fallbacks: templates + keyword screen + Web Speech; raster illustrations deferred seam) · 4 ✅ games (spelling/maths) + coloring — 100% client-side (generators in `src/lib/learn/`, coloring in `src/lib/art/coloring-pages.ts`; stars/gallery in localStorage stores; ZERO backend cost per play, works offline) · 5 school workspace · 6 offline/PWA + frontend redesign polish · 7 Capacitor + store packaging.
