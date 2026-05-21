# COMPONENT_COMPLETION_MAP.md
## Every Component Needed — Organized by Feature Area
### BerntoutGlobal XXL / The Musician's Index

---

## NEW COMPONENTS NEEDED (from Pack 28 design system)

### Design System Components
```
apps/web/src/components/tmi-design/
  TMILogo.tsx               → The Musician's Index logo (Bebas Neue, gold)
  TMIBeltHeader.tsx         → Belt section header with gold label + divider
  TMILiveBadge.tsx          → LIVE badge (red, pulsing)
  TMIRankOverlay.tsx        → Rank number overlay for artist cards
  TMICountdownTimer.tsx     → Neon countdown timer component
  TMIStarCTA.tsx            → Star-shaped join CTA button
  TMIGenreHexagon.tsx       → Genre hexagon tile (clip-path CSS)
  TMIGenreHoneycomb.tsx     → Full honeycomb grid of genre hexagons
  TMILightningBolt.tsx      → Decorative lightning bolt icon
  TMIConfettiField.tsx      → Triangle/shape confetti background
  TMIGlowCard.tsx           → Card with neon border + glow
  TMIGoldCard.tsx           → Card with gold border + glow
  TMICrownBadge.tsx         → Crown winner badge (pulsing gold)
  TMIAdDisclosure.tsx       → "Ad" / "Sponsored" label component
```

### Homepage Belt Components
```
apps/web/src/components/home/belts/
  BeltCover.tsx             → Magazine cover (artist collage grid)
  BeltLiveWorld.tsx         → Live world belt (lobby + random join)
  BeltEditorial.tsx         → Editorial belt (article + news + interviews)
  BeltDiscovery.tsx         → Discovery belt (genre + charts + playlists)
  BeltMarketplace.tsx       → Platform marketplace belt
  BeltTrends.tsx            → Trends + events belt
  BeltAdvertiser.tsx        → Paid advertiser belt
  BeltPartyTeaser.tsx       → Party lobby teaser belt

  HomeSectionRenderer.tsx   → Renders belt list from composition config
  HomeCoverBlock.tsx        → The main cover/hero block
  HomeNewsTickerBlock.tsx   → Scrolling music news headlines
  HomeChartsList.tsx        → Top 10 charts list
  HomeUndiscoveredBoost.tsx → "New Artist of the Day" discovery card
  HomeCypherGateway.tsx     → Gateway to active cypher/battle rooms
  HomeStreamWinWidget.tsx   → Stream & Win score widget
  HomeWorldPremiereCard.tsx → Countdown to exclusive drop
  HomeEventCalendar.tsx     → Upcoming events mini calendar
```

### Party Lobby Components
```
apps/web/src/components/party-lobby/
  PartyLobbyShell.tsx       → Full party lobby screen
  PartyLobbyMini.tsx        → Compact party bar for in-destination mode
  PartyMemberRail.tsx       → Member list with presence status
  PartyChatPanel.tsx        → Text chat panel
  PartyVoicePanel.tsx       → Voice/mic controls
  PartyVideoTiles.tsx       → Video tile grid (WebRTC face cam)
  PartySharedPreview.tsx    → Shared destination preview panel
  PartyDestinationPicker.tsx → Destination selector
  PartyReadyPanel.tsx       → Ready status + join together button
  PartyPresenceCard.tsx     → Individual member presence card
  PartyActivityFeed.tsx     → "Marcel is viewing Cypher Arena"
```

### Monetization Components
```
apps/web/src/components/monetization/
  AdRenderer.tsx            → Universal ad slot renderer
  SponsorRenderer.tsx       → Sponsor placement renderer
  AdWidgetCard.tsx          → Standard ad card (game/room/screen widget)
  AdOverlayPanel.tsx        → Overlay ad for intermissions
  AdCountdownSponsor.tsx    → Countdown wrapped in sponsor branding
  AdLowerThird.tsx          → Lower-third sponsor overlay
  AdStickyMobile.tsx        → Mobile bottom sticky ad
  AdSidePanel.tsx           → Side panel ad (rooms, articles)
  AdHeroStrip.tsx           → Full-width hero banner ad
  AdInlineCard.tsx          → Inline article/feed ad card
  SponsorStrip.tsx          → "Presented by" strip
  SponsorRibbon.tsx         → "Powered by" ribbon
  HouseAdFallback.tsx       → Internal promo fallback
  AdDisclosureLabel.tsx     → "Ad" / "Sponsored" label
```

### Game Components
```
apps/web/src/components/games/
  GameLobbyShell.tsx        → Pre-game lobby
  GameActiveShell.tsx       → In-progress game shell
  GameScoreBoard.tsx        → Live scoring display
  GameTimerCircle.tsx       → Circular countdown timer
  GameQuestionCard.tsx      → Question display card
  GamePlayerTile.tsx        → Player score tile
  GameAnswerButtons.tsx     → Multiple choice answer buttons
  GameIntermissionScreen.tsx → Halftime/break screen
  GameEndScreen.tsx         → Results + CTA screen
  GameAudienceRail.tsx      → Audience viewer count + reactions
  GameBrandedQuestion.tsx   → Sponsored question card
```

### Room Scene Components
```
apps/web/src/components/scenes/
  RoomSceneBackground.tsx   → Scene background renderer (already exists)
  ScenePickerPanel.tsx      → Host scene picker (already exists)
  SceneNeonClub.tsx         → Neon club scene
  SceneRooftopCity.tsx      → Rooftop cityscape scene
  SceneStudioGold.tsx       → Gold studio scene
  SceneConcertArena.tsx     → Arena concert scene
  SceneUndergroundCypher.tsx → Urban/graffiti scene
  SceneSpaceDome.tsx        → Space/cosmic scene
  SceneBeachFestival.tsx    → Beach festival scene
  SceneVirtualGrid.tsx      → Tron/cyber grid scene
  SceneThemeConfig.ts       → Scene metadata + config
```

### Stream & Win Components
```
apps/web/src/components/stream-win/
  StreamWinWidget.tsx       → Score display widget
  StreamWinProgressBar.tsx  → Progress to next reward tier
  StreamWinLeaderboard.tsx  → Top scores leaderboard
```
