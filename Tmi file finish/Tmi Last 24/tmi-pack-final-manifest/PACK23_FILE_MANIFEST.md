# PACK23_FILE_MANIFEST.md
## Complete File Manifest — All Packs, All Destinations
### BerntoutGlobal XXL / The Musician's Index
**Generated:** 2026-03-24 06:05 UTC

---

## SUMMARY

| Category | Count |
|---|---|
| JSON | 2 |
| MD | 120 |
| TSX | 177 |
| **TOTAL** | **299** |

---

## HOW TO USE

1. Extract all three packs from Downloads
2. For each file below, copy from the source column to the repo destination column
3. Files marked **⚠️ CHECK** may already exist — compare before overwriting
4. Files **NOT marked** are new — safe to copy directly
5. After moving all files, delete the zip files from Downloads

---

## DO NOT OVERWRITE (Working Routes)

```
apps/web/src/app/page.tsx              ← Homepage 1 (Crown) — already wired
apps/web/src/app/(auth)/register/      ← Registration — working
apps/web/src/app/(auth)/login/         ← Login — working
apps/web/src/app/onboarding/           ← Onboarding — working
apps/web/src/app/dashboard/            ← Dashboard router — working
apps/web/src/app/streamwin/            ← Stream & Win — wired in Pack 16 Slice 1
apps/web/src/app/layout.tsx            ← Provider chain — do not touch
apps/web/src/middleware.ts             ← Auth middleware — do not touch
```

---

## COMPLETE FILE LIST

| Filename | Repo Destination | Size | Note |
|---|---|---|---|
| `README.md` | `tmi-platform/docs/system/README.md` | 15,180B |  |
| `PROOF_MATRIX_AND_LAUNCH.md` | `tmi-platform/docs/system/PROOF_MATRIX_AND_LAUNCH.md` | 7,663B |  |
| `MASTER_BUILD_MATRIX.md` | `tmi-platform/docs/system/MASTER_BUILD_MATRIX.md` | 12,795B |  |
| `MASTER_INDEXES.md` | `tmi-platform/docs/system/MASTER_INDEXES.md` | 12,618B |  |
| `COMPONENT_SHELLS.tsx` | `tmi-platform/docs/system/COMPONENT_SHELLS.tsx` | 19,422B |  |
| `WORLD_AND_LIFECYCLE_SYSTEMS.md` | `tmi-platform/docs/system/WORLD_AND_LIFECYCLE_SYSTEMS.md` | 7,128B |  |
| `MONITORING_FLAGS_ANALYTICS_LOAD.md` | `tmi-platform/docs/system/MONITORING_FLAGS_ANALYTICS_LOAD.md` | 7,531B |  |
| `DEVICE_AND_DISTRIBUTION_SYSTEMS.md` | `tmi-platform/docs/system/DEVICE_AND_DISTRIBUTION_SYSTEMS.md` | 6,211B |  |
| `MISSING_BOT_MANIFESTS.json` | `tmi-platform/docs/system/bots/MISSING_BOT_MANIFESTS.json` | 10,255B |  |
| `ASSET_BILLING_KNOWLEDGE.md` | `tmi-platform/docs/system/ASSET_BILLING_KNOWLEDGE.md` | 6,012B |  |
| `README.md` | `tmi-platform/docs/system/README.md` | 12,329B |  |
| `HighlightRail.tsx` | `tmi-platform/apps/web/src/components/results/HighlightRail.tsx` | 991B |  |
| `MomentCard.tsx` | `tmi-platform/apps/web/src/components/results/MomentCard.tsx` | 877B |  |
| `RecapTimelinePanel.tsx` | `tmi-platform/apps/web/src/components/results/RecapTimelinePanel.tsx` | 578B |  |
| `ResultsTablePanel.tsx` | `tmi-platform/apps/web/src/components/results/ResultsTablePanel.tsx` | 594B |  |
| `WinnerCard.tsx` | `tmi-platform/apps/web/src/components/results/WinnerCard.tsx` | 842B |  |
| `AnnouncementCard.tsx` | `tmi-platform/apps/web/src/components/communication/AnnouncementCard.tsx` | 966B |  |
| `BroadcastPanel.tsx` | `tmi-platform/apps/web/src/components/communication/BroadcastPanel.tsx` | 535B |  |
| `InviteCard.tsx` | `tmi-platform/apps/web/src/components/communication/InviteCard.tsx` | 1,035B |  |
| `RequestQueuePanel.tsx` | `tmi-platform/apps/web/src/components/communication/RequestQueuePanel.tsx` | 561B |  |
| `EnvironmentBanner.tsx` | `tmi-platform/apps/web/src/components/operator/EnvironmentBanner.tsx` | 714B |  |
| `GlobalCommandCenterShell.tsx` | `tmi-platform/apps/web/src/components/operator/GlobalCommandCenterShell.tsx` | 1,880B |  |
| `IncidentTimelinePanel.tsx` | `tmi-platform/apps/web/src/components/operator/IncidentTimelinePanel.tsx` | 854B |  |
| `KillSwitchPanel.tsx` | `tmi-platform/apps/web/src/components/operator/KillSwitchPanel.tsx` | 1,443B |  |
| `LoadTestStatusPanel.tsx` | `tmi-platform/apps/web/src/components/operator/LoadTestStatusPanel.tsx` | 629B |  |
| `RecoveryActionsPanel.tsx` | `tmi-platform/apps/web/src/components/operator/RecoveryActionsPanel.tsx` | 954B |  |
| `RuntimeContractStatusPanel.tsx` | `tmi-platform/apps/web/src/components/operator/RuntimeContractStatusPanel.tsx` | 902B |  |
| `SystemStatusCard.tsx` | `tmi-platform/apps/web/src/components/operator/SystemStatusCard.tsx` | 939B |  |
| `WatchdogGridPanel.tsx` | `tmi-platform/apps/web/src/components/operator/WatchdogGridPanel.tsx` | 936B |  |
| `ArenaRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/ArenaRoomShell.tsx` | 1,373B |  |
| `BackstageRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/BackstageRoomShell.tsx` | 1,313B |  |
| `BattleRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/BattleRoomShell.tsx` | 1,757B |  |
| `CypherRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/CypherRoomShell.tsx` | 1,332B |  |
| `GreenRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/GreenRoomShell.tsx` | 673B |  |
| `MiniCypherRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/MiniCypherRoomShell.tsx` | 1,131B |  |
| `ProducerRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/ProducerRoomShell.tsx` | 1,196B |  |
| `SoundcheckRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/SoundcheckRoomShell.tsx` | 871B |  |
| `WatchRoomShell.tsx` | `tmi-platform/apps/web/src/components/room/WatchRoomShell.tsx` | 844B |  |
| `CityMapPanel.tsx` | `tmi-platform/apps/web/src/components/world/CityMapPanel.tsx` | 632B |  |
| `PopulationMeter.tsx` | `tmi-platform/apps/web/src/components/world/PopulationMeter.tsx` | 1,013B |  |
| `RegionalScenePanel.tsx` | `tmi-platform/apps/web/src/components/world/RegionalScenePanel.tsx` | 786B |  |
| `SeatMapPanel.tsx` | `tmi-platform/apps/web/src/components/world/SeatMapPanel.tsx` | 695B |  |
| `VenueOccupancyPanel.tsx` | `tmi-platform/apps/web/src/components/world/VenueOccupancyPanel.tsx` | 703B |  |
| `WorldDiscoveryRail.tsx` | `tmi-platform/apps/web/src/components/world/WorldDiscoveryRail.tsx` | 644B |  |
| `BeatCastPanel.tsx` | `tmi-platform/apps/web/src/components/producer/BeatCastPanel.tsx` | 618B |  |
| `BeatPreviewPanel.tsx` | `tmi-platform/apps/web/src/components/producer/BeatPreviewPanel.tsx` | 1,021B |  |
| `ProducerBeatLocker.tsx` | `tmi-platform/apps/web/src/components/producer/ProducerBeatLocker.tsx` | 958B |  |
| `ProducerCollabPanel.tsx` | `tmi-platform/apps/web/src/components/producer/ProducerCollabPanel.tsx` | 623B |  |
| `ProducerInvitePanel.tsx` | `tmi-platform/apps/web/src/components/producer/ProducerInvitePanel.tsx` | 652B |  |
| `VenueHeroPanel.tsx` | `tmi-platform/apps/web/src/components/venue/VenueHeroPanel.tsx` | 1,478B |  |
| `VenueHistoryPanel.tsx` | `tmi-platform/apps/web/src/components/venue/VenueHistoryPanel.tsx` | 523B |  |
| `VenueRoomsPanel.tsx` | `tmi-platform/apps/web/src/components/venue/VenueRoomsPanel.tsx` | 499B |  |
| `VenueSchedulePanel.tsx` | `tmi-platform/apps/web/src/components/venue/VenueSchedulePanel.tsx` | 521B |  |
| `VenueSponsorBoard.tsx` | `tmi-platform/apps/web/src/components/venue/VenueSponsorBoard.tsx` | 585B |  |
| `VenueTemplatePreviewPanel.tsx` | `tmi-platform/apps/web/src/components/venue/VenueTemplatePreviewPanel.tsx` | 620B |  |
| `ArtistArticleRail.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistArticleRail.tsx` | 750B |  |
| `ArtistBattleHistoryPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistBattleHistoryPanel.tsx` | 830B |  |
| `ArtistBookingPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistBookingPanel.tsx` | 760B |  |
| `ArtistCypherHistoryPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistCypherHistoryPanel.tsx` | 541B |  |
| `ArtistHeroPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistHeroPanel.tsx` | 2,093B |  |
| `ArtistMediaLockerPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistMediaLockerPanel.tsx` | 995B |  |
| `ArtistSponsorPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistSponsorPanel.tsx` | 698B |  |
| `ArtistStatsPanel.tsx` | `tmi-platform/apps/web/src/components/profile/ArtistStatsPanel.tsx` | 935B |  |
| `DiamondTierBadge.tsx` | `tmi-platform/apps/web/src/components/profile/DiamondTierBadge.tsx` | 1,098B |  |
| `ProfileCompletionCard.tsx` | `tmi-platform/apps/web/src/components/profile/ProfileCompletionCard.tsx` | 850B |  |
| `ReputationMeter.tsx` | `tmi-platform/apps/web/src/components/profile/ReputationMeter.tsx` | 779B |  |
| `SupporterRail.tsx` | `tmi-platform/apps/web/src/components/profile/SupporterRail.tsx` | 541B |  |
| `VerificationBadge.tsx` | `tmi-platform/apps/web/src/components/profile/VerificationBadge.tsx` | 531B |  |
| `CompareModePanel.tsx` | `tmi-platform/apps/web/src/components/preview/CompareModePanel.tsx` | 1,005B |  |
| `EventAnnouncementCard.tsx` | `tmi-platform/apps/web/src/components/preview/EventAnnouncementCard.tsx` | 879B |  |
| `PreviewDockSlot.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewDockSlot.tsx` | 605B |  |
| `PreviewFallbackCard.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewFallbackCard.tsx` | 864B |  |
| `PreviewMetadataCard.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewMetadataCard.tsx` | 936B |  |
| `PreviewModeBadge.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewModeBadge.tsx` | 1,025B |  |
| `PreviewSourcePicker.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewSourcePicker.tsx` | 970B |  |
| `PreviewTransitionFrame.tsx` | `tmi-platform/apps/web/src/components/preview/PreviewTransitionFrame.tsx` | 635B |  |
| `PrizeAnnouncementCard.tsx` | `tmi-platform/apps/web/src/components/preview/PrizeAnnouncementCard.tsx` | 797B |  |
| `SharedPreviewStagePanel.tsx` | `tmi-platform/apps/web/src/components/preview/SharedPreviewStagePanel.tsx` | 1,979B |  |
| `SponsorPreviewCard.tsx` | `tmi-platform/apps/web/src/components/preview/SponsorPreviewCard.tsx` | 1,138B |  |
| `ArtistOpportunityPanel.tsx` | `tmi-platform/apps/web/src/components/lobby/ArtistOpportunityPanel.tsx` | 810B |  |
| `CountdownCard.tsx` | `tmi-platform/apps/web/src/components/lobby/CountdownCard.tsx` | 1,732B |  |
| `EventCalendarPanel.tsx` | `tmi-platform/apps/web/src/components/lobby/EventCalendarPanel.tsx` | 758B |  |
| `LiveRoomsRadarPanel.tsx` | `tmi-platform/apps/web/src/components/lobby/LiveRoomsRadarPanel.tsx` | 977B |  |
| `LobbyWallPanel.tsx` | `tmi-platform/apps/web/src/components/lobby/LobbyWallPanel.tsx` | 1,399B |  |
| `RandomJoinGatewayCard.tsx` | `tmi-platform/apps/web/src/components/lobby/RandomJoinGatewayCard.tsx` | 992B |  |
| `SponsorSpotlightPanel.tsx` | `tmi-platform/apps/web/src/components/lobby/SponsorSpotlightPanel.tsx` | 935B |  |
| `WorldPremierePanel.tsx` | `tmi-platform/apps/web/src/components/lobby/WorldPremierePanel.tsx` | 895B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/page.tsx` | 908B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/media/page.tsx` | 894B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/articles/page.tsx` | 902B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/timeline/page.tsx` | 911B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/bookings/page.tsx` | 1,004B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/battles/page.tsx` | 908B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/cyphers/page.tsx` | 900B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/artists/[slug]/sponsors/page.tsx` | 893B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/scenes/page.tsx` | 816B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/premiere-room/page.tsx` | 1,011B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/help/page.tsx` | 808B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/status/page.tsx` | 855B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/premieres/page.tsx` | 854B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/calendar/page.tsx` | 881B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/hall-of-fame/page.tsx` | 859B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/results/page.tsx` | 851B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/collab-room/page.tsx` | 958B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/for-venues/page.tsx` | 823B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/awards/page.tsx` | 820B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/cypher/page.tsx` | 988B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/cypher/mini/page.tsx` | 982B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/producers/[slug]/page.tsx` | 887B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/producers/[slug]/beats/page.tsx` | 885B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/producers/[slug]/collabs/page.tsx` | 901B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/producers/[slug]/rooms/page.tsx` | 892B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/workshop-room/page.tsx` | 984B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/announcements/page.tsx` | 957B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/how-it-works/page.tsx` | 834B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/critique-room/page.tsx` | 968B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/command-center/page.tsx` | 1,055B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/health/page.tsx` | 997B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/bots/page.tsx` | 982B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/crown/page.tsx` | 996B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/feature-flags/page.tsx` | 1,035B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/incidents/page.tsx` | 1,003B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/runtime-contracts/page.tsx` | 1,045B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/recovery/page.tsx` | 990B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/logs/page.tsx` | 988B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/emergency/page.tsx` | 1,024B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/admin/watchdogs/page.tsx` | 1,021B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/interview-room/page.tsx` | 982B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/soundcheck/page.tsx` | 966B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/awards-room/page.tsx` | 982B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/press/page.tsx` | 800B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/backstage/page.tsx` | 991B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/genres/page.tsx` | 817B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/rankings/page.tsx` | 845B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/features/page.tsx` | 822B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/community-guidelines/page.tsx` | 869B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/privacy/page.tsx` | 825B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/for-artists/page.tsx` | 829B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/radio-room/page.tsx` | 973B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/for-sponsors/page.tsx` | 835B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/highlights/page.tsx` | 870B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/collabs/page.tsx` | 923B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/broadcasts/page.tsx` | 934B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/safety/page.tsx` | 826B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/venues/[slug]/page.tsx` | 870B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/venues/[slug]/schedule/page.tsx` | 888B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/venues/[slug]/archive/page.tsx` | 877B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/venues/[slug]/rooms/page.tsx` | 876B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/venues/[slug]/sponsors/page.tsx` | 886B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/support/page.tsx` | 822B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/watch-room/page.tsx` | 986B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/partners/page.tsx` | 821B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/archive/page.tsx` | 843B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/content-policy/page.tsx` | 839B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/billing/page.tsx` | 929B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/discover/page.tsx` | 884B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/writing-room/page.tsx` | 965B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/seasons/page.tsx` | 823B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/listening-party/page.tsx` | 995B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/subscriptions/page.tsx` | 961B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/leaderboards/page.tsx` | 881B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/for-producers/page.tsx` | 841B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/terms/page.tsx` | 794B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/appeals/page.tsx` | 825B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/arena/page.tsx` | 986B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/invites/page.tsx` | 936B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/report/page.tsx` | 820B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/requests/page.tsx` | 944B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/messages/page.tsx` | 937B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/downloads/page.tsx` | 843B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/live-world/page.tsx` | 891B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/events/[slug]/page.tsx` | 862B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/events/[slug]/results/page.tsx` | 892B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/events/[slug]/recap/page.tsx` | 883B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/events/[slug]/bracket/page.tsx` | 898B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/events/[slug]/watch/page.tsx` | 885B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/trending/page.tsx` | 856B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/sponsor-room/page.tsx` | 994B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/battle/page.tsx` | 1,002B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/podcast-room/page.tsx` | 960B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/world-map/page.tsx` | 884B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/cities/page.tsx` | 838B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/lobby/page.tsx` | 896B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/lobby/wall/page.tsx` | 895B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/lobby/random/page.tsx` | 895B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/producer-room/page.tsx` | 1,016B |  |
| `page.tsx` | `tmi-platform/apps/web/src/app/green-room/page.tsx` | 957B |  |
| `ACCOUNT_AND_DEVICE_SYNC_SYSTEM.md` | `tmi-platform/docs/system/ACCOUNT_AND_DEVICE_SYNC_SYSTEM.md` | 784B |  |
| `ALERT_PRIORITY_SYSTEM.md` | `tmi-platform/docs/system/ALERT_PRIORITY_SYSTEM.md` | 748B |  |
| `ANALYTICS_EVENT_TAXONOMY.md` | `tmi-platform/docs/system/ANALYTICS_EVENT_TAXONOMY.md` | 1,082B |  |
| `ANIMATION_AND_MOTION_SYSTEM.md` | `tmi-platform/docs/system/ANIMATION_AND_MOTION_SYSTEM.md` | 745B |  |
| `APP_DISTRIBUTION_SYSTEM.md` | `tmi-platform/docs/system/APP_DISTRIBUTION_SYSTEM.md` | 756B |  |
| `APP_STORE_COMPLIANCE_SYSTEM.md` | `tmi-platform/docs/system/APP_STORE_COMPLIANCE_SYSTEM.md` | 772B |  |
| `APP_STORE_STRATEGY.md` | `tmi-platform/docs/system/APP_STORE_STRATEGY.md` | 736B |  |
| `ASSET_PIPELINE_SYSTEM.md` | `tmi-platform/docs/system/ASSET_PIPELINE_SYSTEM.md` | 881B |  |
| `BACKSTAGE_SYSTEM.md` | `tmi-platform/docs/system/BACKSTAGE_SYSTEM.md` | 728B |  |
| `BACKUP_AND_RESTORE_RUNBOOK.md` | `tmi-platform/docs/system/BACKUP_AND_RESTORE_RUNBOOK.md` | 768B |  |
| `BILLING_AND_ENTITLEMENT_SYSTEM.md` | `tmi-platform/docs/system/BILLING_AND_ENTITLEMENT_SYSTEM.md` | 934B |  |
| `CITY_SCENE_SYSTEM.md` | `tmi-platform/docs/system/CITY_SCENE_SYSTEM.md` | 732B |  |
| `CLIP_REVIEW_AND_PUBLISH_SYSTEM.md` | `tmi-platform/docs/system/CLIP_REVIEW_AND_PUBLISH_SYSTEM.md` | 784B |  |
| `DEGRADED_MODE_SYSTEM.md` | `tmi-platform/docs/system/DEGRADED_MODE_SYSTEM.md` | 744B |  |
| `DEPLOYMENT_RUNBOOK.md` | `tmi-platform/docs/system/DEPLOYMENT_RUNBOOK.md` | 736B |  |
| `DEVICE_PLATFORM_SYSTEM.md` | `tmi-platform/docs/system/DEVICE_PLATFORM_SYSTEM.md` | 917B |  |
| `DEVICE_RENDER_MODES.md` | `tmi-platform/docs/system/DEVICE_RENDER_MODES.md` | 740B |  |
| `FEATURE_FLAG_SYSTEM.md` | `tmi-platform/docs/system/FEATURE_FLAG_SYSTEM.md` | 979B |  |
| `GREEN_ROOM_SYSTEM.md` | `tmi-platform/docs/system/GREEN_ROOM_SYSTEM.md` | 732B |  |
| `HUD_LAYER_PRIORITY_SYSTEM.md` | `tmi-platform/docs/system/HUD_LAYER_PRIORITY_SYSTEM.md` | 764B |  |
| `INCIDENT_RESPONSE_RUNBOOK.md` | `tmi-platform/docs/system/INCIDENT_RESPONSE_RUNBOOK.md` | 764B |  |
| `INVOICE_AND_TAX_SYSTEM.md` | `tmi-platform/docs/system/INVOICE_AND_TAX_SYSTEM.md` | 752B |  |
| `KILL_SWITCH_SYSTEM.md` | `tmi-platform/docs/system/KILL_SWITCH_SYSTEM.md` | 736B |  |
| `KNOWLEDGE_BASE_SYSTEM.md` | `tmi-platform/docs/system/KNOWLEDGE_BASE_SYSTEM.md` | 1,176B |  |
| `LAUNCH_DAY_COMMAND_PACK.md` | `tmi-platform/docs/system/LAUNCH_DAY_COMMAND_PACK.md` | 1,022B |  |
| `LINEUP_AND_CALLTIME_SYSTEM.md` | `tmi-platform/docs/system/LINEUP_AND_CALLTIME_SYSTEM.md` | 768B |  |
| `LIVE_EVENT_PRODUCTION_SYSTEM.md` | `tmi-platform/docs/system/LIVE_EVENT_PRODUCTION_SYSTEM.md` | 776B |  |
| `LIVE_SURFACE_MOTION_RULES.md` | `tmi-platform/docs/system/LIVE_SURFACE_MOTION_RULES.md` | 764B |  |
| `LOAD_AND_STRESS_TEST_SYSTEM.md` | `tmi-platform/docs/system/LOAD_AND_STRESS_TEST_SYSTEM.md` | 772B |  |
| `MASTER_COMPONENT_INDEX.md` | `tmi-platform/docs/system/MASTER_COMPONENT_INDEX.md` | 752B |  |
| `MASTER_DEVICE_MODE_INDEX.md` | `tmi-platform/docs/system/MASTER_DEVICE_MODE_INDEX.md` | 760B |  |
| `MASTER_PROOF_INDEX.md` | `tmi-platform/docs/system/MASTER_PROOF_INDEX.md` | 736B |  |
| `MEDIA_APPROVAL_AND_TAKEDOWN_SYSTEM.md` | `tmi-platform/docs/system/MEDIA_APPROVAL_AND_TAKEDOWN_SYSTEM.md` | 800B |  |
| `MEDIA_ARCHIVE_SYSTEM.md` | `tmi-platform/docs/system/MEDIA_ARCHIVE_SYSTEM.md` | 744B |  |
| `MEDIA_FALLBACK_SYSTEM.md` | `tmi-platform/docs/system/MEDIA_FALLBACK_SYSTEM.md` | 748B |  |
| `MEDIA_SLOT_PRIORITY_SYSTEM.md` | `tmi-platform/docs/system/MEDIA_SLOT_PRIORITY_SYSTEM.md` | 768B |  |
| `MEDIA_UPLOAD_PIPELINE.md` | `tmi-platform/docs/system/MEDIA_UPLOAD_PIPELINE.md` | 748B |  |
| `MODERATOR_PLAYBOOK.md` | `tmi-platform/docs/system/MODERATOR_PLAYBOOK.md` | 736B |  |
| `MULTI_DEVICE_LOGIN_SYSTEM.md` | `tmi-platform/docs/system/MULTI_DEVICE_LOGIN_SYSTEM.md` | 764B |  |
| `NUMBER_MOVEMENT_SYSTEM.md` | `tmi-platform/docs/system/NUMBER_MOVEMENT_SYSTEM.md` | 629B |  |
| `ONBOARDING_PROOF_PACK.md` | `tmi-platform/docs/system/ONBOARDING_PROOF_PACK.md` | 748B |  |
| `OPERATOR_PLAYBOOK.md` | `tmi-platform/docs/system/OPERATOR_PLAYBOOK.md` | 732B |  |
| `OVERLAY_STACKING_SYSTEM.md` | `tmi-platform/docs/system/OVERLAY_STACKING_SYSTEM.md` | 871B |  |
| `PACK15_PLACEMENT_AND_WIRING_GUIDE.md` | `tmi-platform/docs/system/PACK15_PLACEMENT_AND_WIRING_GUIDE.md` | 13,284B |  |
| `PLATFORM_PROOF_MATRIX.md` | `tmi-platform/docs/system/PLATFORM_PROOF_MATRIX.md` | 1,184B |  |
| `POPULATION_ROLE_SYSTEM.md` | `tmi-platform/docs/system/POPULATION_ROLE_SYSTEM.md` | 677B |  |
| `POST_EVENT_RECAP_SYSTEM.md` | `tmi-platform/docs/system/POST_EVENT_RECAP_SYSTEM.md` | 756B |  |
| `POST_ROOM_FOLLOWUP_SYSTEM.md` | `tmi-platform/docs/system/POST_ROOM_FOLLOWUP_SYSTEM.md` | 764B |  |
| `PRELIVE_READINESS_SYSTEM.md` | `tmi-platform/docs/system/PRELIVE_READINESS_SYSTEM.md` | 760B |  |
| `REFUND_AND_DISPUTE_SYSTEM.md` | `tmi-platform/docs/system/REFUND_AND_DISPUTE_SYSTEM.md` | 764B |  |
| `REMOTE_CONTROL_SYSTEM.md` | `tmi-platform/docs/system/REMOTE_CONTROL_SYSTEM.md` | 748B |  |
| `RESTORE_PURCHASE_SYSTEM.md` | `tmi-platform/docs/system/RESTORE_PURCHASE_SYSTEM.md` | 756B |  |
| `RESULTS_AND_WINNER_SYSTEM.md` | `tmi-platform/docs/system/RESULTS_AND_WINNER_SYSTEM.md` | 764B |  |
| `ROOM_PROOF_PACK.md` | `tmi-platform/docs/system/ROOM_PROOF_PACK.md` | 724B |  |
| `ROOM_SCALE_TEST_MATRIX.md` | `tmi-platform/docs/system/ROOM_SCALE_TEST_MATRIX.md` | 752B |  |
| `ROOM_TRAFFIC_SYSTEM.md` | `tmi-platform/docs/system/ROOM_TRAFFIC_SYSTEM.md` | 740B |  |
| `RUNTIME_HEALTH_THRESHOLD_SYSTEM.md` | `tmi-platform/docs/system/RUNTIME_HEALTH_THRESHOLD_SYSTEM.md` | 788B |  |
| `SAFE_MODE_SYSTEM.md` | `tmi-platform/docs/system/SAFE_MODE_SYSTEM.md` | 728B |  |
| `SEAT_AND_POSITION_SYSTEM.md` | `tmi-platform/docs/system/SEAT_AND_POSITION_SYSTEM.md` | 539B |  |
| `SECOND_SCREEN_SYSTEM.md` | `tmi-platform/docs/system/SECOND_SCREEN_SYSTEM.md` | 744B |  |
| `SLO_AND_ALERTING_SYSTEM.md` | `tmi-platform/docs/system/SLO_AND_ALERTING_SYSTEM.md` | 663B |  |
| `SOUNDCHECK_SYSTEM.md` | `tmi-platform/docs/system/SOUNDCHECK_SYSTEM.md` | 732B |  |
| `SUBSCRIPTION_SYSTEM.md` | `tmi-platform/docs/system/SUBSCRIPTION_SYSTEM.md` | 869B |  |
| `SUBSCRIPTION_TIER_SYSTEM.md` | `tmi-platform/docs/system/SUBSCRIPTION_TIER_SYSTEM.md` | 760B |  |
| `THUMBNAIL_AND_POSTER_PIPELINE.md` | `tmi-platform/docs/system/THUMBNAIL_AND_POSTER_PIPELINE.md` | 780B |  |
| `TRANSCODE_AND_STREAM_PIPELINE.md` | `tmi-platform/docs/system/TRANSCODE_AND_STREAM_PIPELINE.md` | 780B |  |
| `TRANSITION_PRIORITY_SYSTEM.md` | `tmi-platform/docs/system/TRANSITION_PRIORITY_SYSTEM.md` | 768B |  |
| `TV_WATCH_MODE_SYSTEM.md` | `tmi-platform/docs/system/TV_WATCH_MODE_SYSTEM.md` | 744B |  |
| `VENUE_DISPLAY_MODE_SYSTEM.md` | `tmi-platform/docs/system/VENUE_DISPLAY_MODE_SYSTEM.md` | 764B |  |
| `WORLD_ACTIVITY_ENGINE.md` | `tmi-platform/docs/system/WORLD_ACTIVITY_ENGINE.md` | 748B |  |
| `WORLD_CONTROL_SYSTEM.md` | `tmi-platform/docs/system/WORLD_CONTROL_SYSTEM.md` | 744B |  |
| `WORLD_MAP_SYSTEM.md` | `tmi-platform/docs/system/WORLD_MAP_SYSTEM.md` | 728B |  |
| `WORLD_PROOF_PACK.md` | `tmi-platform/docs/system/WORLD_PROOF_PACK.md` | 728B |  |
| `WORLD_SIMULATION_SYSTEM.md` | `tmi-platform/docs/system/WORLD_SIMULATION_SYSTEM.md` | 759B |  |
| `WORLD_TIME_SYSTEM.md` | `tmi-platform/docs/system/WORLD_TIME_SYSTEM.md` | 601B |  |
| `BILLING_INTEGRITY_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/BILLING_INTEGRITY_BOT_SYSTEM.md` | 1,153B |  |
| `HIGHLIGHT_CAPTURE_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/HIGHLIGHT_CAPTURE_BOT_SYSTEM.md` | 1,174B |  |
| `LOAD_SPIKE_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/LOAD_SPIKE_BOT_SYSTEM.md` | 1,056B |  |
| `MATCHMAKING_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/MATCHMAKING_BOT_SYSTEM.md` | 1,138B |  |
| `MISSING_BOT_MANIFESTS.json` | `tmi-platform/docs/system/bots/MISSING_BOT_MANIFESTS.json` | 10,255B |  |
| `RANKING_UPDATE_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/RANKING_UPDATE_BOT_SYSTEM.md` | 974B |  |
| `RESULTS_RECAP_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/RESULTS_RECAP_BOT_SYSTEM.md` | 1,178B |  |
| `SAFETY_ESCALATION_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/SAFETY_ESCALATION_BOT_SYSTEM.md` | 1,170B |  |
| `SCENE_TRANSITION_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/SCENE_TRANSITION_BOT_SYSTEM.md` | 1,372B |  |
| `STAGE_DIRECTOR_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/STAGE_DIRECTOR_BOT_SYSTEM.md` | 1,576B |  |
| `WORLD_SIMULATION_BOT_SYSTEM.md` | `tmi-platform/docs/system/bots/WORLD_SIMULATION_BOT_SYSTEM.md` | 1,018B |  |
| `README.md` | `tmi-platform/docs/system/README.md` | 5,275B |  |
| `COPILOT_HANDOFF_PROMPT.md` | `tmi-platform/docs/system/COPILOT_HANDOFF_PROMPT.md` | 4,581B |  |
| `PACK16_MICRO_AUDIT.md` | `tmi-platform/docs/system/PACK16_MICRO_AUDIT.md` | 4,169B |  |
| `ADVERTISING_SYSTEM.md` | `tmi-platform/docs/system/ADVERTISING_SYSTEM.md` | 2,022B |  |
| `AD_PLACEMENT_POLICY.md` | `tmi-platform/docs/system/AD_PLACEMENT_POLICY.md` | 1,356B |  |
| `APP_STORE_DISTRIBUTION_CHECKLIST.md` | `tmi-platform/docs/system/APP_STORE_DISTRIBUTION_CHECKLIST.md` | 3,027B |  |
| `CLOUDFLARE_AND_PROXY_COMPATIBILITY.md` | `tmi-platform/docs/system/CLOUDFLARE_AND_PROXY_COMPATIBILITY.md` | 2,481B |  |
| `COOKIE_AND_SESSION_DOMAIN_RULES.md` | `tmi-platform/docs/system/COOKIE_AND_SESSION_DOMAIN_RULES.md` | 1,562B |  |
| `CORS_AND_ORIGIN_POLICY.md` | `tmi-platform/docs/system/CORS_AND_ORIGIN_POLICY.md` | 1,667B |  |
| `DEPLOYMENT_COMPATIBILITY_SYSTEM.md` | `tmi-platform/docs/system/DEPLOYMENT_COMPATIBILITY_SYSTEM.md` | 3,181B |  |
| `DEVICE_COMPATIBILITY_MATRIX.md` | `tmi-platform/docs/system/DEVICE_COMPATIBILITY_MATRIX.md` | 2,306B |  |
| `DOMAIN_AND_DNS_SYSTEM.md` | `tmi-platform/docs/system/DOMAIN_AND_DNS_SYSTEM.md` | 1,300B |  |
| `ENV_VARIABLE_CONTRACT.md` | `tmi-platform/docs/system/ENV_VARIABLE_CONTRACT.md` | 2,502B |  |
| `FINAL_ENVIRONMENT_MATRIX.md` | `tmi-platform/docs/system/FINAL_ENVIRONMENT_MATRIX.md` | 4,577B |  |
| `HOSTINGER_DEPLOYMENT_COMPATIBILITY.md` | `tmi-platform/docs/system/HOSTINGER_DEPLOYMENT_COMPATIBILITY.md` | 1,533B |  |
| `MEDIA_AND_ASSET_DELIVERY_SPEC.md` | `tmi-platform/docs/system/MEDIA_AND_ASSET_DELIVERY_SPEC.md` | 2,051B |  |
| `MONITORING_AND_ALERT_WIRING_SPEC.md` | `tmi-platform/docs/system/MONITORING_AND_ALERT_WIRING_SPEC.md` | 1,890B |  |
| `NEXTJS_PRODUCTION_RUNTIME_SPEC.md` | `tmi-platform/docs/system/NEXTJS_PRODUCTION_RUNTIME_SPEC.md` | 2,568B |  |
| `NODE_AND_BUILD_CONTRACT.md` | `tmi-platform/docs/system/NODE_AND_BUILD_CONTRACT.md` | 2,132B |  |
| `RENDER_API_DEPLOYMENT_SPEC.md` | `tmi-platform/docs/system/RENDER_API_DEPLOYMENT_SPEC.md` | 2,139B |  |
| `ROLLBACK_AND_RESTORE_RUNBOOK.md` | `tmi-platform/docs/system/ROLLBACK_AND_RESTORE_RUNBOOK.md` | 1,995B |  |
| `SPONSORSHIP_SYSTEM.md` | `tmi-platform/docs/system/SPONSORSHIP_SYSTEM.md` | 2,490B |  |
| `SPONSOR_PLACEMENT_POLICY.md` | `tmi-platform/docs/system/SPONSOR_PLACEMENT_POLICY.md` | 1,754B |  |
| `SSL_TLS_SYSTEM.md` | `tmi-platform/docs/system/SSL_TLS_SYSTEM.md` | 1,302B |  |
| `STAGING_TO_PRODUCTION_PROMOTION.md` | `tmi-platform/docs/system/STAGING_TO_PRODUCTION_PROMOTION.md` | 1,595B |  |
| `WEBSOCKET_AND_LIVE_TRANSPORT_SPEC.md` | `tmi-platform/docs/system/WEBSOCKET_AND_LIVE_TRANSPORT_SPEC.md` | 2,133B |  |

---

## WIRING PRIORITY (After Moving Files)

**P0 — Fix Cloudflare Build First:**
Add to `tmi-platform/apps/web/next.config.js`:
```js
transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']
```
Add to `tmi-platform/apps/web/package.json` scripts:
```json
"prebuild": "pnpm -C ../../packages/hud-runtime build && pnpm -C ../../packages/hud-theme build"
```

**P1 — First Wiring Slices:**
1. Wire `/artists/[slug]` → Diamond badge for Marcel + BJ
2. Wire `LobbyWallPanel` → `sort: 'viewers_asc'` (0 viewers = position 1)
3. Wire `CountdownCard` → animated countdown with color thresholds
4. Wire room families to providers
5. Wire `SharedPreviewStagePanel` into rooms
6. Wire `KillSwitchPanel` → feature flags
7. Wire `GlobalCommandCenterShell` → admin

**Full handoff prompt:** See `docs/system/COPILOT_HANDOFF_PROMPT.md`

---

*"This is your stage, be original." — BerntoutGlobal LLC*
