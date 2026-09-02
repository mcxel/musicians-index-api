# LIVE Fan + Performer Mosaic Certification

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-01  
**Product law:** Marcel — Fan + Performer GO LIVE, Live Lobby Wall mosaic, Universal Media Player watch

---

## Task checklist

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Fan GO LIVE on media player | PASS | `CommandCenterMediaStack.tsx` mounts `MediaPlayerGoLiveControl` for both roles |
| 2 | Publish → registry + wall + home | PASS | `executeInstantGoLive` → POST `/api/live/go` → `DiscoveryBus.upsert`; fan category `fan-lobby` |
| 3 | Mosaic scroll panel | PASS | `LiveLobbyMosaicScrollRail.tsx` — WebRTC tiles, horizontal scroll, tap → `/hub/*?watch=` |
| 4 | Self-discovery | PASS | `YOU` badge + `scrollIntoView` when `publishedRoomId` / `hostUserId` matches |
| 5 | Browser cert | PARTIAL | Performer DOM wiring PASS; Fan DOM wiring PASS (login blocked — register 500 on test account) |
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
| `lib/dock/executeInstantGoLive.ts` | Role-aware joinRoute + fan experienceId |
| `lib/discovery/DiscoveryPublisher.ts` | Role-aware joinRoute from session category |
| `lib/broadcast/globalLiveSessionStore.ts` | `StreamCategory` includes `fan-lobby` |
| `app/api/live/go/route.ts` | Normalize `fan-lobby` category |
| `components/lobby/MiniLiveLobbyWallRuntime.tsx` | Watch → hub media player; no fake viewer counts |

---

## Browser acceptance template

### Fan GO LIVE

```
STATUS: ⏳ OPEN (automated wiring PASS — physical pending)
DEVICE: desktop
ROUTE: /hub/fan
TEST STEP:
1. Sign in as FAN
2. Tap 🔴 GO LIVE on media player bezel
3. Confirm LIVE badge + mosaic rail shows YOU tile
4. Open /home/1 or /home/3 — session appears in DiscoveryBus rotation
5. Tap another tile → media player loads watch session
EXPECTED: Fan social live listed; no performer battle/concert UI; watch opens in hub player
```

### Performer GO LIVE

```
STATUS: ⏳ OPEN (automated wiring PASS — physical pending)
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

| Role | Login | GO LIVE control | Mosaic rail | DOM wiring | Result |
|------|-------|-----------------|-------------|------------|--------|
| Performer | PASS | PASS | PASS | PASS | **PASS** |
| Fan | FAIL (test account) | PASS | PASS | PASS | **PARTIAL** |

Evidence: `performer-01-hub-before.png`, `fan-01-hub-before.png`, `cert-report.json`

Fan hub renders GO LIVE + mosaic rail without auth (public shell); authenticated Fan GO LIVE publish requires valid session — test fan register returned HTTP 500.

---

## Blockers

1. **Fan auth test account** — `/api/auth/register` returns 500 for programmatic fan signup; use existing Fan credentials for full publish cert.
2. **Camera / WebRTC preview** — tiles show honest empty/connecting state when no peer stream bound (not a wiring failure).

---

## Commits

| SHA | Message |
|-----|---------|
| `45b197e9` | Wire Fan + Performer GO LIVE mosaic rail to DiscoveryBus |
| *(pending)* | cert script + audit doc update |
