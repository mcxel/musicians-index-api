# CHALLENGE WORLD PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Challenge presentation on frozen Challenge lifecycle/objective DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Challenge lifecycle | `ChallengeOperationalLifecycle`, `ChallengePresentationPack` (lib/challenge) |
| Experience packs + semantic tests | prior pack commits; Battle `51e5765a` |
| Performer Live / Battle compose patterns | `composePerformerLiveProgram`, `composeBattleProgram` |
| Jumbotron P0 + Battle PROGRAM honesty | prior Jumbotron / Battle slices |
| Challenge DNA | OBJECTIVE_FOCUS / ChallengeContract; **forbids** DUAL / A_DOMINANT / B_DOMINANT |

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Lifecycle | `lib/challenge/ChallengeOperationalLifecycle.ts` | Phase + objective contract + judgment pathways |
| Domain defs | `lib/challenge/ChallengeDefinition.ts` | Lanes / work types |
| Pack DNA | `lib/experiencePresentation/packs` → `ChallengePack` | Semantic flags (no VS; prefers contract) |
| Live surface (cinematic) | `/live/challenge/[id]` + `CinematicChallengeArenaStage` | Existing Lane C stage (not rewritten this slice) |
| Song lab | `/rooms/challenge-arena` | Song Challenge venue (separate subtype) |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeChallengeProgram.ts` | Composes `PROGRAM.CHALLENGE_PRIMARY` + contract ISO; binds Universal Player + Jumbotron **without** new session; maps lifecycle → OBJECTIVE_FOCUS / HOST_CLOSE / PIP only |
| Production shell | `components/live/ChallengePresentationShell.tsx` | ChallengeContract center; IdentityPanel for real participants; ResultCard only when authorized |
| Challenge room | `app/rooms/challenge/[roomId]/page.tsx` | Compose + shell; challenged / result only when real — never invent winner |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `CHALLENGE_ARENA` reads `getActiveChallengeProgram()` — objective headline, **not** Battle VS scores |
| Pack cert lanes | `packs/index.ts` | Challenge architectureCert **DONE**; experienceCert **OPEN** |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Challenge ≠ Battle VS by default; no invented dual/winner/scores; Cypher pack unchanged (still rejects VS); Battle wiring untouched; green/debug ≠ experienceCert PASS; full cinematic production **out of scope**.

---

## Trace (Challenge room → presentation)

```
/rooms/challenge/[roomId]
  → objective contract snapshot (real fields; stake NONE default)
  → optional real challenger / challenged (never placeholder opponent required)
  → composeChallengeProgram (PROGRAM.CHALLENGE_PRIMARY + ISO.CONTRACT_CARD)
  → ChallengePresentationShell
       → ChallengeContract + TimerRing + IdentityPanel
       → ResultCard only when authorized result supplied
  → Optional Jumbotron CHALLENGE_ARENA (same PROGRAM · objective headline)
```

Production hook: `window.__TMI_CHALLENGE_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Lifecycle engines + compose unit tests |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no default VS |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: Challenge rejects DUAL/A_DOMINANT; objective-first compose; unauthorized winner dropped; Cypher still rejects DUAL; Battle still allows VS; Challenge architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic Challenge arena polish / fake-data cleanup in `CinematicChallengeArenaStage` | OPEN (out of scope Phase 1) |
| experienceCert physical | OPEN |
| Cypher deep presentation (circle + mic handoff) | **DONE** Phase 1 — see `CYPHER_WORLD_PRESENTATION_SLICE.md` |
| Concert / World Concert presentation | **Next recommended slice** |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
