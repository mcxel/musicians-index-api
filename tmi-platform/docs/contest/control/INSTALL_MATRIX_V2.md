# INSTALL MATRIX V2 — CORRECTED
# TMI Platform — BerntoutGlobal XXL
# All 3 drops + safety corrections for Wave 5 + Wave 6
# Supersedes previous INSTALL_MATRIX.md

---

## CORRECTIONS FROM V1

| Issue | V1 | V2 Fix |
|---|---|---|
| Wave 5 blindly CREATE controller/service | CREATE | CHECK THEN CREATE OR EXTEND |
| Wave 6 Prisma "APPEND" | APPEND | MERGE APPEND-ONLY AFTER MANUAL REVIEW |
| No pre-Wave 5 inventory step | Missing | Added as mandatory Wave 4.5 |
| No runtime proof before Playwright | "services must be running" | healthz + readyz + web root = 200 required |
| Reveal features mixed into Wave 5 | Scattered | Reveal order: components → config → admin page → service → prisma |

---

## ABSOLUTE RULES (read before every wave)

```
NEVER paste chat text into PowerShell
NEVER run API + web + Playwright simultaneously
NEVER touch: middleware.ts / auth/* / onboarding/* / ci.yml / health/*
NEVER replace schema.prisma — APPEND ONLY after manual review
ONLY add ContestModule import to app.module.ts — nothing else
```

---

## GIT CHECKPOINT — BEFORE ANY WAVE

```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
git add -A
git commit -m "checkpoint: before contest wave install"
```

---

## WAVE 1 — DOCS (zero risk)

Place under `docs/contest/`, `docs/contest/control/`, `docs/contest/handoffs/`

All markdown files from all 3 drops. No build needed.

---

## WAVE 2 — WEB COMPONENTS

**Proof after:** `pnpm -C apps/web build`

All component files — contest, host, sponsor, game.
See CONTEST_DROP_MASTER_MATRIX.md for full file list and which drop wins.
**Drop 3 WinnerRevealPanel supersedes Drop 2 version.**

---

## WAVE 3 — CONFIG FILES

**Proof after:** `pnpm -C apps/web build`

```
apps/web/src/config/reveal.presets.ts       CREATE
apps/web/src/config/feature.flags.ts        CREATE (split from Drop 3)
apps/web/src/config/game.types.ts           CREATE (split from Drop 3)
apps/web/src/config/sponsor.tiers.ts        CREATE (split from Drop 3)
apps/web/src/config/contest.routes.ts       CREATE (split from Drop 2)
```

---

## WAVE 4 — PAGES + ADMIN GUARD

**CRITICAL ORDER: Place layout.tsx BEFORE any admin page.**

```
apps/web/src/app/contest/page.tsx                              CHECK THEN CREATE
apps/web/src/app/contest/rules/page.tsx                        CREATE
apps/web/src/app/contest/leaderboard/page.tsx                  CREATE
apps/web/src/app/contest/qualify/page.tsx                      CREATE
apps/web/src/app/contest/sponsors/page.tsx                     CREATE
apps/web/src/app/contest/season/[seasonId]/page.tsx            CREATE
apps/web/src/app/contest/season/[seasonId]/archive/page.tsx    CREATE
apps/web/src/app/contest/host/page.tsx                         CREATE
apps/web/src/app/contest/admin/layout.tsx                      CREATE FIRST ← CRITICAL
apps/web/src/app/contest/admin/page.tsx                        CREATE (after layout.tsx)
apps/web/src/app/contest/admin/contestants/page.tsx            CREATE
apps/web/src/app/contest/admin/sponsors/page.tsx               CREATE
apps/web/src/app/contest/admin/seasons/page.tsx                CREATE
apps/web/src/app/contest/admin/payouts/page.tsx                CREATE
apps/web/src/app/contest/admin/audit/page.tsx                  CREATE
apps/web/src/app/contest/admin/reveal/page.tsx                 CREATE
```

**Proof after:** `pnpm -C apps/web build`

Route checks:
```powershell
# Start web server then:
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/contest).StatusCode } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/contest/rules).StatusCode } catch { $_.Exception.Message }
```

---

## WAVE 4.5 — PRE-API INVENTORY (MANDATORY)

**Do this before Wave 5. Do not skip.**

Run in PowerShell:
```powershell
# Inventory contest module folder
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\api\src\modules\contest" -Recurse -Name 2>$null

# Inventory contest section of schema.prisma
Select-String -Path "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\packages\db\prisma\schema.prisma" -Pattern "^model Contest|^model Sponsor|^model Winner|^model Reveal"

# Inventory contest pages
Get-ChildItem "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\contest" -Recurse -Name 2>$null
```

Report what already exists before placing anything in Wave 5.
If contest.controller.ts / contest.service.ts / contest.module.ts already exist → EXTEND ONLY, do not overwrite.

---

## WAVE 5 — API FILES (after inventory confirms what exists)

### 5A — High-risk files (CHECK THEN CREATE OR EXTEND)

| File | Action |
|---|---|
| `apps/api/src/modules/contest/contest.controller.ts` | CHECK first — if exists: EXTEND. If missing: CREATE. |
| `apps/api/src/modules/contest/contest.service.ts` | CHECK first — if exists: EXTEND. If missing: CREATE. |
| `apps/api/src/modules/contest/contest.module.ts` | CHECK first — if exists: EXTEND. If missing: CREATE. |
| `apps/api/src/app.module.ts` | EXTEND ONLY — add 1 import line for ContestModule |

### 5B — New files (safe to CREATE)

```
apps/api/src/modules/contest/dto/contest.dto.ts                        CREATE
apps/api/src/bots/contest/ContestBots.ts                               CREATE
apps/api/src/modules/contest/entities/contest-entry.entity.ts          CREATE
apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts   CREATE
apps/api/src/modules/contest/entities/contest-round.entity.ts          CREATE
apps/api/src/modules/contest/entities/contest-vote.entity.ts           CREATE
apps/api/src/modules/contest/entities/contest-prize.entity.ts          CREATE
apps/api/src/modules/contest/entities/contest-season.entity.ts         CREATE
apps/api/src/modules/contest/contest.env.contract.ts                   CREATE
apps/api/src/modules/contest/contest.permissions.ts                    CREATE
apps/api/src/modules/contest/services/winner-reveal.service.ts         CREATE
```

### 5C — ENV VARS (add to apps/api/.env)

```env
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
```

**Wave 5 Proof:**
```powershell
pnpm -C apps/api build
```

API endpoint checks:
```powershell
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/contest/sponsor-packages).StatusCode } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/contest/host/scripts).StatusCode } catch { $_.Exception.Message }
```

---

## WAVE 6 — PRISMA (MERGE APPEND-ONLY AFTER MANUAL REVIEW)

### Step 1 — Manual review before touching schema.prisma

Open `packages/db/prisma/schema.prisma` in VS Code.
Scroll to the bottom.
Check: do any of these model names already exist?

```
ContestSeason, ContestEntry, SponsorContribution, SponsorPackage,
ContestRound, ContestVote, ContestPrize, PrizeFulfillment,
RayJourneyScript, HostCue, WinnerRevealConfig, RevealAnalytics
```

If ANY already exist → do NOT paste the contest.schema.prisma blindly.
Instead, compare field by field and add only the missing fields/models.

### Step 2 — Append (only if Step 1 confirms models are missing)

Paste at the very end of schema.prisma:
1. All models from contest.schema.prisma (Drop 1) — 10 models
2. WinnerRevealConfig + RevealAnalytics (winner-reveal-config.prisma from this package)

### Step 3 — Generate and migrate

```powershell
npx prisma generate
```

```powershell
npx prisma migrate dev --name add_contest_system
```

**Wave 6 Proof:**
```powershell
pnpm -C apps/api build
```

---

## WAVE 7 — TESTS

Mandatory runtime pre-proof gate before Playwright:

```powershell
# All three must return 200 before running smoke test
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth).StatusCode } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz).Content } catch { $_.Exception.Message }
try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz).Content } catch { $_.Exception.Message }
```

Then:
```powershell
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

## MINIMUM CONTEST COMPLETE CHECKPOINT

Before expanding to interview/podcast/watch-party, all of these must be true:

- [ ] `pnpm -C apps/web build` exits 0
- [ ] `pnpm -C apps/api build` exits 0
- [ ] `/contest` route returns 200
- [ ] `/contest/admin` redirects unauthenticated user to `/auth`
- [ ] `GET /api/contest/sponsor-packages` returns 200 with array
- [ ] `npx prisma migrate dev` completed without error
- [ ] `pnpm -C apps/api run test:readiness-contract` exits 0
- [ ] `contest.smoke.spec.ts` playwright test exits 0

**Do not wire interview/podcast/watch-party until all checkboxes above are checked.**

---

## INTERVIEW / PODCAST / WATCH-PARTY — DEFERRED WAVE

Add AFTER Minimum Contest Complete checkpoint passes.

**Wave 8 — Interview/Podcast components (UI only)**
```
apps/web/src/components/interview/InterviewStage.tsx         CREATE
apps/web/src/components/podcast/PodcastAudienceRoom.tsx      CREATE
apps/web/src/components/watchparty/WatchPartyPanel.tsx       CREATE
apps/web/src/components/watchparty/GuestQueuePanel.tsx       CREATE
apps/web/src/components/watchparty/AudienceRequestPanel.tsx  CREATE
apps/web/src/components/watchparty/ClipRecorderPanel.tsx     CREATE
apps/web/src/components/watchparty/ReplayPublishPanel.tsx    CREATE
```

**Wave 9 — Interview/Podcast pages**
```
apps/web/src/app/interviews/page.tsx         CREATE
apps/web/src/app/interviews/[id]/page.tsx    CREATE
apps/web/src/app/podcasts/page.tsx           CREATE
apps/web/src/app/podcasts/[id]/page.tsx      CREATE
apps/web/src/app/watch/[roomId]/page.tsx     CREATE
apps/web/src/app/watch/replay/[id]/page.tsx  CREATE
```

**Wave 10 — Interview/Podcast API (after Wave 9 pages build)**
```
apps/api/src/modules/interview/     CREATE module family
apps/api/src/modules/podcast/       CREATE module family
apps/api/src/modules/watchparty/    CREATE module family
apps/api/src/modules/liveroom/      CREATE shared live-room module
```

---

## SYSTEM OVERLAP / CONFLICT RULES

| System | Relationship | Rule |
|---|---|---|
| Contest host (RayJourney) | Separate from podcast/interview host | Keep separate — different identity |
| WinnerRevealPanel | Contest only | Do not reuse in interview/podcast |
| Live room base | Shared by contest + interview + podcast + watch party | Extend from shared base |
| HostCuePanel | Contest admin only | Interview admin gets own HostInterviewCuePanel |
| StageSponsorOverlay | Shared | Use across contest, interview, podcast |
| PresentedBySlate | Shared | Use across all live events |
| SeasonCountdownPanel | Contest only | Interview/podcast gets own EventCountdown |
| ContestBanner | Contest artist profile only | Interview gets InterviewInviteBanner |
| Admin layout.tsx | Guards all /contest/admin/* | Interview admin gets own layout guard |

---

*BerntoutGlobal XXL | TMI Platform | Install Matrix V2 | Phase 19 Corrected*
