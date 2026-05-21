# MASTER BLACKBOX SPRINT — SCENE PACKAGE CONVERSION (PDF-TRUTH BUILD COMMAND)

## NON-NEGOTIABLE RULES
- DO NOT modify locked Phase 5.1 / Phase 5.2 runtime behavior.
- DO NOT break routing, world runtime, communication split, seating, camera, arrival/readiness.
- DO NOT redesign arbitrarily.
- ALL UI conversion must be derived from TMI PDF/image sources listed below.
- ALL converted sections must map to reusable components and packages.
- NO generic UI (plain cards/div dashboards/default utility-only look).
- Keep one coherent style family (1980s futuristic magazine broadcast language).

---

## SOURCE OF TRUTH (SCAN FOLDERS, NOT ZIPS)
Use these extracted folders/files as canonical visual input:

- `Tmi PDF's/The Musician's Index Magazine images/` (img00001–img00088)
- `Tmi PDF's/Tmi Homepage 1.jpg`
- `Tmi PDF's/Tmi Homepage 2.png`
- `Tmi PDF's/Tmi Homepage 3.png`
- `Tmi PDF's/Tmi Homepage 4.png`
- `Tmi PDF's/Tmi Homepage 5.png`
- `Tmi PDF's/Profiles/`
- `Tmi PDF's/game show and venue skins/`
- `Tmi PDF's/Host , Julius , and extra/`
- `Tmi PDF's/Venue Skins Plus Seating/`

Ignore zip files for style extraction if extracted folders already exist.

---

## CORE ARCHITECTURE RULE (ONE PATH, NOT DISCONNECTED PAGES)
This system is NOT page-based. Build as:

`packages → belts → hub → routes → room consumers → HUD overlays`

PDF pages are not standalone routes. They are blueprint sections that compose belts within one unified hub system.

---

## TARGET PACKAGE ARCHITECTURE
Create/extend package structure under `tmi-platform/apps/web/src/packages/`:

1. `editorial/`
2. `discovery/`
3. `live/`
4. `social/`
5. `battle/`
6. `marketplace/`
7. `events/`
8. `ranking/`
9. `profile/`
10. `admin/`
11. `venue/`
12. `avatar-host/`
13. `foundation-visual/`
14. `foundation-shapes/`
15. `foundation-effects/`

---

## SOURCE → PACKAGE MAPPING TABLE

| Source | Package Targets | Primary Belt/Use |
|---|---|---|
| `Tmi Homepage 1-5` | editorial, discovery, live, marketplace, ranking, events | Hub belts baseline |
| `The Musician's Index Magazine images/img00001-00012` | editorial, discovery | Editorial/Discovery belts |
| `img00013-00025` | live, social | Live world / audience surfaces |
| `img00026-00040` | marketplace, admin | Sponsor/ad/command surfaces |
| `img00041-00055` | ranking, battle, events | Winner/cypher/game surfaces |
| `img00056-00070` | profile, avatar-host | Account/artist/fan/host surfaces |
| `img00071-00088` | venue, live, social | Venue skins + room consumers |
| `Profiles/` | profile, admin | signup/account role surfaces |
| `game show and venue skins/` | events, battle, venue, avatar-host | game + host + venue skins |
| `Host , Julius , and extra/` | avatar-host, live, events | host persona surfaces |
| `Venue Skins Plus Seating/` | venue, live, social | room skin + seating consumers |

---

## VISUAL LANGUAGE SYSTEM (MANDATORY)
All package components must consume shared foundation systems:

### Foundation Visual (`foundation-visual/`)
Required frame components:
- `NeonFrame`
- `StageFrame`
- `BillboardFrame`
- `MagazineFrame`
- `SpotlightFrame`
- `PanelFrame`
- `MarqueeFrame`
- `WinnerFrame`
- `AdFrame`

### Foundation Shapes (`foundation-shapes/`)
Required shape components:
- `HexCluster`
- `StarFrame`
- `AngledPanel`
- `SplitPanel`
- `TicketPanel`
- `MarqueePanel`
- `BroadcastShell`

### Foundation Effects (`foundation-effects/`)
Required systems:
- Glow tokens (inner/outer/rim)
- Border energy/shimmer
- Scanline-ready overlays
- Feathering tokens
- Tethering anchor tokens
- Transition presets
- Lighting sweep presets

### Global style rules
- Multi-color section zoning (editorial/discovery/live/sponsor etc.).
- Layered frame-inside-frame panels.
- Dense magazine composition (avoid empty UI blocks).
- Subtle motion (pulse/shimmer/hover energy), no heavy JS animations required.
- 12-column global responsive editorial grid.
- 1980s editorial chaos colors required: cyan, yellow, magenta, purple, teal, electric orange, and solid black anchors. Aggressive contrast.
- NO flat dashboard layouts; must have vertical magazine pacing, rhythm, and stacked vertical flow.
- Shell proportions: realistic thickness for closed shell, realistic gutter/curvature/width for open spreads.
- Fix container bottom slam: 
  - Main page wrapper must use: `min-height: 100vh; display: flex; flex-direction: column; padding-bottom: 80px;`
  - Section wrappers must use: `padding-block: clamp(48px, 8vw, 120px);`
- **Interaction & Timing Rules (V3.1+):**
  - Rotational timing lock: Home 1 Top 10 must enforce a 5-second readable lock before transition.
  - Article snippet rotation: Artist articles require 3 rotating snippets per visit.
  - Sponsor animation layer: Ads must rotate/animate (pulse, swap, fade, hover energy).
  - Billboard preview hover: Venue/show billboards must trigger a live preview window on hover.

---

## REQUIRED PACKAGE OUTPUTS (MINIMUM ARTIFACTS)

### 1) `packages/editorial/`
- `ArticleFeatureCard`
- `EditorialHeadlineStack`
- `NewsTickerPanel`
- `InterviewFeaturePanel`
- `StudioRecapPanel`
- `PollWidget`
- `ArticleAdInsert`
- `PerformerArticleHero`
- `ArtistArticleSection`
- `IssueStrip`
- `MonthlyIssueRotationPanel`

### 2) `packages/discovery/`
- `GenreHexCluster`
- `TopChartsPanel`
- `PlaylistIndexPanel`
- `ArtistDirectoryPanel`
- `DiscoverySpotlightCard`

### 3) `packages/live/`
- `MainPreviewLobby`
- `LobbyWallGrid`
- `StageViewFrame`
- `LiveVideoShell`
- `PerformerSpotlightFrame`
- `LiveControlStrip`
- `LiveTagBadge`
- `WorldPremiereCountdown`
- `EventCalendarPanel`

### 4) `packages/social/`
- `AudienceGrid`
- `ReactionBar`
- `TipPanel`
- `CrowdChatRail`
- `FanSpotlightBadge`
- `SupporterRankBadge`
- `PresenceTagCluster`

### 5) `packages/battle/`
- `CypherArenaGateway`
- `CypherRoomCard`
- `BattleMatchHud`
- `VoteNowBanner`
- `CrownTrackerPanel`
- `ScoreMomentumBar`
- `BattleQueuePanel`

### 6) `packages/marketplace/`
- `SponsorSpotlightFrame`
- `BillboardTakeoverHero`
- `PremiumAdCarousel`
- `CampaignBuilderPanel`
- `AudienceTargetingPanel`
- `GenreTargetingPanel`
- `PlacementIndexGrid`
- `DealsContractPanel`
- `RevenueSharePanel`
- `AnalyticsPerformanceStrip`

### 7) `packages/events/`
- `GameNightHub`
- `NameThatTuneBoard`
- `DealOrFeudBoard`
- `JoinQueuePanel`
- `CountdownPanel`
- `ContestMissionCard`
- `WatchPartyVenuePicker`

### 8) `packages/ranking/`
- `WinnerHallHero`
- `CrownDisplay`
- `LeaderboardRail`
- `TrophySpotlight`
- `WeeklyChampionPanel`
- `WinnerHistoryStrip`

### 9) `packages/profile/`
- `PerformerSignupSurface`
- `FanSignupSurface`
- `SponsorSignupSurface`
- `AdvertiserSignupSurface`
- `ProfileHeroSurface`
- `RoleSwitcherPanel`
- `AchievementSummaryPanel`
- `SeasonPassPanel`

### 10) `packages/admin/`
- `GlobalAdminCommandSurface`
- `BotActivityPanel`
- `BookingMapPanel`
- `RevenueCommandPanel`
- `DiagnosticsActionRow`
- `OverridePanel`

### 11) `packages/venue/`
- `VenueSkinShell`
- `SeatingLayoutFrame`
- `FrontRowPremiumFrame`
- `StageBackgroundLayer`
- `VenueBookingCard`

### 12) `packages/avatar-host/`
- `HostHeroCard`
- `BobbleheadIdentityTile`
- `HostMicPanel`
- `PerformerIdentityFrame`

---

## BELT COMPOSITION (UNIFIED HUB STACK)
Create belt composition under `src/components/belts/` and/or `src/hub/`:

- `EditorialBelt`
- `DiscoveryBelt`
- `LiveWorldBelt`
- `SocialAudienceBelt`
- `BattleCypherBelt`
- `MarketplaceSponsorBelt`
- `EventsGamesBelt`
- `RankingWinnersBelt`
- `BookingVenueBelt`
- `ProfileIdentityBelt`

Build master hub container:

- `TMIHub` (single-path composition root)

---

## ROUTE CONSUMERS TO WIRE (NO RUNTIME BREAKS)
Wire package belts/surfaces into existing app routes (minimally, safely):

- `/home/*`
- `/magazine/current`
- `/articles/*`
- `/artist/[slug]/*`
- `/performer/[slug]/*`
- `/fan/[slug]/*`
- `/rooms/*`
- `/live/*`
- `/winners/*`
- `/shop/*`
- `/admin/*`
- `/booking/*`

Specific Homepage Reconstruction Goals (Phase V3.1):
- **Home 1:** Shell scaling and spread proportions.
- **Home 2:** Convert to stacked editorial blocks (70/30, 50/50, 33/33/33 grid usage).
- **Home 3:** Convert to live world board (hero + wall, stack + stack, full-width CTA).
- **Home 4:** Convert to sponsor marketplace magazine layout (hero ad, carousel, analytics, contracts).
- **Home 5:** Convert to battle bracket editorial page (bracket board, countdown row, winners strip).
- **Post-Build Requirement:** Route-proof audit on /home/1 through /home/5.

Do not force route rewrites. Compose new package surfaces as route consumers.

---

## ARTICLE SYSTEM RULE
Articles are magazine spreads, not plain blog blocks.

Required article families:
- Performer article
- Artist article
- Winner feature
- Live recap
- News issue
- Sponsor-supported editorial inserts

Use editorial package components with frame/shape/effects system.

---

## EXTRA CHAINS REQUIRED FOR COMPLETION (SCAFFOLD + WIRE POINTS)
Add component scaffolds/wiring points (no runtime regression):
- Accounts/logins/signups
- Subscription panels/supporter ranks
- XP/achievements/season pass/reward strips
- Sponsor gifted surprise pipeline visual hooks
- Advertiser prize route hooks
- Winner prize route hooks
- Shop hooks (icons/emotes/clothing/props)
- HUD families: room/hub/backstage/event/cypher/article accents
- Video overlay shells + route transition polish
- Monthly issue rotation strips
- Blocker/warning diagnostic display surfaces
- Automation hooks for magazine/rewards/sponsors/bots

---

## IMPLEMENTATION PASSES (ORDERED, REQUIRED)

### Pass 1 — Visual Foundation
Build `foundation-visual`, `foundation-shapes`, `foundation-effects` and global style tokens.

### Pass 2 — Package Scaffolds
Create all packages and required components with consistent props and style bindings.

### Pass 3 — Belt Assembly
Compose all belts from package artifacts; enforce density and section zoning.

### Pass 4 — Hub Integration
Build `TMIHub` unified stack and section navigation anchors/jump controls.

### Pass 5 — Route Consumers
Mount belts/surfaces into target routes without breaking existing engines/runtime.

### Pass 6 — Validation
Run runtime + visual gates and produce proof artifacts.

---

## VALIDATION GATES (MUST PASS)
- Visual output matches PDF family (or better) while staying same style lineage.
- No generic flat UI blocks remain in converted surfaces.
- Every converted section uses frame + shape + glow + density system.
- No regressions in locked Phase 5.1/5.2 behavior.
- No runtime errors/blocking console exceptions.
- Source-to-component mapping completeness delivered.
- No empty placeholder-only sections for mapped components.

---

## FAIL CONDITIONS (REJECT BUILD IF ANY TRUE)
- Generic dashboard appearance persists.
- One-color dark-only mood dominates all sections.
- Package/belt/hub hierarchy not implemented.
- Source mapping missing or partial.
- Flat card replacements without frame/shape system.
- Regressions introduced in runtime/engine flows.
- Disconnected one-off page redesigns outside unified hub architecture.

---

## TESTING + PROOF OUTPUT (REQUIRED DELIVERABLES)
Return:
1. Files created
2. Files modified
3. Package map
4. Belt map
5. Source mapping table
6. Tests run
7. Blockers/warnings
8. Visual proof screenshots for key routes:
   - Hub belts overview
   - Editorial/article route
   - Live/room route
   - Marketplace/sponsor route
   - Ranking/winner route
   - Profile/signup route
   - Admin command route

Also re-run locked sanity checks and report pass/fail:
- `runSeating2.test.ts`
- `runCamera360.test.ts`
- `runPresence.test.ts`
- `runCommunication.test.ts`

---

## DO-NOT-TOUCH LIST
Do not rewrite these unless absolutely required for compatibility patch:
- `src/engines/world/seating2.engine.ts`
- `src/engines/world/camera360.engine.ts`
- `src/engines/world/presence.engine.ts`
- `src/engines/world/communication.engine.ts`
- Phase 5.2 communication split logic
- Existing validated runtime orchestration paths

If touched, provide exact diff reason and minimal patch only.

---

## EXECUTION NOTE
This is a strict build command file, not documentation.  
Deliver componentized systems and routed surfaces, not mockups.
