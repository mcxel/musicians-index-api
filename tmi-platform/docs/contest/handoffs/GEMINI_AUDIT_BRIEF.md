# GEMINI REPO AUDIT BRIEF
# TMI Platform — BerntoutGlobal XXL
# Hand this to Gemini to run its Phase 19.0 repo audit

---

## YOUR ROLE (Gemini)

You are the **Repo Auditor**. Your job is to scan the TMI repo and produce a precise, structured output that tells Claude exactly what to create and tells Copilot exactly what to wire.

You do NOT write code. You ONLY audit, map, and report.

---

## REPO LOCATION

```
C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform
```

Main areas to audit:
- `apps/web/src/app/**` — all Next.js pages
- `apps/web/src/components/**` — all UI components
- `apps/api/src/modules/**` — all NestJS modules
- `apps/api/src/bots/**` — all bot files
- `packages/db/prisma/schema.prisma` — Prisma schema
- `.github/workflows/ci.yml` — CI pipeline
- `tests/e2e/**` — E2E test files

---

## WHAT YOU MUST OUTPUT

### OUTPUT 1 — Existing Page Inventory
List every file in `apps/web/src/app/**` with:
- Full path
- Route it serves
- Whether it's a static shell, real data-connected page, or layout

### OUTPUT 2 — Existing Component Inventory
List every file in `apps/web/src/components/**` with:
- Full path
- What it does (one line)
- Whether it has real data wired or is a UI shell

### OUTPUT 3 — Existing API Module Inventory
List every module in `apps/api/src/modules/**` with:
- Full path
- Controller endpoints it exposes
- Whether it's connected to Prisma or stub

### OUTPUT 4 — Missing File Inventory
Cross-reference against the MASTER_MANIFEST.md file in the repo (or below). For each file listed as CREATE in the manifest, report:

| File | Status | Notes |
|---|---|---|
| `apps/web/src/components/contest/ContestBanner.tsx` | EXISTS / MISSING | if exists: connected or stub? |
| `apps/web/src/components/contest/SponsorProgressCard.tsx` | EXISTS / MISSING | |
| (etc for every file in manifest) | | |

### OUTPUT 5 — Do Not Touch Confirmation
Confirm these files exist and are untouched:

| File | Exists | Last Modified | Safe |
|---|---|---|---|
| `apps/web/src/middleware.ts` | | | |
| `apps/api/src/auth/*` | | | |
| `apps/web/src/app/onboarding/*` | | | |
| `.github/workflows/ci.yml` | | | |
| `apps/api/src/modules/health/*` | | | |
| `packages/db/prisma/schema.prisma` | | | |

### OUTPUT 6 — Prisma Schema Audit
Report:
- All existing models in schema.prisma
- Which contest models are already added vs missing
- Exact line number where new models should be appended

### OUTPUT 7 — Route Inventory
List every route the app exposes (web + API) so we have a complete map before upload.

### OUTPUT 8 — E2E Test Inventory
List every spec file in `tests/e2e/` and whether it passes with local services running.

---

## CRITICAL FILES TO CROSS-CHECK

These are the files Claude created that need to be placed. Confirm which already exist vs which need to be added:

**Contest Components (→ `apps/web/src/components/contest/`):**
- ContestBanner.tsx
- SponsorProgressCard.tsx
- LocalSponsorProgressWidget.tsx
- MajorSponsorProgressWidget.tsx
- SponsorInvitePanel.tsx
- ContestQualificationStatus.tsx
- SeasonCountdownPanel.tsx
- ContestEntryCard.tsx
- ContestProgressBanner.tsx
- ContestDiscoveryGrid.tsx
- VoteNowPanel.tsx
- WinnerRevealPanel.tsx
- ScoreboardOverlay.tsx
- PrizeRevealPanel.tsx
- ContestRulesCard.tsx
- SponsorPackageTierCard.tsx

**Host Components (→ `apps/web/src/components/host/`):**
- RayJourneyHost.tsx
- HostCuePanel.tsx
- SponsorCuePanel.tsx
- PrizeRevealControlPanel.tsx
- HostScriptPanel.tsx
- CoHostHandoffPanel.tsx
- CrowdPromptPanel.tsx
- HostSoundboardPanel.tsx
- HostStageCard.tsx
- RayJourneyAvatarSpec.ts

**Sponsor Components (→ `apps/web/src/components/sponsor/`):**
- SponsorContestPanel.tsx
- SponsorArtistCard.tsx
- SponsorBadge.tsx
- SponsorSplashCard.tsx
- SponsorActivationButton.tsx
- StageSponsorOverlay.tsx
- PresentedBySlate.tsx
- SponsorLeaderboard.tsx
- SponsorSpotlightCard.tsx
- SponsorROIAnalytics.tsx
- SponsorPackageSelector.tsx

**Game Components (→ `apps/web/src/components/game/`):**
- MysteryBoxReveal.tsx
- SoundClueTrigger.tsx
- AudienceGuessPanel.tsx
- ContestProgressBanner.tsx

**Contest Pages (→ `apps/web/src/app/contest/`):**
- page.tsx (home)
- rules/page.tsx
- leaderboard/page.tsx
- host/page.tsx
- qualify/page.tsx
- sponsors/page.tsx
- season/[seasonId]/page.tsx
- season/[seasonId]/archive/page.tsx
- admin/page.tsx
- admin/layout.tsx (CRITICAL — protects all admin routes)
- admin/contestants/page.tsx
- admin/sponsors/page.tsx
- admin/payouts/page.tsx
- admin/seasons/page.tsx
- admin/audit/page.tsx

**API Modules (→ `apps/api/src/modules/contest/`):**
- contest.controller.ts
- contest.service.ts
- contest.module.ts
- contest.dto.ts
- contest.env.contract.ts
- contest.permissions.ts
- entities/contest-entry.entity.ts
- entities/sponsor-contribution.entity.ts
- entities/contest-round.entity.ts
- entities/contest-vote.entity.ts
- entities/contest-prize.entity.ts
- entities/contest-season.entity.ts

**Bots (→ `apps/api/src/bots/contest/`):**
- ContestBots.ts (contains all 7 bots)

**Config (→ `apps/web/src/config/`):**
- contest.routes.ts

**Tests (→ `tests/e2e/`):**
- contest.smoke.spec.ts

**Prisma (→ `packages/db/prisma/`):**
- schema.prisma — confirm these models are appended:
  - ContestSeason
  - ContestEntry
  - SponsorContribution
  - SponsorPackage
  - ContestRound
  - ContestVote
  - ContestPrize
  - PrizeFulfillment
  - RayJourneyScript
  - HostCue

**Env (→ `apps/api/.env`):**
- CONTEST_REGISTRATION_DAY=8
- CONTEST_REGISTRATION_MONTH=8
- CONTEST_MAX_LOCAL_SPONSORS=10
- CONTEST_MAX_MAJOR_SPONSORS=10

---

## OUTPUT FORMAT

Return your audit in this exact format so ChatGPT can convert it to a Claude brief:

```
GEMINI AUDIT OUTPUT — TMI PLATFORM
Date: [date]
Repo Checkpoint: [latest git hash]

=== SECTION 1: EXISTING PAGES ===
[list]

=== SECTION 2: EXISTING COMPONENTS ===
[list]

=== SECTION 3: EXISTING API MODULES ===
[list]

=== SECTION 4: MISSING FILES ===
CREATE: [path] — [reason]
CREATE: [path] — [reason]
...

=== SECTION 5: DO NOT TOUCH CONFIRMATION ===
[table]

=== SECTION 6: PRISMA AUDIT ===
[existing models] [missing models] [line number for append]

=== SECTION 7: ROUTE INVENTORY ===
[all web routes] [all API routes]

=== SECTION 8: E2E TEST STATUS ===
[file → PASS/FAIL/NOT RUN]

=== SECTION 9: RECOMMENDED NEXT STEPS ===
1. [ordered action]
2. [ordered action]
...
```

---

## RULES FOR YOUR AUDIT

1. Never suggest modifying locked files (middleware.ts, auth/*, onboarding/*, ci.yml, health/*)
2. Never suggest rewriting Prisma schema — only appending
3. Flag any file that seems to duplicate existing locked behavior
4. Flag any contest component that assumes old auth/cookie names
5. Confirm August 8 date rule is enforced anywhere season logic exists
6. If you find a file that Claude generated but it's already in the repo, mark it as EXISTS — do NOT overwrite

---

*BerntoutGlobal XXL | TMI Platform | Gemini Audit Brief | Phase 19.0 | March 2026*
