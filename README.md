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

- **2026-06-11 — Pivot:** scrapped the Flutter + on-device-SLM v1 architecture in favor of web-first Next.js (the `app/` Flutter project and `docs/architecture/` diagrams are retained as legacy reference). Languages narrowed to **Urdu + English**. Go-to-market: **schools first**.
- Next: pre-week checklist, then the one-week MVP build.

---
*Developed under the MIT License. See `LICENSE` for more information.*
