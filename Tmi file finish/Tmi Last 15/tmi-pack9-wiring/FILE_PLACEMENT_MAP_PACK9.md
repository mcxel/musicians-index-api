# FILE_PLACEMENT_MAP_PACK9.md
## Exactly Where Every Pack 9 System Lives in the Repo

---

## PLACEMENT RULES (Non-Negotiable)

| Layer | Folder | Purpose |
|---|---|---|
| Specs/laws | `tmi-platform/docs/` | Design-only, no runtime code |
| Shared types | `tmi-platform/packages/contracts/src/` | TypeScript interfaces |
| Runtime engines | `tmi-platform/packages/platform-kernel/src/` | Orchestrators, registries |
| Web UI | `tmi-platform/apps/web/src/` | Next.js pages + components |
| API backend | `tmi-platform/apps/api/src/` | NestJS modules + services |
| Bot configs | `tmi-platform/bots/` | JSON bot definitions |
| Tests | `tmi-platform/tests/` | E2E, smoke, proof |
| Scripts | `tmi-platform/scripts/` | Build, proof, seed, rollback |

---

## PACK 9 FILE PLACEMENT — COMPLETE MAP

---

### ECONOMY SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `ECONOMY_ENGINE.md` | `docs/economy/` | Spec | Now |
| `economy.ts` | `packages/contracts/src/economy.ts` | Types | Now |
| `economy.module.ts` | `apps/api/src/modules/economy/` | API module | After build |
| `points.service.ts` | `apps/api/src/services/points.service.ts` | API service | After build |
| `payout.service.ts` | `apps/api/src/services/payout.service.ts` | API service | After build |
| `subscription.service.ts` | `apps/api/src/services/subscription.service.ts` | API service | After build |
| `billing.controller.ts` | `apps/api/src/controllers/billing.controller.ts` | API route | After build |
| `EarningsDashboard.tsx` | `apps/web/src/components/tmi/artist/EarningsDashboard.tsx` | UI | After API |
| `PointsBalance.tsx` | `apps/web/src/components/tmi/shared/PointsBalance.tsx` | UI widget | After API |
| `TierProgressBar.tsx` | `apps/web/src/components/tmi/shared/TierProgressBar.tsx` | UI widget | After build |
| `economy-bot.json` | `bots/economy-bot.json` | Bot | After API |

---

### SOCIAL & DISCOVERY SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `SOCIAL_DISCOVERY_ENGINE.md` | `docs/social/` | Spec | Now |
| `social.ts` | `packages/contracts/src/social.ts` | Types | Now |
| `follow.service.ts` | `apps/api/src/services/follow.service.ts` | API service | After build |
| `discovery.service.ts` | `apps/api/src/services/discovery.service.ts` | API service | After build |
| `search.service.ts` | `apps/api/src/services/search.service.ts` | API service | After build |
| `fanclub.service.ts` | `apps/api/src/services/fanclub.service.ts` | API service | Later |
| `watchparty.service.ts` | `apps/api/src/services/watchparty.service.ts` | API service | Later |
| `FollowButton.tsx` | `apps/web/src/components/tmi/shared/FollowButton.tsx` | UI | After follow API |
| `DiscoveryFeed.tsx` | `apps/web/src/components/tmi/homepage/DiscoveryFeed.tsx` | UI | After discovery API |
| `SearchBar.tsx` | `apps/web/src/components/tmi/nav/SearchBar.tsx` | UI | After search API |
| `FanClubCard.tsx` | `apps/web/src/components/tmi/social/FanClubCard.tsx` | UI | Later |
| `search-bot.json` | `bots/search-bot.json` | Bot | After search |

---

### NOTIFICATION SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `NOTIFICATION_SYSTEM.md` | `docs/notifications/` | Spec | Now |
| `notifications.ts` | `packages/contracts/src/notifications.ts` | Types | Now |
| `notification.service.ts` | `apps/api/src/services/notification.service.ts` | API service | After build |
| `notification.module.ts` | `apps/api/src/modules/notification/` | API module | After build |
| `NotificationBell.tsx` | `apps/web/src/components/tmi/shared/NotificationBell.tsx` | UI | After API |
| `NotificationFeed.tsx` | `apps/web/src/components/tmi/shared/NotificationFeed.tsx` | UI | After API |
| `JuliusNotification.tsx` | `apps/web/src/components/tmi/julius/JuliusNotification.tsx` | UI | After Julius wired |
| `notification-bot.json` | `bots/notification-bot.json` | Bot | After notifications |

---

### MODERATION SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `MODERATION_SYSTEM.md` | `docs/moderation/` | Spec | Now |
| `moderation.ts` | `packages/contracts/src/moderation.ts` | Types | Now |
| `moderation.service.ts` | `apps/api/src/services/moderation.service.ts` | API service | After build |
| `report.controller.ts` | `apps/api/src/controllers/report.controller.ts` | API route | After build |
| `fraud.service.ts` | `apps/api/src/services/fraud.service.ts` | API service | After build |
| `ChatModerationLayer.tsx` | `apps/web/src/components/tmi/rooms/ChatModerationLayer.tsx` | UI | After rooms |
| `ReportButton.tsx` | `apps/web/src/components/tmi/shared/ReportButton.tsx` | UI | After API |
| `ModerationQueue.tsx` | `apps/web/src/components/tmi/admin/ModerationQueue.tsx` | Admin UI | Later |
| `moderation-bot.json` | `bots/moderation-bot.json` | Bot | After moderation |
| `fraud-bot.json` | `bots/fraud-bot.json` | Bot | After fraud service |

---

### ARTIST TOOLS SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `ARTIST_TOOLS.md` | `docs/artist-tools/` | Spec | Now |
| `artist-tools.ts` | `packages/contracts/src/artist-tools.ts` | Types | Now |
| `clip.service.ts` | `apps/api/src/services/clip.service.ts` | API service | After live events |
| `schedule.service.ts` | `apps/api/src/services/schedule.service.ts` | API service | After build |
| `season.service.ts` | `apps/api/src/services/season.service.ts` | API service | After build |
| `ArtistDashboard.tsx` | `apps/web/src/components/tmi/artist/ArtistDashboard.tsx` | UI | After build |
| `ClipCenter.tsx` | `apps/web/src/components/tmi/artist/ClipCenter.tsx` | UI | After clip service |
| `ScheduleBuilder.tsx` | `apps/web/src/components/tmi/artist/ScheduleBuilder.tsx` | UI | After schedule |
| `AnalyticsHub.tsx` | `apps/web/src/components/tmi/artist/AnalyticsHub.tsx` | UI | After analytics API |
| `ContentCalendar.tsx` | `apps/web/src/components/tmi/artist/ContentCalendar.tsx` | UI | After schedule |
| `season-registry.ts` | `packages/platform-kernel/src/season-registry.ts` | Registry | After season service |
| `clip-bot.json` | `bots/clip-bot.json` | Bot | After clip service |
| `season-bot.json` | `bots/season-bot.json` | Bot | After season |

---

### ONBOARDING SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `ONBOARDING_FLOW.md` | `docs/onboarding/` | Spec | Now |
| `onboarding.ts` | `packages/contracts/src/onboarding.ts` | Types | Now |
| `onboarding.service.ts` | `apps/api/src/services/onboarding.service.ts` | API service | After auth |
| `onboarding.registry.ts` | `packages/platform-kernel/src/onboarding-registry.ts` | Registry | After service |
| `ArtistOnboarding.tsx` | `apps/web/src/app/onboarding/artist/page.tsx` | Web page | After auth |
| `FanOnboarding.tsx` | `apps/web/src/app/onboarding/fan/page.tsx` | Web page | After auth |
| `OnboardingStep.tsx` | `apps/web/src/components/tmi/onboarding/OnboardingStep.tsx` | UI | After onboarding |
| `GenreSelector.tsx` | `apps/web/src/components/tmi/onboarding/GenreSelector.tsx` | UI | After onboarding |
| `onboarding-bot.json` | `bots/onboarding-bot.json` | Bot | After onboarding |

---

### SPONSOR SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `SPONSOR_PORTAL.md` | `docs/sponsor/` | Spec | Now |
| `sponsor.ts` | `packages/contracts/src/sponsor.ts` | Types | Now |
| `sponsor.service.ts` | `apps/api/src/services/sponsor.service.ts` | API service | Later |
| `sponsor-placement.ts` | `packages/platform-kernel/src/sponsor-placement.ts` | Engine | Later |
| `sponsor-slot-registry.ts` | `packages/platform-kernel/src/sponsor-slot-registry.ts` | Registry | Later |
| `SponsorSlot.tsx` | `apps/web/src/components/tmi/shared/SponsorSlot.tsx` | UI | Later |
| `SponsorPortal.tsx` | `apps/web/src/components/tmi/admin/SponsorPortal.tsx` | Admin UI | Later |
| `sponsor-bot.json` | `bots/sponsor-bot.json` | Bot | Later |

---

### PLATFORM INTEGRITY SYSTEM

| File | Repo Path | Type | Phase |
|---|---|---|---|
| `PLATFORM_INTEGRITY.md` | `docs/integrity/` | Spec | Now |
| `integrity.ts` | `packages/contracts/src/integrity.ts` | Types | Now |
| `emergency-broadcast.service.ts` | `apps/api/src/services/emergency-broadcast.service.ts` | API | After notifications |
| `EmergencyBanner.tsx` | `apps/web/src/components/tmi/shared/EmergencyBanner.tsx` | UI | After notifications |
| `WaitlistEngine.tsx` | `apps/web/src/components/tmi/rooms/WaitlistEngine.tsx` | UI | After rooms |
| `waitlist.service.ts` | `apps/api/src/services/waitlist.service.ts` | API | After rooms |
| `LawBubble.tsx` | `apps/web/src/components/tmi/legal/LawBubble.tsx` | UI | Later |
| `integrity-bot.json` | `bots/integrity-bot.json` | Bot | After fraud |

---

*File Placement Map Pack 9 v1.0 — BerntoutGlobal XXL*
