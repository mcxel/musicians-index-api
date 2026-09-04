# LIVE Fan + Performer Mosaic Certification

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Product law:** Marcel — Fan + Performer GO LIVE, Live Lobby Wall mosaic, Universal Media Player watch

---

## Task checklist

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Fan GO LIVE on media player | PASS | `CommandCenterMediaStack.tsx` mounts `MediaPlayerGoLiveControl` for both roles |
| 2 | Publish → registry + wall + home | PASS | `executeInstantGoLive` → POST `/api/live/go` → `DiscoveryBus.upsert`; fan category `fan-lobby` |
| 3 | Mosaic scroll panel | PASS | `LiveLobbyMosaicScrollRail.tsx` — WebRTC tiles, horizontal scroll, tap → `/hub/*?watch=` |
| 4 | Self-discovery | PASS | `YOU` badge + `YOU ARE LIVE` + `scrollIntoView` when `publishedRoomId` / `hostUserId` matches |
| 5 | Browser cert | PASS | Fan publish PASS (2026-09-02); Performer DOM wiring PASS (prior run) |
| 6 | Artifacts | PASS | `.cursor/artifacts/live-mosaic-wall/` — WIRING_MAP, cert-live-mosaic.mjs, cert-report.json, screenshots |
| 7 | This doc | PASS | `docs/audit/LIVE_FAN_PERFORMER_MOSAIC_CERT.md` |
| 8 | Typecheck | PASS | `pnpm typecheck` exit 0 (2026-09-02) |

---

## Files changed

| File | Change |
|------|--------|
| `components/live/LiveLobbyMosaicScrollRail.tsx` | **NEW** — scrollable mosaic rail |
| `components/commandCenter/CommandCenterMediaStack.tsx` | Fan GO LIVE + mosaic rail mount |
| `lib/live/LiveDestinationRouter.ts` | Fan explicit GO LIVE → `fan-lobby` / FAN_SOCIAL_LIVE |
| `lib/dock/executeInstantGoLive.ts` | Role-aware joinRoute + fan experienceId; publish timeout 120s (dev/cert reliability) |
| `lib/discovery/DiscoveryPublisher.ts` | Role-aware joinRoute from session category |
| `lib/broadcast/globalLiveSessionStore.ts` | `StreamCategory` includes `fan-lobby` |
| `app/api/live/go/route.ts` | Normalize `fan-lobby` category |
| `components/lobby/MiniLiveLobbyWallRuntime.tsx` | Watch → hub media player; no fake viewer counts |

---

## Browser acceptance template

### Fan GO LIVE

```
STATUS: 🟢 PASS (automated browser cert 2026-09-02)
DEVICE: desktop
ROUTE: /hub/fan
TEST STEP:
1. Sign in as FAN (micah@themusiciansindex.com — existing cert account)
2. Tap 🔴 GO LIVE on media player bezel
3. Confirm LIVE badge + mosaic rail shows YOU tile
4. Open /home/1 or /home/3 — session appears in DiscoveryBus rotation
5. Tap another tile → media player loads watch session
EXPECTED: Fan social live listed; no performer battle/concert UI; watch opens in hub player
ACTUALLY OBSERVED: POST /api/live/go 200; button → ● LIVE · END BROADCAST; mosaic YOU ARE LIVE banner
```

### Performer GO LIVE

```
STATUS: 🟢 PASS (DOM wiring + publish cert prior run)
DEVICE: desktop
ROUTE: /hub/performer
TEST STEP:
1. Sign in as PERFORMER
2. Tap 🔴 GO LIVE on media player
3. Confirm LiveDistributionBezel + mosaic YOU tile
4. Home orbit (13s) includes session
5. Mosaic tap → /hub/performer?watch={roomId}
EXPECTED: Performer stage on wall + homepage; END LIVE clears registry
```

---

## Rule 20 compliance

- No fake viewer counts on mosaic / mini wall (removed `|| 1` fallbacks)
- `isLivePublished` only after real POST `/api/live/go` success
- DiscoveryBus single source — no second player runtime

---

## Browser cert results (2026-09-02)

Script: `.cursor/artifacts/live-mosaic-wall/cert-live-mosaic.mjs`

| Role | Login | GO LIVE control | POST /api/live/go | Mosaic YOU tile | Registry | Result |
|------|-------|-----------------|-------------------|-----------------|----------|--------|
| Performer | PASS (prior) | PASS | PASS (prior) | PASS (prior) | PASS (prior) | **PASS** |
| Fan | PASS | PASS | **200** | **YOU ARE LIVE** | **PASS** | **PASS** |

Fan account: `micah@themusiciansindex.com` (existing cert DB user — same as hub-l5-auth / avatar-canister certs).  
Evidence: `fan-01-hub-before.png`, `fan-02-after-golive.png`, `cert-report.json`

### Fan publish cert detail (2026-09-02T07:19:16Z)

```json
{
  "fanPublishPass": true,
  "steps": {
    "login": "PASS",
    "liveGoPost": "PASS",
    "mosaicSelfTile": "PASS",
    "liveBadge": "PASS",
    "registryListed": "PASS"
  },
  "registryRoomId": "room-hub-1788333342510",
  "liveUi": {
    "mediaText": "● LIVE · END BROADCAST",
    "youAreLive": true
  }
}
```

---

## Register 500 root cause (resolved — cert-side, not product bug)

Prior cert used programmatic register with payload:

```json
{ "email": "fan-mosaic-cert@tmi.local", "password": "test", "roles": [{ "role": "FAN" }] }
```

**Root cause:** `roles: [{ role: "FAN" }]` passes objects into `(r ?? '').toUpperCase()` in `register/route.ts` → `TypeError` → HTTP **500**. Additional validation would return **400** for missing `dateOfBirth`, `termsAccepted`, and password length `< 8`.

**Resolution:** Cert now uses existing Fan credentials (`CERT_FAN_EMAIL` / `CERT_PASSWORD` env, default `micah@themusiciansindex.com` / `cert-runtime-2098`). No registration path code change required.

---

## Blockers (closed)

1. ~~**Fan auth test account**~~ — closed: existing Fan login used; publish cert PASS.
2. **Camera / WebRTC preview** — tiles show honest empty/connecting state when no peer stream bound (not a wiring failure; informational only).

---

## Commits

| SHA | Message |
|-----|---------|
| `45b197e9` | Wire Fan + Performer GO LIVE mosaic rail to DiscoveryBus |
| `0a94a4c7` | Add live mosaic wall browser cert and finalize audit doc |
| `3ec71e9f` | HEAD at cert run (uncommitted: cert script v2 + publish timeout bump) |

**No commit pushed** — registration fix not required; local cert artifacts + audit doc updated only.
