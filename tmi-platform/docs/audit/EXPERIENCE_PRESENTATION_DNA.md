# Experience Presentation DNA

**Locked:** 2026-09-02 — Marcel video cross-reference  
**Code:** `apps/web/src/lib/experiencePresentation/`  
**Matrix:** [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

Videos define **experience targets**. Screenshots prove **logic**. Borrow choreography/hierarchy from refs; **do not copy wrong semantics**.

---

## Shared primitives (all packs)

| Primitive | Role |
|-----------|------|
| `LiveVideoPanel` | WebRTC / camera / remote video tile |
| `IdentityPanel` | Nameplate, tier, role badge (real identity only) |
| `EnergyArc` | Visual hype meter driven by **authoritative** energy events |
| `AudioVisualizer` | Local mix visualization — never invents audio |
| `ReactionEmitter` | Emits only real user/bot-policy reactions |
| `TimerRing` | Round / turn / drop countdown from domain clock |
| `ScoreCard` | Battle / judged scores from authoritative ledger |
| `ResultCard` | Pass/fail / objective result — Challenge/Gauntlet |
| `ChallengeContract` | Central objective text + success criteria |
| `CypherCircle` | Collaborative ring layout (no corners) |
| `MicHandoff` | Pass-the-mic affordance + next-up |
| `LowerThird` | Broadcast identity / sponsor (Rule 12 chain) |
| `QueueRail` | ParticipantQueueDirector surface |
| `GameBoard` | GameShow board state |
| `PrizeLedgerView` | Displays PrizeLedger (Rule 23 gated — no fake money) |

**Presentation Event Bus:** may only spectacularize events from authoritative domain engines (battle score update, mic handoff completed, objective passed, real reaction). **Rejected:** fabricated crowd, fake tips, synthetic winner without engine verdict.

---

## Pack signatures

### Battle
- **DNA:** Adversarial symmetry — corners A/B, VS split, energy arcs, score cards, winner takeover (when engine declares).
- **Layouts allowed:** DUAL, A_DOMINANT, B_DOMINANT, PIP, SPLIT.
- **Forbidden as default:** objective-contract-as-center (that's Challenge).
- **Presence:** Live corners + fan audience avatars.

### Challenge
- **DNA:** Contract / objective central; timer; result vs criteria.
- **Layouts preferred:** OBJECTIVE_FOCUS, HOST_CLOSE, PIP.
- **VS corners:** not preferred; not the signature.
- **Primitives:** ChallengeContract, TimerRing, ResultCard.

### Cypher
- **DNA:** Collaborative circle; mic handoff; shared energy.
- **HARD FORBID:** VS layouts, winner/champion/elimination finales.
- **Ignore:** competitive ending of Cypher Base.mp4 reference.
- **Primitives:** CypherCircle, MicHandoff, LiveVideoPanel grid.

### Gauntlet
- **DNA:** Sequential trials; progress rail; one active focus.
- **Layouts:** OBJECTIVE_FOCUS, A_DOMINANT (active), SPLIT for handoff moments.
- **Elimination:** only if domain engine authorizes — Presentation Bus never invents it.

### Live Collaboration
- **DNA:** Multi-guest grid / speaker-active focus (collab streams, not competition).
- **Layouts:** SPLIT, PIP, GRID-like composition via multi-panel.
- **No winner.**

### Concert / World Concert
- **DNA:** Stage-forward; setlist; audience wall; commerce strip.
- **World:** multi-cam / producer-directed; 🌍 badge; platform-scheduled.
- **Mini:** qualified creator; ⭐ badge.
- **Presence:** fan avatars in seats.

### World Release
- **DNA:** Premiere drop; countdown; release media hero; lighter social.
- **Moment:** TRACK_CHANGE / COUNTDOWN_COMPLETE driven scenes.
- **World / Mini:** shared `composeReleaseProgram` — 🌍 `PROGRAM.WORLD_RELEASE` vs ⭐ `PROGRAM.RELEASE_PREMIERE`; never invent World.
- **Hard forbid:** Battle VS corners, Cypher circle combat, invented streams/preorders/attendance.

### Dance Party (WDP)
- **DNA:** DJ + dance floor; BPM; emotes; hybrid composition.
- **Presence:** fan avatars on floor (authorized).
- **World host:** DJ Record Ralph only.

### Lounge
- **DNA:** Free-roam **WebRTC panels**; proximity talk.
- **HARD FORBID:** avatar presence model.
- **Playlist Lounge:** same presence + playlist skin center.
- **Phase 1:** `composeLoungeProgram` → `LoungePresentationShell` (`PROGRAM.LOUNGE` / `PROGRAM.PLAYLIST_LOUNGE`).

### Monday Night Stage
- **DNA:** Flagship broadcast package — host, featured, lower thirds, lineup.
- **HARD:** ≠ Regular GO LIVE / PerformerLive pack.
- **Layouts:** HOST_CLOSE, HYBRID, GAME_BOARD-adjacent show beats.

### Game Show
- **DNA:** Host + contestants + board + turn timer + prize ledger view.
- **Layouts:** GAME_BOARD, HOST_CLOSE, SPLIT.
- **Engine:** Contestant / Round / Turn / Timer / PrizeLedger contracts.

### Fan Live / Fan Lobby
- **DNA:** Social-first hangout; friend gravity; not championship stage.
- **Presence:** fan avatars authorized (Rule 26) — lobby wall + invite.
- **HARD FORBID:** Battle VS, Cypher circle, Game Show board, WDP floor as signature.
- **Phase 1:** `composeFanLobbyProgram` → `FanLobbyPresentationShell` (`PROGRAM.FAN_LOBBY` via FanLive pack).

### Avatar Studio (not a PROGRAM pack)
- **DNA:** Create → customize → preview → save looks → enter authorized Fan worlds.
- **Preview Parity:** Studio + Quick Panel share one Canonical Avatar Draft; preview is a **subset** of production Fan rig capability. See [`AVATAR_PREVIEW_PARITY_LAW.md`](./AVATAR_PREVIEW_PARITY_LAW.md).
- **HARD FORBID:** fake neural Foundry, performer ownership UI, Lounge occupancy from studio lighting preview, claiming experienceCert from editor.

### Performer Live
- **DNA:** Host camera primary; audience secondary; Regular GO LIVE canary.
- **Lobby mode:** WebRTC panels only (see Performer Lobby matrix row).

---

## BroadcastCompositionDirector layouts

```
DUAL | A_DOMINANT | B_DOMINANT | PIP | SPLIT
OBJECTIVE_FOCUS | HOST_CLOSE | GAME_BOARD
CIRCLE_FOCUS | STAGE_WIDE | FLOOR_WIDE
```

Packs declare `allowedCompositions` + `forbiddenCompositions`. Semantic tests enforce Cypher/Lounge/Battle/Challenge guards.

---

## SOURCE ≠ DECODER ≠ TARGET

```
Live Session (one id)
  → ExperienceSourceRegistry (PROGRAM / ISO / AUDIENCE / JUMBOTRON / viewpoints)
    → Decoders (codec/pipeline — not ownership)
      → Display Targets (Universal Player slots, CAST, recording, Jumbotron)
```

One session → many sources → many targets **without** minting a new session id (Universal Player Freedom + Presence Continuity).

---

## Jumbotron dual role

1. **Discovery / LOOK UP** — preview of live experience (P0 certified path exists).
2. **In-venue big screen** — same sources, venue-mounted target.

Never a second experience ownership system.

---

*Locked 2026-09-02. Presentation spectacularizes truth — never manufactures it.*
