# MASTER_BUILD_MATRIX.md
## The Single Source of Truth — Every System, Every Status, Every Owner
### BerntoutGlobal XXL / The Musician's Index
**"This is your stage, be original."**

---

## HOW TO READ THIS

| Column | Meaning |
|---|---|
| System | The platform module or engine |
| Claude Creates | Files Claude must produce (shells, docs, components) |
| Copilot Wires | Files Copilot must connect (routes, providers, contracts, APIs) |
| VS Code Proves | Tests and proof gates that must pass |
| Deploy | What must exist in production |
| Status | MISSING / SHELL / PARTIAL / COMPLETE |
| Launch Blocker | YES = cannot launch without this |

---

## LAYER 1 — RUNTIME FOUNDATION

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Audio Singleton | — | AudioProvider, useAudio hook | playback persists across routes | ✅ COMPLETE | YES |
| HUD Runtime | HudRuntimeProvider shell | wire to AudioProvider | HUD shows live state | ✅ COMPLETE | YES |
| Shared Preview | SharedPreviewProvider, SharedPreviewWindow | wire open/close/content | preview mounts globally | ✅ COMPLETE | YES |
| Turn/Queue | TurnQueueProvider, TurnQueueDock | wire queue ops | advance/release works | ✅ COMPLETE | YES |
| Room Watchdog | RoomWatchdogProvider, RoomWatchdogBadge | wire health checks | health states report correctly | ✅ COMPLETE | YES |
| Live Control Panel | LiveControlPanel shell | wire to all runtime owners | all controls operate | ✅ COMPLETE | YES |
| Session Recovery | SessionRecoveryProvider | wire snapshot/restore | recovery mode is set correctly | ✅ COMPLETE | YES |
| Operator Health Overlay | OperatorHealthOverlay | wire to all runtime owners | overlay renders all states | ✅ COMPLETE | YES |
| Room Infrastructure | RoomInfrastructureProvider, Shell | wire room identity/type/status | room state is owned | ✅ COMPLETE | YES |
| Digital Venue Twin | DigitalVenueTwinProvider, Shell | wire to room infra | venue identity attaches to rooms | ✅ COMPLETE | YES |

---

## LAYER 2 — HOMEPAGE BELTS

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Homepage 1 (Cover) | CrownCard, ArtistRingCard, ComicInsert | wire crown API, ring API | crown loads, ring renders | PARTIAL | YES |
| Homepage 2 (Live World) | LobbyWallPanel, CountdownCard, StreamAndWinCard | wire live API, discovery-first sort | lobby wall sorts 0-viewers first | PARTIAL | YES |
| Homepage 3 (Editorial) | ArticleFeatureCard, GenreCluster, SponsorSpotlight | wire articles, genres, sponsor APIs | editorial cards open correctly | PARTIAL | YES |
| Homepage 4 (Live World Extended) | LiveWorldExtendedShell, LiveRoomsRadarPanel | wire room radar, trending | page renders with real data | MISSING | NO |
| Sponsor World Belt | SponsorWorldBeltShell, SponsorSpotlightPanel | wire sponsor campaigns | sponsor cards render | MISSING | NO |
| Artist World Belt | ArtistWorldBeltShell, ArtistOpportunityPanel | wire artist discovery | artist cards render | MISSING | NO |
| Countdown Engine | CountdownCard, CountdownClock, LiveTicker | wire event timestamps | numbers count down correctly | MISSING | YES |

---

## LAYER 3 — ROOM FAMILIES

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Arena Room | ArenaRoomShell | wire room infra, preview, queue | room opens with all panels | SHELL | NO |
| Battle Room | BattleRoomShell | wire turn lock, scoring | battle turns work | SHELL | NO |
| Cypher Room | CypherRoomShell | wire mic queue, beat preview | cypher queue advances | SHELL | NO |
| Mini Cypher | MiniCypherRoomShell | wire open join, random routing | anyone can join | SHELL | NO |
| Producer Room | ProducerRoomShell, ProducerBeatLocker | wire beat cast, media handoff | beat preview plays | SHELL | NO |
| Watch Room | WatchRoomShell | wire shared media, reactions | audience sees same stream | SHELL | NO |
| Listening Party | ListeningPartyRoomShell | wire album/playlist sync | all hear same track | SHELL | NO |
| Workshop Room | WorkshopRoomShell | wire host controls, queue | host can manage speakers | SHELL | NO |
| Backstage Room | BackstageRoomShell | wire pre-live state | backstage accessible before live | MISSING | NO |
| Green Room | GreenRoomShell | wire performer pre-live | performers can prep | MISSING | NO |
| Premiere Room | PremiereRoomShell | wire countdown, release trigger | countdown fires correctly | MISSING | NO |
| Awards Room | AwardsRoomShell | wire results, winner reveal | winner card shows | MISSING | NO |
| Battle Arena (Weekly) | WeeklyCypherShell | wire scheduled cypher | cypher starts on time | MISSING | YES |
| Random Join | RandomJoinGatewayCard | wire matchmaking routing | user lands in open room | MISSING | YES |

---

## LAYER 4 — ARTIST / PRODUCER PROFILES

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Artist Slug Route | ArtistHeroPanel, DiamondTierBadge | wire /artists/[slug] to DB | profile renders with real data | PARTIAL | YES |
| Artist Media Locker | ArtistMediaLockerPanel, PreviewSourcePicker | wire media DB, artist ownership | artist can add approved media | MISSING | NO |
| Artist Articles | ArtistArticleRail | wire articles API | articles load on profile | MISSING | NO |
| Artist Battle History | ArtistBattleHistoryPanel | wire battle records DB | history renders correctly | MISSING | NO |
| Artist Cypher History | ArtistCypherHistoryPanel | wire cypher records DB | history renders correctly | MISSING | NO |
| Artist Bookings | ArtistBookingPanel | wire booking API | booking entry opens | MISSING | YES |
| Artist Sponsors | ArtistSponsorPanel | wire sponsor DB | sponsor panels show | MISSING | NO |
| Diamond Tier Propagation | DiamondTierBadge | wire tier from DB | Marcel/BJ show Diamond | MISSING | YES |
| Producer Hub | ProducerRoomShell | wire /producers/[slug] | producer profile renders | MISSING | NO |
| Producer Beat Locker | ProducerBeatLocker, BeatPreviewPanel | wire beat DB, preview | beats preview in rooms | MISSING | NO |

---

## LAYER 5 — VENUE / EVENT / WORLD

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Venue Page | VenueHeroPanel, VenueSchedulePanel | wire /venues/[slug] to DB | venue renders with identity | MISSING | NO |
| Venue Rooms | VenueRoomsPanel | wire room list by venue | rooms under venue show | MISSING | NO |
| Event Page | EventHeroPanel, EventBracketPanel | wire /events/[slug] to DB | event renders correctly | MISSING | NO |
| Event Results | EventResultsPanel, WinnerCard | wire results DB | results display after event | MISSING | NO |
| World Map | CityMapPanel, WorldDiscoveryRail | wire /world-map, cities | world map loads | MISSING | NO |
| City Scene | CitySceneHighlightPanel | wire /cities/[slug] | city scene loads | MISSING | NO |
| Hall of Fame | HallOfFamePanel | wire /hall-of-fame to crown history | hall displays past winners | MISSING | NO |
| Leaderboard | LeaderboardPanel | wire /leaderboards to rankings | rankings display correctly | PARTIAL | NO |

---

## LAYER 6 — ECONOMY / SOCIAL / POINTS

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Points Engine | PointsBalanceCard, TierProgressBar | wire points service | points update correctly | PARTIAL | YES |
| Stream & Win | StreamAndWinCard | wire audio + points | points accrue while streaming | PARTIAL | YES |
| Daily Spin | DailySpinWheel | wire spin service, cooldown | spin works once per day | PARTIAL | NO |
| Fan Tiers | FanTierBadge, SupporterRail | wire fan tier DB | tiers display correctly | MISSING | NO |
| Achievements | AchievementsCard, MissionCard | wire achievements engine | achievements unlock | MISSING | NO |
| Booking Portal | BookingCard | wire booking engine | bookings can be created | PARTIAL | NO |
| Sponsor Campaigns | SponsorSpotlightCard | wire sponsor campaign engine | sponsors display in slots | PARTIAL | NO |
| Merch / Store | StoreCard, MerchPanel | wire store API | merch displays correctly | PARTIAL | NO |
| Tips | TipButton, TipHistoryPanel | wire tip transaction | tip posts to artist | MISSING | NO |
| Ticketing | TicketCard | wire ticket engine | tickets can be purchased | MISSING | NO |

---

## LAYER 7 — DISCOVERY / SOCIAL

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Follow System | FollowButton | wire follow service | follow posts to DB | PARTIAL | YES |
| Search | SearchBar | wire search service | search returns results | PARTIAL | YES |
| Discovery Algorithm | UndiscoveredBoostCard | wire discovery service | least-viewed shows first | PARTIAL | YES |
| Fan Clubs | FanClubPanel | wire fan club DB | fans can join clubs | MISSING | NO |
| Crews/Collectives | CrewPanel | wire crew DB | crews can be created | MISSING | NO |
| Messages | MessageListShell | wire messaging service | messages send/receive | MISSING | NO |
| Invites | InviteCard | wire invite service | invites can be sent | MISSING | NO |
| Notifications | NotificationPanel | wire notification service | notifications deliver | PARTIAL | YES |

---

## LAYER 8 — OPERATOR / ADMIN

| System | Claude Creates | Copilot Wires | VS Code Proves | Status | Launch Blocker |
|---|---|---|---|---|---|
| Command Center | GlobalCommandCenterShell | wire /admin/command-center | command center loads | MISSING | YES |
| Watchdog Grid | WatchdogGridPanel | wire health signals | watchdogs report correctly | MISSING | YES |
| Incident Timeline | IncidentTimelinePanel | wire incident logs | incidents show in timeline | MISSING | NO |
| Recovery Actions | RecoveryActionsPanel | wire recovery orchestration | recovery can be triggered | MISSING | NO |
| Bot Status | BotStatusPanel | wire bot manifests | bot status shows | MISSING | NO |
| Feature Flags | FeatureFlagPanel | wire feature flag service | flags can be toggled | MISSING | YES |
| Runtime Contracts | RuntimeContractStatusPanel | wire contract monitors | contract status visible | MISSING | NO |
| Role Management | RoleManagementPanel | wire RBAC admin | roles can be assigned | MISSING | YES |

---

## LAYER 9 — INFRASTRUCTURE

| System | Status | Launch Blocker |
|---|---|---|
| Cloudflare Build (web) | BLOCKED | YES |
| Cloudflare Build (api) | BLOCKED | YES |
| Database (Postgres/Prisma) | PARTIAL | YES |
| Redis (live sync/session) | PARTIAL | YES |
| Media Storage (R2/S3) | MISSING | NO |
| CDN (media delivery) | MISSING | NO |
| Email (Resend) | MISSING | YES |
| Stripe (billing) | MISSING | YES |
| ElevenLabs (TTS) | MISSING | NO |
| Logging/Observability | MISSING | NO |
| Monitoring/Alerts | MISSING | NO |
| Backup/Recovery | MISSING | NO |
| CI/CD (GitHub Actions) | PARTIAL | YES |

---

## LAYER 10 — DEVICE / DISTRIBUTION

| System | Status | Launch Blocker |
|---|---|---|
| Web (PWA) | PARTIAL | YES |
| iOS App | MISSING | NO |
| Android App | MISSING | NO |
| TV/CTV Apps | MISSING | NO |
| Desktop Apps | MISSING | NO |
| Subscription (free download) | MISSING | YES |
| App Store Compliance | MISSING | NO |
| Device Sync | MISSING | NO |

---

## CURRENT OVERALL STATUS

| Layer | Completion % |
|---|---|
| Runtime Foundation | ✅ 90% |
| Homepage Belts | 55% |
| Room Families | 25% (shells only) |
| Artist/Producer Profiles | 35% |
| Venue/Event/World | 10% |
| Economy/Social | 40% |
| Discovery/Social | 35% |
| Operator/Admin | 15% |
| Infrastructure | 50% |
| Device/Distribution | 10% |
| **Overall Platform** | **~42%** |

---

## THE LAUNCH GATE CHECKLIST

Before ANY members are onboarded, these must ALL be green:

- [ ] Cloudflare build: musicians-index-web ✅
- [ ] Cloudflare build: musicians-index-api ✅
- [ ] Route smoke: /, /register, /login → 200
- [ ] Auth: session persists after refresh
- [ ] Crown API: crown loads on Homepage 1
- [ ] Lobby Wall: sorted least-viewers-first
- [ ] Artist Profile: /artists/[slug] renders
- [ ] Diamond: Marcel and BJ show Diamond tier
- [ ] Stream & Win: points accrue while streaming
- [ ] Points: balance updates after earning
- [ ] Subscription: user can upgrade tier
- [ ] Email: notifications deliver
- [ ] Follow: posts to DB
- [ ] Onboarding: artist 8-step flow completes
- [ ] Onboarding: fan genre-selection flow completes
- [ ] Admin: Big Ace can access command center
- [ ] Feature Flags: can disable rooms/preview without redeploy
- [ ] Watchdog: health states report correctly
- [ ] Recovery: session can be restored

---

*MASTER_BUILD_MATRIX.md v1.0 — BerntoutGlobal XXL*
*"This is your stage, be original."*
