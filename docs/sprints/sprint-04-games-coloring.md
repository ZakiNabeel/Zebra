# 🦓 Sprint 4 — Learning Games & Coloring (built to scale to zero cost)

> Date: 2026-06-16 · Status: **shipped** · Build ✅ · Tests ✅ 22/22
> Sequence diagrams: [sprint-04-sequence-diagrams.md](sprint-04-sequence-diagrams.md)

## What happened this sprint

Kid Mode is now a play hub, not just a library. Three new activities — **Spelling**,
**Maths**, and **Coloring** — sit above the story shelf, each bilingual (Urdu +
English, RTL-correct) and built to the walled-garden rules: no free-text input
(letter tiles & multiple-choice only), no links out, no AI prompting by children.

### The headline decision: scale at zero marginal cost
Per your "scalable at all costs" mandate, the entire activity layer is **100%
client-side**. Questions are generated in the browser from curated data; rewards and
saved art live in `localStorage`.

> **A million children can play spelling, maths, and coloring at the same time and
> our servers do exactly nothing.** There is no per-play API call, no per-answer DB
> write, no per-stroke upload. The marginal cost of the games is literally $0,
> independent of user count — the most scalable shape a feature can have.

This also keeps it offline-friendly (a bonus that matters for Pakistani classrooms
and low-end devices) and sets up the PWA work in Sprint 6.

## What shipped

**Spelling (`/kid/[id]/spell`)** — picture + read-aloud cue (Web Speech), then tap
letter tiles in order. Bilingual done right: for Urdu the answer area renders a real
substring of the target word so Nastaliq **joining stays correct**, while the tiles
teach isolated letter shapes. Age-banded word bank (`lib/learn/words.ts`), reshuffled
each round. A star per word spelled with no wrong taps.

**Maths (`/kid/[id]/maths`)** — multiple-choice drills that scale by age band:
counting + add-within-5 (3–5), add/subtract within 20 + comparison (6–8), add/subtract
within 100 + times tables (9–12). Generator in `lib/learn/maths.ts`; a star per
first-try-correct answer. No keyboard (invariant #3), no pressure mechanic — wrong
answers just let the child retry.

**Coloring (`/kid/[id]/color`)** — tap-to-fill SVG line-art (3 pages: Zee, a flower
garden, a starry night), full palette, undo, clear, and **Save to My Gallery**. Saved
art is stored as a tiny `{region → color}` map (a few hundred bytes), **not** an
image, so the gallery costs effectively nothing to keep and never touches a server.

**Rewards** — a per-child star total (`lib/store/progress.ts`) shown on the hub. No
streaks, no loot boxes, nothing compulsive (per docs/plan/02 §5).

## Feature status

| Feature | Status |
|---|---|
| Activity hub on the kid home (Spell / Maths / Color + Stories) | ✅ Done |
| Spelling game — bilingual, Urdu joining handled, age-banded | ✅ Done |
| Maths drills — age-banded generator, multiple-choice | ✅ Done |
| Coloring — tap-fill, palette, undo/clear, save | ✅ Done |
| My Gallery — saved fill-maps, thumbnails, remove | ✅ Done |
| Stars / rewards (local, no backend) | ✅ Done |
| Generator correctness tests (maths + words) | ✅ Done (22 passing) |
| Letter tracing, knowledge-pack quizzes | ◑ Deferred (P1, future sprint) |
| Cross-device progress sync | ◑ Deferred — local by design; opt-in cloud later without interface change |

## Scalability posture (cumulative)

- **Activities:** zero backend per play (this sprint).
- **Story reads:** the indexed `kid_library()` RPC; static art via CDN (Sprints 1–2).
- **AI generation:** adult-only, cached, never per-view (Sprint 3).
- **Database:** RLS columns indexed; free tier covers the pilot, Pro is a traction
  milestone, not a launch cost (Sprint 2 note).

Nothing added this sprint scales with cost. The only things that ever will (cloud DB
rows, optional AI keys) are adult-triggered and bounded.

## What I need from you — nothing

Sprint 4 needs no keys, no DB step, no config. It runs in both local and cloud mode
exactly the same (it doesn't depend on the backend at all).

> **Try it:** Kid Mode → pick a child → **Spelling / Maths / Coloring**. Spell a word,
> solve a few sums, color a page and hit Save — watch the star counter climb.

## How to run it

```
cd apps/web
npm install
npm run dev
npm test    # 22 tests incl. maths-generator correctness and word-bank integrity
npm run build
```
