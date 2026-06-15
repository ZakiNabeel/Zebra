# 🦓 Zebra — Costs & Monetization

> Part of the [Zebra Master Plan](../../README.md). Goal: minimum cost to launch, honest unit economics, revenue from schools first. Last updated: 2026-06-15.

## 0. The $0 MVP path (this is the build target)

**The entire MVP ships for literally zero dollars.** Every piece runs on a permanent free tier. Nothing here is a trial that expires — these are standing free allowances we stay inside by design (generate-once-serve-forever keeps us far below every cap).

| Need | $0 choice | Free allowance | Why we stay inside it |
|---|---|---|---|
| Web hosting | **Vercel Hobby** | Unlimited static, generous bandwidth | PWA is mostly static + CDN-cached content |
| Backend (DB, auth, storage, RLS) | **Supabase Free** | 50K MAU · 500MB DB · 1GB storage | Kids consume cached files; no Realtime fan-out (see §note) |
| Domain | **`zebra.vercel.app`** subdomain | Free | Custom domain ($12/yr) waits for revenue |
| Story/quiz/slide text | **Google AI Studio (Gemini Flash)** | Free tier, ~15 req/min, 1500/day | Generation is adult-initiated + cached; batch the library |
| Narration (TTS) | **Azure Speech Free (F0)** | 0.5M chars/month free | A whole seed library is ~50–100K chars; render once |
| Illustrations | **Cloudflare Workers AI (Flux-1-schnell)** | ~10K Neurons/day free | Batch-generate library art; or ship the SVG cast (free forever) |
| Text moderation | **OpenAI Moderation API** | Free, unlimited | Runs on every generation |
| Image moderation | **Cloudflare Workers AI / Google Vision SafeSearch** | Free allowance / 1K-img/month | One check per generated image |
| Analytics | **PostHog Free** (adult surfaces only) | 1M events/month | Kid Mode sends nothing anyway |

**Deferred until you have revenue or traction (NOT needed for the MVP):**
- ❌ Google Play ($25) & Apple Developer ($99) — **the PWA installs to a phone home screen for free.** We package native apps only once schools/parents are paying.
- ❌ Commissioned character art — **the built-in SVG cast is genuinely $0 and ships today.** Commission model sheets when revenue exists; until then, free AI image gen (Cloudflare/HF) plus the SVG cast carry us.
- ❌ Paid image APIs (fal.ai/Replicate), ElevenLabs, real AI video — all replaced by free-tier equivalents above for the MVP.
- ❌ Lawyer/trademark — needed before signing a *paying* school, not before the demo.

> **Note on Supabase scale (validated 2026-06-15):** Supabase = managed Postgres, so normal SQL indexing/RLS discipline is all it takes to scale. The free tier's one hard wall — **200 concurrent Realtime connections** — is a live-chat/cursors problem. Zebra streams nothing live to kids (content is static + CDN-cached), so that cap never binds us. We only move to Pro ($25/mo: 100K MAU, 8GB DB, daily backups) when the DB outgrows 500MB — a success milestone, not a launch cost. Keep `user_id`/`profile_id` indexed (the columns used in RLS) and queries stay <50ms.

## 1. The cost insight that makes Zebra cheap

**Generate once, serve forever.** The expensive thing is AI generation; the cheap thing is serving cached content. So:

- The **shared library** (stories, audio, quizzes, knowledge packs) is generated *once* — much of it during build week using free tiers — then served as static files to every child. Marginal cost per child ≈ CDN bandwidth ≈ ~0.
- **Custom generation** (a parent's personalized story, a teacher's presentation) is the only metered cost — and it's an *adult-initiated, quota-able* action. That's exactly where pricing goes.
- **Kids consuming content costs us nothing.** A child can read, listen, color, and play all day for fractions of a cent in bandwidth.

## 2. Unit costs (creation-time, 2026 prices, rounded)

| Action | Pipeline | Cost |
|---|---|---|
| Story text (~800 words) | Gemini Flash-Lite | < $0.001 |
| Story illustrations (4 images) | FLUX schnell (+LoRA) | $0.01–0.15 |
| Story narration (~5,000 chars) | Azure TTS | ~$0.08 (free under 0.5M chars/mo) |
| **Fully illustrated, narrated custom story** | all of the above + moderation | **≈ $0.10–0.25** |
| Comic (6 panels, character LoRAs) | FLUX dev + LoRA | $0.10–0.25 |
| Coloring page | FLUX line art | < $0.03 |
| Teacher presentation (10 slides, 5 images) | Gemini + FLUX | $0.02–0.20 |
| Motion story (Remotion render) | compute only | ~$0.01–0.05 |
| Quiz/worksheet | Gemini Flash-Lite | < $0.001 |
| ⚠️ Real AI video (5 min, Veo/Kling class) | — | **$30–150+** → not a per-user feature; batch flagship content only (P2) |
| Character LoRA training | Replicate/fal | $2–5 one-time × 6 characters |

**Rule of thumb: every metered creation costs $0.10–0.25.** Price quotas so a paying user can never cost more than ~20% of their fee.

## 3. Fixed & infrastructure costs

| Item | Pilot (0–1K users) | Growth (5–10K MAU) |
|---|---|---|
| Vercel | $0 (hobby) | $20/mo |
| Supabase | $0 (free tier) | $25/mo + storage |
| Domain | ~$12/yr | — |
| PostHog, moderation APIs | $0 (free tiers) | ~$0–50/mo |
| AI generation (with quotas) | $0–30/mo | $150–400/mo |
| **Total run-rate** | **≈ $0–40/mo** | **≈ $250–500/mo** |

One-time: Google Play $25, Apple Developer $99/yr, character design (illustrator) $200–800 well spent, trademark + legal session (budget ~$300–500 equivalent locally). **Total cash to launch: under ~$500 even being generous.**

## 4. Should income be ads? — Recommendation: **no ads in v1, and never in Kid Mode**

Honest assessment of the ads idea:

1. **Compliance:** ads to under-13s trigger COPPA/Play-Families rules — only certified kid-safe networks (Kidoz, SuperAwesome, AdMob families config), contextual-only. Apple's Kids Category effectively prohibits third-party ad SDKs. Half the distribution channel resists the model.
2. **Economics:** Pakistani eCPMs are among the world's lowest (~$0.10–0.50 banners, ~$1–3 rewarded). 10,000 very active kids might earn **$50–300/month** — it won't cover support email, but it will cost trust.
3. **Brand:** our entire pitch is "the safe alternative to ad-funded YouTube Kids." Ads in the child experience contradict the product's reason to exist; parents in our pilot interviews will say so.

Acceptable later (P2): tasteful **sponsorships** on parent/teacher surfaces only (e.g., "Knowledge pack supported by [publisher]"), house promos for our own paid tiers. Nothing in Kid Mode, ever.

## 5. The actual revenue model — three streams, in order

### 5.1 Schools (B2B) — primary, start here
High-margin (marginal cost per school ≈ a few dollars of generation), invoice-billed, and the trust channel to parents.

| Tier | Price (hypothesis — validate in pilot) | Includes |
|---|---|---|
| Founding pilot | Free for 1 term | Full access, feedback obligation, logo/testimonial rights |
| Per-campus | **PKR 3,000–8,000/month** (annual invoice) | All teacher tools, presentation maker, printables, up to N teachers, class share codes |
| School network / chain | Custom | Multi-campus admin, training session, priority support |

Context: low-cost private schools charge PKR 1,500–4,000/month per child — a campus license costing *less than two students' monthly fees* is an easy yes if it saves each teacher an hour a week.

### 5.2 Parents (freemium) — secondary
| | Free | **Zebra Plus** (~PKR 500–800/mo or ~PKR 4,000–6,000/yr) |
|---|---|---|
| Shared library (stories, audio, games, quizzes) | ✅ Full | ✅ Full |
| Child profiles | 1 | Up to 4 |
| Custom AI stories | 3/month | 30/month |
| Comics & coloring-page generation | — | ✅ Quota'd |
| Motion stories | — | ✅ Quota'd |
| Offline downloads | 5 items | Unlimited |
| Personalization (child's name in stories) | ✅ | ✅ |

Notes: the free tier must be genuinely good (it's the school-to-home funnel and the mission — democratization). The paid line sits exactly on the metered-cost features, which answers "should I charge for some features": **yes — charge for creation quotas (stories, comics, motion stories, audio minutes), never for consumption or core learning.** Billing: Play/Apple IAP in apps; Safepay/JazzCash/Easypaisa on web (Stripe unavailable in Pakistan).

### 5.3 Content & IP — later
Printable packs (one-off PKR purchases), licensed character merchandise/books once the cast has fans, NGO/CSR-funded free school licenses (telcos and banks in Pakistan fund education CSR — a real channel for "sponsored democratization").

## 6. Break-even sketch

Growth-phase run-rate ≈ $400/mo ≈ PKR ~115K/mo. That's ~**20–35 school campuses** *or* ~**250–350 Plus parents** — either alone covers costs. Everything beyond is margin to fund the content library and characters.

## 7. Cost discipline rules (engineering)

1. Every generation result is cached and reusable; identical structured prompts are deduplicated.
2. Quotas enforced server-side per account; hard monthly platform spend cap with alerting at 50/80/100%.
3. Default to the cheapest model that passes quality review (Flash-Lite before Flash before Claude; schnell before dev).
4. TTS and images are rendered once at approval time, never at view time.
5. No real-time generation in any child-facing path (also a safety rule — see [04-safety-and-compliance.md](04-safety-and-compliance.md)).
