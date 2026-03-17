# SAFE WAVE INSTALL ORDER
# TMI Platform — BerntoutGlobal XXL
# READ THIS BEFORE TOUCHING ANY FILE IN VS CODE
# Updated: Phase 19 Add-On

---

## TERMINAL RULES — READ FIRST

NEVER paste chat text into PowerShell.
NEVER mix prose and commands in the same paste.
ONLY paste raw command blocks, one at a time.
The "Enter : The term 'Enter' is not recognized" error = chat text was pasted into terminal.

```
CORRECT: paste only this →   pnpm dev -- -p 3001
WRONG:   paste this →        Shell 2 — Web
                             pnpm dev -- -p 3001
```

---

## VS CODE FREEZE PREVENTION

Before starting any wave:
- Close GitHub Copilot Chat panel if open
- Close extra Explorer panels
- Close any tabs not needed for this wave
- Do NOT run dev server + build + Playwright at the same time
- Do NOT split 10+ files manually while dev server is running
- Only open ONE terminal per shell purpose

---

## WAVE A — Safe UI Only (install first, lowest risk)
**Proof required before Wave B.**

| # | File | Repo Path | Action |
|---|---|---|---|
| A1 | `SponsorContestPanel.tsx` | `apps/web/src/components/sponsor/` | CREATE |
| A2 | `SponsorProgressCard.tsx` | `apps/web/src/components/contest/` | CREATE |
| A3 | `WinnerRevealPanel.tsx` | `apps/web/src/components/contest/` | CREATE (multi-winner) |
| A4 | `ContestEntryCard.tsx` | `apps/web/src/components/contest/` | CREATE |
| A5 | `ContestQualificationStatus.tsx` | `apps/web/src/components/contest/` | CREATE |
| A6 | `ContestRulesCard.tsx` | `apps/web/src/components/contest/` | CREATE |
| A7 | `ContestProgressBanner.tsx` | `apps/web/src/components/contest/` | CREATE |
| A8 | `WinnerLineupStrip.tsx` | `apps/web/src/components/contest/` | CREATE |
| A9 | `WinnerReactionBurst.tsx` | `apps/web/src/components/contest/` | CREATE |
| A10 | `WinnerCameraDirector.tsx` | `apps/web/src/components/contest/` | CREATE |

**Wave A Proof:**
```powershell
pnpm -C apps/web build
```
If build passes → proceed to Wave B.
If build fails → fix import errors only. Do NOT start Wave B.

---

## WAVE B — Route-Safe Pages (after Wave A proof)
**Proof required before Wave C.**

| # | File | Repo Path | Action |
|---|---|---|---|
| B1 | `contest/rules/page.tsx` | `apps/web/src/app/contest/rules/` | CREATE |
| B2 | `contest/leaderboard/page.tsx` | `apps/web/src/app/contest/leaderboard/` | CREATE |
| B3 | `contest/qualify/page.tsx` | `apps/web/src/app/contest/qualify/` | CREATE |
| B4 | `contest/sponsors/page.tsx` | `apps/web/src/app/contest/sponsors/` | CREATE |
| B5 | `contest/season/[seasonId]/page.tsx` | `apps/web/src/app/contest/season/[seasonId]/` | CREATE |
| B6 | `contest/season/[seasonId]/archive/page.tsx` | `apps/web/src/app/contest/season/[seasonId]/archive/` | CREATE |
| B7 | `reveal.presets.ts` | `apps/web/src/config/` | CREATE |
| B8 | `feature.flags.ts` | `apps/web/src/config/` | CREATE |
| B9 | `game.types.ts` | `apps/web/src/config/` | CREATE |
| B10 | `sponsor.tiers.ts` | `apps/web/src/config/` | CREATE |
| B11 | `contest.routes.ts` | `apps/web/src/config/` | CREATE (already in previous package) |

**Wave B Proof:**
```powershell
pnpm -C apps/web build
# Then start web server and verify:
# http://localhost:3001/contest/rules → 200
# http://localhost:3001/contest/leaderboard → 200
# http://localhost:3001/contest/qualify → 200
```

---

## WAVE C — Guarded Admin Pages (after Wave B proof + Gemini audit)
**DO NOT start Wave C until Gemini audit confirms schema path.**

| # | File | Repo Path | Action |
|---|---|---|---|
| C1 | `contest/admin/layout.tsx` | `apps/web/src/app/contest/admin/` | CREATE ← CRITICAL |
| C2 | `contest/admin/page.tsx` | `apps/web/src/app/contest/admin/` | CREATE |
| C3 | `contest/admin/reveal/page.tsx` | `apps/web/src/app/contest/admin/reveal/` | CREATE |
| C4 | `contest/host/page.tsx` | `apps/web/src/app/contest/host/` | CREATE |
| C5 | `contest/admin/contestants/page.tsx` | `apps/web/src/app/contest/admin/contestants/` | CREATE |
| C6 | `contest/admin/sponsors/page.tsx` | `apps/web/src/app/contest/admin/sponsors/` | CREATE |
| C7 | `contest/admin/seasons/page.tsx` | `apps/web/src/app/contest/admin/seasons/` | CREATE |
| C8 | `contest/admin/payouts/page.tsx` | `apps/web/src/app/contest/admin/payouts/` | CREATE |
| C9 | `contest/admin/audit/page.tsx` | `apps/web/src/app/contest/admin/audit/` | CREATE |

**Wave C Proof:**
```powershell
pnpm -C apps/web build
# Verify admin guard:
# http://localhost:3001/contest/admin → should redirect to /auth if not logged in
```

---

## WAVE D — API + Config (after Wave C proof)
**Run Gemini audit before this wave. Never modify app.module.ts beyond adding ContestModule import.**

| # | File | Repo Path | Action |
|---|---|---|---|
| D1 | `contest.env.contract.ts` | `apps/api/src/modules/contest/` | CREATE |
| D2 | `contest.permissions.ts` | `apps/api/src/modules/contest/` | CREATE |
| D3 | `update-reveal-config.dto.ts` | `apps/api/src/modules/contest/dto/` | CREATE |
| D4 | `winner-reveal-config.entity.ts` | `apps/api/src/modules/contest/entities/` | CREATE |
| D5 | `winner-reveal.service.ts` | `apps/api/src/modules/contest/services/` | CREATE |
| D6 | Entity files (all 6) | `apps/api/src/modules/contest/entities/` | CREATE |
| D7 | Prisma models | `packages/db/prisma/schema.prisma` | APPEND ONLY |
| D8 | ContestModule import | `apps/api/src/app.module.ts` | EXTEND (one line only) |

**Wave D Proof:**
```powershell
pnpm -C apps/api build
pnpm -C apps/api run test:readiness-contract
# Verify:
# GET http://localhost:4000/api/contest/sponsor-packages → 200
# GET http://localhost:4000/api/contest/host/scripts → 200
```

---

## WAVE E — Tests + Final Proof (after all waves)

| # | File | Repo Path | Action |
|---|---|---|---|
| E1 | `contest.smoke.spec.ts` | `tests/e2e/` | CREATE |
| E2 | ENV vars | `apps/api/.env` | APPEND 5 lines |

**Wave E Proof:**
```powershell
pnpm -C apps/api run test:readiness-contract
pnpm -C apps/api build
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

## DO NOT TOUCH — EVER

```
apps/web/src/middleware.ts          ← LOCKED Phase 17.5
apps/api/src/auth/*                 ← LOCKED Phase 15.x
apps/web/src/app/onboarding/*       ← LOCKED Phase 17.3
.github/workflows/ci.yml            ← LOCKED Phase 17.4
apps/api/src/modules/health/*       ← LOCKED Phase 17.5
packages/db/prisma/schema.prisma    ← APPEND ONLY (never rewrite)
apps/api/src/app.module.ts          ← EXTEND (one import line only)
```

---

## ROLLBACK STEPS

### Soft Recovery (broken import after file placement)
```powershell
# Find the broken file
pnpm -C apps/web build 2>&1 | Select-String "error"
# Fix the import path only — do not refactor
```

### Medium Recovery (wave broke the build)
```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
git stash
pnpm -C apps/api build
# Confirm stable, then git stash pop and fix only the broken file
```

### Hard Recovery (restore last stable checkpoint)
```powershell
git checkout 21aa9b2  # Last stable checkpoint
pnpm install
pnpm -C apps/api build
pnpm -C apps/web build
```

---

*BerntoutGlobal XXL | TMI Platform | Safe Wave Install Order | Phase 19*
