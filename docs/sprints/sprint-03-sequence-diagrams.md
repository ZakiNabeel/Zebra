# 🦓 Sprint 3 — Sequence Diagrams (as implemented)

> Code that exists and runs today. Sprint report: [sprint-03-generation.md](sprint-03-generation.md)

## 1. The creation pipeline — generate → moderate → review → approve

```mermaid
sequenceDiagram
    actor Parent
    participant UI as Studio (parent dashboard)
    participant API as /api/generate (server)
    participant Gen as generateStory()
    participant Mod as moderateStory()
    participant Store as cloud / local store

    Parent->>UI: Structured prompt (child, theme, character, length)
    UI->>API: POST /api/generate
    alt cloud mode & no parent session
        API-->>UI: 401 (children/strangers can't generate)
    else authorized (or local mode)
        API->>Gen: generate (Gemini if keyed, else $0 templates)
        Gen-->>API: bilingual draft (scenes validated)
        API->>Mod: moderate (OpenAI if keyed, else keyword screen)
        Mod-->>API: verdict {pass | flagged}
        API-->>UI: { story, moderation }
        alt flagged
            UI-->>Parent: ❌ auto-blocked — not stored, not shown
        else pass
            UI->>Store: save as pending_review
            UI-->>Parent: ✅ in review queue (still not child-visible)
        end
    end
```

## 2. The human approval gate — the only path to a child

```mermaid
sequenceDiagram
    actor Parent
    participant Q as Review queue
    participant Data as data/studio.approve()
    participant DB as Postgres (cloud) / studio store (local)
    participant Trig as approval_gate trigger (cloud only)

    Parent->>Q: Preview pending story
    Parent->>Q: Approve (for one child)
    Q->>Data: approve(storyId, profileId)
    Data->>DB: status = published_profile, approved_at, approved_by
    alt cloud mode
        DB->>Trig: before update
        Note over Trig: requires approved_at + moderation_verdict<br/>(set at creation) — else REJECT
        Trig-->>DB: allowed ✅
    end
    DB-->>Q: published_profile for that child only
```

## 3. Two backends, one provider-fallback switch

```mermaid
flowchart TD
    P[Structured prompt] --> G{GEMINI_API_KEY?}
    G -->|yes| GA[Gemini Flash]
    G -->|no| GT[Deterministic $0 templates]
    GA --> M{OPENAI_API_KEY?}
    GT --> M
    M -->|yes| MO[OpenAI Moderation]
    M -->|no| MK[Keyword screen]
    MO --> R{flagged?}
    MK --> R
    R -->|yes| BL[Auto-blocked — discarded]
    R -->|no| PR[pending_review]
    PR --> H[[Human approval gate]]
    H --> PUB[published_profile → child]
```

## 4. Read-along narration — $0 now, Azure-ready

```mermaid
flowchart LR
    Btn["🔊 Listen (reader)"] --> A{page.audio for lang?}
    A -->|yes, pre-generated| AZ["play Azure audio file"]
    A -->|no| WS["Web Speech API (ur-PK / en voice)"]
    PageTurn["page turn / exit"] -.->|stop| Btn
```

## 5. Where the safety invariant is enforced (cumulative, Sprints 1–3)

```mermaid
flowchart TD
    subgraph Create["Sprint 3 — creation"]
        S1[Structured prompt only<br/>no free-text-to-model]
        S2[Auto moderation<br/>can only reject]
        S3[Human approval gate<br/>per child]
    end
    subgraph Enforce["Sprints 1–2 — enforcement"]
        E1[filter.ts / storiesForProfile<br/>local mode + tests]
        E2[RLS policies<br/>cloud anon/owner]
        E3[approval_gate trigger<br/>publish needs approval+verdict]
        E4[kid_library RPC<br/>can't return drafts]
    end
    S1 --> S2 --> S3 --> E3
    E1 -. mirrors .- E2
    Child[Child] -->|sees only published_*| E1
    Child -->|sees only published_*| E4
```
