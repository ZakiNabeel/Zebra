# 🦓 Zebra — Feature Catalog & Scope

> Part of the [Zebra Master Plan](../../README.md). Priorities: **P0** = build-week MVP, **P1** = month 1–2, **P2** = later. Last updated: 2026-06-11.

## 1. The three modes

| Mode | Who | What |
|---|---|---|
| **Kid Mode** | Child (no account of their own — a profile under the parent/school) | Locked-down, visual, audio-first. Consume library + approved custom content, play learning games, color. No free-text input to AI, no links out, no chat, ever. Exit requires parental gate (PIN + hold-to-confirm). |
| **Parent Dashboard** | Parent | Create child profiles (age band, language preference), generate & approve custom content, set screen-time limits, see learning progress, manage subscription. |
| **School Workspace** | Teacher / school admin | Everything parents have, plus: presentation maker, class management, share codes, printables (PDF export), class progress reports. |

## 2. Learn (P0 core)

- **Spellings — English & Urdu (P0):** age-banded word lists (curated JSON, SNC-aligned). Game loops: hear the word → arrange letters; picture → spell it; missing-letter fill-in. Urdu requires RTL + Nastaliq rendering and joined-form letter handling — treat Urdu as a first-class citizen, not a translation.
- **Alphabet & letter tracing (P1):** canvas-based tracing for English letters and Urdu huroof (initial/medial/final forms). Stroke guides + star reward.
- **Basic maths (P0):** counting, comparison, add/subtract within 100, times tables, simple word problems (band 9–12). Drill engine is one component fed by generated-then-approved question banks — near-zero marginal cost.
- **Knowledge packs (P1):** history (Pakistan + world for kids), geography (provinces, rivers, mountains, flags), space, animals/nature. Format: illustrated fact cards + 5-question quiz per pack. Batch-generated with AI, human-reviewed, published to the shared library.

## 3. Stories (P0 core)

- **Text story library (P0):** Zebra-published, illustrated, age-banded, tagged by theme (honesty, courage, kindness, sharing…) and language. Read-along mode highlights words as narration plays (band 6–8 literacy booster).
- **Audio stories (P0):** every library story ships with TTS narration (Urdu: Azure `ur-PK` neural voices; English: Azure neural voices). Generated once at publish time, cached forever — kids stream/download MP3s, no per-play AI cost.
- **Comics (P1):** 4–8 panel comics starring our characters. Generated via image model + character LoRAs, laid out from a JSON panel script, always human-approved before publishing.
- **Interactive/branching stories (P2):** "choose what Zee does next." Pre-authored branches only (no live generation in front of the child).

## 4. Create — the Gen-AI suite (adults only)

All creation flows: **adult writes a prompt → AI generates → automated moderation → adult reviews/edits/approves → only then visible to children.** Children never prompt the AI directly. See [04-safety-and-compliance.md](04-safety-and-compliance.md).

- **Story generator (P0):** parent/teacher picks theme, moral, age band, language, and optionally the child's name + our character cast → illustrated story draft → approve → appears in the child's library. The flagship personalization feature.
- **Coloring page generator (P0.5):** prompt → black-and-white line art page. Also: every library story illustration available as a coloring page. Printable PDF for schools.
- **Comic generator (P1):** prompt → panel script → images with character LoRAs → review grid → approve.
- **Presentation maker — schools (P1, the school wedge):** teacher enters topic + grade → 8–12 illustrated, kid-friendly slides (Urdu or English) → edit → present full-screen in class → export PDF. Built as templated slide JSON rendered in-app; PDF export for printing.
- **Worksheet/printable generator (P1):** spelling lists, fill-in-the-blanks, maths drills as printable PDFs. Disproportionately valuable in Pakistani classrooms.
- **Motion stories — the video strategy (P1.5):** *not* AI video generation. Pipeline: story images + TTS narration + word-highlight captions + Ken Burns pan/zoom + character animation stickers, rendered programmatically (Remotion). Looks like video, costs pennies. True AI video gen (Veo/Kling class) is P2+ and only for batch-produced flagship library content — never per-user (cost rationale in [05-costs-and-monetization.md](05-costs-and-monetization.md)).

## 5. Play & motivate

- **Coloring canvas (P0.5):** touch/stylus/mouse painting on line-art pages — flood fill, brush sizes, palette, undo, save to "My Gallery" (visible to parent). Works on tablets, touch laptops, and phones.
- **Rewards (P1):** stars for completed activities → unlock stickers of our characters. No streaks-pressure mechanics, no loot boxes, nothing that exploits compulsion.
- **Read-aloud karaoke (P2):** child reads into the mic, app scores fluency. (Speech processing + recording a child's voice = heavy privacy lift; do properly or not at all.)

## 6. Characters & IP — our own cast 🦓

Original characters are the moat: they make Zebra recognizable, keep AI output on-brand, and become marketing assets. **Proposed cast** (names/designs to finalize — all rooted in Pakistani nature & culture, all ours, trademark them early):

| Character | Animal | Personality / teaches |
|---|---|---|
| **Zee** | Zebra | Curious lead; bilingual narrator; loves letters & words (stripes = ink on paper) |
| **Mano** | Markhor (national animal) | Brave mountain climber; courage, history, never giving up |
| **Sitara** | Snow leopard | Quiet stargazer; space, science, curiosity ("sitara" = star) |
| **Bholu** | Indus river dolphin (bhulan) | Playful explorer; rivers, geography, nature |
| **Cheeko** | Chakor partridge | Chatty traveler; maps, places, cultures |
| **Dada Kachwa** | Old tortoise | The storyteller; morals, ethics, patience — opens every moral story |

**Production pipeline:**
1. Design model sheets (front/side/expressions) — commission one illustrator or design in Illustrator/Krita; keep vector sources. This is the one thing worth spending real money on early.
2. **In-app animation: Rive** — rig each character with state machines (idle, talk, celebrate, sad). Tiny files, runs natively on web/iOS/Android, interactive (Zee reacts when tapped). Free editor tier.
3. **AI consistency: one LoRA per character** — train on the model sheets (~$2–5 one-time each on Replicate/fal.ai) so every generated story illustration and comic panel keeps each character on-model.
4. **Video content later: Blender Grease Pencil** (free) or After Effects for longer animated episodes — P2.

Style guide (colors, proportions, do/don'ts) lives in `docs/brand/` and is included in every image-generation prompt.

## 7. Platform & democratization (P0)

- **One codebase → three surfaces:** responsive PWA (any browser, any laptop/tablet/phone — the democratization play), Android app on Play Store, iOS app on App Store (via Capacitor wrap of the same app).
- **Offline:** library stories, audio, and word lists downloadable; service-worker caching; sync on reconnect.
- **Low-end friendly:** target smooth use on a 2GB-RAM Android; aggressive image compression (AVIF/WebP), audio at modest bitrates, no heavy runtime.
- **Urdu-first UI:** full RTL layout, Noto Nastaliq Urdu font, language toggle on every screen.

## 8. Explicitly out of scope (v1)

- Public user-generated content, social features, comments, or child-to-child sharing.
- Live AI chat for children (even "safe" chatbots — not in v1; the approval-gate model is the product).
- Languages beyond Urdu + English.
- Real-time multiplayer, in-app purchases aimed at children, any third-party ad SDK in Kid Mode.
