# LOCKED FILE TOUCH RULES
# TMI Platform — BerntoutGlobal XXL
# These rules override ALL other instructions.

---

## RULE 1 — NEVER MODIFY THESE FILES

| File | Reason | Who enforced by |
|---|---|---|
| `apps/web/src/middleware.ts` | Auth/CSRF/session — locked Phase 17.5 | Copilot, Claude, Gemini |
| `apps/api/src/auth/**` | Full auth system — locked Phase 15.x | Copilot, Claude, Gemini |
| `apps/web/src/app/onboarding/**` | Onboarding recovery — locked Phase 17.3 | Copilot, Claude, Gemini |
| `.github/workflows/ci.yml` | CI pipeline — locked Phase 17.4 | Copilot, Claude, Gemini |
| `apps/api/src/modules/health/**` | Health module — locked Phase 17.5 | Copilot, Claude, Gemini |

## RULE 2 — APPEND ONLY (never rewrite, never replace)

| File | Rule |
|---|---|
| `packages/db/prisma/schema.prisma` | APPEND new models at bottom only. Never touch existing models. |
| `apps/api/src/app.module.ts` | ADD `ContestModule` import line only. Nothing else. |

## RULE 3 — EXTEND ONLY (no rewrites)

| File | What you may do |
|---|---|
| Artist profile page | Add ContestBanner import and JSX block |
| `apps/web/src/app/layout.tsx` | Add contest nav link only if needed |
| Contest controller | Add new endpoints — never remove existing |
| Contest service | Add new methods — never change existing method signatures |

## RULE 4 — THE THREE QUESTIONS BEFORE TOUCHING ANY FILE

Before Claude, Copilot, or Gemini modifies ANY existing file, answer:
1. Is this file on the DO NOT MODIFY list? → Stop.
2. Is this file a APPEND ONLY file? → Append at end only.
3. Does this change break any locked behavior? → Stop and ask Marcel.

---

# SAFE TERMINAL COMMANDS — TMI PLATFORM
# BerntoutGlobal XXL
# ONLY paste these exact blocks into PowerShell. NOTHING else.

---

## RULE: ONE BLOCK AT A TIME

Never paste multiple command blocks together.
Never paste prose, labels, or chat text into PowerShell.
The "Enter : not recognized" error means chat text got pasted.

---

## START API (Shell 1)

```powershell
Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\api"
$dbLine = Select-String -Path .env -Pattern '^DATABASE_URL=' | Select-Object -First 1
if (-not $dbLine) { Write-Error 'DATABASE_URL_NOT_FOUND'; exit 1 }
$env:DATABASE_URL = $dbLine.Line.Substring(13).Trim('"')
$env:PORT = '4000'
Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
pnpm --filter tmi-platform-api start:dev
```

## START WEB (Shell 2)

```powershell
Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web"
pnpm dev -- -p 3001
```

## HEALTH CHECK (Shell 3, after both servers running)

```powershell
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth).StatusCode } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz).Content } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz).Content } catch { $_.Exception.Message }
```

## BUILD PROOF

```powershell
pnpm -C apps/api build
```

```powershell
pnpm -C apps/web build
```

## READINESS CONTRACT

```powershell
pnpm -C apps/api run test:readiness-contract
```

## PLAYWRIGHT (services must be running first)

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

## PRISMA MIGRATION (Wave D only, after Gemini audit confirms path)

```powershell
npx prisma generate
```

```powershell
npx prisma migrate dev --name add_contest_system
```

## ROLLBACK TO LAST STABLE

```powershell
git stash
```

```powershell
git checkout 21aa9b2
```

---

*BerntoutGlobal XXL | Safe Terminal Commands | Never paste prose into PowerShell*
