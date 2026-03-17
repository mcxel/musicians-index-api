# CONTEST DROP MASTER MATRIX
# TMI Platform — BerntoutGlobal XXL
# Collision prevention map for all 3 Claude contest drops
# READ THIS BEFORE TOUCHING ANY FILE

---

## DROP SOURCES

| Drop | Label | Contents |
|---|---|---|
| Drop 1 | CORE | contest.controller, contest.dto, contest.module, contest.schema.prisma, contest.service, ContestBanner, ContestBots, HostCuePanel, page.tsx, RayJourneyAvatarSpec, RayJourneyHost, SeasonCountdownPanel, SponsorInvitePanel, SponsorPackageTierCard, COPILOT_WIRING_GUIDE, MASTER_MANIFEST |
| Drop 2 | ADDON | ContestComponents, ContestEntities, ContestPages, GameComponents, HostComponents, SponsorComponents, SponsorContestPanel, SponsorROIAnalytics, contest.smoke.spec, FILE_PLACEMENT_GUIDE, CHATGPT_SEQUENCING_BRIEF, GEMINI_AUDIT_BRIEF |
| Drop 3 | REVEAL | admin-reveal-page, feature.flags (contains game.types + sponsor.tiers), LOCKED_FILE_TOUCH_RULES, MULTI_WINNER_REVEAL_SPEC, PROGRAM_SUCCESS_CRITERIA, reveal.presets, SAFE_WAVE_INSTALL_ORDER, SYSTEM_STATE_MAP, WinnerCameraDirector, WinnerLineupStrip, winner-reveal.service, WinnerRevealPanel |

---

## COLLISION / SUPERSEDE MAP

For every file family, exactly ONE version wins. This is the decision table.

### WinnerRevealPanel
| Drop | Version | Decision |
|---|---|---|
| Drop 2 | ContestComponents.tsx contains WinnerRevealPanel (basic single-winner) | SUPERSEDED |
| Drop 3 | WinnerRevealPanel.tsx — full multi-winner with idle/lineup/group/hero phases | **USE DROP 3** |
**Winner: Drop 3 WinnerRevealPanel.tsx**

### SponsorPackageTierCard
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | SponsorPackageTierCard.tsx — standalone component with 7 tiers | KEEP |
| Drop 2 | SponsorComponents.tsx contains SponsorPackageSelector (different, complementary) | KEEP BOTH — different names |
**Winner: Both exist. Drop 1 = SponsorPackageTierCard, Drop 2 split = SponsorPackageSelector**

### SponsorInvitePanel
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | SponsorInvitePanel.tsx — full invite flow | USE |
**Winner: Drop 1 only**

### ContestBanner
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | ContestBanner.tsx — animated profile banner | USE |
**Winner: Drop 1 only**

### SponsorProgressCard
| Drop | Version | Decision |
|---|---|---|
| Drop 2 | ContestComponents.tsx contains SponsorProgressCard | SPLIT FROM Drop 2 |
**Winner: Drop 2 split**

### SeasonCountdownPanel
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | SeasonCountdownPanel.tsx — standalone | USE |
**Winner: Drop 1 only**

### RayJourneyHost + RayJourneyAvatarSpec
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | RayJourneyHost.tsx + RayJourneyAvatarSpec.ts | USE BOTH |
**Winner: Drop 1 only**

### HostCuePanel
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | HostCuePanel.tsx — admin cue panel | USE |
| Drop 2 | HostComponents.tsx contains HostScriptPanel (different) | SPLIT, DIFFERENT NAME |
**Winner: Drop 1 = HostCuePanel, Drop 2 split = HostScriptPanel (different component)**

### contest.controller / contest.service / contest.module
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | Full controller/service/module with 25+ endpoints | USE |
**Winner: Drop 1 only — do NOT overwrite with anything from Drop 2 or 3**

### Prisma Schema
| Drop | Version | Decision |
|---|---|---|
| Drop 1 | contest.schema.prisma — 10 models | APPEND ONLY to packages/db/prisma/schema.prisma |
**Winner: Drop 1, APPEND ONLY**

### Entity Classes (NestJS)
| Drop | Version | Decision |
|---|---|---|
| Drop 2 | ContestEntities.ts — 6 entity classes + env contract + routes + permissions | SPLIT from Drop 2 |
| Drop 3 | winner-reveal.service.ts — contains WinnerRevealConfigEntity + UpdateRevealConfigDto + WinnerRevealService | Keep Drop 3 version |
**Winner: Drop 2 for contest entities, Drop 3 for reveal entity/service**

### Feature Flags + Config
| Drop | Version | Decision |
|---|---|---|
| Drop 3 | feature.flags.ts — contains feature.flags + game.types + sponsor.tiers | SPLIT into 3 files |
**Winner: Drop 3, split into 3 separate files**

### Reveal Presets
| Drop | Version | Decision |
|---|---|---|
| Drop 3 | reveal.presets.ts — CAMERA_PRESETS + TRANSITION_PRESETS | USE |
**Winner: Drop 3 only**

---

## FULL MASTER MATRIX — ALL FILES

| Source Drop | Source File | Final Repo Path | Action | Wave | Conflicts With |
|---|---|---|---|---|---|
| Drop 1 | MASTER_MANIFEST.md | docs/contest/MASTER_MANIFEST.md | CREATE | W1 | None |
| Drop 1 | COPILOT_WIRING_GUIDE.md | docs/contest/COPILOT_WIRING_GUIDE.md | CREATE | W1 | None |
| Drop 2 | FILE_PLACEMENT_GUIDE.md | docs/contest/FILE_PLACEMENT_GUIDE.md | CREATE | W1 | None |
| Drop 2 | CHATGPT_SEQUENCING_BRIEF.md | docs/contest/handoffs/CHATGPT_SEQUENCING_BRIEF.md | CREATE | W1 | None |
| Drop 2 | GEMINI_AUDIT_BRIEF.md | docs/contest/handoffs/GEMINI_AUDIT_BRIEF.md | CREATE | W1 | None |
| Drop 3 | SAFE_WAVE_INSTALL_ORDER.md | docs/contest/control/SAFE_WAVE_INSTALL_ORDER.md | CREATE | W1 | None |
| Drop 3 | LOCKED_FILE_TOUCH_RULES.md | docs/contest/control/LOCKED_FILE_TOUCH_RULES.md | CREATE | W1 | None |
| Drop 3 | PROGRAM_SUCCESS_CRITERIA.md | docs/contest/control/PROGRAM_SUCCESS_CRITERIA.md | CREATE | W1 | None |
| Drop 3 | MULTI_WINNER_REVEAL_SPEC.md | docs/contest/control/MULTI_WINNER_REVEAL_SPEC.md | CREATE | W1 | None |
| Drop 3 | SYSTEM_STATE_MAP.md | docs/contest/control/SYSTEM_STATE_MAP.md | CREATE | W1 | None |
| Drop 1 | ContestBanner.tsx | apps/web/src/components/contest/ContestBanner.tsx | CREATE | W2 | None |
| Drop 1 | SeasonCountdownPanel.tsx | apps/web/src/components/contest/SeasonCountdownPanel.tsx | CREATE | W2 | None |
| Drop 3 | WinnerRevealPanel.tsx | apps/web/src/components/contest/WinnerRevealPanel.tsx | CREATE | W2 | Drop 2 (supersedes) |
| Drop 3 | WinnerLineupStrip.tsx | apps/web/src/components/contest/WinnerLineupStrip.tsx | CREATE | W2 | None |
| Drop 3 | WinnerCameraDirector.tsx | apps/web/src/components/contest/WinnerCameraDirector.tsx | CREATE | W2 | None |
| Drop 2 | ContestComponents→SponsorProgressCard | apps/web/src/components/contest/SponsorProgressCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ContestEntryCard | apps/web/src/components/contest/ContestEntryCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ContestQualificationStatus | apps/web/src/components/contest/ContestQualificationStatus.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ContestRulesCard | apps/web/src/components/contest/ContestRulesCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ContestProgressBanner | apps/web/src/components/contest/ContestProgressBanner.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ContestDiscoveryGrid | apps/web/src/components/contest/ContestDiscoveryGrid.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→VoteNowPanel | apps/web/src/components/contest/VoteNowPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | ContestComponents→ScoreboardOverlay | apps/web/src/components/contest/ScoreboardOverlay.tsx | SPLIT+CREATE | W2 | None |
| Drop 1 | RayJourneyHost.tsx | apps/web/src/components/host/RayJourneyHost.tsx | CREATE | W2 | None |
| Drop 1 | RayJourneyAvatarSpec.ts | apps/web/src/components/host/RayJourneyAvatarSpec.ts | CREATE | W2 | None |
| Drop 1 | HostCuePanel.tsx | apps/web/src/components/host/HostCuePanel.tsx | CREATE | W2 | None |
| Drop 2 | HostComponents→SponsorCuePanel | apps/web/src/components/host/SponsorCuePanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→PrizeRevealControlPanel | apps/web/src/components/host/PrizeRevealControlPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→HostScriptPanel | apps/web/src/components/host/HostScriptPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→CoHostHandoffPanel | apps/web/src/components/host/CoHostHandoffPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→CrowdPromptPanel | apps/web/src/components/host/CrowdPromptPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→HostSoundboardPanel | apps/web/src/components/host/HostSoundboardPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | HostComponents→HostStageCard | apps/web/src/components/host/HostStageCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 1 | SponsorInvitePanel.tsx | apps/web/src/components/sponsor/SponsorInvitePanel.tsx | CREATE | W2 | None |
| Drop 1 | SponsorPackageTierCard.tsx | apps/web/src/components/sponsor/SponsorPackageTierCard.tsx | CREATE | W2 | None |
| Drop 2 | SponsorContestPanel.tsx | apps/web/src/components/sponsor/SponsorContestPanel.tsx | CREATE | W2 | None |
| Drop 2 | SponsorROIAnalytics.tsx | apps/web/src/components/sponsor/SponsorROIAnalytics.tsx | CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorBadge | apps/web/src/components/sponsor/SponsorBadge.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorSplashCard | apps/web/src/components/sponsor/SponsorSplashCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorActivationButton | apps/web/src/components/sponsor/SponsorActivationButton.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→StageSponsorOverlay | apps/web/src/components/sponsor/StageSponsorOverlay.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→PresentedBySlate | apps/web/src/components/sponsor/PresentedBySlate.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorArtistCard | apps/web/src/components/sponsor/SponsorArtistCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorSpotlightCard | apps/web/src/components/sponsor/SponsorSpotlightCard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorComponents→SponsorPackageSelector | apps/web/src/components/sponsor/SponsorPackageSelector.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | SponsorROIAnalytics→SponsorLeaderboard | apps/web/src/components/sponsor/SponsorLeaderboard.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | GameComponents→MysteryBoxReveal | apps/web/src/components/game/MysteryBoxReveal.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | GameComponents→SoundClueTrigger | apps/web/src/components/game/SoundClueTrigger.tsx | SPLIT+CREATE | W2 | None |
| Drop 2 | GameComponents→AudienceGuessPanel | apps/web/src/components/game/AudienceGuessPanel.tsx | SPLIT+CREATE | W2 | None |
| Drop 3 | reveal.presets.ts | apps/web/src/config/reveal.presets.ts | CREATE | W3 | None |
| Drop 3 | feature.flags→feature.flags | apps/web/src/config/feature.flags.ts | SPLIT+CREATE | W3 | None |
| Drop 3 | feature.flags→game.types | apps/web/src/config/game.types.ts | SPLIT+CREATE | W3 | None |
| Drop 3 | feature.flags→sponsor.tiers | apps/web/src/config/sponsor.tiers.ts | SPLIT+CREATE | W3 | None |
| Drop 2 | ContestEntities→contest.routes | apps/web/src/config/contest.routes.ts | SPLIT+CREATE | W3 | None |
| Drop 1 | page.tsx | apps/web/src/app/contest/page.tsx | CREATE | W4 | Check if exists first |
| Drop 2 | ContestPages→qualify | apps/web/src/app/contest/qualify/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→rules | apps/web/src/app/contest/rules/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→leaderboard | apps/web/src/app/contest/leaderboard/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→host | apps/web/src/app/contest/host/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→admin | apps/web/src/app/contest/admin/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→admin layout | apps/web/src/app/contest/admin/layout.tsx | SPLIT+CREATE | W4 | CRITICAL — guard |
| Drop 2 | ContestPages→season | apps/web/src/app/contest/season/[seasonId]/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→archive | apps/web/src/app/contest/season/[seasonId]/archive/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 2 | ContestPages→sponsors | apps/web/src/app/contest/sponsors/page.tsx | SPLIT+CREATE | W4 | None |
| Drop 3 | admin-reveal-page.tsx | apps/web/src/app/contest/admin/reveal/page.tsx | CREATE | W4 | None |
| Drop 1 | contest.controller.ts | apps/api/src/modules/contest/contest.controller.ts | CREATE | W5 | None |
| Drop 1 | contest.service.ts | apps/api/src/modules/contest/contest.service.ts | CREATE | W5 | None |
| Drop 1 | contest.module.ts | apps/api/src/modules/contest/contest.module.ts | CREATE | W5 | None |
| Drop 1 | contest.dto.ts | apps/api/src/modules/contest/dto/contest.dto.ts | CREATE | W5 | None |
| Drop 1 | ContestBots.ts | apps/api/src/bots/contest/ContestBots.ts | CREATE | W5 | None |
| Drop 2 | ContestEntities→ContestEntryEntity | apps/api/src/modules/contest/entities/contest-entry.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→SponsorContributionEntity | apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→ContestRoundEntity | apps/api/src/modules/contest/entities/contest-round.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→ContestVoteEntity | apps/api/src/modules/contest/entities/contest-vote.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→ContestPrizeEntity | apps/api/src/modules/contest/entities/contest-prize.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→ContestSeasonEntity | apps/api/src/modules/contest/entities/contest-season.entity.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→validateContestEnv | apps/api/src/modules/contest/contest.env.contract.ts | SPLIT+CREATE | W5 | None |
| Drop 2 | ContestEntities→CONTEST_PERMISSIONS | apps/api/src/modules/contest/contest.permissions.ts | SPLIT+CREATE | W5 | None |
| Drop 3 | winner-reveal.service.ts | apps/api/src/modules/contest/services/winner-reveal.service.ts | CREATE | W5 | None |
| Drop 1 | contest.schema.prisma | packages/db/prisma/schema.prisma | APPEND ONLY | W6 | DO NOT REPLACE |
| Drop 2 | contest.smoke.spec.ts | tests/e2e/contest.smoke.spec.ts | CREATE | W7 | None |
| Drop 1 | app.module.ts note | apps/api/src/app.module.ts | EXTEND (1 import line) | W5 | DO NOT REWRITE |

---

## DO NOT CREATE LIST (already exists in repo — Copilot EXTEND ONLY)

```
apps/web/src/app/page.tsx              ← homepage — extend only
apps/web/src/app/layout.tsx            ← root layout — extend only
apps/web/src/middleware.ts             ← LOCKED — DO NOT TOUCH
apps/web/src/components/ui/*           ← shadcn — extend only
apps/api/src/auth/*                    ← LOCKED — DO NOT TOUCH
apps/api/src/modules/health/*          ← LOCKED — DO NOT TOUCH
packages/db/prisma/schema.prisma       ← APPEND ONLY (never replace)
apps/api/src/app.module.ts             ← EXTEND (1 line: ContestModule import)
.github/workflows/ci.yml               ← LOCKED — DO NOT TOUCH
apps/web/src/app/onboarding/*          ← LOCKED — DO NOT TOUCH
```

---

*BerntoutGlobal XXL | TMI Platform | Contest Drop Master Matrix | Phase 19*
