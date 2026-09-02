# TMI Experience Completion Matrix

**Locked:** 2026-09-02 — Marcel Dickens video cross-reference + repo evidence  
**Branch:** `eos/vocal-improv-clean`  
**Stance:** Screenshots prove **logic/routing**. Videos are **experience targets**. Build **upward** on frozen Live Fabric / Universal Media Player / Jumbotron / Battle lifecycle. **NO green/debug surface** may satisfy production visual (`experienceCert`) certification.

**Companion laws:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · [`VENUE_WORLD_RUNTIME_SPEC.md`](./VENUE_WORLD_RUNTIME_SPEC.md) · [`AVATAR_STUDIO_TO_WORLD_PIPELINE.md`](./AVATAR_STUDIO_TO_WORLD_PIPELINE.md) · [`AVATAR_PREVIEW_PARITY_LAW.md`](./AVATAR_PREVIEW_PARITY_LAW.md) · [`UNIVERSAL_PLAYER_FREEDOM_LAW.md`](./UNIVERSAL_PLAYER_FREEDOM_LAW.md) · [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md)

**Code contracts:** `apps/web/src/lib/experiencePresentation/`

---

## Legend

| Column | Meaning |
|--------|---------|
| **presence model** | Who appears how (avatars / WebRTC panels / none) |
| **center of gravity** | What the eye should lock on first |
| **signature DNA** | Pack id + non-negotiable presentation identity |
| **PROGRAM source** | Canonical PROGRAM bus source kind id |
| **ISO/viewpoints** | Available alternate sources without new session |
| **Jumbotron** | Dual role (discovery preview + in-venue big screen) readiness |
| **adInventory** | In-venue physical ad surfaces (`venue:{id}:jumbotron:{face}` + LED/ribbon/scoreboard) — see [`JUMBOTRON_AD_AND_SHOW_DIRECTOR.md`](./JUMBOTRON_AD_AND_SHOW_DIRECTOR.md) |
| **Universal Player** | Freedom law / multi-target support |
| **logic cert** | Routing, lifecycle, engines (screenshots OK) |
| **architecture cert** | Contracts wired, SOURCE≠DECODER≠TARGET, no semantic violations |
| **experience cert** | Production visual/choreography match to video targets — **never** from debug/green UI |
| Status | `DONE` · `PARTIAL` · `OPEN` · `N/A` |

---

## Hard semantic laws (apply to every row)

1. **Cypher** = collaborative — **NO** VS / winner / champion / elimination (ignore competitive ending of Cypher Base.mp4).
2. **Lounges** = **NO avatars** — WebRTC free-roam panels only.
3. **Performer Lobby** = WebRTC panels, **not** avatars.
4. **Fan Lobby / WDP / concert audience** = fan avatars where Rule 26 authorizes.
5. **No fake crowds, fake tips/money, fake reactions.**
6. **SOURCE ≠ DECODER ≠ TARGET**; Universal Player Freedom; Presence Continuity; Dynamic Communication; Jumbotron dual role.
7. **Monday Night Stage ≠ Regular GO LIVE.**
8. **Battle vs Challenge:** VS/corners vs objective/contract central.
9. **Presentation Event Bus** only spectacularizes authoritative domain events — never manufactures them.
10. **Avatar Preview Parity** — Studio / Quick preview is a subset of production Fan rig capability (same draft, same Foundry rig). LOD ok; invented smile/dance/prop forbidden. Lounge lighting preview never enables occupancy. See [`AVATAR_PREVIEW_PARITY_LAW.md`](./AVATAR_PREVIEW_PARITY_LAW.md). ACGBR Authoritative-Truth Boundary applies here; Challenge ACGBR lane files are not modified.

---

## Matrix

### Fan Live

| Field | Value |
|-------|-------|
| route(s) | `/hub/fan` (in-place), `/live/rooms/[id]` (legacy), Fan Social Live paths |
| presence model | Fan avatars in social contexts; grid tiles OK for multi-cam social |
| center of gravity | Self + friends / social circle — not stage championship |
| signature DNA | `FanLive` — social hangout energy, not performer broadcast |
| PROGRAM source id | `PROGRAM.FAN_SOCIAL_PRIMARY` |
| ISO/viewpoints | SELF, FRIEND_CAM, ROOM_CONTEXT, CHAT |
| Jumbotron support | PARTIAL (discovery tile); in-venue N/A for pure social |
| Universal Player support | PARTIAL |
| queue/game requirements | None |
| world interactions | Lobby wall join, chat, reactions (real only) |
| commerce | Tips optional; merch N/A primary |
| logic cert | PARTIAL |
| architecture cert | PARTIAL |
| experience cert | OPEN |
| desktop/mobile | Both required; mobile grid/PIP |
| notes | Distinct from Performer Regular GO LIVE |

### Performer Live (Regular GO LIVE)

| Field | Value |
|-------|-------|
| route(s) | `/hub/performer` in-place GO LIVE; canary `LIVE_CANARY_REGULAR_GO_LIVE` |
| presence model | Performer = live camera; audience = fan avatars where authorized |
| center of gravity | Host / performer primary stage |
| signature DNA | `PerformerLive` — flat/PIP host-first; **≠ Monday Night Stage** |
| PROGRAM source id | `PROGRAM.PERFORMER_CAMERA` |
| ISO/viewpoints | SELF, AUDIENCE, SECONDARY, COMMERCE, CAST |
| Jumbotron support | PARTIAL → same PROGRAM bind (`JUMBOTRON_IN_VENUE`) when venue shell mounts |
| adInventory | PARTIAL — stage-facing face prioritizes performer cues; house/artist sponsor PiP in breaks (`VenueAdDirector`) |
| Universal Player support | PARTIAL → PROGRAM bound to any Universal Player slot (Freedom Law) |
| queue/game requirements | None (not competitive) |
| world interactions | Audience presence, reactions, CAST targets |
| commerce | Tips, merch, fan club |
| logic cert | PARTIAL (canary path + presentation compose) |
| architecture cert | **DONE** (PerformerLive pack + `composePerformerLiveProgram` wired on Regular GO LIVE; no second LiveSession) |
| experience cert | **OPEN** → physical production surface pending / in-progress (green/debug cannot PASS) |
| desktop/mobile | Both; single-screen FLAT fallback mandatory |
| notes | **Do not** rebuild; upward presentation only. Canary must stay green. Phase 1 slice: `docs/audit/PERFORMER_LIVE_PRESENTATION_SLICE.md` |

### Battle

| Field | Value |
|-------|-------|
| route(s) | `/battles/*`, `/rooms/battle/[roomId]`, arena shells, Home 5; Jumbotron battle lookup |
| presence model | Two corners (A/B) live video; audience avatars |
| center of gravity | **VS split / corners** — adversarial symmetry |
| signature DNA | `Battle` — DUAL / A\|B dominant / VS energy arcs / score cards / winner takeover |
| PROGRAM source id | `PROGRAM.BATTLE_COMPOSITE` (or A/B take) |
| ISO/viewpoints | CORNER_A, CORNER_B, HOST, JUDGE, AUDIENCE, REPLAY |
| Jumbotron support | PARTIAL (P0 LOOK UP closed; P2 show-critical from real PROGRAM; cinematic OPEN) |
| adInventory | **DONE** (contracts) — 4 independent faces; P1/P2 battle state preempts ads; packages: Round Timer Frame / Scoreboard Ribbon / Winner Spotlight |
| Universal Player support | PARTIAL |
| queue/game requirements | Bracket/queue; round clock; score; winner (authoritative) |
| world interactions | Seat fill real-only; hype from real reactions |
| commerce | Tips, sponsor slots via Rule 12 |
| logic cert | PARTIAL (lifecycle engines + presentation compose unit tests) |
| architecture cert | **DONE** (Battle pack + `composeBattleProgram` wired on `/rooms/battle/[roomId]`; Jumbotron reads real PROGRAM — no invented scores; no second LiveSession) |
| experience cert | **OPEN** — production physical cert pending; Phase 1 is NOT full cinematic Voltron |
| desktop/mobile | SPLIT fallback on single screen |
| notes | VS layouts **allowed**. Distinct from Challenge/Cypher. Slice: `docs/audit/BATTLE_WORLD_PRESENTATION_SLICE.md` |

### Challenge

| Field | Value |
|-------|-------|
| route(s) | `/rooms/challenge/[roomId]`, `/live/challenge/[id]`, Challenges wall |
| presence model | Challenger focus; judges optional; audience reactions |
| center of gravity | **Contract / objective card** — not VS corners |
| signature DNA | `Challenge` — OBJECTIVE_FOCUS, ChallengeContract primitive, result vs objective |
| PROGRAM source id | `PROGRAM.CHALLENGE_PRIMARY` |
| ISO/viewpoints | PERFORMER, CONTRACT_CARD, JUDGE, TIMER, AUDIENCE |
| Jumbotron support | **STRONG** (logic) — room `__TMI_CHALLENGE_ACGBR_FACES__` + PROGRAM → `VenueAutomatedJumbotronMount` applies plan via `JumbotronShowDirector`/`FaceTargetRegistry` (N attempt / S objective+timer / E sponsor / W audience); no VS scoreboard seed; experienceCert OPEN |
| Universal Player support | PARTIAL→STRONG (PROGRAM bound; lifecycle fabric Gates 8–9; no second LiveSession) |
| queue/game requirements | Objective contract, timer, pass/fail ledger |
| world interactions | Real votes/judging only |
| commerce | Sponsor prize (Rule 23 gated); settlement **separate** from result finalize |
| ACGBR | **DONE** contracts + Challenge bridge (read-only snapshot; certified templates; neural OUT OF SCOPE) — `docs/audit/ACGBR_ARCHITECTURE_CONTRACT.md` |
| logic cert | **STRONG** (lifecycle + Lane C Gates 1–16 + ACGBR boundary jest + compose semantic tests) |
| architecture cert | **DONE** (Challenge pack + `composeChallengeProgram` + ACGBR one-way boundary + result≠settlement) |
| experience cert | **OPEN** — production physical Chromium cert pending; do **not** treat logic green as experienceCert PASS |
| desktop/mobile | FOCUS / FLAT · pacing FULL/FAST/RECONNECT/REDUCED_MOTION/LOW_DEVICE |
| notes | **Not** Battle. No mandatory corner VS. Phase 1: `CHALLENGE_WORLD_PRESENTATION_SLICE.md`. Lane C: `LANE_C_CHALLENGE_OPERATIONAL_ACTIVATION.md` |

### Cypher

| Field | Value |
|-------|-------|
| route(s) | `/cypher`, `/rooms/cypher`, `/rooms/cypher/[roomId]`, Cypher Live Wall |
| presence model | Circle of live performers; collaborative mic handoff |
| center of gravity | **Active mic / circle** — shared energy, not elimination |
| signature DNA | `Cypher` — CypherCircle, MicHandoff; **FORBIDS** VS/winner/champion/elimination layouts |
| PROGRAM source id | `PROGRAM.CYPHER_FOCUS` |
| ISO/viewpoints | ACTIVE_MIC, CIRCLE_WIDE, NEXT_UP, AUDIENCE, HOST |
| Jumbotron support | PARTIAL — reads `getActiveCypherProgram()` (on-mic + next-up; never Battle scores) |
| adInventory | PARTIAL — mic-handoff show beats + house/artist faces; **no** winner-spotlight packages |
| Universal Player support | PARTIAL — PROGRAM bound; no second LiveSession |
| queue/game requirements | Mic queue / pass-the-mic — **no** elimination bracket |
| world interactions | Collaborative reactions only |
| commerce | Tips shared pool optional |
| logic cert | PARTIAL |
| architecture cert | **DONE** — `composeCypherProgram` + CypherPresentationShell + `/rooms/cypher/[roomId]` |
| experience cert | **OPEN** — production physical cert pending; Phase 1 is NOT full cinematic; **ignore** competitive ending of Cypher Base.mp4 |
| desktop/mobile | GRID / FOCUS |
| notes | Hard law: collaborative forever. Slice: `docs/audit/CYPHER_WORLD_PRESENTATION_SLICE.md` |

### Gauntlet

| Field | Value |
|-------|-------|
| route(s) | Gauntlet / sequential challenge routes |
| presence model | One active performer vs sequential obstacles/opponents |
| center of gravity | Current trial + progress rail |
| signature DNA | `Gauntlet` — sequential FOCUS, timer rings, elimination **only if** authoritative engine says so |
| PROGRAM source id | `PROGRAM.GAUNTLET_ACTIVE` |
| ISO/viewpoints | ACTIVE, NEXT_CHALLENGER, JUDGE, PROGRESS, AUDIENCE |
| Jumbotron support | OPEN |
| Universal Player support | OPEN |
| queue/game requirements | Ordered queue, round advance, fail-forward rules from domain engine |
| world interactions | Real occupancy |
| commerce | Sponsor milestones |
| logic cert | OPEN |
| architecture cert | OPEN (pack stub) |
| experience cert | OPEN |
| desktop/mobile | FOCUS / SPLIT |
| notes | Distinct from one-shot Challenge and 1v1 Battle. |

### Monday Night Stage

| Field | Value |
|-------|-------|
| route(s) | `/rooms/monday-stage` (canonical), `/shows/monday-night-stage` (EOS mill) |
| presence model | Hosted show; performer + audience avatars; system host |
| center of gravity | Broadcast show package — host + featured act + Who's Next |
| signature DNA | `MondayNightStage` — producer-directed; **≠ Regular GO LIVE**; **≠ Battle VS** |
| PROGRAM source id | `PROGRAM.MNS_SHOW` |
| ISO/viewpoints | HOST, FEATURED, WHOS_NEXT, AUDIENCE, SPONSOR, LOWER_THIRD |
| Jumbotron support | PARTIAL — reads `getActiveMondayNightStageProgram()` (featured / Who's Next; no fake scores) |
| adInventory | PARTIAL — four-face takeover packages + lower-thirds; Intermission Takeover during breaks |
| Universal Player support | PARTIAL (PROGRAM bound; no second player runtime) |
| queue/game requirements | Official schedule, lineup queue (`/api/events/submissions`), host succession |
| world interactions | Bot-operated Official event (Rule 21) — real outcomes |
| commerce | Tickets (Venue/Promoter), sponsors |
| logic cert | PARTIAL (`MondayNightStageEngine` + `HostShowAssignment` + `composeMondayNightStageProgram`) |
| architecture cert | **DONE** (Phase 1 — pack + compose + shell + room/EOS consumers) |
| experience cert | OPEN |
| desktop/mobile | HYBRID / MULTI_MONITOR aspirational |
| notes | Never reuse Regular GO LIVE DNA pack. Do not force Battle VS onto whole show. |

### Concert (Mini Concert)

| Field | Value |
|-------|-------|
| route(s) | `/rooms/concert/[roomId]` (⭐ Mini default), `/rooms/live-concert`, `/concerts` |
| presence model | Stage performer + seated fan avatars |
| center of gravity | Stage performance + set energy |
| signature DNA | `Concert` — stage-forward, commerce strip, audience wall |
| PROGRAM source id | `PROGRAM.CONCERT_STAGE` |
| ISO/viewpoints | STAGE, WIDE, AUDIENCE, SETLIST, MERCH |
| Jumbotron support | PARTIAL (reads `getActiveConcertProgram()` — headliner / now-playing; no fake impressions) |
| Universal Player support | PARTIAL (PROGRAM bound; no second player runtime) |
| queue/game requirements | Setlist queue |
| world interactions | Seat claim, real reactions, tip |
| commerce | Tips, merch, tickets if Venue/Promoter issued |
| logic cert | PARTIAL (`ConcertRuntimeEngine` + `composeConcertProgram`) |
| architecture cert | **DONE** (Phase 1 — pack + compose + shell + room consumer) |
| experience cert | OPEN |
| desktop/mobile | FLAT / PIP |
| notes | Mini = user-qualified ⭐; World = bot/platform only 🌍. Phase 1 slice: `docs/audit/CONCERT_WORLD_PRESENTATION_SLICE.md`. |

### World Concert

| Field | Value |
|-------|-------|
| route(s) | `/rooms/world-concert`, `/rooms/concert/world-*` or `?scope=world` |
| presence model | Large venue; fan avatars; multi-cam |
| center of gravity | Stadium broadcast + world-scale audience |
| signature DNA | `WorldConcert` — multi-monitor aspirational, producer-directed |
| PROGRAM source id | `PROGRAM.WORLD_CONCERT` |
| ISO/viewpoints | STAGE, WIDE, CROWD, B-ROLL, SPONSOR, REPLAY |
| Jumbotron support | PARTIAL (same Concert PROGRAM path; WORLD_CONCERT experience type) |
| Universal Player support | PARTIAL |
| queue/game requirements | Platform schedule |
| world interactions | Progressive real fill; LOD |
| commerce | Tickets Venue/Promoter; sponsors |
| logic cert | PARTIAL (venue runtime + compose) |
| architecture cert | **DONE** (shared `composeConcertProgram` scope=WORLD) |
| experience cert | OPEN |
| desktop/mobile | HYBRID; FLAT fallback |
| notes | 🌍 WORLD badge law; bot/platform-created only. Legacy `/rooms/world-concert` still has pre-slice UI debt outside PROGRAM shell. |

### World Release

| Field | Value |
|-------|-------|
| route(s) | `/rooms/release/[roomId]` · Shows & Releases catalog (`MINI_RELEASE` / `WORLD_RELEASE`) |
| presence model | Premiere focus; lighter audience (reactions OK) |
| center of gravity | Release media + countdown + artist |
| signature DNA | `WorldRelease` — premiere card, drop moment, commerce |
| PROGRAM source id | `PROGRAM.WORLD_RELEASE` (🌍) / `PROGRAM.RELEASE_PREMIERE` (⭐) |
| ISO/viewpoints | PREMIERE, ARTIST, COUNTDOWN, MERCH (real inventory only) |
| Jumbotron support | PARTIAL (same Release PROGRAM path; `WORLD_RELEASE` experience type) |
| Universal Player support | PARTIAL |
| queue/game requirements | Drop schedule via Shows & Releases + ReleasePartyDirectorEngine |
| world interactions | Listen-along sync (OPEN) |
| commerce | Real merch/preorder CTAs only when supplied; tips via existing paths |
| logic cert | PARTIAL (catalog + director countdown + compose) |
| architecture cert | **DONE** (shared `composeReleaseProgram` Mini/World) |
| experience cert | OPEN |
| desktop/mobile | FLAT / PIP |
| notes | Distinct from Listening Party (social sync). 🌍/⭐ from kind/scope — never invent World. No fake streams/preorders/attendance. |

### Listening Party

| Field | Value |
|-------|-------|
| route(s) | Listening party rooms |
| presence model | Shared timeline audio; participant tiles / light presence |
| center of gravity | Shared track + host commentary |
| signature DNA | Shared sync playback (Rule 25 adjacent) |
| PROGRAM source id | `PROGRAM.LISTENING_SYNC` |
| ISO/viewpoints | ARTWORK, HOST, LISTENERS, LYRICS |
| Jumbotron support | N/A primary |
| Universal Player support | PARTIAL (sync engines exist) |
| queue/game requirements | Track queue |
| world interactions | Reactions, chat |
| commerce | Tips, playlist save |
| logic cert | PARTIAL |
| architecture cert | PARTIAL |
| experience cert | OPEN |
| desktop/mobile | FLAT / GRID |
| notes | Solo play ≠ Rotation Credits (Rule 25). |

### Watch Party

| Field | Value |
|-------|-------|
| route(s) | Watch party rooms |
| presence model | Shared external/primary media + social grid |
| center of gravity | Watched content + friend reactions |
| signature DNA | PIP content + social overlay |
| PROGRAM source id | `PROGRAM.WATCH_CONTENT` |
| ISO/viewpoints | CONTENT, SELF, FRIENDS, CHAT |
| Jumbotron support | OPEN |
| Universal Player support | PARTIAL |
| queue/game requirements | Optional playlist |
| world interactions | Chat, reactions |
| commerce | Optional |
| logic cert | OPEN |
| architecture cert | OPEN |
| experience cert | OPEN |
| desktop/mobile | PIP default |
| notes | Presence Continuity — adding friend cam must not kill content session. |

### World Dance Party

| Field | Value |
|-------|-------|
| route(s) | `/rooms/world-dance-party` (DJ Record Ralph · 🌍 WORLD) |
| presence model | **Fan avatars on dance floor**; DJ cam |
| center of gravity | Floor energy + DJ |
| signature DNA | `DanceParty` — BPM sync, dance emotes, hybrid DJ/floor |
| PROGRAM source id | `PROGRAM.WDP_COMPOSITE` |
| ISO/viewpoints | DJ, DANCE_FLOOR, CROWD, TRACK_QUEUE |
| Jumbotron support | **DONE** Phase 1 — reads `getActiveDancePartyProgram()` (DJ + now-playing; no invented counts) |
| adInventory | PARTIAL — disco-orb / rotating faces; group-action spotlight (consent); house ambient fallback |
| Universal Player support | PARTIAL — PROGRAM bound to Universal Player targets (no second fabric) |
| queue/game requirements | Track queue via RotationPool; DJ bot schedule |
| world interactions | Dance emotes, group actions (real users) |
| commerce | Tips, cosmetics |
| logic cert | PARTIAL (WDP lifecycle + RotationPool + compose unit tests) |
| architecture cert | **DONE** Phase 1 (`composeDancePartyProgram` + `DancePartyPresentationShell`) |
| experience cert | OPEN |
| desktop/mobile | HYBRID / FLAT |
| notes | World = Ralph bot only; Mini Dance Party = Gold DJ (compose scope flag; no dedicated Mini room route yet). Avatars authorized for fans. ≠ Battle VS / Cypher combat. |

### Game Show (Deal or Feud)

| Field | Value |
|-------|-------|
| route(s) | `/shows/deal-or-feud` (+ mill aliases `/rooms/deal-or-feud`, Name That Tune / Circle and Squares routes) |
| presence model | Host + contestants + audience |
| center of gravity | **Game board / turn / timer / prize ledger** |
| signature DNA | `GameShow` — GAME_BOARD layout, Contestant/Round/Turn/Timer/PrizeLedger |
| PROGRAM source id | `PROGRAM.GAME_SHOW` |
| ISO/viewpoints | HOST, CONTESTANT_N, BOARD, AUDIENCE, PRIZE |
| Jumbotron support | **DONE** Phase 1 — `VenueAutomatedJumbotronMount` reads `getActiveGameShowProgram()` |
| Universal Player support | PARTIAL — bound as display target; no new player runtime |
| queue/game requirements | Full GameShowEngine / DealOrFeudEngine contract when live roster exists |
| world interactions | Real answers/votes only |
| commerce | PrizeLedger Rule-23 gated (awards need authoritativeGrantId) |
| logic cert | PARTIAL (hosts + compose unit tests; live contestant roster OPEN) |
| architecture cert | **DONE** Phase 1 (`composeGameShowProgram` + `GameShowPresentationShell`) |
| experience cert | OPEN |
| desktop/mobile | HYBRID / FLAT |
| notes | Platform/bot-hosted Official only. ≠ Battle VS / Cypher. Consumer: DealOrFeudExperience. |

### Fan Lobby

| Field | Value |
|-------|-------|
| route(s) | Fan lobby / avatar lobby / Lobby Wall entry (`FanLobbyVenue`, `/live/lobby/fans`, StageLoader `fan-lobby`) |
| presence model | **Fan avatars** (Rule 26) |
| center of gravity | Social space before show — theater lobby energy |
| signature DNA | Avatar hangout + playlist; entry via LobbyEntryFlow |
| PROGRAM source id | `PROGRAM.FAN_LOBBY` (ambient) |
| ISO/viewpoints | SELF_AVATAR, FRIENDS, LOBBY_WALL, PLAYLIST |
| Jumbotron support | **DONE** Phase 1 — `VenueAutomatedJumbotronMount` reads `getActiveFanLobbyProgram()` |
| adInventory | PARTIAL — `venue:{id}:lobby` surface + wall mosaic; personalized ads stay in personal UI only |
| Universal Player support | PARTIAL — bound as display target; no new player runtime |
| queue/game requirements | Seat assignment on join show |
| world interactions | Emotes, walk, invite |
| commerce | Cosmetics (Fan Store) |
| logic cert | PARTIAL |
| architecture cert | **DONE** Phase 1 (`composeFanLobbyProgram` + `FanLobbyPresentationShell` via FanLive pack) |
| experience cert | OPEN |
| desktop/mobile | Both |
| notes | Avatars OK. Distinct from Lounge (no avatars). Consumer: `FanLobbyVenue` when `roomType=FAN_LOBBY`. |

### Performer Lobby

| Field | Value |
|-------|-------|
| route(s) | Backstage performer lobby |
| presence model | **WebRTC panels ONLY — never avatars** |
| center of gravity | Free-roam panel bodies + proximity audio |
| signature DNA | `PerformerLive` lobby mode / backstagePerformerLobby law |
| PROGRAM source id | `PROGRAM.PERFORMER_LOBBY_LOCAL` |
| ISO/viewpoints | SELF_PANEL, NEARBY_PANELS, SUBROOM |
| Jumbotron support | N/A |
| Universal Player support | Panel-as-source |
| queue/game requirements | Sub-rooms: private/group/rehearsal/audition |
| world interactions | Collision, 1.5m personal space, proximity audio |
| commerce | N/A primary |
| logic cert | PARTIAL (`backstagePerformerLobby.ts`) |
| architecture cert | PARTIAL (law encoded; liveFabric audiencePolicy legacy note) |
| experience cert | OPEN |
| desktop/mobile | Desktop primary |
| notes | liveFabric `PERFORMER_LOBBY` historically listed AVATAR_WALL — **superseded by this matrix** for presence. |

### Lounge

| Field | Value |
|-------|-------|
| route(s) | Lounge containers / venue HUD lounges (`LoungeExperience`, UVR lounge side-rooms) |
| presence model | **NO avatars** — WebRTC free-roam panels only |
| signature DNA | `Lounge` — panel roam, proximity, playlist optional |
| PROGRAM source id | `PROGRAM.LOUNGE` |
| ISO/viewpoints | SELF_PANEL, ROOM_WIDE, PLAYLIST |
| Jumbotron support | **DONE** Phase 1 — `VenueAutomatedJumbotronMount` reads `getActiveLoungeProgram()` |
| Universal Player support | PARTIAL — bound as display target; no new player runtime |
| queue/game requirements | None |
| world interactions | Free-roam, talk proximity |
| commerce | Optional tips |
| logic cert | PARTIAL (`loungeVideoPresenceLaw`) |
| architecture cert | **DONE** Phase 1 (`composeLoungeProgram` + `LoungePresentationShell`; pack rejects avatar presence) |
| experience cert | OPEN |
| desktop/mobile | Both |
| notes | Hard law: avatar presence model → REJECT. Consumer: `LoungeExperience`. |

### Playlist Lounge

| Field | Value |
|-------|-------|
| route(s) | Playlist-centric lounge variants (`FanLobbyVenue` `PLAYLIST_LOUNGE`, `/rooms/playlist-lounge`) |
| presence model | WebRTC panels (no avatars) + shared playlist skin |
| center of gravity | Playlist + panel social |
| signature DNA | Lounge + Playlist Skin Economy (Rule 19) |
| PROGRAM source id | `PROGRAM.PLAYLIST_LOUNGE` |
| ISO/viewpoints | PLAYLIST, PANEL_SELF, PANEL_OTHERS |
| Jumbotron support | **DONE** Phase 1 — same `getActiveLoungeProgram()` path (`loungeMode=PLAYLIST_LOUNGE`) |
| Universal Player support | PARTIAL |
| queue/game requirements | Playlist queue |
| world interactions | Same as Lounge |
| commerce | Skin purchase paths |
| logic cert | PARTIAL |
| architecture cert | **PARTIAL** Phase 1 (shared `composeLoungeProgram`; skin economy UI still OPEN) |
| experience cert | OPEN |
| desktop/mobile | Both |
| notes | Skin economy UI still OPEN (Rule 19 gap). Presentation PROGRAM wired; venue avatar mesh for this roomType remains a known tension — PROGRAM never claims avatar stadium DNA. |

### Avatar Studio

| Field | Value |
|-------|-------|
| route(s) | `/avatar/studio`, `/avatar/closet`, `/avatar/looks`, Quick Panel |
| presence model | Fan-only avatar ownership (Rule 26/28) |
| center of gravity | Live rigged avatar preview |
| signature DNA | Create → customize → preview → save looks → enter venue |
| PROGRAM source id | N/A (studio, not broadcast) |
| ISO/viewpoints | TURNABLE, FACE, FULL_BODY, LOOK_COMPARE |
| Jumbotron support | N/A |
| Universal Player support | Studio viewport ≠ live session |
| queue/game requirements | None |
| world interactions | Equip → `FanEquippedLookBridge` into Fan Lobby presence + local venue seat (LiveAvatarSync all-rooms OPEN) |
| commerce | Wardrobe packs, cosmetics |
| logic cert | PARTIAL (Canister SMILE / bobblehead_v0 + FAN-only look-bridge + Preview Parity unit tests) |
| architecture cert | **PARTIAL** — Phase 1 studio→lobby/seat glue + Preview Parity contracts; Herser wardrobe / LiveAvatarSync / QA Lab / facial+motion packages not complete. See [`AVATAR_STUDIO_WORLD_PHASE1_SLICE.md`](./AVATAR_STUDIO_WORLD_PHASE1_SLICE.md) · [`AVATAR_PREVIEW_PARITY_LAW.md`](./AVATAR_PREVIEW_PARITY_LAW.md) |
| experience cert | OPEN |
| desktop/mobile | Both |
| notes | Face-scan / lip-sync not stubbed. Closet/looks/test bookmark-redirect to `/avatar/studio`. One Canonical Avatar Draft for Studio + Quick Panel. Do not claim architectureCert DONE. |

### Rehearsal

| Field | Value |
|-------|-------|
| route(s) | Rehearsal sub-rooms / private practice |
| presence model | Performer self (+ optional guests); audience **HIDDEN** |
| center of gravity | Practice take / notes |
| signature DNA | Private; no public discovery |
| PROGRAM source id | `PROGRAM.REHEARSAL` (private bus) |
| ISO/viewpoints | SELF, NOTES, REFERENCE |
| Jumbotron support | Forbidden (private) |
| Universal Player support | Local only |
| queue/game requirements | Optional setlist |
| world interactions | None public |
| commerce | None |
| logic cert | PARTIAL (sub-room type) |
| architecture cert | OPEN |
| experience cert | OPEN |
| desktop/mobile | FLAT |
| notes | Privacy isolation mandatory. |

### Audition

| Field | Value |
|-------|-------|
| route(s) | Audition rooms / judge panels |
| presence model | Auditionee primary + judge frame |
| center of gravity | Performance under evaluation |
| signature DNA | FOCUS + judge slot |
| PROGRAM source id | `PROGRAM.AUDITION` |
| ISO/viewpoints | AUDITIONEE, JUDGE, SELF |
| Jumbotron support | Forbidden unless explicitly public call |
| Universal Player support | OPEN |
| queue/game requirements | Audition queue |
| world interactions | Judge notes |
| commerce | None |
| logic cert | OPEN |
| architecture cert | OPEN |
| experience cert | OPEN |
| desktop/mobile | FOCUS / FLAT |
| notes | Judge policy FRAME_SLOT. |

### Interview

| Field | Value |
|-------|-------|
| route(s) | Interview / talk formats |
| presence model | Host + guest split; light reactions |
| center of gravity | Conversation split |
| signature DNA | SPLIT host/guest |
| PROGRAM source id | `PROGRAM.INTERVIEW` |
| ISO/viewpoints | HOST, GUEST, WIDE |
| Jumbotron support | OPEN |
| Universal Player support | OPEN |
| queue/game requirements | Topic queue optional |
| world interactions | Chat questions |
| commerce | Sponsor lower-third |
| logic cert | OPEN |
| architecture cert | OPEN |
| experience cert | OPEN |
| desktop/mobile | SPLIT |
| notes | Not Battle VS — conversational symmetry. |

---

## DONE / OPEN summary (roll-up)

| Experience | Logic | Architecture | Experience (prod visual) |
|------------|-------|--------------|---------------------------|
| Fan Live | PARTIAL | **DONE** | OPEN |
| Performer Live | PARTIAL | **DONE** | **OPEN** (prod physical) |
| Battle | PARTIAL | **DONE** | OPEN |
| Challenge | **STRONG** | **DONE** | OPEN |
| Cypher | PARTIAL | **DONE** | OPEN |
| Gauntlet | OPEN | OPEN | OPEN |
| Monday Night Stage | PARTIAL | **DONE** | OPEN |
| Concert | PARTIAL | **DONE** | OPEN |
| World Concert | PARTIAL | **DONE** | OPEN |
| World Release | PARTIAL | **DONE** | OPEN |
| Listening Party | PARTIAL | PARTIAL | OPEN |
| Watch Party | OPEN | OPEN | OPEN |
| World Dance Party | PARTIAL | **DONE** | OPEN |
| Game Show | PARTIAL | **DONE** | OPEN |
| Fan Lobby | PARTIAL | **DONE** | OPEN |
| Performer Lobby | PARTIAL | PARTIAL | OPEN |
| Lounge | PARTIAL | **DONE** | OPEN |
| Playlist Lounge | PARTIAL | PARTIAL | OPEN |
| Avatar Studio | PARTIAL | PARTIAL | OPEN |
| Rehearsal | PARTIAL | OPEN | OPEN |
| Audition | OPEN | OPEN | OPEN |
| Interview | OPEN | OPEN | OPEN |

**Frozen foundations (do not rebuild):** Live Fabric contracts, Universal Media Player law, Jumbotron P0 LOOK UP, Battle operational lifecycle engines.

**This lock (2026-09-02):** Matrix + DNA + venue world specs + presentation pack scaffolds + semantic unit tests = **architecture documentation DONE**; **experienceCert remains OPEN** for all rows until production (non-debug) physical cert.

---

## Phased vertical-slice build order

Build **upward** presentation + venue world only. One slice at a time; certify logic → architecture → experience (no green UI for experience).

| Phase | Slice | Exit criteria |
|-------|-------|---------------|
| **0** | Matrix + contracts + semantic tests | This document + `experiencePresentation/` tests PASS |
| **1** | **Performer Live** presentation polish | Host-first DNA on canary Regular GO LIVE — **architecture DONE**; experienceCert OPEN until production physical |
| **2** | **Battle world** presentation (not new lifecycle) | VS pack + `composeBattleProgram` + BattlePresentationShell — **architecture DONE**; experienceCert OPEN until production physical; no fake crowd/score; Cypher uncontaminated |
| **3** | **Challenge** | Contract/objective center; no default VS — **architecture DONE**; Lane C ACGBR + lifecycle logicCert **STRONG**; experienceCert OPEN (`LANE_C_CHALLENGE_OPERATIONAL_ACTIVATION.md`) |
| **4** | **Cypher** | Circle + mic handoff; reject winner layouts — **architecture DONE** Phase 1 (`composeCypherProgram` + shell); experienceCert OPEN |
| **5** | **Concert / World Concert** | Stage + audience; Mini vs World badges — **architecture DONE** Phase 1 (`composeConcertProgram` + shell); experienceCert OPEN |
| **6** | **World Release** | Premiere drop choreography on real schedule — **architecture DONE** Phase 1 (`composeReleaseProgram` + shell); experienceCert OPEN |
| **7** | **World Dance Party** | Floor avatars + DJ composite — **architecture DONE** Phase 1 (`composeDancePartyProgram` + shell); experienceCert OPEN |
| **7b** | **Monday Night Stage** | Show package + Who's Next — **architecture DONE** Phase 1 (`composeMondayNightStageProgram` + shell); experienceCert OPEN |
| **7c** | **Game Show** | Host + board + turn + prize ledger — **architecture DONE** Phase 1 (`composeGameShowProgram` + shell); experienceCert OPEN |
| **8** | **Lounges** (+ Playlist Lounge) / **Fan Lobby** | Panel-only presence; avatar model rejected for Lounge; Fan Lobby avatars OK — **architecture DONE** Phase 1 (`composeFanLobbyProgram` + `composeLoungeProgram` + shells); experienceCert OPEN |
| **9** | **Avatar Studio → World** | Looks equip → Fan Lobby / local seat via `FanEquippedLookBridge` + Preview Parity (one draft → `AvatarPreviewRuntime`) — **architecture PARTIAL** Phase 1 (Herser/LiveAvatarSync/facial+motion incomplete); experienceCert OPEN. Slice: `docs/audit/AVATAR_STUDIO_WORLD_PHASE1_SLICE.md` · law: `docs/audit/AVATAR_PREVIEW_PARITY_LAW.md` |

Do **not** start full cinematic Battle renderer until Phase 0–1 landed and Phase 2 scoped against frozen Battle lifecycle.

---

*Locked 2026-09-02 for Marcel Dickens. Assembly-director posture: wire and encode laws — do not redesign certified fabric.*
