# WORLD DANCE PARTY PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Dance Party presentation on frozen WDP lifecycle DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| WDP schedule / World host | `WorldDancePartyShowtime` + `RECORD_RALPH_BOT_ID` — Friday 🌍 only; bot-hosted |
| Rotation pool | `WorldDancePartyRotationPool` + `/api/world-dance-party/now-playing` |
| Lifecycle engine | `lib/dance/WorldDancePartyRuntimeEngine.ts` — DancePartyState |
| Prior compose patterns | PerformerLive / Battle / Challenge / Cypher / Concert |
| DanceParty pack DNA | FLOOR_WIDE / HOST_CLOSE / PIP / SPLIT; **forbids** DUAL / A_DOMINANT / B_DOMINANT / CIRCLE_FOCUS / OBJECTIVE_FOCUS / GAME_BOARD |

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Official room | `/rooms/world-dance-party` | StageLoader → WorldDancePartyExperience |
| Experience module | `registries/experiences/WorldDancePartyExperience.tsx` | Compose + shell + EosArenaEventShell |
| Showtime | `lib/dance/WorldDancePartyShowtime.ts` | Friday LIVE / submit windows |
| Rotation | `lib/dance/WorldDancePartyRotationPool.ts` | Real tracks only; idle when empty |
| Host | `HostIdentityRegistry` · `record-ralph` | World DJ only |
| Pack DNA | `DancePartyPack` | Semantic flags (no VS; no winner; no Cypher circle) |
| Legacy adapter | `DancePartyPresentationAdapter.ts` | DirectorRegistry bridge (not replaced this slice) |

**Mini Dance Party:** compose supports `scope: "MINI"` (⭐) for Gold DJ — no dedicated Mini room route shipped this slice.

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeDancePartyProgram.ts` | `PROGRAM.WDP_COMPOSITE` + ISO DJ / floor / crowd / track; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/DancePartyPresentationShell.tsx` | DJ focus + floor presence; **no** VS / Cypher circle / winner chrome; ⭐/🌍 badge |
| Experience consumer | `WorldDancePartyExperience.tsx` | Compose + shell; polls real now-playing API |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `WORLD_DANCE_PARTY` reads `getActiveDancePartyProgram()` — DJ + now-playing |
| Pack cert lanes | `packs/index.ts` | DanceParty architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | WDP rejects VS + CIRCLE_FOCUS; Battle/Challenge/Cypher/Concert untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; WDP ≠ Battle VS; Cypher still clean; no invented DJ / tracks / dancer counts / tips / scores; World host coerced to Record Ralph; prior wiring untouched; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (WDP room → presentation)

```
/rooms/world-dance-party
  → StageLoader(experienceId=world-dance-party)
  → WorldDancePartyExperience
       → /api/world-dance-party/now-playing (real pool only)
       → composeDancePartyProgram (PROGRAM.WDP_COMPOSITE
            + ISO.DJ / ISO.DANCE_FLOOR / ISO.CROWD? / ISO.TRACK_QUEUE?)
       → DancePartyPresentationShell
            → LiveVideoPanel + IdentityPanel + LowerThird + AudioVisualizer
            → 🌍 WORLD badge — Record Ralph [BOT]
            → never ResultCard / VS corners / Cypher circle
       → EosArenaEventShell (eventType=world-dance-party) → Jumbotron
  → Optional Jumbotron WORLD_DANCE_PARTY (same PROGRAM · DJ + now-playing)
```

Production hook: `window.__TMI_DANCE_PARTY_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Showtime + RotationPool + compose unit tests |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/circle |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: DanceParty rejects DUAL/CIRCLE_FOCUS; World Ralph coercion; Mini badge; floor-count honesty; Battle still allows VS; Challenge objective-first; Cypher still VS-free; Concert still VS-free; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic WDP polish / BPM-reactive floor FX | OPEN (out of scope Phase 1) |
| Mini Dance Party dedicated room route + one-click Gold DJ create | OPEN (Rule 21 gap) |
| Floor presence count from seat/presence engines | OPEN (shell shows honest "unknown") |
| experienceCert physical | OPEN |
| **Monday Night Stage** presentation | **Next recommended slice** |
| **World Release** presentation | Alternate if Monday Night Stage blocked |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
