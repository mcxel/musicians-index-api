# Universal Media Player Runtime — Platform Law

**Locked:** 2026-08-31 by Marcel Dickens  
**Status:** LAW (canonical direction) + P0-1 partial wiring  
**Companion cert:** [`LIVE_P0_1_CERT.md`](./LIVE_P0_1_CERT.md)  
**Master sync pointer:** [`MASTER_BUILD_SYNC_2026-08-31.md`](./MASTER_BUILD_SYNC_2026-08-31.md) §0 / P0

---

## Hard law

**If an experience is meant to be watched, it is watched through the Universal Media Player Runtime.**

- Venue / room / lobby / world = spatial / runtime **context**
- Media player = **viewing surface**
- Do **not** put the primary watch experience in a separate room page, canister, or one-off viewer shell

Applies to **all** watchable experiences: Regular live, Mini Concert, World Concert, World Release, Battle, Cypher, Challenge, Monday Night Stage / Live, and future event types.

Production chain:

```
GO LIVE / scheduled
 → canonical Live Session (GlobalLiveSessionRegistry)
 → media feeds + spatial presence
 → Universal Media Player Runtime
 → viewport orchestration
 → audience / avatar viewport
 → interaction / commerce
 → CAST / PiP / fullscreen
 → recording / replay
 → clean disconnect
```

---

## Multi-viewport architecture (same player, different Experience Media Contracts)

| Viewport | Role |
|----------|------|
| **Primary Stage** | Performer / host / featured / battle A\|B / cypher focus / premiere feed |
| **Audience** | Real presence (fan avatars where applicable), reactions, group actions — **not** fake crowds |
| **Secondary Feed** | Alt cams, backstage, judges, guests, DJ, instruments, replay, sponsor |
| **Context** | Lyrics, setlist, bracket, queue, voting, metadata |
| **Commerce** | Tips / merch / tickets / VIP without ejecting from watch |
| **Communication** | Chat / reactions / polls |
| **Operational Bezel** | CAST, Fan/Performer ID+QR, mic/cam, recording, platform lights, quality, privacy/publication, fullscreen / PiP / view selector |

**Media Viewport Director** (future) assigns panels dynamically from the experience contract (Battle ≠ Concert ≠ Cypher). Same Universal Media Player architecture — never a second player system.

---

## Supercharge requirements (canonical direction)

| # | Requirement | P0-1 status |
|---|-------------|-------------|
| 1 | One **Experience Media Contract** per experience type | **OPEN** — not built |
| 2 | One **Media Session Director** — one session ID across registry, WebRTC, player, Lobby Wall, audience, CAST, recording, disconnect | **PARTIAL** — `GlobalLiveSessionRegistry` + `canonicalMediaPlayerRuntime.roomId` + Lobby Wall; full director **OPEN** |
| 3 | Panel priority / failover (no permanent black secondary) | **OPEN** |
| 4 | User view presets: STAGE, STAGE+AUDIENCE, MULTICAM, SOCIAL, IMMERSIVE (+ mobile swipe) | **OPEN** (layout modes exist on runtime; presets **OPEN**) |
| 5 | Audio director — multi-panel ≠ multi uncontrolled audio | **PARTIAL** — `primaryAudioFrame` arbitration exists |
| 6 | Fan avatar audience camera = real presence only | **PARTIAL** — audience engines exist; full avatar cam cert **OPEN** |
| 7 | Dock / PiP / fullscreen preserve same session | **PARTIAL** — `PersistentMiniPlayer` + WatchSession; PiP product cert **OPEN** |
| 8 | CAST casts the *session* with TV layout; phone = controller | **OPEN** (CAST UI scaffold only — out of P0-1 depth) |
| 9 | Recording / replay reuse viewport metadata | **OPEN** |
| 10 | Accessibility inside media runtime | **OPEN** |
| 11 | Feed-level moderation (mute one panel without killing session) | **OPEN** |
| 12 | Observatory panel-level telemetry | **OPEN** |

Rule 20: do not stub fake Viewport Director / Experience Contracts.

---

## What exists now (reuse — do not reinvent)

| Surface / engine | Path | Role |
|------------------|------|------|
| Command Center dual monitors | `CommandCenterMediaStack` + `CanonicalDualMonitorStack` | Primary Universal Media Player chassis on hub |
| Canonical runtime | `lib/media/canonicalMediaPlayerRuntime.ts` | Frame sources, layout, primary audio, roomId |
| Chassis ownership / skins | `MEDIA_PLAYER_CHASSIS_REGISTRY` (`PlaylistArtifactEngine`) + `MediaPlayerOwnershipService` (`85f853e2` era) | Cosmetic chassis — **not** a second live runtime |
| Profile showcase | `ProfileMediaPlayerShowcase` | Profile-bound player surface |
| Persistent mini | `PersistentMiniPlayer` + `WatchSessionContext` | Dock / still-watching |
| Live discovery overlay | `GlobalLiveDiscoveryOverlay` | Lobby Wall UI → join |
| Instant GO LIVE | `MediaPlayerGoLiveControl` → `presentInstantGoLiveInPlace` → `executeInstantGoLive` → `POST /api/live/go` | Publication authority on media-player bezel |
| Registry | `GlobalLiveSessionRegistry` (+ durable server) | Live session SoT |
| Watch route helper | `lib/media/universalMediaPlayerWatchRoute.ts` | Lobby Wall / discovery → `/hub/*?watch=` |

---

## P0-1 wiring locked this slice

1. **GO LIVE** hosts on `MediaPlayerGoLiveControl` inside `CommandCenterMediaStack` (`data-media-player-go-live`) — operational bezel, media-player-first.
2. Hub session strip / creator cluster **deep-link** via `tmi:media-player-golive-intent` — do not publish as orphan chrome.
3. Publish success → `canonicalMediaPlayerRuntime` bind (SELF_CAMERA + VENUE_VIEW) + `isLivePublished` only after registry OK.
4. Lobby Wall `LIVE_SESSION` cards route to `mediaPlayerWatchHref` (`/hub/fan?watch=…`) — primary watch is hub media player.
5. `CommandCenterShell` `?watch=` binds the same runtime + GoLive transition in-place.
6. Same-origin APIs via `canonicalEndpointResolver` — no `:3002` silent fallback.

**Still OPEN after P0-1:** full Viewport Director, Experience Media Contracts, CAST/QR/platform lights product depth, audience presence sync E2E, WebRTC multi-device cert.

---

## Anti-patterns (forbidden)

- Primary watch = only `/live/rooms/[id]` room page / GoLiveStudio silo
- Second media player system parallel to `canonicalMediaPlayerRuntime`
- Fake green LIVE without registry publish
- Fake audience / black secondary left as “success”
- Hardcoded `localhost:3002` for Next same-app APIs
