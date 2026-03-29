# TMI Grand Platform Contest System — Master Manifest
# BerntoutGlobal XXL | The Musician's Index
# Generated for VS Code / Copilot Integration

---

## SYSTEM OVERVIEW

The Grand Platform Contest is a core pillar of The Musician's Index (TMI) platform.
It is styled as the platform's equivalent of "America's Got Talent" — open to ALL creator types:
singers, rappers, comedians, dancers, DJs, beatmakers, magicians, influencers, freestyle artists, bands.

Every eligible creator must secure **20 sponsors** (10 Local + 10 Major) to qualify for entry.

---

## MASTER REPO PLACEMENT MAP

### 📁 Pages (Next.js App Router)

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/app/contest/page.tsx` | **CREATE** | Contest home / discovery hub |
| `apps/web/src/app/contest/rules/page.tsx` | **CREATE** | Official contest rules |
| `apps/web/src/app/contest/leaderboard/page.tsx` | **CREATE** | Live sponsor + contestant leaderboard |
| `apps/web/src/app/contest/host/page.tsx` | **CREATE** | Ray Journey host stage page |
| `apps/web/src/app/contest/season/[seasonId]/page.tsx` | **CREATE** | Season-specific landing |
| `apps/web/src/app/contest/season/[seasonId]/archive/page.tsx` | **CREATE** | Season replay + winner archive |
| `apps/web/src/app/contest/qualify/page.tsx` | **CREATE** | Qualification status dashboard |
| `apps/web/src/app/contest/sponsors/page.tsx` | **CREATE** | Sponsor discovery for artists |
| `apps/web/src/app/contest/admin/page.tsx` | **CREATE** | Contest admin control center |
| `apps/web/src/app/contest/admin/contestants/page.tsx` | **CREATE** | Contestant qualification queue |
| `apps/web/src/app/contest/admin/sponsors/page.tsx` | **CREATE** | Sponsor approval queue |
| `apps/web/src/app/contest/admin/payouts/page.tsx` | **CREATE** | Prize/payout tracker |
| `apps/web/src/app/contest/admin/seasons/page.tsx` | **CREATE** | Season setup and management |
| `apps/web/src/app/contest/admin/audit/page.tsx` | **CREATE** | Audit + export page |

---

### 📁 Contest Components

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/components/contest/ContestBanner.tsx` | **CREATE** | Animated profile banner — invites artists to join |
| `apps/web/src/components/contest/SponsorProgressCard.tsx` | **CREATE** | 20/20 sponsor progress tracker |
| `apps/web/src/components/contest/LocalSponsorProgressWidget.tsx` | **CREATE** | 10 local sponsor count widget |
| `apps/web/src/components/contest/MajorSponsorProgressWidget.tsx` | **CREATE** | 10 major sponsor count widget |
| `apps/web/src/components/contest/SponsorInvitePanel.tsx` | **CREATE** | Artist sponsor invitation/search panel |
| `apps/web/src/components/contest/ContestQualificationStatus.tsx` | **CREATE** | Qual status badge + checklist |
| `apps/web/src/components/contest/SeasonCountdownPanel.tsx` | **CREATE** | Season deadline countdown |
| `apps/web/src/components/contest/ContestEntryCard.tsx` | **CREATE** | Single contestant entry card |
| `apps/web/src/components/contest/ContestProgressBanner.tsx` | **CREATE** | Phase progress banner (qual → regional → final) |
| `apps/web/src/components/contest/ContestDiscoveryGrid.tsx` | **CREATE** | Fan-facing contestant discovery grid |
| `apps/web/src/components/contest/VoteNowPanel.tsx` | **CREATE** | Fan voting panel |
| `apps/web/src/components/contest/WinnerRevealPanel.tsx` | **CREATE** | Animated winner reveal |
| `apps/web/src/components/contest/ScoreboardOverlay.tsx` | **CREATE** | Live scoreboard overlay |
| `apps/web/src/components/contest/PrizeRevealPanel.tsx` | **CREATE** | Prize reveal animation panel |
| `apps/web/src/components/contest/ContestRulesCard.tsx` | **CREATE** | Inline rules summary card |
| `apps/web/src/components/contest/SponsorPackageTierCard.tsx` | **CREATE** | Bronze/Silver/Gold/Title sponsor packages |

---

### 📁 Host Components (Ray Journey)

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/components/host/RayJourneyHost.tsx` | **CREATE** | Ray Journey animated host avatar + speech |
| `apps/web/src/components/host/HostCuePanel.tsx` | **CREATE** | Script cue triggers for host |
| `apps/web/src/components/host/SponsorCuePanel.tsx` | **CREATE** | Sponsor shoutout cue system |
| `apps/web/src/components/host/PrizeRevealControlPanel.tsx` | **CREATE** | Host-controlled prize reveal |
| `apps/web/src/components/host/HostScriptPanel.tsx` | **CREATE** | Script library panel |
| `apps/web/src/components/host/CoHostHandoffPanel.tsx` | **CREATE** | Co-host transition logic |
| `apps/web/src/components/host/CrowdPromptPanel.tsx` | **CREATE** | Crowd engagement triggers |
| `apps/web/src/components/host/HostSoundboardPanel.tsx` | **CREATE** | Host sound effects board |
| `apps/web/src/components/host/HostStageCard.tsx` | **CREATE** | Host identity card / intro card |
| `apps/web/src/components/host/RayJourneyAvatarSpec.ts` | **CREATE** | Ray Journey character spec / design tokens |

---

### 📁 Sponsor Components

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/components/sponsor/SponsorContestPanel.tsx` | **CREATE** | Sponsor contest management panel |
| `apps/web/src/components/sponsor/SponsorArtistCard.tsx` | **CREATE** | Sponsor → artist association card |
| `apps/web/src/components/sponsor/SponsorBadge.tsx` | **CREATE** | Inline sponsor badge |
| `apps/web/src/components/sponsor/SponsorSplashCard.tsx` | **CREATE** | Full sponsor splash/feature card |
| `apps/web/src/components/sponsor/SponsorActivationButton.tsx` | **CREATE** | CTA button for sponsor activation |
| `apps/web/src/components/sponsor/StageSponsorOverlay.tsx` | **CREATE** | Stage performance sponsor overlay |
| `apps/web/src/components/sponsor/PresentedBySlate.tsx` | **CREATE** | "Presented by [Brand]" slate |
| `apps/web/src/components/sponsor/SponsorLeaderboard.tsx` | **CREATE** | Which sponsors backed the most artists |
| `apps/web/src/components/sponsor/SponsorSpotlightCard.tsx` | **CREATE** | Featured sponsor spotlight |
| `apps/web/src/components/sponsor/SponsorROIAnalytics.tsx` | **CREATE** | Sponsor analytics + ROI widget |
| `apps/web/src/components/sponsor/SponsorPackageSelector.tsx` | **CREATE** | Package tier selector (Bronze→Title) |

---

### 📁 Game / Show Engine Components

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/components/game/MysteryBoxReveal.tsx` | **CREATE** | Mystery box reveal animation |
| `apps/web/src/components/game/SoundClueTrigger.tsx` | **CREATE** | Audio clue trigger for games |
| `apps/web/src/components/game/AudienceGuessPanel.tsx` | **CREATE** | Audience guess input panel |
| `apps/web/src/components/game/ContestProgressBanner.tsx` | **CREATE** | Phase-aware progress banner |

---

### 📁 API — NestJS Modules

| File Path | Status | Purpose |
|---|---|---|
| `apps/api/src/modules/contest/contest.controller.ts` | **CREATE** | REST endpoints for contest system |
| `apps/api/src/modules/contest/contest.service.ts` | **CREATE** | Contest business logic |
| `apps/api/src/modules/contest/contest.module.ts` | **CREATE** | NestJS module registration |
| `apps/api/src/modules/contest/contest.dto.ts` | **CREATE** | DTOs for contest requests/responses |
| `apps/api/src/modules/contest/entities/contest-entry.entity.ts` | **CREATE** | ContestEntry Prisma entity |
| `apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts` | **CREATE** | SponsorContribution entity |
| `apps/api/src/modules/contest/entities/contest-round.entity.ts` | **CREATE** | ContestRound entity |
| `apps/api/src/modules/contest/entities/contest-vote.entity.ts` | **CREATE** | ContestVote entity |
| `apps/api/src/modules/contest/entities/contest-prize.entity.ts` | **CREATE** | ContestPrize entity |
| `apps/api/src/modules/contest/entities/contest-season.entity.ts` | **CREATE** | ContestSeason entity |

---

### 📁 Bot Helpers

| File Path | Status | Purpose |
|---|---|---|
| `apps/api/src/bots/contest/ContestQualificationBot.ts` | **CREATE** | Guides contestants through qual steps |
| `apps/api/src/bots/contest/SponsorVerificationBot.ts` | **CREATE** | Verifies sponsor legitimacy + payments |
| `apps/api/src/bots/contest/SponsorMatchBot.ts` | **CREATE** | Suggests sponsors to artists |
| `apps/api/src/bots/contest/HostScriptBot.ts` | **CREATE** | Generates host script cues |
| `apps/api/src/bots/contest/PrizeFulfillmentBot.ts` | **CREATE** | Tracks prize delivery |
| `apps/api/src/bots/contest/ContestAnalyticsBot.ts` | **CREATE** | Contest engagement analytics |
| `apps/api/src/bots/contest/RuleEnforcementBot.ts` | **CREATE** | Anti-abuse / fraud enforcement |

---

### 📁 Prisma Schema Additions

| Model | Status | Purpose |
|---|---|---|
| `ContestSeason` | **ADD** | Yearly season tracking |
| `ContestEntry` | **ADD** | Artist contest entry |
| `SponsorContribution` | **ADD** | Sponsor → entry association |
| `SponsorPackage` | **ADD** | Bronze/Silver/Gold/Title tiers |
| `ContestRound` | **ADD** | Qual / Regional / Semi / Final |
| `ContestVote` | **ADD** | Fan vote records |
| `ContestPrize` | **ADD** | Prize inventory |
| `PrizeFulfillment` | **ADD** | Winner prize delivery |
| `RayJourneyScript` | **ADD** | Host script library |
| `HostCue` | **ADD** | Live host cue records |

---

## DO NOT CREATE LIST

These already exist in TMI repo — Copilot should EXTEND only:

- `apps/web/src/app/page.tsx` — homepage (extend only)
- `apps/web/src/app/layout.tsx` — root layout (extend only)
- `apps/web/src/middleware.ts` — auth middleware (extend only)
- `apps/web/src/components/ui/*` — shadcn base components (extend only)
- `apps/api/src/app.module.ts` — root module (extend only, add contest import)
- `apps/api/src/auth/*` — auth system (extend only)
- `prisma/schema.prisma` — ADD new models, do NOT rewrite existing

---

## IMPLEMENTATION WAVES

### Wave 1 — Core Contest Pages + Banner System
Files: ContestBanner, SponsorProgressCard, ContestBanner page, Rules page, Qualify page

### Wave 2 — Sponsor System + Package Tiers
Files: SponsorContestPanel, SponsorPackageSelector, SponsorInvitePanel, SponsorArtistCard

### Wave 3 — API + Data Models
Files: contest.controller, contest.service, contest.module, all entities, Prisma schema additions

### Wave 4 — Ray Journey Host System
Files: RayJourneyHost, HostCuePanel, SponsorCuePanel, HostScriptPanel, RayJourneyAvatarSpec

### Wave 5 — Admin + Analytics + Bots
Files: All admin pages, all bot files, SponsorROIAnalytics, ContestAnalyticsBot

### Wave 6 — Game Engine + Visual Polish
Files: MysteryBoxReveal, VoteNowPanel, WinnerRevealPanel, motion tuning, StageSponsorOverlay

### Wave 7 — Season System + Archive
Files: Season pages, archive pages, winner hall, replay overlay

---

## MASTER MONETIZATION MATRIX (Contest Surfaces)

| Surface | Ads | Sponsors | Prizes | Audio Ads | Creator Revenue |
|---|---|---|---|---|---|
| Contest Home | Yes | Yes | No | Silent | No |
| Contestant Entry Page | No | Yes | No | No | Yes |
| Leaderboard | Yes | Yes | No | No | No |
| Host Stage | No | Yes | Yes | Yes | No |
| Fan Voting | No | Sponsor Overlay | No | No | No |
| Winner Reveal | No | Title Sponsor Only | Yes | No | Yes |
| Season Archive | Yes | Yes | No | Silent | No |

---

## MASTER VISUAL GOVERNANCE MATRIX

| Page | Motion Level | Theme | Sponsor Density | Mobile Fallback |
|---|---|---|---|---|
| Contest Home | High | Neon/Dark | Medium | Static banner |
| Qualification | Medium | Neon/Dark | Low | Simplified progress |
| Leaderboard | Medium | Neon/Dark | Medium | Scrollable list |
| Host Stage | Maximum | Stage/Dark | High | Audio-only mode |
| Admin | Low | Dark/Minimal | None | Full mobile |
| Rules | None | Dark/Minimal | None | Full mobile |

---

## SPONSOR PACKAGE TIERS

### Local Sponsors (10 required)
| Tier | Price | Benefits |
|---|---|---|
| Local Bronze | $50 | Name on profile |
| Local Silver | $100 | Name + logo on profile |
| Local Gold | $250 | Logo + stage mention |

### Major Sponsors (10 required)
| Tier | Price | Benefits |
|---|---|---|
| Major Bronze | $1,000 | Logo + profile placement |
| Major Silver | $5,000 | Logo + stage overlay + analytics |
| Major Gold | $10,000 | Logo + stage overlay + priority mention + analytics |
| Title Sponsor | $25,000+ | Full naming rights, all surfaces, exclusive overlays |

---

## BOT GOVERNANCE MATRIX

| Bot | Role | Inputs | Outputs | Failure Mode | Human Override |
|---|---|---|---|---|---|
| ContestQualificationBot | Guide artists through qual | Artist profile, sponsor count | Next step prompt | Fallback to FAQ | Admin can override status |
| SponsorVerificationBot | Verify sponsor payments | Payment record, sponsor profile | Verified/Rejected status | Flag for admin | Admin approval queue |
| SponsorMatchBot | Suggest sponsors to artists | Artist genre, location, following | Ranked sponsor list | Generic suggestions | Artist can dismiss |
| HostScriptBot | Generate Ray Journey cues | Contestant name, sponsor names | Script string | Template fallback | Host can edit live |
| PrizeFulfillmentBot | Track prize delivery | Winner record, prize inventory | Fulfillment status | Admin alert | Manual fulfillment |
| ContestAnalyticsBot | Contest engagement tracking | Vote events, sponsor events | Dashboard data | Empty state | Manual refresh |
| RuleEnforcementBot | Fraud detection | Entry data, payment data | Block/Allow signal | Flag for review | Admin appeals queue |

---

## RAY JOURNEY HOST — CHARACTER SPECIFICATION

- **Name:** Ray Journey
- **Type:** White male, 30s, charismatic, energetic show host
- **Style:** Futuristic game-show host meets music industry insider
- **Voice:** Upbeat, clear, slightly dramatic
- **Visual Style:** Matches TMI neon/retro dark aesthetic
- **Motion Set:** Walk-on animation, speech animation, reaction animations
- **Script Pack Types:**
  - Contestant Intro Scripts
  - Sponsor Shoutout Scripts
  - Prize Reveal Scripts
  - Round Transition Scripts
  - Winner Announcement Scripts
  - Crowd Hype Scripts
  - Co-Host Handoff Scripts

---

## CONTEST PHASES

| Phase | Name | What Happens |
|---|---|---|
| Phase 1 | Sponsor Qualification | Artist secures 20 sponsors (10 local + 10 major) |
| Phase 2 | Regional Rounds | Platform regional voting |
| Phase 3 | Semi-Finals | Top contestants per category advance |
| Phase 4 | Grand Finals | Live platform event, hosted by Ray Journey |

---

## SEASON SYSTEM

- Season runs **yearly**
- Registration window: 60 days
- Sponsor collection phase: 30 days
- Regional rounds: 30 days
- Semi-finals: 14 days
- Finals: 1 event
- Archive: Permanent

---

*End of Master Manifest — TMI Grand Platform Contest System*
*BerntoutGlobal XXL | Generated for Phase 20 Claude File Package*
