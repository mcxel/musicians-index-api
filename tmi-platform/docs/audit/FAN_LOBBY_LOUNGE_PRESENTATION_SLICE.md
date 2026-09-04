# FAN LOBBY / LOUNGE PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production Fan Lobby + Lounge presentation on existing lobby/lounge lifecycle DNA (NOT full cinematic polish)  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Fan Lobby venue | `components/live/FanLobbyVenue.tsx` + `FanLobbyPresence` / lobby-sync |
| Fan Lobby routes | StageLoader `fan-lobby` → FanLobbyVenue; `/live/lobby/fans` discovery |
| Lounge EOS | `registries/experiences/LoungeExperience.tsx` + `LoungePack` |
| Lounge law | `loungeVideoPresenceLaw` — panels only, no avatars |
| Pack DNA | FanLive = FAN_AVATARS hangout; Lounge = WEBRTC_PANELS |
| Prior compose patterns | PerformerLive → Game Show slices |

**Blocker check:** Fan Lobby + Lounge consumers exist. Real panel occupancy from loungeVideoPresenceLaw and friend lists remain honest-empty until engines publish (Rule 20). **No pivot away from Fan Lobby required.**

**Do not invent:** occupancy, friend lists, panel counts, ads, attendance (Rule 20).  
**Do not** give performers Fan avatar ownership UI (Rule 26). Performer Lobby is a separate row — untouched.

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Fan Lobby venue | `FanLobbyVenue.tsx` | Avatar hangout + Jumbotron mount |
| Fan presence | `FanLobbyPresence` / `useLobbyPresenceSync` | Real seat/presence sync |
| Fan skins | `FanLobbySkinRegistry` | Real skin ids only |
| Lounge EOS | `LoungeExperience.tsx` | StageLoader lounge module |
| Lounge UVR | `UniversalVenueRenderer` lounge side-room | Connected lounge panels (pre-existing) |
| Lounge law | `loungeVideoPresenceLaw.ts` | Rejects avatar presence model |
| Pack DNA | `FanLivePack` / `LoungePack` | Semantic flags |
| Jumbotron | `VenueAutomatedJumbotronMount` | FAN_LOBBY + LOUNGE PROGRAM readers |

**OPEN gaps (honest):** live panel count bind from SpatialVideoPresence; Playlist Lounge venue still shares FanLobbyVenue seating mesh (PROGRAM never claims avatar stadium); Performer Lobby presentation not this slice; experienceCert physical OPEN.

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| Fan PROGRAM composer | `lib/experiencePresentation/composeFanLobbyProgram.ts` | `PROGRAM.FAN_LOBBY` + ISO SELF/FRIENDS/WALL; FanLive pack |
| Lounge PROGRAM composer | `lib/experiencePresentation/composeLoungeProgram.ts` | `PROGRAM.LOUNGE` / `PROGRAM.PLAYLIST_LOUNGE`; WEBRTC_PANELS only |
| Fan shell | `components/live/FanLobbyPresentationShell.tsx` | Social hangout chrome — ≠ VS / Cypher / Game Show |
| Lounge shell | `components/live/LoungePresentationShell.tsx` | Panels-only chrome — ≠ Fan Lobby stadium |
| Fan consumer | `FanLobbyVenue.tsx` | Composes Fan PROGRAM when `roomType=FAN_LOBBY`; Playlist → Lounge PROGRAM |
| Lounge consumer | `LoungeExperience.tsx` | Composes Lounge PROGRAM + shell above EosArenaEventShell |
| Jumbotron | `VenueAutomatedJumbotronMount.tsx` | FAN_LOBBY / LOUNGE → `getActiveFanLobbyProgram` / `getActiveLoungeProgram` |
| Packs | `packs/index.ts` | FanLive + Lounge architectureCert **DONE**; experienceCert **OPEN** |
| Semantic guards | `types.ts` + director + tests | Lobby ≠ Lounge ≠ Battle/Cypher/GameShow |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; Fan Lobby avatars OK (Rule 26); Lounge rejects avatar occupancy; prior slices untouched; no invented friends/occupancy; green/debug ≠ experienceCert PASS; full cinematic polish **out of scope**.

---

## Trace

```
Fan Lobby
  StageLoader(fan-lobby) / CommandCenter / /live/lobby entry
    → FanLobbyVenue (roomType=FAN_LOBBY)
         → composeFanLobbyProgram (PROGRAM.FAN_LOBBY
              + real skin + lobby-sync presenceCount when known)
         → FanLobbyPresentationShell
         → VenueAutomatedJumbotronMount eventType=fan-lobby
              → getActiveFanLobbyProgram()

Lounge (EOS)
  StageLoader(lounge)
    → LoungeExperience
         → composeLoungeProgram (PROGRAM.LOUNGE · panels only)
         → LoungePresentationShell
         → EosArenaEventShell eventType=lounge
         → Jumbotron LOUNGE → getActiveLoungeProgram()

Playlist Lounge
  FanLobbyVenue (roomType=PLAYLIST_LOUNGE)
    → composeLoungeProgram (PROGRAM.PLAYLIST_LOUNGE)
    → LoungePresentationShell
    → Jumbotron eventType=lounge
```

Production hooks: `window.__TMI_FAN_LOBBY_PROGRAM__`, `window.__TMI_LOUNGE_PROGRAM__`.

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Compose unit tests + presence/skin honesty; live panel roster OPEN |
| architectureCert | **DONE** (Fan Lobby + Lounge); Playlist Lounge **PARTIAL** | Packs wired; SOURCE≠DECODER≠TARGET; no second runtime; DNA separated |
| experienceCert | **OPEN** | Physical production browser cert not claimed this slice |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
```

Asserts: FanLive FAN_AVATARS + rejects VS/CIRCLE/GAME_BOARD/FLOOR_WIDE; Lounge WEBRTC_PANELS + rejects avatar model + same combat layouts; invented occupancy stripped; Battle still VS; Cypher still clean; architectureCert DONE / experienceCert OPEN.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Live panel presence count bind from loungeVideoPresenceLaw / SpatialVideoPresence | OPEN |
| Playlist Lounge venue mesh vs panel DNA tension | OPEN (PROGRAM honest; mesh convergence later) |
| Performer Lobby presentation slice | OPEN (separate — never Fan avatar ownership) |
| Friend-list ISO when real invite graph exists | OPEN |
| Full cinematic lobby polish | OPEN (out of scope Phase 1) |
| experienceCert physical | OPEN |
| **Avatar Studio → World** (matrix Phase 9) | **Next recommended slice** |
| experienceCert physical pass backlog (prior presentation rows) | Alternate next |
| Observatory Ad Control / AdSense-3D | Intentionally OPEN (do not start) |
