# T3 Live Join + T4 Runtime Certification Evidence — 2026-08-12

**Branch:** `eos/vocal-improv-clean`  
**main:** CLOSED (`bf9024fd`)  
**Rule:** No percentage inflation. Caveats listed below do not get erased by PASS labels.

**Script:** `scripts/cert-t3-t4-runtime.mjs`  
**Artifact:** `tmp/t3-t4-runtime-cert/report.json`

---

## Ledger (post this run)

| Target | Status |
|--------|--------|
| T1 Mobile / CC visual + in-place workspaces | **OPEN** (not in this pass; DISCOVERY floater + drawer convergence still pending owner phone) |
| T2 createRoom boolean + 403 | CORE **PASS** (prior) |
| T2 progressive caps | **FAIL / missing policy** (untouched) |
| T3 create→discover→host/guest same room | **RUNTIME PASS** (with caveats) |
| T4 LIVE NOW N→N+1→N | **RUNTIME PASS** (with caveats) |

---

## Certification output (latest successful run)

| Field | Value |
|-------|--------|
| baseline N | **0** |
| generated roomId | `room-t3t4-1786574194869` |
| create endpoint/status | `POST /api/live/go` intent `create-room` → **200** |
| DB/session persistence | create returned `session`; GET listed same `roomId` |
| registry proof | `userId=cmoq0bpst0000y8ujxlx12zk6`, privacy PUBLIC |
| discovery proof | guest `GET /api/live/go` sees room (`guestCount=1`) |
| guest join | `http://localhost:3000/live/rooms/room-t3t4-1786574194869?from=live-lobby` |
| host/guest same session | identical `roomId` on both hrefs |
| end lifecycle | `DELETE /api/live/go` → **200** `{ ok: true }` |
| final N | **0** |
| UI baseline | `LIVE NOW — 0 ACTIVE ROOMS` |
| UI after create | `LIVE NOW — 1 ACTIVE ROOMS` |
| UI final | `LIVE NOW — 0 ACTIVE ROOMS` |

Host: `berntmusic33@gmail.com` (DIAMOND)  
Guest: `micah@themusiciansindex.com` (DIAMOND fan)

---

## Active definition (unchanged from T4 impl)

- SoT: `GET /api/live/go` → `count`
- Active: registry session with `lastPingAt` ≤ 120s
- Public count excludes `INVITE_ONLY`; dedupes `roomId`
- Anchors / seeds never counted

---

## Fixes landed during this cert (required for UI N truth)

1. **Durable reconcile on empty memory** — `GlobalLiveSessionRegistry.server.ts` `getActiveSessionsDurable()` reloads from persistence when the in-memory map is empty (Next HMR/recompile was wiping sessions while `hydratedFromDb` blocked rehydrate → UI fetch showed 0 while a prior API read showed 1).
2. **Hydrate ping freshness** — `liveSessionPersistence.ts` `sessionFromUserRow` sets `lastPingAt = Date.now()` so User-row fallbacks are not immediately TTL-evicted.

---

## Caveats (honest — not 100% product-perfect)

1. **Create path:** exercised via authenticated Playwright `request.post` to the same endpoint `/live/rooms/new` targets. Automated **form click** previously failed to emit POST (hydration/overlay). Page + form load verified (`hasForm: true`).
2. **UI surface:** authenticated users are **307-redirected** from `/home/3` → `/dashboard` (middleware). LIVE NOW label was verified on **anonymous** `/home/3` polling the same SoT.
3. **Lobby DOM:** `hrefHit: false` on `/live/lobby` tile anchors; discovery proven via guest API + exact-room URL join (not lobby card scrape).
4. **Dev stability:** corrupted `.next` webpack packs caused intermittent 404 on `/api/live/go` DELETE/GET mid-run; required clean restart before the successful pass.

---

## T1 note (carried, not started here)

Locked next after this cert was T3+T4 only. T1 remaining blockers (owner screenshots):
- Vertical **DISCOVERY** floater still visible → find exact mount (not CSS kill-switch)
- Command Center shortcuts must open bottom-drawer workspaces in-place (not navigate away)

---

## Next

- Optional: harden lobby tile → exact `roomId` href visibility; wire LIVE NOW badge onto authenticated hub (middleware currently hides `/home/3`).
- Then **T5 Lounges** (only after owner accepts this evidence).
- Parallel queue: T1 in-place workspace convergence when authorized.
