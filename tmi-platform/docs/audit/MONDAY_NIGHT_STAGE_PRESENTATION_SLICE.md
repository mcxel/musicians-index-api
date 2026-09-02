# MONDAY NIGHT STAGE PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Monday Night Stage presentation on frozen MNS lifecycle DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Schedule window | `MondayShowtime` + `ScheduledEventRegistry.getMondayNightStageSchedule` |
| Host assignment | `HostShowAssignmentEngine` — Bobby Stanley + Kira + Bebo |
| Lifecycle engine | `lib/shows/MondayNightStageEngine.ts` (ShowRuntime + Bebo + Kira) |
| Canonical room | `/rooms/monday-stage` — real submissions queue (`/api/events/submissions?category=MONDAY_NIGHT_STAGE`) |
| EOS mill | `/shows/monday-night-stage` → `MondayNightStageExperience` |
| Prior compose patterns | PerformerLive / Battle / Challenge / Cypher / Concert / WDP |
| Pack DNA | `MondayNightStagePack` — HOST_CLOSE / STAGE_WIDE / PIP / SPLIT; **forbids** DUAL / A_DOMINANT / B_DOMINANT / CIRCLE_FOCUS; **≠ Regular GO LIVE** |

**Blocker check:** MNS routes/engines are complete enough to wire honestly — no pivot to World Release this slice.

**Do not use:** `lib/events/MondayNightStageEngine.ts` `getCanonicalMondayStageEpisode()` — invented performers/votes/scores (Rule 20).

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Official room | `/rooms/monday-stage` | Real queue + curtain + MondayNightStageEngine + ArenaEventShell |
| EOS experience | `registries/experiences/MondayNightStageExperience.tsx` | Compose + shell + EosArenaEventShell |
| Showtime | `lib/shows/MondayShowtime.ts` | Monday LIVE / PRESHOW / ARCHIVE windows |
| Hosts | `HostShowAssignmentEngine` · `HostIdentityRegistry` | bobby-stanley / kira / bebo |
| Pack DNA | `MondayNightStagePack` | Semantic flags (no VS; no winner; ≠ GO LIVE) |
| Legacy TV episode stub | `lib/events/MondayNightStageEngine.ts` | **Not wired** — fake episode data |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeMondayNightStageProgram.ts` | `PROGRAM.MNS_SHOW` + ISO HOST / FEATURED / WHOS_NEXT / AUDIENCE? / SPONSOR?; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/MondayNightStagePresentationShell.tsx` | Featured + Who's Next + host; **no** VS / Cypher circle / winner / GO LIVE chrome; 🌍 WORLD badge |
| Room consumer | `app/rooms/monday-stage/page.tsx` | Compose from real lineup + stage state |
| EOS consumer | `MondayNightStageExperience.tsx` | Compose + shell (hosts/schedule; lineup stays empty until room queue) |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | `monday-stage` → `MONDAY_NIGHT_STAGE`; reads `getActiveMondayNightStageProgram()` |
| Pack cert lanes | `packs/index.ts` | MNS architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | MNS rejects VS + CIRCLE_FOCUS; ≠ GO LIVE; Cypher/Battle/WDP untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; MNS ≠ Battle VS; MNS ≠ Regular GO LIVE; Cypher still clean; Battle untouched; no invented winners / attendance / scores / featured acts; prior wiring untouched; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (MNS room → presentation)

```
/rooms/monday-stage
  → real submissions queue + MondayNightStageEngine
  → composeMondayNightStageProgram (PROGRAM.MNS_SHOW
       + ISO.HOST / ISO.FEATURED / ISO.WHOS_NEXT? / ISO.AUDIENCE? / ISO.SPONSOR?)
  → MondayNightStagePresentationShell
       → LiveVideoPanel + IdentityPanel + LowerThird + QueueRail
       → 🌍 WORLD badge — Bobby Stanley [BOT] + co-hosts
       → never ResultCard / VS corners / Cypher circle / GO LIVE alias
  → ArenaEventShell (eventType=monday-stage) → Jumbotron MONDAY_NIGHT_STAGE
  → Optional Jumbotron (same PROGRAM · featured + Who's Next)

/shows/monday-night-stage
  → StageLoader → MondayNightStageExperience
       → schedule phase + HostShowAssignment hosts (no invented lineup)
       → compose + shell + EosArenaEventShell
```

Production hook: `window.__TMI_MNS_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Schedule + HostShowAssignment + compose unit tests; queue is real on room path |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/circle; ≠ GO LIVE |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: MNS rejects DUAL/CIRCLE_FOCUS; hosts resolve from registry; Who's Next honesty; attendance invent rejected; Battle still allows VS; Cypher still VS-free; PerformerLive still Regular GO LIVE; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic MNS polish / applause FX / sponsor takeover choreography | OPEN (out of scope Phase 1) |
| Audience presence count from seat/presence engines | OPEN (shell shows honest "unknown") |
| experienceCert physical | OPEN |
| EOS mill path still has no real submission queue (room owns it) | OPEN / intentional split |
| **World Release** presentation | **DONE** Phase 1 architecture — see `WORLD_RELEASE_PRESENTATION_SLICE.md` |
| **Game Show** or **Fan Lobby / Lounge** presentation | **Next recommended slice** |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
