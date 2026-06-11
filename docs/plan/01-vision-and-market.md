# 🦓 Zebra — Vision & Market Plan

> Part of the [Zebra Master Plan](../../README.md). Last updated: 2026-06-11 (post-pivot).

## 1. Mission

**Zebra is the safe, nourishing alternative to YouTube Kids for children under 12 — built Pakistan-first, in Urdu and English.**

YouTube Kids is passive, algorithm-driven, ad-funded, and repeatedly fails at content safety. Zebra inverts every one of those properties:

| YouTube Kids | Zebra |
|---|---|
| Infinite algorithmic feed | Finite, curated, age-banded library |
| Passive watching | Active learning: reading, spelling, maths, coloring, quizzes |
| Anyone can upload | Only Zebra, approved teachers, and the child's own parents create content |
| Ad-funded, behavioral tracking | No ads in the child experience, no tracking of children |
| Generic global content | Urdu + English, Pakistani culture, morals & ethics woven into stories |

**One-line pitch:** *"Everything your child watches, reads, and plays on Zebra was either made by us, their teacher, or you — and it teaches them something."*

## 2. Three pillars

1. **Education** — basic literacy (English + Urdu spellings, alphabets, letter tracing), basic maths, and knowledge packs (history, geography, space, nature) as games, fact cards, and quizzes.
2. **Nourishment** — stories (text, narrated audio, comics) that carry morals, ethics, and good teachings; culturally rooted in Pakistan, not imported.
3. **Creation** — generative AI tools for *adults* (parents and teachers) to create personalized stories, comics, coloring pages, and classroom presentations. Children consume; adults create. This is the core safety stance and the core differentiator.

## 3. Target users

### Children (the consumers) — under 12, in three age bands
- **3–5 (Pre-school):** narrated stories, coloring, alphabet tracing, shapes/counting. Minimal text, large touch targets, audio-first.
- **6–8 (Primary):** read-along stories with word highlighting, spellings, basic maths drills, comics, simple quizzes.
- **9–12 (Upper primary):** longer stories, knowledge packs (history/geography/space), creative reading, harder quizzes.

Every content item is tagged with an age band; a child profile only ever sees its band (and optionally one below).

### Parents (the buyers & creators)
What Pakistani parents of under-12s want (validate in pilot interviews):
- **Safety above all** — no rabbit holes, no strangers, no ads, no chat. They currently hand over YouTube Kids with guilt.
- **Visible learning** — "my child learned 20 English words this week" beats "watched 3 hours."
- **Values alignment** — moral stories, adab/akhlaq, respect for elders. This is a buying trigger in this market that global apps cannot serve.
- **Bilingual development** — English for opportunity, Urdu for identity. Both, not either.
- **Screen-time control** — daily limits enforced by the app, not by fighting.
- **Works on what they own** — low-cost Android phones and tablets, shared family devices, patchy internet (offline downloads matter; load-shedding is real).
- **Personalization** — a story where the hero shares their child's name is magic. This is our gen-AI hook for parents.

### Schools (the first go-to-market) — see §5
What schools want:
- **Teacher time-saving** — generate a fun, illustrated presentation or story for tomorrow's lesson in 5 minutes. Teachers in low-cost private schools are overloaded and underpaid; this is the killer feature.
- **Curriculum alignment** — content mappable to Pakistan's Single National Curriculum (SNC) topics for KG–Grade 5.
- **Classroom display mode** — one screen/projector, whole class follows along (most classrooms have at most one device).
- **Printables** — worksheets, spelling lists, and coloring pages as PDFs. Print culture dominates; this makes Zebra useful even in zero-device classrooms.
- **Class libraries & share codes** — teacher publishes a story/quiz to the class; kids open it at home with a code (this is also our parent-acquisition channel).
- **Progress visibility** — simple per-class reports for principals and parent-teacher meetings.
- **Urdu-medium support** — full Urdu UI, not just Urdu content.
- **Low cost, simple billing** — annual invoice, bank transfer, founding-school discounts.

## 4. Market context (Pakistan-first)

- ~80M Pakistanis are under 15; under-12s are our wedge. Massive, underserved in local-language digital education.
- Device reality: low-cost Androids dominate; iOS is a minority but matters for premium parents and credibility. Browsers work everywhere → **web-first (PWA) is the democratization play**, with Play Store and App Store apps from the same codebase.
- Connectivity reality: data is metered, power is intermittent → offline caching and small payloads are product features, not nice-to-haves.
- Payments reality: low card penetration; JazzCash/Easypaisa wallets and bank transfer dominate. Stripe does not operate in Pakistan (see [05-costs-and-monetization.md](05-costs-and-monetization.md)).
- Competition: YouTube Kids (default, distrusted), Khan Academy Kids (excellent but English-only, US-curriculum, no creation tools), local edtechs (mostly exam-prep for older students). **Nobody owns "safe Urdu/English content + creation tools for under-12s."**

## 5. Go-to-market: schools first, parents through schools

**Phase 1 — Founding schools (months 1–2):** Sign 5–10 private schools in one city as free/discounted pilots. The wedge product is the **teacher presentation & story maker** + classroom display mode + printables. Success metric: teachers use it weekly without prompting.

**Phase 2 — School-to-home (months 2–4):** Class share codes put Zebra on parents' phones ("Miss Ayesha shared a story for homework"). The school is the trust signal that no ad campaign can buy. Convert parents to free accounts → Zebra Plus.

**Phase 3 — Direct to parents (months 4+):** App stores + social proof from schools. Content marketing: free printable packs, moral-story reels (made with our own characters — they double as marketing assets).

## 6. Success metrics

- Pilot: ≥5 schools active, ≥60% of pilot teachers creating ≥1 item/week, ≥30% of shared-code parents install/sign up.
- Child engagement: weekly active kids, *learning actions* per session (words spelled, pages read, quizzes done) — not watch time. We deliberately do not optimize for time-on-app.
- Safety: zero unreviewed AI content shown to a child, ever. This is a hard invariant, tracked as a metric (see [04-safety-and-compliance.md](04-safety-and-compliance.md)).

## 7. Decisions log (this pivot, 2026-06-11)

- ❌ Scrapped: Flutter client, on-device SLM ("Edge AI") as the v1 architecture. Kept as a future cost-optimization idea only.
- ✅ Web-first PWA + Play Store + App Store from one codebase (see [03-tech-stack.md](03-tech-stack.md)).
- ✅ Languages: **Urdu + English only** for v1. (French/Arabic/Spanish/Italian/Hindi spellings deferred to later; architecture keeps language as data, so adding them is content work, not code work.)
- ✅ Schools-first GTM; parents second; kids never the customer.
- ✅ Own original characters (see [02-features.md](02-features.md) §6).
- ✅ No third-party ads in the child experience (rationale in [05-costs-and-monetization.md](05-costs-and-monetization.md)).
