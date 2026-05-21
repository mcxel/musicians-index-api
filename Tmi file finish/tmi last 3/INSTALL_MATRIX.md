# INSTALL MATRIX
# TMI Platform — BerntoutGlobal XXL
# Master install order for all 3 contest drops combined
# One file per final repo path. No bundles. No splits needed — all pre-split here.

---

## BEFORE ANY WAVE — GIT CHECKPOINT

```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
git add -A
git commit -m "checkpoint: before contest system wave install"
```

Do NOT run API + web + Playwright while placing files.
Close GitHub Copilot Chat sidebar while placing files to reduce editor freeze.

---

## WAVE 1 — DOCS ONLY (no code risk)

Create folder: `docs/contest/`, `docs/contest/control/`, `docs/contest/handoffs/`

| # | Source File | Final Repo Path |
|---|---|---|
| 1.01 | MASTER_MANIFEST.md (Drop 1) | `docs/contest/MASTER_MANIFEST.md` |
| 1.02 | COPILOT_WIRING_GUIDE.md (Drop 1) | `docs/contest/COPILOT_WIRING_GUIDE.md` |
| 1.03 | FILE_PLACEMENT_GUIDE.md (Drop 2) | `docs/contest/FILE_PLACEMENT_GUIDE.md` |
| 1.04 | SAFE_WAVE_INSTALL_ORDER.md (Drop 3) | `docs/contest/control/SAFE_WAVE_INSTALL_ORDER.md` |
| 1.05 | LOCKED_FILE_TOUCH_RULES.md (Drop 3) | `docs/contest/control/LOCKED_FILE_TOUCH_RULES.md` |
| 1.06 | PROGRAM_SUCCESS_CRITERIA.md (Drop 3) | `docs/contest/control/PROGRAM_SUCCESS_CRITERIA.md` |
| 1.07 | MULTI_WINNER_REVEAL_SPEC.md (Drop 3) | `docs/contest/control/MULTI_WINNER_REVEAL_SPEC.md` |
| 1.08 | SYSTEM_STATE_MAP.md (Drop 3) | `docs/contest/control/SYSTEM_STATE_MAP.md` |
| 1.09 | CONTEST_DROP_MASTER_MATRIX.md (this package) | `docs/contest/control/CONTEST_DROP_MASTER_MATRIX.md` |
| 1.10 | IMPORT_FIX_MATRIX.md (this package) | `docs/contest/control/IMPORT_FIX_MATRIX.md` |
| 1.11 | CHATGPT_SEQUENCING_BRIEF.md (Drop 2) | `docs/contest/handoffs/CHATGPT_SEQUENCING_BRIEF.md` |
| 1.12 | GEMINI_AUDIT_BRIEF.md (Drop 2) | `docs/contest/handoffs/GEMINI_AUDIT_BRIEF.md` |

**Wave 1 Proof:** no build needed. Docs only.

---

## WAVE 2 — WEB COMPONENTS (UI, no routes, no API)

Create folders first: `apps/web/src/components/contest/`, `host/`, `sponsor/`, `game/`

### Contest Components → `apps/web/src/components/contest/`

| # | Source | File | Action |
|---|---|---|---|
| 2.01 | Drop 1 | `ContestBanner.tsx` | CREATE |
| 2.02 | Drop 1 | `SeasonCountdownPanel.tsx` | CREATE |
| 2.03 | **Drop 3 WINS** | `WinnerRevealPanel.tsx` | CREATE (supersedes Drop 2 version) |
| 2.04 | Drop 3 | `WinnerLineupStrip.tsx` | CREATE |
| 2.05 | Drop 3 | `WinnerCameraDirector.tsx` | CREATE |
| 2.06 | Drop 2 split | `SponsorProgressCard.tsx` | CREATE |
| 2.07 | Drop 2 split | `ContestEntryCard.tsx` | CREATE |
| 2.08 | Drop 2 split | `ContestQualificationStatus.tsx` | CREATE |
| 2.09 | Drop 2 split | `ContestRulesCard.tsx` | CREATE |
| 2.10 | Drop 2 split | `ContestProgressBanner.tsx` | CREATE |
| 2.11 | Drop 2 split | `ContestDiscoveryGrid.tsx` | CREATE |
| 2.12 | Drop 2 split | `VoteNowPanel.tsx` | CREATE |
| 2.13 | Drop 2 split | `ScoreboardOverlay.tsx` | CREATE |

### Host Components → `apps/web/src/components/host/`

| # | Source | File | Action |
|---|---|---|---|
| 2.14 | Drop 1 | `RayJourneyHost.tsx` | CREATE |
| 2.15 | Drop 1 | `RayJourneyAvatarSpec.ts` | CREATE |
| 2.16 | Drop 1 | `HostCuePanel.tsx` | CREATE |
| 2.17 | Drop 2 split | `SponsorCuePanel.tsx` | CREATE |
| 2.18 | Drop 2 split | `PrizeRevealControlPanel.tsx` | CREATE |
| 2.19 | Drop 2 split | `HostScriptPanel.tsx` | CREATE |
| 2.20 | Drop 2 split | `CoHostHandoffPanel.tsx` | CREATE |
| 2.21 | Drop 2 split | `CrowdPromptPanel.tsx` | CREATE |
| 2.22 | Drop 2 split | `HostSoundboardPanel.tsx` | CREATE |
| 2.23 | Drop 2 split | `HostStageCard.tsx` | CREATE |

### Sponsor Components → `apps/web/src/components/sponsor/`

| # | Source | File | Action |
|---|---|---|---|
| 2.24 | Drop 1 | `SponsorInvitePanel.tsx` | CREATE |
| 2.25 | Drop 1 | `SponsorPackageTierCard.tsx` | CREATE |
| 2.26 | Drop 2 | `SponsorContestPanel.tsx` | CREATE |
| 2.27 | Drop 2 | `SponsorROIAnalytics.tsx` | CREATE |
| 2.28 | Drop 2 split | `SponsorLeaderboard.tsx` | CREATE (split from SponsorROIAnalytics) |
| 2.29 | Drop 2 split | `SponsorBadge.tsx` | CREATE |
| 2.30 | Drop 2 split | `SponsorSplashCard.tsx` | CREATE |
| 2.31 | Drop 2 split | `SponsorActivationButton.tsx` | CREATE |
| 2.32 | Drop 2 split | `StageSponsorOverlay.tsx` | CREATE |
| 2.33 | Drop 2 split | `PresentedBySlate.tsx` | CREATE |
| 2.34 | Drop 2 split | `SponsorArtistCard.tsx` | CREATE |
| 2.35 | Drop 2 split | `SponsorSpotlightCard.tsx` | CREATE |
| 2.36 | Drop 2 split | `SponsorPackageSelector.tsx` | CREATE |

### Game Components → `apps/web/src/components/game/`

| # | Source | File | Action |
|---|---|---|---|
| 2.37 | Drop 2 split | `MysteryBoxReveal.tsx` | CREATE |
| 2.38 | Drop 2 split | `SoundClueTrigger.tsx` | CREATE |
| 2.39 | Drop 2 split | `AudienceGuessPanel.tsx` | CREATE |

**Wave 2 Proof:**
```powershell
pnpm -C apps/web build
```
Fix any import errors using IMPORT_FIX_MATRIX.md. Do NOT proceed to Wave 3 if build fails.

---

## WAVE 3 — CONFIG FILES

Create folder: `apps/web/src/config/`

| # | Source | File | Action |
|---|---|---|---|
| 3.01 | Drop 3 | `reveal.presets.ts` | CREATE |
| 3.02 | Drop 3 split | `feature.flags.ts` | SPLIT+CREATE |
| 3.03 | Drop 3 split | `game.types.ts` | SPLIT+CREATE |
| 3.04 | Drop 3 split | `sponsor.tiers.ts` | SPLIT+CREATE |
| 3.05 | Drop 2 split | `contest.routes.ts` | SPLIT+CREATE |

**Wave 3 Proof:**
```powershell
pnpm -C apps/web build
```

---

## WAVE 4 — PAGES

**CRITICAL: Place `admin/layout.tsx` BEFORE any admin page files.**

| # | Source | File | Action |
|---|---|---|---|
| 4.01 | Drop 1 | `apps/web/src/app/contest/page.tsx` | CREATE (check if exists first) |
| 4.02 | Drop 2 split | `apps/web/src/app/contest/rules/page.tsx` | CREATE |
| 4.03 | Drop 2 split | `apps/web/src/app/contest/leaderboard/page.tsx` | CREATE |
| 4.04 | Drop 2 split | `apps/web/src/app/contest/qualify/page.tsx` | CREATE |
| 4.05 | Drop 2 split | `apps/web/src/app/contest/sponsors/page.tsx` | CREATE |
| 4.06 | Drop 2 split | `apps/web/src/app/contest/season/[seasonId]/page.tsx` | CREATE |
| 4.07 | Drop 2 split | `apps/web/src/app/contest/season/[seasonId]/archive/page.tsx` | CREATE |
| **4.08** | **This package** | `apps/web/src/app/contest/admin/layout.tsx` | **CREATE FIRST** ← CRITICAL |
| 4.09 | Drop 2 split | `apps/web/src/app/contest/admin/page.tsx` | CREATE (after 4.08) |
| 4.10 | Drop 2 split | `apps/web/src/app/contest/admin/contestants/page.tsx` | CREATE |
| 4.11 | Drop 2 split | `apps/web/src/app/contest/admin/sponsors/page.tsx` | CREATE |
| 4.12 | Drop 2 split | `apps/web/src/app/contest/admin/seasons/page.tsx` | CREATE |
| 4.13 | Drop 2 split | `apps/web/src/app/contest/admin/payouts/page.tsx` | CREATE |
| 4.14 | Drop 2 split | `apps/web/src/app/contest/admin/audit/page.tsx` | CREATE |
| 4.15 | Drop 3 | `apps/web/src/app/contest/admin/reveal/page.tsx` | CREATE |
| 4.16 | Drop 2 split | `apps/web/src/app/contest/host/page.tsx` | CREATE |

**Wave 4 Proof:**
```powershell
pnpm -C apps/web build
# Start web server then verify routes:
# http://localhost:3001/contest → 200
# http://localhost:3001/contest/rules → 200
# http://localhost:3001/contest/admin → redirects to /auth (unauthenticated)
```

---

## WAVE 5 — API FILES

**Run Gemini audit first to confirm schema.prisma path.**
**Do NOT overwrite existing contest controller/service if already placed.**

| # | Source | File | Action |
|---|---|---|---|
| 5.01 | Drop 1 | `apps/api/src/modules/contest/contest.controller.ts` | CREATE |
| 5.02 | Drop 1 | `apps/api/src/modules/contest/contest.service.ts` | CREATE |
| 5.03 | Drop 1 | `apps/api/src/modules/contest/contest.module.ts` | CREATE |
| 5.04 | Drop 1 | `apps/api/src/modules/contest/dto/contest.dto.ts` | CREATE |
| 5.05 | Drop 1 | `apps/api/src/bots/contest/ContestBots.ts` | CREATE |
| 5.06 | Drop 2 split | `apps/api/src/modules/contest/entities/contest-entry.entity.ts` | CREATE |
| 5.07 | Drop 2 split | `apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts` | CREATE |
| 5.08 | Drop 2 split | `apps/api/src/modules/contest/entities/contest-round.entity.ts` | CREATE |
| 5.09 | Drop 2 split | `apps/api/src/modules/contest/entities/contest-vote.entity.ts` | CREATE |
| 5.10 | Drop 2 split | `apps/api/src/modules/contest/entities/contest-prize.entity.ts` | CREATE |
| 5.11 | Drop 2 split | `apps/api/src/modules/contest/entities/contest-season.entity.ts` | CREATE |
| 5.12 | This package | `apps/api/src/modules/contest/contest.env.contract.ts` | CREATE |
| 5.13 | This package | `apps/api/src/modules/contest/contest.permissions.ts` | CREATE |
| 5.14 | Drop 3 | `apps/api/src/modules/contest/services/winner-reveal.service.ts` | CREATE |
| **5.15** | **EXTEND ONLY** | `apps/api/src/app.module.ts` | **ADD 1 IMPORT LINE** |

**Wave 5 Proof:**
```powershell
pnpm -C apps/api build
# Then:
# GET http://localhost:4000/api/contest/sponsor-packages → 200
# GET http://localhost:4000/api/contest/host/scripts → 200
```

---

## WAVE 6 — PRISMA (APPEND ONLY)

**DO NOT replace schema.prisma. DO NOT touch existing models.**

| # | Source | File | Action |
|---|---|---|---|
| 6.01 | Drop 1 | contest.schema.prisma (10 models) | APPEND to `packages/db/prisma/schema.prisma` |
| 6.02 | This package | winner-reveal-config.prisma (2 models) | APPEND after Drop 1 models |
| 6.03 | THEN run | prisma generate | `npx prisma generate` |
| 6.04 | THEN run | prisma migrate | `npx prisma migrate dev --name add_contest_system` |

**Wave 6 Proof:**
```powershell
npx prisma generate
npx prisma migrate dev --name add_contest_system
pnpm -C apps/api build
```

---

## WAVE 7 — TESTS

| # | Source | File | Action |
|---|---|---|---|
| 7.01 | Drop 2 | `tests/e2e/contest.smoke.spec.ts` | CREATE |

**Wave 7 Proof (services must be running first):**
```powershell
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

## COMPLETE PROOF CHAIN (after all waves)

```powershell
pnpm -C apps/api run test:readiness-contract
pnpm -C apps/api build
pnpm -C apps/web build
pnpm -s exec playwright test tests/e2e/phase13_5.spec.ts --workers=1 --reporter=dot
pnpm -s exec playwright test tests/e2e/phase14_onboarding.spec.ts --workers=1 --reporter=dot
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

## ENV VARS (add to apps/api/.env before Wave 5)

```env
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
```

---

*BerntoutGlobal XXL | TMI Platform | Install Matrix | All 3 Drops Combined | Phase 19*
