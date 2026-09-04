# BATTLE WORLD PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Battle presentation on frozen Battle lifecycle (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Battle lifecycle | `BattleBroadcastStateMachine`, `WinnerStaysLifecycleEngine`, `BattleWinnerEngine` |
| Experience packs + semantic tests | `5de2f2a1`, `9cfc222f` |
| Performer Live compose pattern | `19bf1001` · `composePerformerLiveProgram` |
| Jumbotron P0 + ad face contracts | prior Jumbotron commits |
| VS UI | `BattleSplitScreenPanel`, `BattleBillboardPreview` |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeBattleProgram.ts` | Composes `PROGRAM.BATTLE_COMPOSITE` + corner ISOs from real participants; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/BattlePresentationShell.tsx` | Dual → existing `BattleSplitScreenPanel` VS; solo → honest waiting IdentityPanel |
| Battle room | `app/rooms/battle/[roomId]/page.tsx` | WinnerStays → compose; drives broadcast machine with real A / optional B only |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | Reads `getActiveBattleProgram()` — **removed** MC Nova / fake score seed |
| Scoreboard honesty | `JumbotronSurfaceRenderer.tsx` | No invented names/scores; `—` when score not finite |
| Pack cert lanes | `packs/index.ts` | Battle architectureCert **DONE**; experienceCert **OPEN** |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; no invented dual/winner/scores; Cypher pack unchanged (still rejects VS); Physical Advertising — Battle P2 show-critical outranks ads when PROGRAM present; green/debug ≠ experienceCert PASS; full Voltron cinematic **out of scope**.

---

## Trace (Battle room → presentation)

```
/rooms/battle/[roomId]
  → WinnerStaysLifecycleEngine (champion + optional challenger)
  → battleBroadcastStateMachine (A join; B only when real challenger)
  → composeBattleProgram (PROGRAM.BATTLE_COMPOSITE + ISO corners)
  → BattlePresentationShell
       → dual? BattleSplitScreenPanel VS_MODE
       → else IdentityPanel (waiting — no placeholder opponent)
  → Optional Jumbotron BATTLE_ARENA (same PROGRAM identity / real names)
```

Production hook: `window.__TMI_BATTLE_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Lifecycle + compose unit tests |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; Jumbotron honesty |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: dual only when both corners real; unauthorized winner dropped; Cypher still rejects DUAL; Battle architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic Voltron / CinematicBattleArenaStage polish | OPEN (out of scope Phase 1) |
| experienceCert physical | OPEN |
| Challenge / Cypher deep presentation | Next recommended slices |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
