# Lane C — Challenge Physical Chromium Certification

**STATUS:** 🔴 **FAIL** (experienceCert remains **OPEN** — Lane C **NOT CLOSED**)  
**Branch:** `eos/vocal-improv-clean`  
**HEAD at start:** `d2cdde1e` (Challenge Jumbotron ACGBR face wire)  
**Date:** 2026-09-02 / 2026-09-03 (PT)  
**Route under test:** `/rooms/challenge/sess-challenge-prod-01`  
**Server:** `http://localhost:3002` (warm Next; later `.next` corruption / telemetry overload)  
**Runner:** `scripts/cert-physical-lane-c-challenge.mjs`  
**Artifacts:** `.cursor/artifacts/challenge-lane-c-physical/`

---

## Verdict

| Gate | Requirement | Result | Notes |
|------|-------------|--------|-------|
| 1 | Route mounts real Challenge venue | 🔴 **FAIL** | Re-run blocked: Next `TypeError: __webpack_modules__[moduleId] is not a function` then sustained route timeouts / telemetry backlog after `.next` wipe+restart. Exact failing step = **Gate 1 mount on re-cert**. |
| 2 | Objective-contract assembly visible | 🟡 PARTIAL (prior) | Observed earlier in-session when server healthy: `ChallengeContract` + `OBJECTIVE_FOCUS` + objective copy. **Not re-certified after wiring patch.** |
| 3 | Challenge DNA (no Battle VS) | 🟡 PARTIAL (prior) | `data-vs-layout="false"`, pack=`Challenge`, “not Battle VS” copy. **Not re-certified after patch.** |
| 4 | Attempt countdown / active | 🟡 PATCHED / UNCERTIFIED | First run: START ATTEMPT skipped countdown → FAIL wording. Wiring patch: COUNTDOWN → auto ACTIVE (2.5s) + higher z-index controls. **Physical re-run not completed.** |
| 5 | Judgment modes | 🟡 PARTIAL (prior) | Select exercised AUDIENCE_VOTE / AUTHORIZED_JUDGES / MEASURABLE_RESULT. |
| 6 | Result presentation | 🔴 UNTESTED | First run aborted (ADD CHALLENGED click intercepted before patch). |
| 7 | Jumbotron LOOK-UP / N/E/S/W | 🟡 PARTIAL (prior) | DOM probe (healthy server) showed distinct faces: NORTH CONTRACT→ACTIVE_ATTEMPT, SOUTH OBJECTIVE_TIMER, EAST SPONSOR, WEST AUDIENCE via `__TMI_CHALLENGE_ACGBR_FACES__`. |
| 8 | Universal Player continuity | 🔴 UNTESTED | |
| 9 | Reconnect / phase resume | 🟡 PATCHED / UNCERTIFIED | `sessionStorage` resume key `tmi.challenge.operational.{roomId}` added. **Not physically re-proven.** |
| 10 | Single PROGRAM audio | 🔴 UNTESTED | |
| 11 | Clean teardown | 🔴 UNTESTED | |
| 12 | Semantic negatives | 🟡 PARTIAL (prior) | No Battle VS / Cypher / Gauntlet chrome in observed text when healthy. |
| M | Mobile 390×844 | 🔴 UNTESTED | |

**FINAL PHYSICAL VERDICT:** 🔴 **FAIL AT STEP 1** (re-cert mount / server integrity).  
**Lane C CLOSED?** **NO**  
**Avatar Preview Parity deepen started?** **NO** (blocked until Challenge physical PASS)

---

## ACCEPTANCE TEMPLATE — Gate 1 (failing step)

```text
ACCEPTANCE TEMPLATE

STATUS:
🔴 FAIL

DEVICE:
desktop (Playwright Chromium headless) + prior 1280×800 evidence

DEVICE MODEL:
N/A (automation Chromium)

OS:
Windows 10

BROWSER:
Chromium via @playwright/test

BUILD / SHA:
d2cdde1e+ (branch eos/vocal-improv-clean; local wiring patch for countdown + resume uncommitted until this cert commit)

ROUTE:
http://localhost:3002/rooms/challenge/sess-challenge-prod-01

MODULE / GATE:
Lane C Challenge experienceCert — Gate 1 Route Mount

TEST STEP:
1. Navigate to /rooms/challenge/[roomId] after warm Next and observe production Challenge shell + venue/Jumbotron (not empty shell / not Server Error).

EXPECTED:
Page mounts ChallengePresentationShell (production), objective contract, venue/Jumbotron layer without Next server error.

ACTUALLY OBSERVED:
- Earlier healthy session: mount + objective DNA + Jumbotron face hook worked (see partial shots / probe).
- After wiring patch + .next cache conflict across multi-port Next: Chromium showed Next.js Server Error
  `TypeError: __webpack_modules__[moduleId] is not a function`
  (evidence: `.cursor/artifacts/challenge-lane-c-physical/00-goto-fail.png`).
- After scoped wipe of `apps/web/.next` and single-port restart: Challenge compiled, but HTTP/Playwright requests to the room timed out (60s–420s) under telemetry backlog; Gate 1 could not be re-confirmed.

AUDIO CONTINUITY:
N/A

VIDEO / WEBRTC CONTINUITY:
N/A

ROOM ID / SESSION CONTINUITY:
FAIL (route unstable)

PLAYER STATE PRESERVED:
N/A

LAYOUT / COLLISION:
N/A

CONSOLE / NETWORK ERROR:
TypeError: __webpack_modules__[moduleId] is not a function (Next server page generate);
subsequent request timeouts; webpack cache ENOENT / invalid block type on multi-instance .next sharing.

SCREENSHOT / RECORDING:
.cursor/artifacts/challenge-lane-c-physical/00-goto-fail.png
.cursor/artifacts/challenge-lane-c-physical/01-desktop-mount-objective.png (prior partial)
.cursor/artifacts/challenge-lane-c-physical/02-desktop-attempt-active.png (prior partial — phase did not advance under overlay race)
.cursor/artifacts/challenge-lane-c-physical/03-desktop-judgment-policy.png (prior partial)

FINAL RESULT:
🔴 FAIL AT STEP 1

FOLLOW-UP RULE:
Restore a single healthy Next instance (one port, clean `.next`, telemetry not starving compiles), then re-run
`E2E_BASE_URL=http://localhost:3002 node scripts/cert-physical-lane-c-challenge.mjs`
once. Do not mark experienceCert PASS / Lane C CLOSED until all 12 gates + mobile PASS.
Do not start Avatar Preview Parity deepen until Challenge physical PASS.
```

---

## Wiring applied this session (not yet physically certified)

File: `apps/web/src/app/rooms/challenge/[roomId]/page.tsx`

1. **Countdown path:** `START ATTEMPT` → `ATTEMPT_1_COUNTDOWN` → auto `ATTEMPT_1_ACTIVE` after 2.5s  
2. **Reconnect resume:** `sessionStorage` key `tmi.challenge.operational.{roomId}` for phase/policy/challenged/result  
3. **Clickability:** control bar `z-index: 30` + `data-testid`s for cert clicks  

Runner updated: `scripts/cert-physical-lane-c-challenge.mjs` (production `/rooms/challenge` gates, desktop+mobile).

---

## Matrix / Lane C status

- `docs/audit/LANE_C_CHALLENGE_OPERATIONAL_ACTIVATION.md` — experienceCert stays **OPEN**  
- `docs/audit/TMI_EXPERIENCE_COMPLETION_MATRIX.md` — Challenge **experience cert** stays **OPEN** (no PASS write)

---

## Avatar Preview Parity

**Not started** — Challenge physical FAIL / incomplete.
