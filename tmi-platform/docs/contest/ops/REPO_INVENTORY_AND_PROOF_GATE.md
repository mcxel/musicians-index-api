# REPO INVENTORY BEFORE WAVE 5
# TMI Platform — BerntoutGlobal XXL
# Run this BEFORE placing any API files. Do not skip.

---

## INVENTORY COMMANDS (run in PowerShell, one at a time)

### Check contest API module folder
```powershell
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\api\src\modules\contest" -Recurse -Name 2>$null
```

### Check contest pages folder
```powershell
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\contest" -Recurse -Name 2>$null
```

### Check contest components folder
```powershell
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\components\contest" -Recurse -Name 2>$null
```

### Check host components folder
```powershell
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\components\host" -Recurse -Name 2>$null
```

### Check sponsor components folder
```powershell
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\components\sponsor" -Recurse -Name 2>$null
```

### Check app.module.ts for existing ContestModule import
```powershell
Select-String -Path "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\api\src\app.module.ts" -Pattern "ContestModule"
```

---

## DECISION TABLE — BASED ON INVENTORY RESULTS

| File | If Found | If Not Found |
|---|---|---|
| `contest.controller.ts` | EXTEND ONLY — compare endpoints, add missing ones | CREATE from Drop 1 |
| `contest.service.ts` | EXTEND ONLY — compare methods, add missing ones | CREATE from Drop 1 |
| `contest.module.ts` | EXTEND ONLY — check imports, add missing providers | CREATE from Drop 1 |
| `contest.dto.ts` | EXTEND ONLY — add missing DTOs | CREATE from Drop 1 |
| `apps/web/src/app/contest/page.tsx` | COMPARE — use whichever is more complete | CREATE from Drop 1 |
| ContestModule in app.module.ts | Skip — already imported | ADD the import line |

---

# SCHEMA MERGE CHECKLIST
# TMI Platform — BerntoutGlobal XXL
# Run before Wave 6. NEVER append Prisma blindly.

---

## STEP 1 — Find existing contest models in schema.prisma

```powershell
Select-String -Path "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\packages\db\prisma\schema.prisma" -Pattern "^model "
```

Write down every model name that appears.

## STEP 2 — Compare against Drop 1 contest.schema.prisma models

Check if these already exist in your schema:
- [ ] ContestSeason
- [ ] ContestEntry
- [ ] SponsorContribution
- [ ] SponsorPackage
- [ ] ContestRound
- [ ] ContestVote
- [ ] ContestPrize
- [ ] PrizeFulfillment
- [ ] RayJourneyScript
- [ ] HostCue

## STEP 3 — Compare against Drop 3 winner-reveal models

Check if these already exist:
- [ ] WinnerRevealConfig
- [ ] RevealAnalytics

## STEP 4 — Decision

| If Model Exists | Action |
|---|---|
| Model already in schema, fields match | SKIP — do not add again |
| Model already in schema, fields missing | ADD MISSING FIELDS ONLY (not the whole model) |
| Model not in schema | APPEND the full model at end of schema |

## STEP 5 — After appending

```powershell
npx prisma generate
```

```powershell
npx prisma migrate dev --name add_contest_system
```

If migrate fails → read the error carefully. It usually means a duplicate model or conflicting enum. Fix manually.

---

# RUNTIME PROOF GATE
# TMI Platform — BerntoutGlobal XXL
# Run this before EVERY Playwright test. All 3 must return success.

---

## MANDATORY PRE-PROOF (all 3 required)

```powershell
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth).StatusCode } catch { $_.Exception.Message }
```
Expected: `200`

```powershell
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz).Content } catch { $_.Exception.Message }
```
Expected: JSON with `"status":"ok"` and build hash

```powershell
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz).Content } catch { $_.Exception.Message }
```
Expected: `"ready"` or JSON with ready status

**If any of the 3 above fails → do NOT run Playwright. Fix the failing service first.**

---

## THEN RUN PLAYWRIGHT

```powershell
pnpm -s exec playwright test tests/e2e/phase13_5.spec.ts --workers=1 --reporter=dot
```

```powershell
pnpm -s exec playwright test tests/e2e/phase14_onboarding.spec.ts --workers=1 --reporter=dot
```

```powershell
pnpm -s exec playwright test tests/e2e/phase15_rbac_boundaries.spec.ts --workers=1 --reporter=dot
```

```powershell
pnpm -s exec playwright test tests/e2e/phase15_4_api_guards.spec.ts --workers=1 --reporter=dot
```

```powershell
pnpm -s exec playwright test tests/e2e/phase15_5_artist_admin.spec.ts --workers=1 --reporter=dot
```

```powershell
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

## POST-WAVE VALIDATION CHECKLIST

Run after each wave before proceeding:

```
WAVE 2 DONE WHEN:
  ☐  pnpm -C apps/web build exits 0
  ☐  No TypeScript errors in component files

WAVE 3 DONE WHEN:
  ☐  pnpm -C apps/web build exits 0
  ☐  reveal.presets.ts exports CAMERA_PRESETS and TRANSITION_PRESETS

WAVE 4 DONE WHEN:
  ☐  pnpm -C apps/web build exits 0
  ☐  /contest → 200
  ☐  /contest/admin → redirects to /auth (unauthenticated)

WAVE 5 DONE WHEN:
  ☐  pnpm -C apps/api build exits 0
  ☐  GET /api/contest/sponsor-packages → 200 with array
  ☐  GET /api/contest/host/scripts → 200 with scripts

WAVE 6 DONE WHEN:
  ☐  npx prisma generate → no errors
  ☐  npx prisma migrate dev → no errors
  ☐  pnpm -C apps/api build exits 0

WAVE 7 DONE WHEN:
  ☐  Runtime proof gate: all 3 health checks = success
  ☐  contest.smoke.spec.ts playwright → all tests pass
```

---

*BerntoutGlobal XXL | TMI Platform | Pre-Wave5 Inventory + Schema Checklist + Proof Gate | Phase 19*
