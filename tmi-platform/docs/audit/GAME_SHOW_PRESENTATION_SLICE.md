# GAME SHOW PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Official Game Show presentation on existing show lifecycle DNA (NOT full cinematic polish)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Show runtime | `lib/shows/ShowRuntimeEngine.ts` + `DealOrFeudEngine` / `NameThatTuneEngine` / `CircleAndSquaresEngine` |
| Host assignment | `HostShowAssignmentEngine` — `deal-or-feud` → Bobby Stanley + Mindy (prize) |
| EOS mount | `/shows/deal-or-feud` → `StageLoader` → `DealOrFeudExperience` |
| Pack DNA | `GameShowPack` — GAME_BOARD / HOST_CLOSE / SPLIT / PIP; **forbids** DUAL / CIRCLE_FOCUS |
| Prior compose patterns | PerformerLive / Battle / Challenge / Cypher / Concert / WDP / MNS / World Release |

**Blocker check:** Official hosts + Deal or Feud route/engine exist. Live contestant roster / authoritative prize grants are still OPEN — compose stays honest-empty until supplied (Rule 20). **No pivot to Fan Lobby required.**

**Do not invent:** contestants, scores, board answers, prize winners, attendance (Rule 20).

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Format engines | `DealOrFeudEngine`, `NameThatTuneEngine`, `CircleAndSquaresEngine` | Official formats only |
| Contract stub | `experiencePresentation/GameShowEngine.ts` | Contestant / Round / Turn / PrizeLedger contract |
| Hosts | `HostShowAssignmentEngine` + `HostIdentityRegistry` | Bot-hosted Official lineup |
| Pack DNA | `GameShowPack` | Semantic flags (no VS; winner finale only when engine-authoritative) |
| EOS experience | `DealOrFeudExperience` | Compose + shell consumer |
| Show route | `/shows/deal-or-feud` | Production surface |
| Mill alias | `/rooms/deal-or-feud` → mill | ArenaEventShell + Jumbotron |

**OPEN gaps (honest):** live contestant intake not auto-bound from session registry; `/rooms/deal-vs-feud` producer runtime still missing as a page (links exist); Name That Tune / Circle and Squares share compose but are not separately shelled this slice; cash prizes remain Rule-23 gated.

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeGameShowProgram.ts` | `PROGRAM.GAME_SHOW` + ISO HOST / CONTESTANT / BOARD / AUDIENCE / PRIZE; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/GameShowPresentationShell.tsx` | Host + board + turn timer + contestants + prize ledger; **no** VS / Cypher circle |
| Room consumer | `registries/experiences/DealOrFeudExperience.tsx` | Composes host package (honest empty roster) + shell above ArenaEventShell |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `GAME_SHOW` → reads `getActiveGameShowProgram()` |
| Pack cert lanes | `packs/index.ts` | GameShow architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | Game Show rejects VS + CIRCLE_FOCUS; Cypher/Battle/prior packs untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Game Show ≠ Battle VS; Cypher still clean; prior slices untouched; no invented contestants / scores / prizes; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (Deal or Feud → presentation)

```
/shows/deal-or-feud
  → StageLoader(experienceId=deal-or-feud)
  → DealOrFeudExperience
       → composeGameShowProgram (PROGRAM.GAME_SHOW
            + hosts from HostShowAssignment
            + contestants/board only when caller supplies real data)
       → GameShowPresentationShell
            → LiveVideoPanel + IdentityPanel + GameBoard? + TimerRing? + PrizeLedgerView?
            → 🌍 WORLD badge · ≠ Battle VS · ≠ Cypher
       → EosArenaEventShell eventType=deal-or-feud
  → Arena/UVR deal-or-feud → Jumbotron GAME_SHOW
  → Optional Jumbotron (same PROGRAM · host + board/turn)

Name That Tune / Circle and Squares
  → same composeGameShowProgram(formatId=…) when wired (not separate consumers this slice)
```

Production hook: `window.__TMI_GAME_SHOW_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Host assignment + compose unit tests; live roster / prize grants OPEN |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/circle |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: Game Show rejects DUAL/CIRCLE_FOCUS; GAME_BOARD/SPLIT allowed; invented winner/active contestant rejected; prize award without grant stripped; Battle still allows VS; Cypher still VS-free; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Live contestant roster bind from session / ShowRuntime | OPEN |
| Authoritative prize grant pipeline (Rule 23) | OPEN |
| Name That Tune / Circle and Squares dedicated shells | OPEN (compose ready) |
| `/rooms/deal-vs-feud` full producer runtime page | OPEN (referenced, not present) |
| Full cinematic board FX / buzzer polish | OPEN (out of scope Phase 1) |
| experienceCert physical | OPEN |
| **Fan Lobby / Lounge** presentation | **DONE** Phase 1 — see `FAN_LOBBY_LOUNGE_PRESENTATION_SLICE.md` |
| **Avatar Studio → World** | **Next recommended slice** |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
