# 🦓 Sprint 5 — Sequence Diagrams (as implemented)

> Code that exists and runs today. Sprint report: [sprint-05-school-workspace.md](sprint-05-school-workspace.md)

## 1. Teacher Tools — entry and layout

```mermaid
flowchart TD
    Parent["/parent (PIN-gated adult area)"] --> School["/school — Teacher Tools"]
    School --> P["🖥️ /school/present — Presentation maker"]
    School --> W["📝 /school/worksheet — Worksheet maker"]
    School --> C["🏫 /school/classes — Classes"]
    School -. "useAdultArea(): signed-in + family + unlocked" .-> Guard["else → /auth / /onboarding / home"]
```

## 2. Make a presentation (two paths, both cheap)

```mermaid
sequenceDiagram
    actor Teacher
    participant UI as /school/present
    participant Ready as READY_DECKS (static)
    participant API as /api/slides (server)
    participant Gen as generateSlides()
    participant Mod as moderateText()
    participant Store as school store (localStorage)

    alt Ready lesson (instant, $0)
        Teacher->>UI: tap a curated deck
        UI->>Ready: clone deck
        UI->>Store: addPresentation
    else Custom topic
        Teacher->>UI: topic + age + language
        UI->>API: POST /api/slides
        alt cloud mode & no session
            API-->>UI: 401
        else authorized
            API->>Gen: Gemini if keyed, else $0 scaffold
            Gen-->>API: bilingual slides
            API->>Mod: screen deck text
            Mod-->>API: pass / flagged
            API-->>UI: { slides, source, moderation }
            alt flagged
                UI-->>Teacher: ❌ topic blocked
            else pass
                UI->>Store: addPresentation
            end
        end
    end
    UI-->>Teacher: open editor
```

## 3. Present & export (zero server cost)

```mermaid
sequenceDiagram
    actor Teacher
    participant Editor as /school/present/[id]
    participant Print as window.print()

    Teacher->>Editor: edit slide titles/bullets (bilingual)
    Note over Editor: changes persist to localStorage store
    alt Present
        Teacher->>Editor: Present → full-screen
        Teacher->>Editor: ← / → / Esc (keyboard)
    else Export PDF
        Teacher->>Print: Print / Save PDF
        Note over Print: print stylesheet renders<br/>one slide per .print-page<br/>(browser's own PDF engine)
    end
```

## 4. Worksheets reuse the game engines

```mermaid
flowchart LR
    Pick["pick type + age + language"] --> Kind{spelling or maths?}
    Kind -->|spelling| WS["spellingWorksheet()<br/>← lib/learn/words.ts"]
    Kind -->|maths| WM["mathsWorksheet()<br/>← lib/learn/maths.ts"]
    WS --> Sheet["print-ready sheet (name/date header)"]
    WM --> Sheet
    Sheet --> PDF["window.print() → PDF"]
    Note["all client-side — no backend, any scale"]
```

## 5. Scalability map (cumulative, Sprints 1–5)

```mermaid
flowchart TD
    subgraph Zero["Zero marginal backend cost"]
        G["Games & coloring (S4)"]
        Wk["Worksheets + PDF export (S5)"]
        Rd["Ready lessons (S5)"]
        Static["Library art via CDN (S1)"]
    end
    subgraph Bounded["Adult-triggered, cached, never per-view"]
        AI["AI story + slide generation (S3/S5)"]
        DB["Cloud reads via indexed kid_library RPC (S2)"]
    end
    Zero --> Scale["scales to any user count"]
    Bounded --> Scale
```
