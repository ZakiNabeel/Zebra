# 🦓 Zebra

**The safe, nourishing alternative to YouTube Kids — education and moral stories for children under 12, built Pakistan-first in Urdu and English.**

Zebra is a walled-garden learning and stories platform. Children read, listen, spell, count, color, and play inside a locked Kid Mode. Parents and teachers — never children — use built-in generative AI to create personalized stories, comics, coloring pages, and classroom presentations. **No AI content ever reaches a child without automated moderation and explicit adult approval.** No ads, no algorithmic feed, no strangers.

## What's inside

- **Learn:** English & Urdu spellings, alphabet tracing, basic maths, knowledge packs (history, geography, space, nature)
- **Stories:** illustrated text stories with read-along audio narration (Urdu `ur-PK` + English voices), comics, moral & ethics themes
- **Create (adults only):** AI story generator with a hard approval gate, coloring-page and comic generators, teacher presentation maker with printable PDFs, "motion stories" (programmatic video)
- **Characters:** an original cast rooted in Pakistani nature — Zee the zebra, Mano the markhor, Sitara the snow leopard, Dada Kachwa the storyteller tortoise, and friends — animated with Rive, kept on-model in AI output via per-character LoRAs
- **Everywhere:** one codebase → browser PWA + Play Store + App Store (Next.js + Capacitor), offline-capable, smooth on low-cost Android devices

## The plan

| Doc | Contents |
|---|---|
| [01 — Vision & Market](docs/plan/01-vision-and-market.md) | Mission, age bands, what parents & schools want, schools-first go-to-market |
| [02 — Features](docs/plan/02-features.md) | Full feature catalog with priorities, character cast & IP pipeline |
| [03 — Tech Stack](docs/plan/03-tech-stack.md) | Next.js + Supabase + Capacitor, Google Stitch workflow, Rive animation, AI services |
| [04 — Safety & Compliance](docs/plan/04-safety-and-compliance.md) | Six-layer defense in depth, COPPA / GDPR-K / store policies, privacy minimization |
| [05 — Costs & Monetization](docs/plan/05-costs-and-monetization.md) | Unit economics, why not ads, school B2B + Zebra Plus freemium pricing |
| [06 — One-Week Build](docs/plan/06-one-week-build.md) | Day-by-day MVP plan driven with Claude Code |

## Status

- **2026-06-11 — Pivot:** scrapped the Flutter + on-device-SLM v1 architecture in favor of web-first Next.js (now archived in `legacy/flutter-app/`; old diagrams in `docs/architecture/` are legacy reference). Languages narrowed to **Urdu + English**. Go-to-market: **schools first**.
- **2026-06-11 — Sprint 1 shipped:** web foundation in `apps/web` — onboarding, PIN-gated Kid Mode, bilingual story library + reader, safety filter with tests, Supabase schema ready. ([report](docs/sprints/sprint-01-foundation.md) · [diagrams](docs/sprints/sprint-01-sequence-diagrams.md)).
- **2026-06-16 — Sprint 2 shipped:** Supabase live — parent accounts (email/password), cloud family/profiles/stories, and the safety invariant now enforced **in the database** (RLS + approval-gate trigger + `kid_library` RPC), with local mode preserved as the offline/test path. Schema applied, library seeded, RLS proven live. ([report](docs/sprints/sprint-02-supabase.md) · [diagrams](docs/sprints/sprint-02-sequence-diagrams.md)).
- **2026-06-16 — Sprint 3 shipped:** AI story generation behind the approval gate — adults create stories from a **structured prompt** (no free-text-to-model), an **automated moderation** screen can only reject, passing stories enter a **review queue**, and nothing reaches a child until a parent **approves** it (per child). Runs at **$0 with no AI keys** via deterministic story templates + browser Web Speech narration; add Gemini/OpenAI/Azure keys to upgrade each layer. ([report](docs/sprints/sprint-03-generation.md) · [diagrams](docs/sprints/sprint-03-sequence-diagrams.md)).
- **2026-06-16 — Sprint 4 shipped:** learning games + coloring — bilingual **Spelling** (letter tiles, Urdu joining handled), age-banded **Maths** drills, and a tap-to-fill **Coloring** studio with a saved gallery, plus a star-reward hub. Built **100% client-side** (questions generated in-browser, rewards/art in localStorage): the activity layer adds **zero backend cost at any scale** and works offline. ([report](docs/sprints/sprint-04-games-coloring.md) · [diagrams](docs/sprints/sprint-04-sequence-diagrams.md)).
- Next: Sprint 5 — school workspace (presentation maker, classes, printables).

## Run it

```
cd apps/web
npm install
npm run dev    # http://localhost:3000
npm test
```

---
*Developed under the MIT License. See `LICENSE` for more information.*
