# 🦓 Sprint 1 — Sequence Diagrams (as implemented)

> These diagrams describe code that exists and runs today, not aspirations.
> Sprint report: [sprint-01-foundation.md](sprint-01-foundation.md)

## 1. Onboarding — family, PIN, first child

```mermaid
sequenceDiagram
    actor Parent
    participant UI as Onboarding Page
    participant Pin as pin.ts (Web Crypto)
    participant Store as useFamily (zustand)
    participant LS as localStorage

    Parent->>UI: Family name + app language (en/ur)
    UI->>UI: Apply language & RTL direction
    Parent->>UI: Set 4-digit PIN
    Parent->>UI: Confirm PIN
    alt PINs match
        UI->>Pin: makeSalt() + hashPin(pin, salt)
        Pin-->>UI: SHA-256 hash (PIN never stored)
        Parent->>UI: First child (name, age band, story language, avatar)
        UI->>Store: createFamily + addProfile
        Store->>LS: persist {family, profiles} (parentUnlocked excluded)
        UI-->>Parent: → Parent Dashboard (unlocked this session)
    else Mismatch
        UI-->>Parent: error, re-enter PIN
    end
```

## 2. Parental gate — the only door out of Kid Mode

```mermaid
sequenceDiagram
    actor Child
    actor Parent
    participant Kid as Kid Mode UI
    participant Gate as ParentalGate
    participant Store as useFamily
    participant Pin as pin.ts

    Note over Kid: Entering Kid Mode calls lockParent()<br/>parent area is re-locked every time
    Child->>Kid: Taps "For Parents 🔒"
    Kid->>Gate: Show full-screen PIN pad
    Child->>Gate: Wrong digits
    Gate->>Store: unlockParent(pin)
    Store->>Pin: verifyPin (constant-time compare)
    Pin-->>Store: false
    Gate-->>Child: "That PIN isn't right" — stays locked
    Parent->>Gate: Correct PIN
    Gate->>Store: unlockParent(pin) → true
    Store-->>Gate: parentUnlocked = true (memory only, dies with tab)
    Gate-->>Parent: → Parent Dashboard
```

## 3. Child reads a story — every path crosses the safety filter

```mermaid
sequenceDiagram
    actor Child
    participant Picker as Profile Picker (/kid)
    participant Home as Kid Home (/kid/[profileId])
    participant Filter as storiesForProfile()
    participant Reader as Story Reader
    participant Art as StoryArt (SVG cast)

    Child->>Picker: Tap own avatar
    Picker->>Home: profileId
    Home->>Filter: SEED_STORIES + profile
    Note over Filter: SAFETY INVARIANT<br/>only published_* content,<br/>own profile scope, own age band
    Filter-->>Home: visible stories only
    Home-->>Child: Story grid (title & UI in child's language, RTL if Urdu)
    Child->>Reader: Tap a story
    Note over Reader: Deep links re-run the same filter —<br/>a hidden story 404s back to Kid Home
    loop Each page
        Reader->>Art: scene key → SVG illustration
        Reader-->>Child: Art + bilingual text page, progress dots
        Child->>Reader: Next (RTL-aware arrows)
    end
    Reader-->>Child: 🌟 The End — read again / all stories
```

## 4. Where this architecture is headed (sprint 2–3 seams, already in place)

```mermaid
sequenceDiagram
    participant Store as useFamily / content store
    participant Local as localStorage adapter (today)
    participant SB as Supabase (sprint 2)
    participant RLS as RLS + approval trigger (0001_init.sql — written)

    Note over Store: Pages talk only to store actions
    Store->>Local: today: persist/read
    Store-->>SB: sprint 2: same actions, cloud adapter
    SB->>RLS: every child read
    Note over RLS: kid JWT can only SELECT published rows;<br/>trigger refuses publish without<br/>approver + moderation verdict
```
