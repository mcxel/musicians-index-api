# CONSOLIDATION_EXECUTION_PLAN (Post-Audit Bridge — No Execution Yet)

Status: Planning only (no code movement)  
Date: 2026-06-02  
Input sources: Sprint 1B audit suite reports

## Purpose
Bridge **Audit Phase** to **Consolidation Phase** with explicit migration sequencing, risk controls, and rollback strategy.

---

## Phase 0 — Guardrails (must stay active)
- No deletion without approved classification review.
- Protected systems remain protected:
  - PlaylistEngine
  - AudiencePresenceEngine
  - ProfileLobbyRuntime
  - MemoryWallEngine
  - MessagingEngine
  - LiveStageRuntime
- Keep Home1 Golden Build containment intact during all migrations.
- Route compatibility via adapters/aliases before replacement.

---

## Consolidation matrix (high level)

| Current System Cluster | Target Canonical Engine | Primary Files/Families Affected | Classification Mix | Migration Risk | Rollback Strategy |
|---|---|---|---|---|---|
| Parallel profile shells (`/profile/*`, `/dashboard/*`, `/<role>/profile`, `/hub/*`) | ProfileLobbyRuntime | `apps/web/src/components/profile/*`, profile role pages | KEEP/MERGE/REPLACE/REIMAGINE | High | Keep route aliases + feature flags; revert shell binding only |
| Distributed playlist/radio/music widgets | PlaylistEngine | radio player, beat slider, play contracts, media orchestrator touchpoints | KEEP/MERGE/REIMAGINE | High | Preserve legacy widget wrappers; fallback to local player state |
| Lobby/audience/theater variants | AudiencePresenceEngine | avatar lobby canvas, lobby shells, wall grids, audience field | KEEP/MERGE/REIMAGINE | High | Keep existing lobby routes; toggle canonical adapter off |
| Live room/stage/video overlays | LiveStageRuntime + VideoSessionEngine | live room pages, stage overlays, RTC hooks | KEEP/MERGE | High | Runtime toggle to legacy stage stack |
| Magazine/articles/home story surfaces | MagazineEngine + CrownOrbitEngine | magazine/article routes, Home1 orbital/header/belt | KEEP/MERGE/REIMAGINE | Medium | Maintain existing routes/components; gate new data adapters |
| Venue/seating/ticketing distributed logic | VenueEngine + BookingEngine | venue kiosk, booking canvas, ticketing engine/shells | KEEP/MERGE | Medium | Revert engine adapter bindings only |
| Sponsor/ad overlays and telemetry dashboards | SponsorOverlayEngine + AnalyticsEngine | sponsor/admin/ad pages, observability surfaces | MERGE/REIMAGINE | Medium | Keep current admin dashboards untouched; defer overlay runtime |

---

## Recommended execution sequence (after approval)

### Step 1: Profile runtime unification shell
- Bind role routes to `ProfileLobbyRuntime` via adapter layer.
- No route removals; add compatibility wrappers.
- Validate role parity (Performer/Fan/Artist first).

### Step 2: PlaylistEngine canonicalization
- Centralize play state contracts and queue ownership.
- Keep existing player widgets as frontends to canonical state.
- Verify persistence across route/lobby/profile transitions.

### Step 3: AudiencePresenceEngine convergence
- Unify lobby wall, avatar lobby, theater audience surfaces under common contracts.
- Introduce common event/feed adapter (battle/challenge/cypher/games walls).

### Step 4: LiveStageRuntime + VideoSessionEngine alignment
- Consolidate stage overlays and RTC hooks into canonical runtime services.
- Preserve live room route contracts.

### Step 5: MagazineEngine + CrownOrbitEngine mapping
- Unify `/magazine/*` and `/articles/*` content model adapters.
- Keep Home1 as canonical entertainment front surface.

### Step 6: VenueEngine + BookingEngine alignment
- Centralize seating/ticketing/venue runtime ownership with adapter compatibility.

### Step 7: SponsorOverlayEngine preparation (implementation deferred until approved)
- Wire slots/contracts only after runtime stability pass.

---

## Curtain/Event expansion integration (planned)
From review feedback, include in later implementation scope:
- Curtain System states:
  - CURTAIN_CLOSED
  - CURTAIN_OPENING
  - CURTAIN_OPEN
- Expanded event classes:
  - Joke Offs
  - Dance Offs
  - World Concerts
  - World Release Parties
These are planned as REIMAGINE targets in entertainment/audience engines.

---

## Detailed risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Breaking profile role routes during shell unification | High | adapter-first migration, alias routes preserved |
| Playlist regressions (music continuity) | High | protected system rule + persistence tests before swaps |
| WebRTC/live room instability | High | isolate stage/video migrations behind runtime toggle |
| Audience/lobby UX fragmentation | Medium/High | common audience contracts before UI merge |
| Home1 regression | High | keep Golden containment untouched; no structural rewrite |
| Admin dashboard data loss due to reimagine pressure | Medium | separate reimagine plan from operational telemetry correctness |

---

## Rollback policy (global)
- Every consolidation step must be reversible by:
  1. Adapter toggle off
  2. Rebinding to legacy runtime components
  3. Route alias fallback
- No destructive deletion until two cycles:
  - cycle 1: functional parity pass
  - cycle 2: stability + telemetry pass

---

## Required acceptance gates before any execution
1. Audit suite approved by reviewer.
2. This consolidation plan approved.
3. Manual Home1 browser sign-off completed.
4. Implementation branch + checkpoint tagging strategy set.

---

## Out of scope now
- No implementation started
- No refactor executed
- No file movement/deletion

This document is the approved bridge candidate for phase transition review.
