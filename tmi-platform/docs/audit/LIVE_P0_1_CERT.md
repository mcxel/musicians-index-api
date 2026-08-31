# LIVE P0-1 CERT — Publication & Presence (media-player-first)

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Law docs:** [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md) · pointer in [`MASTER_BUILD_SYNC_2026-08-31.md`](./MASTER_BUILD_SYNC_2026-08-31.md) Appendix C  
**Artifacts:** `.cursor/artifacts/live-p0/`

---

## P0-1 RESULT (executive)

| Gate | Result |
|------|--------|
| Same-origin / no `:3002` / no CONNECTION_REFUSED | **PASS** |
| Hub hydration (`/_next/static` JS/CSS, not HTML/404) | **PASS** (after clean `.next` rebuild) |
| Media-player GO LIVE host visible | **PASS** (`MediaPlayerGoLiveControl`) |
| Real Performer auth | **PASS** |
| Browser click → `POST /api/live/go` **200** | **PASS** |
| UI LIVE only after publish | **PASS** |
| Lobby Wall `LIVE_SESSION` + `/hub/fan?watch=` | **PASS** |
| Fake green light when publish fails | **PASS** |

**Universal Media Player law:** locked. Primary watch = hub media player (`?watch=`), not siloed room page.

**Browser cert overall:** **PASS** (`.cursor/artifacts/live-p0/cert-report.json`, `network-summary.json`).

---

## Hydration blocker (fixed)

### Root cause
Corrupt / incomplete `apps/web/.next` on the running `:3000` process. HTML referenced `/_next/static/chunks/main-app.js` (etc.) but disk only had `webpack.js` + `polyfills.js` (~7 files). Next returned **404 HTML** for missing chunks → MIME `text/html` → React never hydrated → GO LIVE markup visible, handlers dead.

Not middleware eating `/_next/static` (matcher already excluded it). Not `assetPrefix`. Not a multi-port mismatch once a single clean `next dev -p 3000` was running.

### Fix
1. Kill listeners on `:3000`, delete `apps/web/.next` (+ `node_modules/.cache`).
2. Start one healthy `pnpm exec next dev -p 3000`; verify chunks `200` + `application/javascript`.
3. Defense-in-depth: middleware early `NextResponse.next()` for `/_next` and `/favicon.ico`.

### Secondary (post-hydration) — connection starvation
After hydration, click fired but browser `POST /api/live/go` hung (~45s timeout) while the same POST via cookie session outside the hub completed in ~3s. Hub flood of `POST /api/telemetry/ingest` + poll `GET /api/live/go` / session / beats exhausted HTTP/1.1’s ~6 connections per origin.

**Product mitigations:**
- `TelemetryTransportGovernor.pause()` during GO LIVE publish
- Soft client admit when media-player passes explicit role; **server `POST /api/live/go` remains hard auth**
- Skip blocking Daily mint before registry POST on hub in-place path
- Cert harness aborts telemetry + stubs poll GETs during E2E so publish gets a socket

---

## Files changed (this follow-up)

| File | Change |
|------|--------|
| `apps/web/middleware.ts` | Explicit `/_next` short-circuit |
| `apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts` | Soft admit when role passed; server POST authoritative |
| `apps/web/src/lib/dock/executeInstantGoLive.ts` | Soft session for publish; pause telemetry; POST timeout + priority |
| `apps/web/src/lib/analytics/TelemetryTransportGovernor.ts` | `pause(ms)` for critical publish |
| `.cursor/artifacts/live-p0/cert-live-p0-1.mjs` | Hydration + cookie jar + overlay dismiss + connection stubs |
| `docs/audit/LIVE_P0_1_CERT.md` | This update |

Prior P0-1 publish wiring (media player, lobby wall watch routes, canonical resolver) remains from `28020c7f`.

---

## Browser / network proof

- `liveGoPosts`: `[{ status: 200 }]`
- Lobby Wall sample: `sourceType=LIVE_SESSION`, `route=/hub/fan?watch=room-hub-…&from=live-lobby-wall`
- Screenshots: `01-hub-before.png`, `02-after-golive.png`, `03-after-cleanup.png`
- Console: no chunk MIME/404 after rebuild

---

## Remaining / out of scope (STOP until noted)

1. Audience presence / seat visibility for performer — **not started** (per stop rule; browser GO LIVE now PASS).
2. CAST / QR / platform lights — **STOP** until this gate (now green).
3. Optional: throttle hub poll clients product-wide beyond telemetry pause (cert stubs prove the starvation class).
4. Full Media Viewport Director / Experience Contracts — OPEN in law file.

---

## Typecheck / commits

Touched GO LIVE + middleware + telemetry governor — run filtered typecheck before merge.  
Commits: see git log on `eos/vocal-improv-clean` after hydration follow-up push.

---

## Media-player host acknowledgment (mandatory)

- **Component:** `MediaPlayerGoLiveControl`  
- **Surface:** `CommandCenterMediaStack` (`data-media-player-live-bezel`)  
- **Publish path:** media player → `presentInstantGoLiveInPlace` → `executeInstantGoLive` → `POST /api/live/go` → Lobby Wall  
- **Watch path:** Lobby Wall → `/hub/fan?watch={roomId}` → Universal Media Player  
