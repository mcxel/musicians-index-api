# COMPLETE REPO FILE TREE — THE MUSICIAN'S INDEX
## Every file and folder needed. Blackbox generates logic. Claude generated structure.

```
tmi-platform/
│
├── apps/
│   ├── web/                              # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/
│   │   │   │   │   ├── page.tsx                    # Home 1 — Magazine Cover
│   │   │   │   │   ├── editorial/page.tsx           # Home 2 — Magazine Dashboard
│   │   │   │   │   ├── lobby/page.tsx               # Home 3 — Live World
│   │   │   │   │   ├── advertise/page.tsx           # Home 4 — Sponsors & Ads
│   │   │   │   │   ├── magazine/page.tsx
│   │   │   │   │   ├── artists/
│   │   │   │   │   │   ├── page.tsx                # Artists directory
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       ├── page.tsx            # Artist profile
│   │   │   │   │   │       ├── articles/page.tsx
│   │   │   │   │   │       ├── events/page.tsx
│   │   │   │   │   │       ├── media/page.tsx
│   │   │   │   │   │       ├── store/page.tsx
│   │   │   │   │   │       └── analytics/page.tsx
│   │   │   │   │   ├── stations/[slug]/page.tsx     # Artist station — MUST link from articles
│   │   │   │   │   ├── venues/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── signup/page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── tickets/page.tsx
│   │   │   │   │   │       ├── lineup/page.tsx
│   │   │   │   │   │       ├── sponsors/page.tsx
│   │   │   │   │   │       └── replay/page.tsx
│   │   │   │   │   ├── articles/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx         # MUST include stationSlug link
│   │   │   │   │   ├── interviews/page.tsx
│   │   │   │   │   ├── charts/page.tsx
│   │   │   │   │   ├── playlists/page.tsx
│   │   │   │   │   ├── reviews/page.tsx
│   │   │   │   │   ├── archive/page.tsx
│   │   │   │   │   ├── issues/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── explore/page.tsx
│   │   │   │   │   ├── discover/page.tsx
│   │   │   │   │   ├── trending/page.tsx
│   │   │   │   │   ├── search/page.tsx
│   │   │   │   │   ├── calendar/page.tsx
│   │   │   │   │   ├── schedule/page.tsx
│   │   │   │   │   ├── leaderboards/page.tsx
│   │   │   │   │   ├── hall-of-fame/page.tsx
│   │   │   │   │   ├── genres/[slug]/page.tsx
│   │   │   │   │   ├── tags/[slug]/page.tsx
│   │   │   │   │   ├── stores/[slug]/page.tsx
│   │   │   │   │   ├── beats/page.tsx
│   │   │   │   │   ├── sponsors/page.tsx
│   │   │   │   │   ├── advertisers/page.tsx
│   │   │   │   │   ├── stadium/page.tsx
│   │   │   │   │   ├── vr/[sceneId]/page.tsx
│   │   │   │   │   ├── downloads/page.tsx
│   │   │   │   │   ├── install/page.tsx
│   │   │   │   │   ├── vr-setup/page.tsx
│   │   │   │   │   ├── studio/page.tsx
│   │   │   │   │   ├── groups/[slug]/page.tsx
│   │   │   │   │   ├── labels/[slug]/page.tsx
│   │   │   │   │   ├── fan-clubs/[slug]/page.tsx
│   │   │   │   │   ├── clips/[id]/page.tsx
│   │   │   │   │   ├── replays/[id]/page.tsx
│   │   │   │   │   ├── shows/page.tsx
│   │   │   │   │   └── shows/[id]/page.tsx
│   │   │   │   │
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── artist/page.tsx
│   │   │   │   │   │   ├── fan/page.tsx
│   │   │   │   │   │   ├── sponsor/page.tsx
│   │   │   │   │   │   └── venue/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   ├── reset-password/page.tsx
│   │   │   │   │   └── verify-email/[token]/page.tsx
│   │   │   │   │
│   │   │   │   ├── (onboarding)/
│   │   │   │   │   ├── onboarding/admin/page.tsx   # ✅ fixed Pack 31
│   │   │   │   │   ├── onboarding/artist/page.tsx  # ✅ fixed Pack 31
│   │   │   │   │   └── onboarding/fan/page.tsx     # ✅ fixed Pack 31
│   │   │   │   │
│   │   │   │   ├── (member)/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── artist/page.tsx
│   │   │   │   │   │   └── fan/page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── edit/page.tsx
│   │   │   │   │   ├── wallet/page.tsx
│   │   │   │   │   ├── earnings/page.tsx
│   │   │   │   │   ├── payouts/page.tsx
│   │   │   │   │   ├── orders/page.tsx
│   │   │   │   │   ├── tickets/page.tsx
│   │   │   │   │   ├── inventory/page.tsx
│   │   │   │   │   ├── shop/page.tsx
│   │   │   │   │   ├── shop/avatar/page.tsx
│   │   │   │   │   ├── rewards/page.tsx
│   │   │   │   │   ├── points/page.tsx
│   │   │   │   │   ├── achievements/page.tsx
│   │   │   │   │   ├── friends/page.tsx
│   │   │   │   │   ├── messages/page.tsx
│   │   │   │   │   ├── notifications/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   ├── avatar-lab/page.tsx
│   │   │   │   │   ├── media/page.tsx
│   │   │   │   │   ├── uploads/page.tsx
│   │   │   │   │   └── creator-hub/page.tsx
│   │   │   │   │
│   │   │   │   ├── (live)/
│   │   │   │   │   ├── live/
│   │   │   │   │   │   ├── page.tsx               # Live index
│   │   │   │   │   │   └── [roomId]/
│   │   │   │   │   │       ├── page.tsx            # Live room viewer
│   │   │   │   │   │       ├── control/page.tsx    # Host controls
│   │   │   │   │   │       ├── backstage/page.tsx
│   │   │   │   │   │       └── broadcast/page.tsx
│   │   │   │   │   ├── lobby/rooms/page.tsx
│   │   │   │   │   ├── cypher/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [battleId]/page.tsx
│   │   │   │   │   ├── games/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [gameId]/page.tsx
│   │   │   │   │   ├── dirty-dozens/page.tsx
│   │   │   │   │   ├── deal-or-feud/page.tsx
│   │   │   │   │   ├── venues/[venueId]/page.tsx  # Virtual venue
│   │   │   │   │   └── waiting-room/[id]/page.tsx
│   │   │   │   │
│   │   │   │   ├── (tickets)/
│   │   │   │   │   ├── tickets/page.tsx
│   │   │   │   │   ├── tickets/[id]/page.tsx
│   │   │   │   │   └── tickets/transfer/page.tsx
│   │   │   │   │
│   │   │   │   ├── (booking)/
│   │   │   │   │   ├── booking/page.tsx
│   │   │   │   │   ├── booking/requests/page.tsx
│   │   │   │   │   └── booking/calendar/page.tsx
│   │   │   │   │
│   │   │   │   ├── (sponsor)/
│   │   │   │   │   ├── sponsor/dashboard/page.tsx
│   │   │   │   │   ├── sponsor/campaigns/page.tsx
│   │   │   │   │   ├── sponsor/analytics/page.tsx
│   │   │   │   │   ├── sponsor/deals/page.tsx
│   │   │   │   │   └── sponsor/local/page.tsx
│   │   │   │   │
│   │   │   │   ├── (advertiser)/
│   │   │   │   │   ├── advertiser/dashboard/page.tsx
│   │   │   │   │   ├── advertiser/campaigns/page.tsx
│   │   │   │   │   ├── advertiser/creatives/page.tsx
│   │   │   │   │   └── advertiser/analytics/page.tsx
│   │   │   │   │
│   │   │   │   ├── (venue)/
│   │   │   │   │   ├── venues/dashboard/page.tsx
│   │   │   │   │   ├── venues/events/page.tsx
│   │   │   │   │   ├── venues/analytics/page.tsx
│   │   │   │   │   └── venues/staff/page.tsx
│   │   │   │   │
│   │   │   │   ├── (admin)/
│   │   │   │   │   ├── admin/command-center/page.tsx  # ✅ Pack 34
│   │   │   │   │   ├── admin/finance/profit/page.tsx
│   │   │   │   │   ├── admin/users/page.tsx
│   │   │   │   │   ├── admin/artists/page.tsx
│   │   │   │   │   ├── admin/venues/page.tsx
│   │   │   │   │   ├── admin/events/page.tsx
│   │   │   │   │   ├── admin/tickets/page.tsx
│   │   │   │   │   ├── admin/orders/page.tsx
│   │   │   │   │   ├── admin/wallet/page.tsx
│   │   │   │   │   ├── admin/campaigns/page.tsx
│   │   │   │   │   ├── admin/placements/page.tsx
│   │   │   │   │   ├── admin/articles/page.tsx
│   │   │   │   │   ├── admin/media/page.tsx
│   │   │   │   │   ├── admin/moderation/page.tsx
│   │   │   │   │   ├── admin/bots/page.tsx
│   │   │   │   │   ├── admin/analytics/page.tsx
│   │   │   │   │   ├── admin/feature-flags/page.tsx
│   │   │   │   │   ├── admin/health/page.tsx
│   │   │   │   │   ├── admin/audit-logs/page.tsx
│   │   │   │   │   ├── admin/deploy/page.tsx
│   │   │   │   │   ├── admin/rollback/page.tsx
│   │   │   │   │   └── admin/emergency/page.tsx
│   │   │   │   │
│   │   │   │   ├── (scanner)/
│   │   │   │   │   ├── scanner/checkin/page.tsx
│   │   │   │   │   └── scanner/verify/page.tsx
│   │   │   │   │
│   │   │   │   ├── (kiosk)/
│   │   │   │   │   ├── kiosk/page.tsx
│   │   │   │   │   ├── kiosk/browse/page.tsx
│   │   │   │   │   └── kiosk/display/page.tsx
│   │   │   │   │
│   │   │   │   ├── (tv)/
│   │   │   │   │   ├── tv/page.tsx
│   │   │   │   │   ├── tv/live/page.tsx
│   │   │   │   │   ├── tv/watch/[id]/page.tsx
│   │   │   │   │   └── tv/login-code/page.tsx
│   │   │   │   │
│   │   │   │   ├── (device)/
│   │   │   │   │   ├── device/pair/page.tsx
│   │   │   │   │   └── device/handoff/page.tsx
│   │   │   │   │
│   │   │   │   └── (legal)/
│   │   │   │       ├── privacy/page.tsx
│   │   │   │       ├── terms/page.tsx
│   │   │   │       ├── community-guidelines/page.tsx
│   │   │   │       ├── cookie-policy/page.tsx
│   │   │   │       ├── dmca/page.tsx
│   │   │   │       ├── accessibility/page.tsx
│   │   │   │       ├── refund-policy/page.tsx
│   │   │   │       ├── support/page.tsx
│   │   │   │       ├── faq/page.tsx
│   │   │   │       ├── about/page.tsx
│   │   │   │       ├── press/page.tsx
│   │   │   │       └── careers/page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── PageShell.tsx
│   │   │   │   │   ├── WorldShell.tsx
│   │   │   │   │   ├── BeltSection.tsx
│   │   │   │   │   └── CardCanvas.tsx
│   │   │   │   ├── hud/
│   │   │   │   │   ├── HUDHeader.tsx
│   │   │   │   │   ├── HUDFooter.tsx
│   │   │   │   │   ├── WorldSwitcher.tsx           # ✅ Pack 35
│   │   │   │   │   ├── RecLight.tsx
│   │   │   │   │   ├── VibeMeter.tsx
│   │   │   │   │   └── SatelliteFooter.tsx
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── TopNav.tsx
│   │   │   │   │   ├── BottomNav.tsx               # mobile
│   │   │   │   │   ├── SideNav.tsx                 # desktop
│   │   │   │   │   ├── TVNav.tsx                   # TV dpad
│   │   │   │   │   └── BreadcrumbBar.tsx
│   │   │   │   ├── cards/
│   │   │   │   │   ├── BaseCard.tsx
│   │   │   │   │   ├── ArtistCard.tsx
│   │   │   │   │   ├── ArticleCard.tsx
│   │   │   │   │   ├── EventCard.tsx
│   │   │   │   │   ├── LiveRoomCard.tsx
│   │   │   │   │   ├── GameCard.tsx
│   │   │   │   │   ├── SponsorCard.tsx
│   │   │   │   │   ├── AdCard.tsx
│   │   │   │   │   ├── TicketCard.tsx
│   │   │   │   │   ├── ProductCard.tsx
│   │   │   │   │   ├── ItemCard.tsx               # shop
│   │   │   │   │   ├── VenueCard.tsx
│   │   │   │   │   ├── PlaylistCard.tsx
│   │   │   │   │   ├── ChartCard.tsx
│   │   │   │   │   ├── CountdownCard.tsx
│   │   │   │   │   ├── RewardCard.tsx
│   │   │   │   │   ├── LeaderboardCard.tsx
│   │   │   │   │   └── MotionArtistCard.tsx       # 3s video clip card
│   │   │   │   ├── belts/
│   │   │   │   │   ├── EditorialBelt.tsx
│   │   │   │   │   ├── DiscoveryBelt.tsx
│   │   │   │   │   ├── MarketplaceBelt.tsx
│   │   │   │   │   ├── ActivityBelt.tsx
│   │   │   │   │   ├── TrendingBelt.tsx
│   │   │   │   │   ├── SponsorBelt.tsx
│   │   │   │   │   └── AdsSpotlightBelt.tsx
│   │   │   │   ├── scenes/
│   │   │   │   │   ├── SceneBackdrop.tsx
│   │   │   │   │   ├── SceneBackground.tsx
│   │   │   │   │   └── SceneTransition.tsx
│   │   │   │   ├── effects/
│   │   │   │   │   ├── NeonGlow.tsx
│   │   │   │   │   ├── ScanlineOverlay.tsx
│   │   │   │   │   ├── CRTFlicker.tsx
│   │   │   │   │   ├── FilmGrain.tsx
│   │   │   │   │   ├── ConfettiSystem.tsx
│   │   │   │   │   ├── FireFlame.tsx
│   │   │   │   │   ├── CrownAnimation.tsx         # 3000ms pop-on/off
│   │   │   │   │   ├── LivePulse.tsx
│   │   │   │   │   ├── HypeMeter.tsx
│   │   │   │   │   └── WinnerReveal.tsx
│   │   │   │   ├── live/
│   │   │   │   │   ├── HLSPlayer.tsx
│   │   │   │   │   ├── ChatPanel.tsx
│   │   │   │   │   ├── LobbyWall.tsx              # discovery-first
│   │   │   │   │   ├── RoomCard.tsx
│   │   │   │   │   ├── ViewerCount.tsx
│   │   │   │   │   ├── TipJar.tsx
│   │   │   │   │   ├── ReactionBar.tsx
│   │   │   │   │   ├── LowerThird.tsx
│   │   │   │   │   ├── BroadcasterOverlay.tsx
│   │   │   │   │   └── AdBreakOverlay.tsx
│   │   │   │   ├── games/
│   │   │   │   │   ├── Scoreboard.tsx
│   │   │   │   │   ├── RoundTimer.tsx
│   │   │   │   │   ├── AudienceVotePanel.tsx
│   │   │   │   │   ├── BuzzInButton.tsx
│   │   │   │   │   ├── GameResultPanel.tsx
│   │   │   │   │   └── BracketTree.tsx
│   │   │   │   ├── venue/
│   │   │   │   │   ├── SeatMap.tsx
│   │   │   │   │   ├── LightingControl.tsx
│   │   │   │   │   ├── DJPanel.tsx
│   │   │   │   │   └── StaffBadge.tsx
│   │   │   │   ├── shop/
│   │   │   │   │   ├── ShopGrid.tsx
│   │   │   │   │   ├── RarityBadge.tsx
│   │   │   │   │   ├── ItemPreviewPanel.tsx
│   │   │   │   │   ├── LoadoutBuilder.tsx
│   │   │   │   │   └── DailyDropBanner.tsx
│   │   │   │   ├── vr/
│   │   │   │   │   ├── VREntryPoint.tsx           # ✅ Pack 39
│   │   │   │   │   └── StadiumPage.tsx            # ✅ Pack 39
│   │   │   │   ├── audio/
│   │   │   │   │   └── SceneAudio.tsx
│   │   │   │   ├── ads/
│   │   │   │   │   └── AdRenderer.tsx             # ✅ Pack 34 — always 200
│   │   │   │   ├── accessibility/
│   │   │   │   │   ├── SkipToContent.tsx
│   │   │   │   │   ├── FocusTrap.tsx
│   │   │   │   │   ├── LiveRegion.tsx
│   │   │   │   │   └── KeyboardNav.tsx
│   │   │   │   └── states/
│   │   │   │       ├── LoadingState.tsx
│   │   │   │       ├── EmptyState.tsx
│   │   │   │       ├── ErrorState.tsx
│   │   │   │       ├── OffAirState.tsx
│   │   │   │       └── ReconnectingState.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── scenes/
│   │   │   │   │   ├── scene-registry.ts          # ✅ Pack 38
│   │   │   │   │   ├── scene-loader.ts
│   │   │   │   │   ├── scene-audio.ts
│   │   │   │   │   └── scene-transitions.ts
│   │   │   │   ├── realtime/
│   │   │   │   │   ├── socket-client.ts
│   │   │   │   │   ├── room-client.ts
│   │   │   │   │   ├── game-client.ts
│   │   │   │   │   └── useRealtime.ts
│   │   │   │   ├── api/
│   │   │   │   │   └── api-client.ts              # typed API client
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useRoom.ts
│   │   │   │   │   ├── useGame.ts
│   │   │   │   │   ├── useWallet.ts
│   │   │   │   │   ├── useInventory.ts
│   │   │   │   │   ├── useLeaderboard.ts
│   │   │   │   │   └── useDevice.ts
│   │   │   │   └── utils/
│   │   │   │       ├── cn.ts
│   │   │   │       ├── format.ts
│   │   │   │       └── discovery-sort.ts          # viewers_asc — LOCKED
│   │   │   │
│   │   │   └── config/
│   │   │       ├── platform-registry.ts           # ✅ Pack 36
│   │   │       ├── scene-registry.ts
│   │   │       ├── feature-flags.ts
│   │   │       ├── bot-registry.ts
│   │   │       └── pipeline-registry.ts
│   │   │
│   │   ├── public/
│   │   │   ├── audio/
│   │   │   │   ├── ui/                            # 12 UI sounds
│   │   │   │   ├── ambience/                      # 6 ambient loops
│   │   │   │   ├── game/                          # 9 game sounds
│   │   │   │   ├── music/                         # 7 background tracks
│   │   │   │   ├── sponsor/                       # 3 stings
│   │   │   │   └── spatial/                       # VR 3D audio
│   │   │   ├── standby/
│   │   │   │   ├── tmi-standby-loop.mp4           # off-air video
│   │   │   │   └── test-pattern.png
│   │   │   ├── icons/
│   │   │   │   ├── icon-192.png
│   │   │   │   ├── icon-512.png
│   │   │   │   └── apple-touch-icon.png
│   │   │   └── manifest.json                      # PWA manifest
│   │   │
│   │   └── package.json
│   │
│   └── api/                              # NestJS API
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── profiles/
│           │   ├── artists/
│           │   ├── venues/
│           │   ├── events/
│           │   ├── tickets/
│           │   ├── orders/
│           │   ├── store/
│           │   ├── wallet/
│           │   ├── points/
│           │   ├── economy/              # shop, items, inventory
│           │   ├── articles/
│           │   ├── issues/
│           │   ├── playlists/
│           │   ├── charts/
│           │   ├── ads/                  # always 200
│           │   ├── campaigns/
│           │   ├── placements/
│           │   ├── sponsors/
│           │   ├── advertisers/
│           │   ├── rooms/               # discovery-first
│           │   ├── livestream/
│           │   ├── games/
│           │   ├── scoring/
│           │   ├── chat/               # canSendMessage gate
│           │   ├── friends/
│           │   ├── notifications/
│           │   ├── media/
│           │   ├── uploads/
│           │   ├── search/
│           │   ├── recommendations/
│           │   ├── analytics/
│           │   ├── bots/
│           │   ├── admin/
│           │   ├── moderation/
│           │   ├── support/
│           │   ├── device-pairing/
│           │   └── feature-flags/
│           ├── gateways/               # WebSocket
│           │   ├── rooms.gateway.ts
│           │   ├── games.gateway.ts
│           │   ├── chat.gateway.ts
│           │   ├── notifications.gateway.ts
│           │   ├── crown.gateway.ts
│           │   ├── hype.gateway.ts
│           │   └── ads.gateway.ts
│           ├── bots/
│           │   ├── bot-orchestrator.ts  # ✅ Pack 35
│           │   ├── editorial/
│           │   ├── monetization/
│           │   ├── discovery/
│           │   ├── competition/
│           │   ├── platform/
│           │   ├── moderation/
│           │   ├── acquisition/
│           │   ├── economy/
│           │   ├── broadcast/
│           │   ├── archive/
│           │   ├── analytics/
│           │   └── release/
│           └── workers/
│               ├── media-transcoder.worker.ts
│               ├── image-resizer.worker.ts
│               ├── audio-encoder.worker.ts
│               └── thumbnail.worker.ts
│
├── packages/
│   ├── db/                             # Prisma schema + client
│   │   └── prisma/
│   │       ├── schema.prisma           # ✅ Pack 37 (55+ models)
│   │       ├── seed.ts
│   │       └── migrations/
│   ├── contracts/                      # ✅ Pack 25
│   ├── hud-core/                       # ✅ Pack 25
│   ├── hud-runtime/                    # ✅ Pack 25
│   ├── hud-theme/                      # ✅ Pack 25
│   ├── hud-tmi/                        # ✅ Pack 25
│   ├── realtime/                       # ✅ Pack 38
│   ├── broadcast-engine/               # ✅ Pack 38
│   ├── scoring-engine/                 # ✅ Pack 38
│   ├── economy-engine/                 # ✅ Pack 38
│   ├── venue-engine/                   # ✅ Pack 38
│   ├── media-pipeline/                 # ✅ Pack 38
│   ├── ui-hud/                         # ✅ Pack 38
│   ├── audio-engine/                   # ✅ Pack 38
│   ├── vr-engine/                      # ✅ Pack 39
│   ├── cross-device/                   # ✅ Pack 37
│   ├── push-notifications/             # MISSING — add
│   ├── email-engine/                   # MISSING — add
│   ├── search/                         # MISSING — add
│   ├── recommendations/                # MISSING — add
│   ├── payments/                       # MISSING — add
│   ├── cache/                          # MISSING — Redis abstraction
│   └── queue/                          # MISSING — Bull/BullMQ
│
├── infrastructure/
│   ├── cdn/
│   │   └── cloudflare-r2/
│   ├── monitoring/
│   │   ├── sentry.config.ts
│   │   └── alerts/
│   └── redis/
│       └── redis.config.ts
│
├── distribution/                        # ✅ Pack 37
│   ├── web/pwa/
│   ├── mobile/ios/
│   ├── mobile/android/
│   ├── desktop/windows/
│   ├── desktop/mac/
│   ├── tv/apple/
│   ├── tv/android/
│   ├── tv/roku/
│   ├── tv/amazon/
│   ├── kiosk/
│   └── scanner/
│
├── docs/
│   ├── GAP_ANALYSIS.md                  # ✅ Pack 37
│   ├── MASTER_BUILD_ORDER.md            # ✅ Pack 37
│   ├── MASTER_PLATFORM_MAP.md           # ✅ Pack 35
│   ├── SCENES_AUDIO_ARCHITECTURE.md     # ✅ Pack 37
│   ├── ENGINE_INTEGRATION_MAP.ts        # ✅ Pack 40
│   └── flows/                           # ✅ Pack 40 (5 flows)
│
└── runbooks/
    ├── BLACKBOX_IMPLEMENTATION_GUIDE.md # ✅ Pack 40
    ├── MASTER_BUILD_ORDER.md            # ✅ Pack 37
    └── PLATFORM_LAWS.md                 # 15 laws + enforcement points
```
