# LIVE P0-2 CERT — Lobby Wall sync + audience presence binding

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Prior gate:** [`LIVE_P0_1_CERT.md`](./LIVE_P0_1_CERT.md) (`389e2e08`)  
**Law:** [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md)  
**Harness:** `.cursor/artifacts/live-p0/cert-live-p0-2.mjs` → `cert-p0-2-report.json`

---

## Scope (this slice only)

1. DiscoveryBus / GlobalLiveSessionRegistry → Lobby Wall sync (no stale poll kill / replaceAll wipe loops)
2. Real audience presence on Universal Media Player watch path (`?watch=` → occupancy)
3. Performer Monitor B shows **human** counts (Rule 20 — no bot inflation)
4. Home 13s orbit — verify DiscoveryBus only (no Showroom/Happy Days rebuild)
5. Fan SOCIAL_LIVE — presence join must not hard-block Fan; no full Fan GO LIVE UI this slice
6. Presence feeds media-player audience viewport / WatchSession — not a siloed canister as primary

**Hard stops:** CAST / platform bezel lights / Fan·Performer ID+QR — deferred.  
**Hard stops:** do not edit `apps/web/src/lib/liveFabric/**`.

---

## Wiring locked

| Path | Change |
|------|--------|
| `POST /api/live/audience` | `viewerCount` sync = **humans only** (`countHumanAttendance`); empty audience no longer ends published GO LIVE |
| `DiscoveryPublisher.startDiscoveryPoll` | **Ref-counted** shared interval (multi-`useDiscoveryBus` safe) |
| `syncDiscoveryFromSessions` | Grace-merge recent client upserts + prefer higher human counts (POST→GET race) |
| `useMediaPlayerAudiencePresence` | Watch bind → join / unbind → leave; host skip when `isPublishedHost` |
| `CommandCenterShell` | Wires presence to `inPlace.roomId` after `?watch=` |
| `HubMonitorVenuePlayer` | Polls `/api/live/audience` whenever `roomId` bound; `data-audience-watching` |
| `WatchSessionContext` + `PersistentMiniPlayer` | `updateViewers` via `tmi:watch-audience-count` |

### Verified (no rebuild)

- Home 13s rotation: `useHomeDiscoveryRotation` → `useDiscoveryBus` only for live orbit (`HOME_BROADCAST_ROTATION_MS` = 13s).
- Fan publish listing remains restricted; **audience join** is not Fan-hard-blocked (dating soft-gate only).

---

## Browser / dual-context proof

```text
node .cursor/artifacts/live-p0/cert-live-p0-2.mjs
```

| Gate | Result (2026-08-31) |
|------|---------------------|
| Performer `POST /api/live/go` 200 | **PASS** (API publish; media-player click already P0-1) |
| Distinct fan `POST /api/live/audience` join | **PASS** — humans 0→1 |
| Monitor B `data-audience-watching` ≥1 | **PASS** |
| Registry `viewerCount` = humans (not bots) | **PASS** (`viewerCount=1`) |
| Host `?watch=` → audience join POST | **PASS** (`host-watch-bind`) |
| Dual-context watch tab | **PASS** |
| Fan leave → humans decrease; session still published | **PASS** (0 humans, session live) |
| Lobby Wall LIVE_SESSION + `/hub/fan?watch=` | **PASS** |

Screenshots: `p0-2-01-host-live.png`, `p0-2-02-watch-context.png`, `p0-2-03-after-leave.png`.  
Report: `.cursor/artifacts/live-p0/cert-p0-2-report.json`.

---

## Out of scope / next

- CAST / PiP product depth
- Fan / Performer ID + QR bezel
- Platform status lights
- Full Fan social GO LIVE UI (policy path only verified for presence)
- `liveFabric/**` foundation (parallel)
- Optional: align `/api/live/lobby-wall` `realHumanCount` with registry human sync (card still listed LIVE; count field lagged at 0 in one sample)

---

## Return block

```
Registry→Wall sync: PASS — DiscoveryBus ref-counted poll + grace merge; Lobby Wall LIVE_SESSION + watch route
Audience binding: PASS — useMediaPlayerAudiencePresence on ?watch=; humans-only registry sync
Performer sees real count?: YES — Monitor B data-audience-watching=1 after fan join
Browser proof: PASS — cert-live-p0-2.mjs / cert-p0-2-report.json
Commit: (see git)
Push: (see git)
Blockers before CAST/ID: none for presence; CAST/QR still explicitly deferred
```
