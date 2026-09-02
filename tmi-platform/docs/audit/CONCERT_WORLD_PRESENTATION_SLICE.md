# CONCERT / WORLD CONCERT PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Concert presentation on frozen concert lifecycle DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Concert lifecycle | `ConcertRuntimeEngine` (`lib/concert/ConcertRuntimeEngine.ts`) — 18 states |
| Experience packs + semantic tests | prior pack commits; Cypher `8f657671`; Challenge `3df0dff0`; Battle `51e5765a` |
| Prior compose patterns | `composePerformerLiveProgram`, `composeBattleProgram`, `composeChallengeProgram`, `composeCypherProgram` |
| Jumbotron P0 + Cypher PROGRAM honesty | prior Jumbotron / Cypher slices |
| Concert DNA | STAGE_WIDE / HOST_CLOSE / PIP; World may SPLIT for sponsor; **forbids** DUAL / A_DOMINANT / B_DOMINANT / CIRCLE_FOCUS |

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Lifecycle engine | `lib/concert/ConcertRuntimeEngine.ts` | VENUE_PREP → PERFORMANCE_ACTIVE → ENCORE → CREDITS |
| Legacy presentation adapter | `lib/concert/ConcertPresentationAdapter.ts` | DirectorRegistry bridge (not replaced this slice) |
| Camera director | `lib/broadcast/ConcertDirectorEngine.ts` | Shot sequences (not rebuilt) |
| Pack DNA | `lib/experiencePresentation/packs` → `ConcertPack` / `WorldConcertPack` | Semantic flags (no VS; no winner; no Cypher circle) |
| Legacy World surface | `/rooms/world-concert` | Existing stadium UI — PROGRAM shell wired; invented attendance/setlist removed from primary surfaces |
| Phase 1 consumer | `/rooms/concert/[roomId]` | Compose + ConcertPresentationShell (⭐ Mini default; 🌍 via `world-*` or `?scope=world`) |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeConcertProgram.ts` | Shared Mini/World compose → `PROGRAM.CONCERT_STAGE` / `PROGRAM.WORLD_CONCERT` + ISO stage/audience/setlist; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/ConcertPresentationShell.tsx` | Stage + IdentityPanel + LowerThird + setlist rail; **no** VS / Cypher circle / winner chrome; ⭐/🌍 badge |
| Concert room | `app/rooms/concert/[roomId]/page.tsx` | Compose + shell; claim stage / real tracks only — never invent attendance |
| World Concert page | `app/rooms/world-concert/page.tsx` | Mounts compose (scope=WORLD) + shell; honest empty setlist/headliner; seat-mesh occupancy replaces fake 8,244 |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `concert` → `WORLD_CONCERT`; reads `getActiveConcertProgram()` — headliner + now-playing |
| Pack cert lanes | `packs/index.ts` | Concert + WorldConcert architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | Concert rejects VS + CIRCLE_FOCUS; Battle/Challenge/Cypher untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Concert ≠ Battle VS; Cypher still clean; no invented headliner/setlist/attendance/tips/scores; prior wiring untouched; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (Concert room → presentation)

```
/rooms/concert/[roomId]  (or /rooms/world-concert)
  → real headliner only when claimed / supplied
  → real setlist tracks only when added
  → ConcertRuntimeEngine phase (or mapped alias)
  → composeConcertProgram (PROGRAM.CONCERT_STAGE | PROGRAM.WORLD_CONCERT
       + ISO.STAGE / ISO.AUDIENCE_WIDE / ISO.SETLIST)
  → ConcertPresentationShell
       → LiveVideoPanel + IdentityPanel + LowerThird (+ QueueRail setlist)
       → ⭐ MINI or 🌍 WORLD badge — never invent World without scope
       → never ResultCard / VS corners / Cypher circle
  → Optional Jumbotron WORLD_CONCERT (same PROGRAM · headliner + now-playing)
```

Production hook: `window.__TMI_CONCERT_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | ConcertRuntimeEngine + compose unit tests |
| architectureCert | **DONE** | Packs wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/circle |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: Concert/WorldConcert reject DUAL/CIRCLE_FOCUS; Mini vs World PROGRAM ids + badges; setlist/nowPlaying honesty; Battle still allows VS; Challenge objective-first; Cypher still VS-free; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic concert polish / multi-cam producer desk | OPEN (out of scope Phase 1) |
| Mini Concert one-click creation flow (Rule 21 gap) | OPEN |
| experienceCert physical | OPEN |
| Legacy `/rooms/world-concert` remaining cosmetic debt | OPEN (PROGRAM surfaces cleaned; page not fully redesigned) |
| **World Dance Party** presentation | **Next recommended slice** (matrix Phase 6–7; WDP already PARTIAL logic/arch) |
| Monday Night Stage / World Release | Alternates if WDP blocked |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
