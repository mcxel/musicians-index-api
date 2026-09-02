# WORLD RELEASE PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production World / Mini Release presentation on frozen Shows & Releases lifecycle DNA (NOT full cinematic Voltron)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Shows & Releases catalog | `ScheduledEventRegistry` — `MINI_RELEASE` / `WORLD_RELEASE` |
| Publish API | `/api/events/shows-releases` (Prisma Event + FeedItem) |
| Director phases | `lib/broadcast/ReleasePartyDirectorEngine.ts` (countdown → intro → performing → …) |
| Prior compose patterns | PerformerLive / Battle / Challenge / Cypher / Concert / WDP / MNS |
| Pack DNA | `WorldReleasePack` — STAGE_WIDE / HOST_CLOSE / PIP; **forbids** DUAL / CIRCLE_FOCUS / GAME_BOARD |

**Blocker check:** Release lifecycle is complete enough to wire honestly (catalog + director + Mini live registration). No pivot required.

**Do not invent:** stream counts, preorder counts, attendance, fake World releases, merch without real inventory (Rule 20).

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Catalog kinds | `ScheduledEventRegistry` | `MINI_RELEASE` ⭐ / `WORLD_RELEASE` 🌍 |
| Publisher | `ShowsReleasePublisher` | Gold+ request → platform Event |
| Director | `ReleasePartyDirectorEngine` | Phase + countdown from real `startsAt` |
| Pack DNA | `WorldReleasePack` | Semantic flags (no VS; no winner; ≠ GO LIVE) |
| Live go | `/api/live/go` categories | `release-party` / `mini-release` / `world-release` |
| Presentation room | `/rooms/release/[roomId]` | Compose + shell consumer |

**OPEN gaps (honest):** no dedicated lyrics ISO wiring yet; merch CTAs only when caller supplies real inventory (room does not invent store SKUs); listen-along sync not built; `/live/world-release/[id]` matrix route still unrealized (presentation uses `/rooms/release/[roomId]`).

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composeReleaseProgram.ts` | `PROGRAM.WORLD_RELEASE` / `PROGRAM.RELEASE_PREMIERE` + ISO PREMIERE / ARTIST / COUNTDOWN? / MERCH?; binds Universal Player + Jumbotron **without** new session |
| Production shell | `components/live/ReleasePresentationShell.tsx` | Artist + release + countdown + real merch; **no** VS / Cypher circle / winner |
| Room consumer | `app/rooms/release/[roomId]/page.tsx` | Loads real catalog card; director countdown; compose + shell |
| Join wiring | `ScheduledEventRegistry.toShowsReleasePublicCard` + shows-releases POST | Release kinds → `/rooms/release/...` |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` + contracts/packs | `world-release` / `mini-release` / `release-party` → `WORLD_RELEASE`; reads `getActiveReleaseProgram()` |
| Pack cert lanes | `packs/index.ts` | WorldRelease architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + `ExperiencePresentationDirector.ts` + tests | Release rejects VS + CIRCLE_FOCUS + GAME_BOARD; Cypher/Battle/MNS untouched |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Release ≠ Battle VS; Cypher still clean; prior slices untouched; no invented streams / preorders / attendance; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace (Release room → presentation)

```
/rooms/release/[roomId]?eventId=&scope=
  → GET /api/events/shows-releases (real MINI_RELEASE / WORLD_RELEASE card)
  → ReleasePartyDirectorEngine.getCurrentPhase (real scheduledStartIso)
  → composeReleaseProgram (PROGRAM.WORLD_RELEASE | PROGRAM.RELEASE_PREMIERE
       + ISO.PREMIERE / ISO.ARTIST / ISO.COUNTDOWN? / ISO.MERCH?)
  → ReleasePresentationShell
       → LiveVideoPanel + IdentityPanel + TimerRing + LowerThird + merch QueueRail?
       → 🌍 WORLD / ⭐ MINI badge
       → never ResultCard / VS corners / Cypher circle
  → Arena/UVR eventType world-release|mini-release → Jumbotron WORLD_RELEASE
  → Optional Jumbotron (same PROGRAM · artist + premiere title)

ShowsReleasePublisher (Mini)
  → POST shows-releases → liveRoomUrl /rooms/release/…?scope=mini
```

Production hook: `window.__TMI_RELEASE_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Catalog + director countdown + compose unit tests; merch only when real CTAs supplied |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime; no VS/circle; Mini/World shared compose |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: Release rejects DUAL/CIRCLE_FOCUS/GAME_BOARD; Mini vs World PROGRAM ids; invalid merch/`#` href rejected; negative countdown rejected; Battle still allows VS; Cypher still VS-free; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Full cinematic premiere polish / artwork reveal FX / lyric ISO | OPEN (out of scope Phase 1) |
| Real merch inventory auto-bind from StoreCanister / ArtistCommerceCatalog | OPEN (shell accepts real CTAs only) |
| Listen-along sync / shared timeline | OPEN |
| `/live/world-release/[id]` matrix alias route | OPEN (presentation lives at `/rooms/release`) |
| experienceCert physical | OPEN |
| **Game Show** or **Fan Lobby / Lounge** presentation | **Next recommended slice** |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
