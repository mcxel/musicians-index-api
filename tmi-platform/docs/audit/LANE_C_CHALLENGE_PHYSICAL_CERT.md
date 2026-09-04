# Lane C — Challenge Physical Chromium Certification

**STATUS:** 🟢 **PASS** — Lane C **CLOSED / PHYSICALLY CERTIFIED**  
**Branch:** `eos/vocal-improv-clean`  
**HEAD at cert:** `93a94f8d` + compose useMemo / cert-runner waitForFunction fixes (this commit)  
**Date:** 2026-09-03 (PT)  
**Route under test:** `/rooms/challenge/sess-challenge-prod-01`  
**Server:** `http://localhost:3002` (single Next; isolated `TMI_BUILD_VERIFY_DISTDIR=.next-lane-c-cert`)  
**Runner:** `scripts/cert-physical-lane-c-challenge.mjs`  
**Artifacts:** `.cursor/artifacts/challenge-lane-c-physical/`

---

## Verdict

| Gate | Requirement | Result | Notes |
|------|-------------|--------|-------|
| 1 | Route mounts real Challenge venue | 🟢 **PASS** | Venue+shell+jumbo; lookUp=true; pack=Challenge |
| 2 | Objective-contract assembly visible | 🟢 **PASS** | ChallengeContract; OBJECTIVE_FOCUS; Complete the stated objective |
| 3 | Challenge DNA (no Battle VS) | 🟢 **PASS** | pack=Challenge; vsLayout=false |
| 4 | Attempt countdown / active | 🟢 **PASS** | ATTEMPT_1_COUNTDOWN → ATTEMPT_1_ACTIVE (2.5s) |
| 5 | Judgment modes | 🟢 **PASS** | AUDIENCE_VOTE / AUTHORIZED_JUDGES / MEASURABLE_RESULT |
| 6 | Result presentation | 🟢 **PASS** | ResultCard; honest no-winner copy |
| 7 | Jumbotron LOOK-UP / N/E/S/W | 🟢 **PASS** | NORTH:ACTIVE_ATTEMPT · SOUTH:OBJECTIVE_TIMER · EAST:SPONSOR · WEST:AUDIENCE |
| 8 | Universal Player continuity | 🟢 **PASS** | PROGRAM.CHALLENGE_PRIMARY bound; no remount |
| 9 | Reconnect / phase resume | 🟢 **PASS** | Reload resumes ATTEMPT_1_ACTIVE via sessionStorage |
| 10 | Single PROGRAM audio | 🟢 **PASS** | unmutedPlaying=0 (no double-audio) |
| 11 | Clean teardown | 🟢 **PASS** | Left to /challenges; face hook cleared |
| 12 | Semantic negatives | 🟢 **PASS** | No Battle VS / Cypher / Gauntlet chrome |
| M | Mobile 390×844 | 🟢 **PASS** | Shell+contract retained; attempt+judgment |

**FINAL PHYSICAL VERDICT:** 🟢 **PASS**  
**Lane C CLOSED?** **YES**  
**Avatar Preview Parity deepen started?** **YES** (immediately after this PASS close)

---

## Environment recovery (this run)

1. Stopped multi-port tmi-platform Next listeners (3000/3002/3005/3010/3781) sharing corrupted `.next`
2. Wiped `.next`; restarted **one** Next on `:3002` with `TMI_BUILD_VERIFY_DISTDIR=.next-lane-c-cert`
3. Smoke `GET /rooms/challenge/sess-challenge-prod-01` → HTTP 200 (no webpack_modules crash)
4. Wiring fixes for physical readiness:
   - `composeChallengeProgram` derived via `useMemo` (shell no longer stuck on “Waiting for objective contract”)
   - Cert runner `waitForFunction(fn, undefined, { timeout })` Playwright signature + `NAV_TIMEOUT` defaults

---

## ACCEPTANCE TEMPLATE — Final

```text
ACCEPTANCE TEMPLATE

STATUS:
🟢 PASS

DEVICE:
desktop Playwright Chromium 1280×800 + mobile 390×844

OS:
Windows 10

BROWSER:
Chromium via @playwright/test

BUILD / SHA:
93a94f8d+ (eos/vocal-improv-clean)

ROUTE:
http://localhost:3002/rooms/challenge/sess-challenge-prod-01

MODULE / GATE:
Lane C Challenge experienceCert — Gates 1–12 + M

FINAL RESULT:
🟢 PASS (all gates)

SCREENSHOT / RECORDING:
.cursor/artifacts/challenge-lane-c-physical/01-desktop-mount-objective.png … 13-mobile-judgment.png
.cursor/artifacts/challenge-lane-c-physical/cert-report.json
```

---

## Matrix / Lane C status

- `docs/audit/LANE_C_CHALLENGE_OPERATIONAL_ACTIVATION.md` — experienceCert **DONE / PHYSICALLY CERTIFIED**
- `docs/audit/TMI_EXPERIENCE_COMPLETION_MATRIX.md` — Challenge experience cert **DONE**
