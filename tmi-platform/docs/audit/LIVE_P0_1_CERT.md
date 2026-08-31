# LIVE P0-1 CERT — Publication & Presence (media-player-first)

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Law docs:** [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md) · pointer in [`MASTER_BUILD_SYNC_2026-08-31.md`](./MASTER_BUILD_SYNC_2026-08-31.md) Appendix C  
**Artifacts:** `.cursor/artifacts/live-p0/`

---

## P0-1 RESULT (executive)

| Gate | Result |
|------|--------|
| Same-origin / no `:3002` / no CONNECTION_REFUSED | **PASS** (browser network) |
| Media-player GO LIVE host visible | **PASS** (`MediaPlayerGoLiveControl` on `CommandCenterMediaStack`) |
| Real Performer auth | **PASS** (API + session) |
| `POST /api/live/go` → registry | **PASS** (API session cookie path) |
| Lobby Wall discoverable + media-player watch route | **PASS** (API: `LIVE_SESSION` → `/hub/fan?watch=…`) |
| Browser click → POST from media-player button | **PARTIAL / FAIL** (button visible; click→POST flaky under Playwright — see blockers) |
| Fake green light when publish fails | **PASS** (UI did not claim LIVE without POST) |

**Universal Media Player law:** locked. Primary watch = hub media player (`?watch=`), not siloed room page.

---

## 1. Root cause(s) of ERR_CONNECTION_REFUSED

1. **`apps/web/src/app/home/1/page.tsx`** used `NEXT_PUBLIC_API_URL || 'http://localhost:3002'` for SSR performer fetch while Next listens on **:3000** → `ERR_CONNECTION_REFUSED` when env unset.  
2. **Silent dead localhost fallbacks** in `lib/tmi.ts` (`:3001`) and magazine `liveFeedBus.ts` (`ws://…:8080`) caused console CONNECTION_REFUSED noise.  
3. GO LIVE publish path itself already used relative `/api/live/go` / `/api/auth/session` (same-origin) — not the primary :3002 offender.

---

## 2. Files changed (P0-1)

| File | Change |
|------|--------|
| `apps/web/src/lib/runtime/canonicalEndpointResolver.ts` | **NEW** — one resolver; no dead localhost fallback |
| `apps/web/src/app/home/1/page.tsx` | Same-origin `/api/performers` via resolver |
| `apps/web/src/lib/tmi.ts` | Fail if `API_BASE_URL` missing |
| `apps/web/src/packages/magazine-engine/liveFeedBus.ts` | Socket only if `NEXT_PUBLIC_TMI_FEED_SOCKET_URL` |
| `apps/web/src/lib/dock/executeInstantGoLive.ts` | Real auth required; fail publish on non-OK; no fake DiscoveryBus on fail |
| `apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts` | Real session admit; `isLivePublished` only after `published` |
| `apps/web/src/app/api/live/lobby-wall/route.ts` | Durable sessions; LIVE_SESSION → `mediaPlayerWatchHref` |
| `apps/web/src/lib/media/universalMediaPlayerWatchRoute.ts` | **NEW** — hub `?watch=` routes |
| `apps/web/src/lib/discovery/DiscoveryPublisher.ts` | joinRoute → hub watch |
| `apps/web/src/components/commandCenter/MediaPlayerGoLiveControl.tsx` | **NEW** — canonical GO LIVE on media player |
| `apps/web/src/components/commandCenter/CommandCenterMediaStack.tsx` | Mount GO LIVE on live bezel |
| `apps/web/src/components/commandCenter/CommandCenterSessionControlStrip.tsx` | Deep-link intent only |
| `apps/web/src/components/commandCenter/PerformerCreatorControlCluster.tsx` | Deep-link intent only |
| `apps/web/src/components/commandCenter/CommandCenterShell.tsx` | `?watch=` binds Universal Media Player |
| `apps/web/src/components/presence/PersistentMiniPlayer.tsx` | Restore → media player watch |
| `docs/audit/LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md` | **NEW** law |
| `docs/audit/MASTER_BUILD_SYNC_2026-08-31.md` | Appendix C pointer |
| `.cursor/artifacts/live-p0/cert-live-p0-1.mjs` | Browser cert harness |

---

## 3. Dead localhost refs removed/converted

- `home/1` `:3002` → same-origin absolute via request headers  
- `tmi.ts` `:3001` silent fallback → explicit fail  
- `liveFeedBus` `:8080` auto-connect → env-gated only  

---

## 4. Canonical endpoint resolver

`apps/web/src/lib/runtime/canonicalEndpointResolver.ts`  
- Same-app: `resolveSameOriginApi` / `resolveSameOriginApiAbsolute`  
- External: `resolveExternalServiceBase` (throws if missing / dead localhost)

---

## 5. Authentication path

`POST /api/auth/login` (Performer cert) → cookies → `GET /api/auth/session` → client admit + `POST /api/live/go` sessionUserId / `getTmiAuth` / `admitGoLive`. No simulated performer.

---

## 6. Publication state transitions

`IDLE → … → presentInstantGoLiveInPlace → executeInstantGoLive → POST /api/live/go`  
`isLivePublished=true` **only** when `result.published === true`. Unauthorized/fail clears published claim.

---

## 7. Browser / network proof

- `.cursor/artifacts/live-p0/cert-report.json`  
- Screenshots when produced: `01-hub-before.png`, `02-after-golive.png`  
- API probe (same day): `POST /api/live/go` **200** + Lobby Wall `LIVE_SESSION` `route=/hub/fan?watch=room-p0-cert-api&from=live-lobby-wall`

---

## 8. Performer on Live Lobby discovery?

**Y** via authenticated API publish (session appeared as `LIVE_SESSION` with media-player watch route).  
**Browser UI publish click:** not yet reliably proven (POST count 0 in Playwright). Console showed `/_next/static/chunks/*.js` returning HTML/404 — hub shell may render markup without hydrated React handlers. **API publish path + Lobby Wall media-player route: PASS.**

---

## 9. Remaining blocker before audience-presence sync

1. Harden Playwright → React click on `data-media-player-go-live` (or expose a test hook) so browser E2E POST is reliable.  
2. Audience presence / seat visibility for performer (out of P0-1 publish scope).  
3. Full Media Viewport Director / Experience Contracts (documented OPEN in law file).  
4. CAST / QR / platform lights — **STOP** until browser publish click is green (Marcel).

---

## 10. Commits + push

See git log on `eos/vocal-improv-clean` after this handoff commit.

---

## 11. Typecheck (touched files)

Run `pnpm typecheck` / filtered `tsc` on touched paths before merge; fix any new errors in owned files.

---

## Media-player host acknowledgment (mandatory)

- **Component:** `MediaPlayerGoLiveControl`  
- **Surface:** `CommandCenterMediaStack` (`data-media-player-live-bezel`)  
- **Publish path:** media player → `presentInstantGoLiveInPlace` → `executeInstantGoLive` → `GlobalLiveSessionRegistry` → Lobby Wall  
- **Watch path:** Lobby Wall → `/hub/fan?watch={roomId}` → `CommandCenterShell` binds `canonicalMediaPlayerRuntime`
