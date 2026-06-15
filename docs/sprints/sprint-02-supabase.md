# 🦓 Sprint 2 — Supabase Goes Live (Cloud Auth, Cloud Data, DB-Enforced Safety)

> Date: 2026-06-16 · Status: **code shipped, awaiting one 60-second DB step** · Build ✅ · Tests ✅ 8/8
> Sequence diagrams: [sprint-02-sequence-diagrams.md](sprint-02-sequence-diagrams.md)

## What happened this sprint

Zebra went from "browser-only local mode" to a **real cloud backend on Supabase** — without losing the $0/offline local mode. The app now detects whether Supabase keys are present and runs in one of two modes from the same code:

- **Cloud mode** (keys present → your setup): real parent accounts (email + password), family/profiles/stories stored in Postgres, and the safety invariant **enforced inside the database** by Row-Level Security + a trigger.
- **Local mode** (no keys): exactly Sprint 1 — localStorage, no accounts, instant demo, used by the test suite.

The switch is a single source of truth (`isSupabaseConfigured()`), so every page works in both modes and nothing regressed.

### New in cloud mode
- **Parent accounts** — email/password sign-up and sign-in via Supabase Auth, sessions kept in cookies and refreshed by a Next 16 **proxy** (the renamed middleware). Sign-out in the parent dashboard.
- **Cloud family & profiles** — onboarding now starts by creating the parent account, then the family (with hashed PIN) and first child, all written to Postgres under that account.
- **Cloud library** — Kid Mode reads stories through a `kid_library()` database function that *structurally cannot* return a draft or pending item, and only returns content for a profile the signed-in parent actually owns.

### The safety invariant is now enforced in the database
Sprint 1 enforced "kids only see published content" in app code + tests. Sprint 2 makes the **database** refuse to break it, three ways:
1. **RLS policies** — the public/anon role can read only `published_library`; a parent can read/write only their own rows; nobody can read anyone else's drafts.
2. **An approval-gate trigger** — any attempt to set a row to `published_*` without an approval timestamp *and* a moderation verdict is rejected by Postgres with a `SAFETY:` error. This is what makes Sprint 3's AI generation safe by construction.
3. **The `kid_library()` SECURITY DEFINER function** — Kid Mode's only read path, which can't return unpublished rows even though it runs under the parent's session.

A runnable proof of all three lives in [`scripts/verify-rls.mjs`](../../apps/web/scripts/verify-rls.mjs).

## Feature status

| Feature | Status |
|---|---|
| Dual-mode data layer (cloud when configured, else local) | ✅ Done |
| Supabase browser + server clients, session proxy | ✅ Done |
| Parent email/password auth (sign-up, sign-in, sign-out) | ✅ Done (code) |
| Onboarding writes account + family + profiles to cloud | ✅ Done (code) |
| RLS policies + approval-gate trigger + `kid_library()` RPC | ✅ Written in `0001_init.sql` |
| Kid Mode reads library via the safe RPC | ✅ Done (code) |
| Seed script (library → cloud) + RLS verification script | ✅ Written |
| **Schema applied to your project + seeded + verified live** | ⏳ Needs the 60-second step below |
| Audio narration (TTS) | ⏳ Deferred to Sprint 3 — needs Azure key (not yet added) |
| Connectivity confirmed against your project | ✅ `auth` endpoint reachable, keys valid |

> **Note on TTS:** the plan paired Sprint 2 as "Supabase + audio/TTS." You added Supabase keys but not the Azure Speech key, so narration moves to Sprint 3 (it shares that sprint's generate→moderate→approve pipeline anyway). Everything else in Sprint 2 is done.

## What I need from you — ONE step (then I finish it live)

The only thing I can't do with the keys you gave me is create database tables (that needs your dashboard — by design, your keys don't grant raw schema access). It's 60 seconds:

1. Open your SQL editor: **https://supabase.com/dashboard/project/yqiiknoavwwkxyvkcovp/sql/new**
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](../../supabase/migrations/0001_init.sql) and click **Run**.
3. Tell me it's done — I'll then run `npm run db:seed` (loads the library) and `npm run db:verify` (proves RLS blocks unpublished content) against your live project.

**Recommended for a smooth demo:** in Authentication → Providers → Email, turn **off** "Confirm email" so sign-up works instantly without an email round-trip. (With it on, the app correctly shows a "check your email, then sign in" message — but off is friendlier for testing.)

*Alternative:* if you'd rather I automate schema pushes now and in future, create a Supabase **personal access token** (Account → Access Tokens) and share it — I'll use the Supabase CLI to apply migrations directly. The SQL-paste path needs no secret sharing, so it's the one I recommend.

## On the frontend redesign (you asked)

**Do it later — and here's why it's safe to wait.** Right now every screen pulls its colors, fonts, and copy from central tokens (`globals.css` `@theme`) and the i18n dictionary, and UI lives in small components (`Button`, `PinPad`, `StoryArt`, etc.). That means a visual redesign is mostly *re-skinning these tokens and components*, not rewriting screens. If we redesign now, we'd be re-skinning a UI that's still growing features (games, comics, school tools in Sprints 4–5). Better sequence: finish the feature surface, then do one focused **Google Stitch → polished component** pass in Sprint 6 (the "polish" sprint) when the screens to design are all present. The architecture is deliberately built so that pass is cheap.

## How to run it

```
cd apps/web
npm install
npm run dev        # cloud mode (your keys are in .env.local)
npm test           # safety + PIN suite (runs in local mode, no keys)
npm run db:check   # confirms connectivity + whether the schema is applied
```
