# 🦓 Zebra — Child Safety & Compliance

> Part of the [Zebra Master Plan](../../README.md). This is the document we never compromise on. Last updated: 2026-06-11.

## 0. The invariant

> **No AI-generated content is ever shown to a child without (1) automated moderation AND (2) explicit approval by a verified adult.**

This is enforced in the database (Row-Level Security: child profiles can only read `published` rows), not just in the UI. It is also the product positioning: Zebra is safe *by architecture*, while YouTube Kids is safe *by filtering* — and filtering fails.

## 1. Defense in depth — six layers

1. **Walled garden.** No open internet content, no external links, no embedded web views, no search of the open web, no user-to-user content from strangers. The only content sources are: Zebra's reviewed library, the child's own parent, and their own teacher (within their class).
2. **Constrained generation.** Children never type prompts into an AI. Adults create through *structured* prompt builders (theme + moral + age band + characters + child name) — free-text is allowed for adults but passes input moderation first. System prompts hard-constrain output: age-appropriate vocabulary, no violence/romance/fear themes beyond age band, no real-world brands, characters from our cast only.
3. **Automated moderation on every output.**
   - Text: OpenAI Moderation API (free) → our keyword/topic rule layer (both Urdu and English — Urdu rules are hand-built; don't assume English-centric APIs catch Urdu) → LLM safety-judge pass ("is this appropriate for a 6-year-old Pakistani child? answer with category flags").
   - Images: Google Cloud Vision SafeSearch / Azure Content Safety on every generated image. Hard-block thresholds; failures are deleted, never queued.
4. **Human approval gate.** Whatever passes moderation lands in the adult's review queue as `pending_review`. The adult reads/edits/regenerates, then approves → `published` scoped to a profile, a class, or (Zebra staff only) the global library. Teachers' class-published content is additionally sampled by Zebra review during the pilot.
5. **Kid Mode lockdown.** Separate locked UI; exiting requires a parental gate (PIN + a hold-gesture or simple arithmetic — required by Apple Kids Category anyway). No purchases, no notifications, no data entry beyond first name/avatar. Screen-time limits enforced server-side per profile.
6. **Operational safety.** Audit log of every generation, moderation verdict, and approval (who/when/what). A red-team prompt suite (jailbreaks, innuendo, violence-by-implication, Urdu slang) runs against the generation pipeline in CI — releases block on it. Incident playbook: kill-switch flag that instantly unpublishes any content item across all caches.

## 2. Privacy & data minimization (children's data is a liability, not an asset)

- **Collect nothing about the child beyond:** first name (optional, can be a nickname), age band, language preference, and learning progress counters. No email, no photos, no location, no contacts, no voice (until/unless the P2 read-aloud feature is built to a much higher standard).
- Child profiles are not accounts; they hang off the parent's/school's account. The adult is the data subject of record.
- No third-party analytics, ads SDKs, or trackers load in Kid Mode. PostHog only on parent/teacher/marketing surfaces.
- Data deletion: parent can delete a profile (cascade-deletes progress + custom content) and their account, self-serve. Export on request.
- Encryption in transit everywhere; Supabase encryption at rest; PIN hashes, never plaintext.

## 3. Regulatory checklist

| Regime | Applies because | What we do |
|---|---|---|
| **COPPA (US)** | App stores distribute globally; the standard to design to | Verifiable parental consent at child-profile creation; data minimization above; no behavioral ads to children |
| **GDPR-K / UK AADC** | Same; AADC is the strictest design code — meet it and we meet most others | Age-appropriate defaults, no dark patterns, no nudges to extend use, high-privacy-by-default |
| **Google Play Families Policy** | Required for "designed for children" listing | Declare target age groups; only certified ad SDKs *if ads ever exist* (none in v1); content ratings; teacher-approved badge later |
| **Apple Kids Category** | Required for the kids listing | Parental gate before any commerce/links-out; **no third-party ads or third-party analytics in the kid experience**; privacy nutrition labels |
| **Pakistan (PECA / draft Personal Data Protection Bill)** | Home market | Local-law review before school contracts; keep school data residency story clean (document where data lives) |

Budget item: one session with a lawyer for the privacy policy, terms, school data-processing agreement, and trademark filing for the characters — do this before signing the first paying school.

## 4. School-specific safety

- Teachers are verified through the school admin account (admin invites teacher emails); no self-serve "I am a teacher" claims.
- Class share codes are scoped, expiring, and read-only: a code grants access to *that class's published items*, nothing else, and never exposes other children's data.
- Class progress reports show aggregates and per-child learning counters only — no behavioral profiling.

## 5. Brand promise (publish this)

A plain-language **Zebra Safety Promise** page, in Urdu and English, that parents and schools can read in two minutes: every claim above, stated simply, with a changelog. Safety is the marketing.
