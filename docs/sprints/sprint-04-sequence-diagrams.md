# 🦓 Sprint 4 — Sequence Diagrams (as implemented)

> Code that exists and runs today. Sprint report: [sprint-04-games-coloring.md](sprint-04-games-coloring.md)

## 1. Why it scales — the games never touch the server

```mermaid
flowchart LR
    subgraph Browser["Child's device (100% of the work)"]
        Gen["generate question<br/>(words.ts / maths.ts)"]
        Play["play + score"]
        Stars["stars → localStorage<br/>(progress store)"]
        Art["coloring fill-map → localStorage<br/>(gallery store)"]
        Gen --> Play --> Stars
        Play --> Art
    end
    Server["Backend"]
    Browser -. "no call per play / answer / stroke" .-> Server
    Note["⇒ N concurrent kids = 0 server load"]
```

## 2. Spelling round (bilingual, Urdu-joining-safe)

```mermaid
sequenceDiagram
    actor Child
    participant Game as SpellingGame
    participant Words as spellingRound()
    participant TTS as SpeakButton (Web Speech)

    Game->>Words: spellingRound(ageBand, lang, 5)
    Words-->>Game: shuffled word items
    loop each word
        Game->>TTS: hear the word (optional)
        Child->>Game: tap a letter tile
        alt matches targetChars[filled]
            Game->>Game: filled++ ; render target.slice(0, filled)
            Note over Game: Urdu prefix is a REAL substring → joins correctly
        else wrong
            Game->>Game: flash tile, count a miss (no star if missed)
        end
        Game-->>Child: word complete → Next
    end
    Game->>Game: addStars(profile, cleanWords) [local]
```

## 3. Maths drill (age-banded, multiple-choice)

```mermaid
sequenceDiagram
    actor Child
    participant Game as MathsGame
    participant Gen as mathQuestion(ageBand)

    loop 6 questions
        Game->>Gen: next question
        Gen-->>Game: { expr / count, choices[], answer }
        Child->>Game: tap a choice
        alt correct
            Game->>Game: complete (star if first try)
        else wrong
            Game-->>Child: mark red, let retry (no pressure)
        end
    end
    Game->>Game: addStars(profile, firstTryCorrect) [local]
```

## 4. Coloring + gallery (saves a fill-map, not an image)

```mermaid
sequenceDiagram
    actor Child
    participant Canvas as ColoringCanvas
    participant Gallery as gallery store (localStorage)

    Child->>Canvas: pick color, tap a region
    Canvas->>Canvas: fills[regionId] = color (push undo history)
    Child->>Canvas: Save
    Canvas->>Gallery: save({ pageId, fills })  %% ~hundreds of bytes
    Gallery-->>Child: thumbnail in My Gallery
    Note over Gallery: no image upload, no server — bytes, on-device
```

## 5. Kid Mode hub (where the safety rules still hold)

```mermaid
flowchart TD
    Hub["/kid/[id] — activity hub"]
    Hub --> Stories["📚 Stories (kid_library / filter)"]
    Hub --> Spell["🔤 Spelling"]
    Hub --> Maths["🔢 Maths"]
    Hub --> Color["🎨 Coloring"]
    subgraph Rules["walled garden (unchanged)"]
        R1["no free-text input<br/>(tiles + choices only)"]
        R2["no links out / no ads"]
        R3["exit only via PIN gate"]
    end
    Spell -.-> R1
    Maths -.-> R1
    Color -.-> R2
```
