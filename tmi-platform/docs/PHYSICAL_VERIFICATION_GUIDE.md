# TMI Physical Verification Guide

**Branch:** `eos/vocal-improv-clean`  
**Harness rule:** Automated PASS ≠ physical certification. Phone / hardware proof still required where listed.  
**Do not fake PASS.** Record what was actually observed.

Companion harness commands (repo root, server at `E2E_BASE_URL` or `http://localhost:3000`):

| Command | Script | Evidence dir |
|---------|--------|--------------|
| `pnpm run cert:qp10` | `scripts/qp10-mobile-retest.mjs` | `qp10-evidence/` |
| `pnpm run cert:go-live` | `scripts/go-live-retest.mjs` | `tmp/go-live-retest/` |
| `pnpm run cert:gate3` | `scripts/gate3-broadcast-proof.mjs` → `scripts/cert-t3-t4-runtime.mjs` | `tmp/gate3-broadcast-proof/` + `tmp/t3-t4-runtime-cert/` |
| `pnpm run cert:gate4` | `scripts/gate4-media-audible-proof.mjs` | `tmp/gate4-media-audible-proof/` |
| `pnpm run cert:physical-suite` | runs all four in order | (combined) |

---

## Universal Acceptance Template

Copy one block per test step. Fill only what you physically saw/heard.

```text
ACCEPTANCE TEMPLATE

STATUS:
⏳ OPEN / 🟡 BLOCKED / 🔴 FAIL / 🟢 PASS

DEVICE:
<desktop / phone / tablet>

DEVICE MODEL:
<exact model if physical certification>

OS:
<Windows / iOS / Android / etc.>

BROWSER:
<Chrome / Safari / Edge / Firefox + version if known>

BUILD / SHA:
<exact candidate commit or deployed build>

ROUTE:
<exact URL / roomId>

MODULE / GATE:
<QP-10 | GO LIVE | Gate 3 | Gate 4>

TEST STEP:
<exact numbered step>

EXPECTED:
<what should have happened>

ACTUALLY OBSERVED:
<only what was physically visible/heard>

AUDIO CONTINUITY:
PASS / FAIL / N/A

VIDEO / WEBRTC CONTINUITY:
PASS / FAIL / N/A

ROOM ID / SESSION CONTINUITY:
PASS / FAIL / N/A

PLAYER STATE PRESERVED:
PASS / FAIL / N/A

LAYOUT / COLLISION:
PASS / FAIL / N/A

CONSOLE / NETWORK ERROR:
<exact error if captured>

SCREENSHOT / RECORDING:
<attached evidence>

FINAL RESULT:
🟢 PASS
or
🔴 FAIL AT STEP <n>

FOLLOW-UP RULE:
If FAIL, patch only the observed failing execution path.
Do not redesign frozen architecture.
```

---

## QP-10 — Mobile visual / density (360 / 390 / 430)

**Locked primary strip (do not change button set):**  
`MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | LOBBIES | GO LIVE`

**Harness covers:** button presence, forbidden labels absent (`MONITORS`, `HAND`, `EMOTES`, `STAGE`, `STREAM & WIN`), LOBBIES panel, density (page H-overflow, min tap height, strip scroll honesty) for Fan + Performer × 360/390/430.

**Still requires phone proof:**

1. Real iPhone / Android at ~360, 390, 430 CSS widths (or closest device).
2. Primary strip readable; horizontal strip scroll OK; **page** must not require sideways pan of the whole hub.
3. Tap each primary control once — each must open/toggle a real surface (no dead buttons).
4. Lower row must not duplicate `LOBBIES` or resurrect forbidden primary labels.

```text
MODULE / GATE: QP-10
ROUTE: /hub/fan and /hub/performer
EXPECTED: Seven locked primary labels; density usable on phone; LOBBIES opens honest wall or empty state
```

---

## GO LIVE retest (hub strip)

**Harness covers:** authenticated performer hub → click `GO LIVE` → POST `/api/live/go` → registry session / LIVE UI (in-place stage; navigation to `/live/rooms` is **not** required for harness PASS).

**Still requires phone / hardware proof:**

1. Grant camera + microphone.
2. Tap `GO LIVE` — local preview visible; button reaches `● LIVE` (or honest error).
3. Second device joins the same `roomId` and sees/hears the broadcast (not a black tile forever).
4. End live — registry and LIVE badges clear; no ghost session.

```text
MODULE / GATE: GO LIVE
ROUTE: /hub/performer (strip) → in-place stage / roomId
EXPECTED: Click publishes real session; second viewer receives live media
```

---

## Gate 3 — E2E Go Live broadcast convergence

**Harness covers:** `cert-t3-t4-runtime.mjs` create → discover → host/guest same `roomId` → end lifecycle → LIVE NOW N→N+1→N (API + anonymous Home 3 UI where applicable).

**Still requires phone proof:**

1. Full broadcast path with real A/V on two devices.
2. Lobby Wall / discovery surfaces show the same room **without fake viewers**.
3. End stream clears all LIVE surfaces within a short window.

```text
MODULE / GATE: Gate 3
ROUTE: POST /api/live/go → /live/rooms/{roomId} (host + guest)
EXPECTED: Same session for host and guest; count honest; end removes session
```

---

## Gate 4 — Upload → audible after refresh

**Harness covers:** source wiring for upload/blob/playlists; auth gate on upload; playlist/blob API liveness; optional HEAD reachability if account already has audio URLs.

**Still requires physical audible proof (mandatory for Gate 4 certification):**

1. Upload a real audio file via Media Locker / playlist UI.
2. Hard refresh.
3. Press play — sound must be heard on speakers/headphones.
4. Confirm player `src` (or network media request) points at the uploaded asset after refresh.
5. A green “upload success” toast alone is **not** a PASS.

```text
MODULE / GATE: Gate 4
ROUTE: media upload UI + player after refresh
EXPECTED: Upload persists; playback is audible after refresh
```

---

## Run log (this session — `eos/vocal-improv-clean` @ `9aaa6a27`)

| Gate | Harness command | Harness result | Physical result | Evidence path | Notes |
|------|-----------------|----------------|-----------------|---------------|-------|
| QP-10 | `pnpm run cert:qp10` | 🟢 PASS (after Next clean restart) | ⏳ phone density | `qp10-evidence/` | Fan+Performer × 360/390/430: locked 7-button strip + density PASS. Strip may H-scroll (`stripOverflowX=true`); page overflow false. Phone still required for real-device feel. |
| GO LIVE | `pnpm run cert:go-live` | 🔴 FAIL | ⏳ | `tmp/go-live-retest/` | Strip locked 7 buttons. Click → `● GOING LIVE…` (ui-phase PASS). Publish blocked: `POST /api/live/go` **500** (`PrismaClientConstructorValidationError`). |
| Gate 3 | `pnpm run cert:gate3` | 🔴 FAIL at `create_room` | ⏳ | `tmp/gate3-broadcast-proof/` + `tmp/t3-t4-runtime-cert/` | Same Prisma constructor 500 on create-room. |
| Gate 4 | `pnpm run cert:gate4` | 🟢 PASS (harness) | ⏳ PENDING audible | `tmp/gate4-media-audible-proof/` | Upload auth + playlist API OK; blob 503 (route mounted); no stored audio URLs → physical upload+hear still required. |

**Exit codes:** `0` PASS · `1` FAIL · `2` BLOCKED (server / missing dependency)

### Environment blocker (honest)

`POST /api/live/go` (create / publish) currently 500s with:

`PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"`

Until Prisma client construction is fixed in this runtime, Gate 3 + Go Live registry publish cannot harness-PASS. Do not mark them PASS.
