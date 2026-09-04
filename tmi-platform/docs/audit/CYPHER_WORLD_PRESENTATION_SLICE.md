# CYPHER WORLD PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Cypher presentation on frozen circle/mic-handoff DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Cipher/Cypher lifecycle | `CipherPresentationStateMachine`, `CypherRuntimeEngine` (`lib/cypher`, `lib/cipher`) |
| Experience packs + semantic tests | prior pack commits; Challenge `3df0dff0`; Battle `51e5765a` |
| Performer Live / Battle / Challenge compose patterns | `composePerformerLiveProgram`, `composeBattleProgram`, `composeChallengeProgram` |
| Jumbotron P0 + Challenge PROGRAM honesty | prior Jumbotron / Challenge slices |
| Cypher DNA | CIRCLE_FOCUS / MicHandoff; **forbids** DUAL / A_DOMINANT / B_DOMINANT / SPLIT / winner finale |

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Mic / handoff lifecycle | `lib/cipher/CipherPresentationStateMachine.ts` | LOBBY → VERSE → MIC_PASS → NEXT |
| Turn engine | `lib/cypher/CypherRuntimeEngine.ts` | `passMic` / `startPerformerTurn` semantic events |
| Pack DNA | `lib/experiencePresentation/packs` → `CypherPack` | Semantic flags (no VS; no winner) |
| Live arena (existing) | `/rooms/cypher` + `CipherArenaShell` | Existing production shell (not rewritten this slice) |
| Phase 1 consumer | `/rooms/cypher/[roomId]` | Compose + CypherPresentationShell |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeCypherProgram.ts` | Composes `PROGRAM.CYPHER_FOCUS` + ISO mic/next/circle; binds Universal Player + Jumbotron **without** new session; maps lifecycle → CIRCLE_FOCUS / HOST_CLOSE / PIP only — SPLIT_CLASH & winner states still resolve collaborative |
| Production shell | `components/live/CypherPresentationShell.tsx` | CypherCircle + MicHandoff + IdentityPanel; **no** VS / winner chrome |
| Cypher room | `app/rooms/cypher/[roomId]/page.tsx` | Compose + shell; join circle / take mic / pass mic — never invent winners |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `CYPHER` reads `getActiveCypherProgram()` — on-mic + next-up, **not** Battle scores |
| Pack cert lanes | `packs/index.ts` | Cypher architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | Cypher rejects DUAL/SPLIT/VS flags; Battle/Challenge untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Cypher ≠ Battle VS; no invented dual/winner/scores; Challenge + Battle wiring untouched; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (Cypher room → presentation)

```
/rooms/cypher/[roomId]
  → real circle members (user-joined only)
  → active mic + derived next-up
  → composeCypherProgram (PROGRAM.CYPHER_FOCUS + ISO.ACTIVE_MIC / NEXT_UP / CIRCLE_WIDE)
  → CypherPresentationShell
       → CypherCircle + MicHandoff + IdentityPanel
       → never ResultCard / VS corners / winner banner
  → Optional Jumbotron CYPHER (same PROGRAM · on-mic + next-up)
```

Production hook: `window.__TMI_CYPHER_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Cipher/Cypher engines + compose unit tests |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/winner |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: Cypher rejects DUAL/SPLIT/A_DOMINANT; circle + mic compose; stranger mic dropped; Battle still allows VS; Challenge still objective-first; Cypher architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic CipherArenaShell polish / competitive-ending cleanup | OPEN (out of scope Phase 1; DNA ignores Cypher Base.mp4 competitive ending) |
| experienceCert physical | OPEN |
| Concert / World Concert presentation | **DONE** Phase 1 — see `CONCERT_WORLD_PRESENTATION_SLICE.md` |
| World Dance Party presentation | **Next recommended slice** |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
