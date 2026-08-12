# Fix #1 Mobile Visual Cert — Measure Report

**Date:** 2026-08-12  
**Branch:** `eos/vocal-improv-clean`  
**Requested tip candidate:** `c270ede7`  
**HEAD when measure run started:** `811b2bc60107fa76253128a412d7505c245e70ae` (`811b2bc6`) — docs commit atop `c270ede7`.  
**Branch tip at report commit time:** verify with `git rev-parse HEAD` (may be ahead of `811b2bc6`; `c270ede7` remains an ancestor).  
**Server measured:** local `pnpm --filter web dev` serving workspace files at measure time (not a production deploy).  
**Method:** Headless Chromium via patchright (`channel: chromium`), mobile UA + `isMobile`/`hasTouch`, viewports 360×800 / 390×844 / 430×932. Desktop Site OFF equivalent.  
**Base URL:** `http://localhost:3000` (local `pnpm --filter web dev`)  
**Auth:** No `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` in runner env; no browser cookie session. All hub/admin routes redirected to `/auth?next=…`.  
**NO CODE FIXES in this pass.**

Raw JSON + PNGs: `tmp/mobile-visual-cert/` (local evidence; not required for cert claim).

---

## Overall verdict

| Gate | Result |
|------|--------|
| **Overall** | **BLOCKED** |
| A. Width isolation (documentElement.scrollWidth) on reached pages | **PASS** numerically on `/auth` |
| A. Exclusive role shell (Fan≠Performer≠Admin DOM) | **BLOCKED** — Command Center never mounted |
| B. UX geometry (stage / OPS / CHAT / vertical order) | **BLOCKED** — auth gate; no CC stage |
| Should Fix #1 implementation start? | **NO** — not until authenticated Fan/Performer/Admin shells are measured |

---

## Hard blocker

| Item | Detail |
|------|--------|
| Blocker | Unauthenticated session |
| Behavior | `/hub/fan`, `/hub/performer`, `/admin/overseer` → `307`/client redirect → `/auth?next=…` |
| Login attempt | Skipped (`no E2E_TEST_EMAIL/PASSWORD`) |
| Cursor browser MCP | Unavailable this session (`No browser tab available`) |
| What was still measured | Auth landing at each target width; overflow offenders; DISCOVERY off-canvas panel; screenshots |

Without an authenticated session, Gates A (exclusive shell) and B (Command Center UX geometry) **cannot** be certified. Width numbers on the auth shell are **not** a substitute for Fan/Performer/Admin HQ cert.

---

## Compact matrix

### Fan (requested first)

| role | width | route | renderedShell | innerWidth | clientWidth | scrollWidth | widthPass | exclusiveShellPass | notes |
|------|------:|-------|---------------|----------:|------------:|------------:|:---------:|:------------------:|-------|
| Fan | 360 | `/hub/fan` | auth-gate | 360 | 360 | 360 | PASS | BLOCKED | Redirect `/auth?next=%2Fhub%2Ffan`. No `[data-role]`. Off-canvas DISCOVERY panel `right=691`. Shot: `tmp/mobile-visual-cert/Fan-360-closed.png` (path recorded; file may be missing from first batch). |
| Fan | 390 | `/hub/fan` | auth-gate | 390 | 390 | 390 | PASS | BLOCKED | Same auth gate. Shot: `Fan-390-closed.png`. |
| Fan | 430 | `/hub/fan` | auth-gate | 430 | 430 | 430 | PASS | BLOCKED | Same. Shot: `Fan-430-closed.png`. |

### Performer

| role | width | route | renderedShell | innerWidth | clientWidth | scrollWidth | widthPass | exclusiveShellPass | notes |
|------|------:|-------|---------------|----------:|------------:|------------:|:---------:|:------------------:|-------|
| Performer | 360 | `/hub/performer` | auth-gate | 360 | 360 | 360 | PASS | BLOCKED | `/auth?next=%2Fhub%2Fperformer`. Ads & privacy overlay + beta banner present in shot (`Performer-360-closed.png`). |
| Performer | 390 | `/hub/performer` | auth-gate | 390 | 390 | 390 | PASS | BLOCKED | Auth only. |
| Performer | 430 | `/hub/performer` | auth-gate | 430 | 430 | 430 | PASS | BLOCKED | Auth only. |

### Admin / Overseer

| role | width | route | renderedShell | innerWidth | clientWidth | scrollWidth | widthPass | exclusiveShellPass | notes |
|------|------:|-------|---------------|----------:|------------:|------------:|:---------:|:------------------:|-------|
| Admin | 360 | `/admin/overseer` | auth-gate | 360 | 360 | 360 | PASS | BLOCKED | `/auth?next=%2Fadmin%2Foverseer`. Admin path not reached. |
| Admin | 390 | `/admin/overseer` | auth-gate | 390 | 390 | 390 | PASS | BLOCKED | Auth only. |
| Admin | 430 | `/admin/overseer` | auth-gate | 430 | 430 | 430 | PASS | BLOCKED | Auth only. |

**uxGeometryPass:** BLOCKED for all 9 cells (no video stage / ☰ OPS / 💬 CHAT Command Center chrome).

---

## Gate A — Width isolation (detail)

### Document metrics
On every measured cell: `scrollWidth === innerWidth === clientWidth` (360/390/430). MatchMedia `(max-width: 767px)` = true.

### Caveat — `overflow-x: hidden` on `<body>`
First overflow walk finds off-canvas nodes, then:

- **Leaf offender:** anonymous `DIV` with `left ≈ innerWidth`, `width ≈ 330–331`, `right ≈ innerWidth + 331` (e.g. 360→691).
- **First viewport-constrained ancestor:** `BODY.tmi-obsidian-cinematic.overflow-x-hidden` (`overflowX: hidden`, `maxWidth` equal to viewport).

This is **not** credited as a clean width architecture win. Instruction for this cert: do **not** treat `overflow-x:hidden` as a certification shortcut. Off-canvas content still exists in the DOM; scrollWidth PASS may be masked by body clip.

### Horizontal role swipe / neighboring shell “give”
**Not observable** on auth pages — no Fan/Performer/Admin Command Center shells mounted, so no role-track swipe test executed.

### Exclusive shell verification (3d2a077e intent)

| Check | Browser result | Source-only note (not cert) |
|-------|----------------|-----------------------------|
| Fan page mounts only Fan CC | **BLOCKED** — auth | `DashboardWorkspaceContainer` mounts Fan **or** Performer exclusively (`active === "fan" ? … : null`); Admin is route-separate `/admin/overseer` |
| Performer page mounts only Performer | **BLOCKED** | Same exclusive ternary; lazy `PerformerCommandCenter` |
| Admin mounts only Overseer | **BLOCKED** | Admin never co-mounted in dashboard container (comment + code) |
| Multiple `[data-role]` / CC trees | None on auth (0) | N/A until authenticated |
| `CommandCenterShell` `data-role={role}` | Not in DOM | Present in `CommandCenterShell.tsx` |

**Exclusive shell browser result: BLOCKED (incomplete). Code candidate exists; not browser-proven.**

---

## Gate B — UX geometry (detail)

| Requirement | Result |
|-------------|--------|
| Monitor/video stage visible & stable | **BLOCKED** — not rendered behind auth |
| ☰ OPS / 💬 CHAT must not push/shrink/cover stage | **BLOCKED** — CC controls absent. Auth page has ☰ DISCOVERY tab (not OPS/CHAT). |
| Canonical order: header → video → controls → mini player → quick bar → bottom drawer | **BLOCKED** — auth form only |
| Real responsive layout vs scaled desktop canvas | Auth UI appears mobile-composed (not `transform: scale` desktop canvas). `scaledDesktop=false` in measures. |

### DISCOVERY drawer probe (auth @ 360, not CC OPS)
- Before/after `scrollWidth` stayed 360.
- Off-canvas panel offender persisted (`right=691`).
- Sign-in region still full-viewport after click attempt; not a Command Center stage test.
- Shot: `tmp/mobile-visual-cert/Fan-360-auth-discovery-open.png`

---

## Top offending elements (evidence)

| Rank | Evidence | Why it matters |
|------|----------|----------------|
| 1 | Auth redirect on all role hubs | Blocks exclusive-shell + UX geometry cert entirely |
| 2 | Off-canvas `DIV` (~331px) parked at `left=innerWidth` (DISCOVERY drawer body) | `getBoundingClientRect().right > innerWidth+2`; sibling offscreen chrome |
| 3 | `BODY.tmi-obsidian-cinematic.overflow-x-hidden` | First constrained ancestor — clips overflow; conflicts with “no overflow-x:hidden shortcut” doctrine for cert |
| 4 | Ads & privacy overlay + beta banner (esp. Performer-360 shot) | Obscures lower chrome on auth; not CC stage, but mobile clutter |

Do **not** blame `CommandCenterShell` for these cells — it was **not mounted**.

---

## Working tree note (honesty)

At measure time, git status showed local modifications including `apps/web/src/components/commandCenter/CommandCenterShell.tsx` (unclean). Server measured whatever was on disk + `811b2bc6` tip lineage. Docs commit must not include feature code.

---

## Fix phase recommendation

| Question | Answer |
|----------|--------|
| Start Fix #1 now? | **No** |
| Why | Measurement of Fan/Performer/Admin shells did not occur |
| Unblock | Provide authenticated session (E2E creds or manual login cookie/storageState), re-run matrix on live CC |
| After auth, first components to inspect if FAIL | Only with evidence: likely mobile paths in `CommandCenterShell.tsx` (OPS/CHAT overlays), drawer hosts, TopNav/DISCOVERY off-canvas — **not guessed until measured** |
| Auth-page overflow-x-hidden / DISCOVERY | Track as separate hygiene finding; do not “fix” via more `overflow-x:hidden` |

---

## Reproduction

```bash
# from tmi-platform, with web server on :3000
# optional: set E2E_TEST_EMAIL / E2E_TEST_PASSWORD for authenticated cells
node ./scripts/run-mobile-visual-cert-measure.mjs
# outputs tmp/mobile-visual-cert/measure-results.json
```

---

*Measure-only. No feature fixes. main closed.*
