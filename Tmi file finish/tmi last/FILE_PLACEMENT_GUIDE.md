# TMI ADD-ON FILE PLACEMENT GUIDE
# BerntoutGlobal XXL | The Musician's Index
# Hand this to Copilot in VS Code after downloading all files

---

## REPO ROOT
C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform

---

## COMPLETE FILE LIST — WHERE EVERYTHING GOES

### FROM THIS ADD-ON DOWNLOAD (new files — Phase 19.0 additions)

| Downloaded File | Create In Repo At |
|---|---|
| `SponsorContestPanel.tsx` | `apps/web/src/components/sponsor/SponsorContestPanel.tsx` |
| `SponsorComponents.tsx` | **SPLIT** into 8 files — see below |
| `SponsorROIAnalytics.tsx` | `apps/web/src/components/sponsor/SponsorROIAnalytics.tsx` (contains SponsorLeaderboard too — split it) |
| `ContestComponents.tsx` | **SPLIT** into 9 files — see below |
| `HostComponents.tsx` | **SPLIT** into 7 files — see below |
| `GameComponents.tsx` | **SPLIT** into 3 files — see below |
| `ContestPages.ts` | **USE AS REFERENCE** — copy each page block into its own file |
| `ContestEntities.ts` | **SPLIT** into entity files — see below |
| `contest.smoke.spec.ts` | `tests/e2e/contest.smoke.spec.ts` |
| `CHATGPT_SEQUENCING_BRIEF.md` | Keep on desktop — paste into ChatGPT at start of each session |
| `GEMINI_AUDIT_BRIEF.md` | Keep on desktop — paste into Gemini for Phase 19.0 audit |

---

## SPLIT INSTRUCTIONS FOR SponsorComponents.tsx

Open `SponsorComponents.tsx` and split each export into its own file:

| Export | File to Create |
|---|---|
| `SponsorBadge` | `apps/web/src/components/sponsor/SponsorBadge.tsx` |
| `SponsorSplashCard` | `apps/web/src/components/sponsor/SponsorSplashCard.tsx` |
| `SponsorActivationButton` | `apps/web/src/components/sponsor/SponsorActivationButton.tsx` |
| `StageSponsorOverlay` | `apps/web/src/components/sponsor/StageSponsorOverlay.tsx` |
| `PresentedBySlate` | `apps/web/src/components/sponsor/PresentedBySlate.tsx` |
| `SponsorArtistCard` | `apps/web/src/components/sponsor/SponsorArtistCard.tsx` |
| `SponsorSpotlightCard` | `apps/web/src/components/sponsor/SponsorSpotlightCard.tsx` |
| `SponsorPackageSelector` | `apps/web/src/components/sponsor/SponsorPackageSelector.tsx` |

---

## SPLIT INSTRUCTIONS FOR ContestComponents.tsx

| Export | File to Create |
|---|---|
| `WinnerRevealPanel` | `apps/web/src/components/contest/WinnerRevealPanel.tsx` |
| `VoteNowPanel` | `apps/web/src/components/contest/VoteNowPanel.tsx` |
| `ScoreboardOverlay` | `apps/web/src/components/contest/ScoreboardOverlay.tsx` |
| `ContestDiscoveryGrid` | `apps/web/src/components/contest/ContestDiscoveryGrid.tsx` |
| `ContestEntryCard` | `apps/web/src/components/contest/ContestEntryCard.tsx` |
| `ContestQualificationStatus` | `apps/web/src/components/contest/ContestQualificationStatus.tsx` |
| `ContestRulesCard` | `apps/web/src/components/contest/ContestRulesCard.tsx` |
| `ContestProgressBanner` | `apps/web/src/components/contest/ContestProgressBanner.tsx` |
| `SponsorProgressCard` | `apps/web/src/components/contest/SponsorProgressCard.tsx` |

---

## SPLIT INSTRUCTIONS FOR HostComponents.tsx

| Export | File to Create |
|---|---|
| `SponsorCuePanel` | `apps/web/src/components/host/SponsorCuePanel.tsx` |
| `PrizeRevealControlPanel` | `apps/web/src/components/host/PrizeRevealControlPanel.tsx` |
| `HostScriptPanel` | `apps/web/src/components/host/HostScriptPanel.tsx` |
| `CoHostHandoffPanel` | `apps/web/src/components/host/CoHostHandoffPanel.tsx` |
| `CrowdPromptPanel` | `apps/web/src/components/host/CrowdPromptPanel.tsx` |
| `HostSoundboardPanel` | `apps/web/src/components/host/HostSoundboardPanel.tsx` |
| `HostStageCard` | `apps/web/src/components/host/HostStageCard.tsx` |

---

## SPLIT INSTRUCTIONS FOR GameComponents.tsx

| Export | File to Create |
|---|---|
| `MysteryBoxReveal` | `apps/web/src/components/game/MysteryBoxReveal.tsx` |
| `SoundClueTrigger` | `apps/web/src/components/game/SoundClueTrigger.tsx` |
| `AudienceGuessPanel` | `apps/web/src/components/game/AudienceGuessPanel.tsx` |

---

## SPLIT INSTRUCTIONS FOR ContestEntities.ts

| Export | File to Create |
|---|---|
| `ContestEntryEntity` | `apps/api/src/modules/contest/entities/contest-entry.entity.ts` |
| `SponsorContributionEntity` | `apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts` |
| `ContestRoundEntity` | `apps/api/src/modules/contest/entities/contest-round.entity.ts` |
| `ContestVoteEntity` | `apps/api/src/modules/contest/entities/contest-vote.entity.ts` |
| `ContestPrizeEntity` | `apps/api/src/modules/contest/entities/contest-prize.entity.ts` |
| `ContestSeasonEntity` | `apps/api/src/modules/contest/entities/contest-season.entity.ts` |
| `validateContestEnv()` | `apps/api/src/modules/contest/contest.env.contract.ts` |
| `CONTEST_ROUTES` | `apps/web/src/config/contest.routes.ts` |
| `CONTEST_PERMISSIONS + hasContestPermission()` | `apps/api/src/modules/contest/contest.permissions.ts` |

---

## PAGES FROM ContestPages.ts (uncomment the JSX, split into files)

| Commented Block | File to Create |
|---|---|
| Qualify page | `apps/web/src/app/contest/qualify/page.tsx` |
| Rules page | `apps/web/src/app/contest/rules/page.tsx` |
| Leaderboard page | `apps/web/src/app/contest/leaderboard/page.tsx` |
| Host page | `apps/web/src/app/contest/host/page.tsx` |
| Admin page | `apps/web/src/app/contest/admin/page.tsx` |
| Admin layout | `apps/web/src/app/contest/admin/layout.tsx` ← CRITICAL, protects admin routes |
| Season page | `apps/web/src/app/contest/season/[seasonId]/page.tsx` |
| Archive page | `apps/web/src/app/contest/season/[seasonId]/archive/page.tsx` |
| Sponsors page | `apps/web/src/app/contest/sponsors/page.tsx` |

---

## ENV VARS TO ADD (apps/api/.env)

```env
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
```

---

## WAVE ORDER FOR COPILOT (stick to this)

1. Wave 1: Place + wire ContestBanner, SponsorProgressCard in artist profile
2. Wave 2: Place + wire SponsorInvitePanel, SponsorPackageTierCard, SponsorPackageSelector
3. Wave 3: Place API files, append Prisma models, register ContestModule (AFTER Gemini audit)
4. Wave 4: Place host system files, wire /contest/host page
5. Wave 5: Place admin pages (with layout.tsx guard!), wire bots, wire analytics
6. Wave 6: Place sponsor overlays, StageSponsorOverlay, SponsorLeaderboard
7. Wave 7: Season + archive pages

---

## AFTER PLACING FILES — PROOF COMMANDS

```powershell
# Run after each wave
pnpm -C apps/api run test:readiness-contract
pnpm -C apps/api build
pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
```

---

*BerntoutGlobal XXL | TMI Platform | Add-On Placement Guide | March 2026*
