# TMI Canon Scan + Controlled Build Map

## 1) Source Scan Completed

### TMI PDF + image canon folder scanned
- `Tmi PDF's/The Musician's Index Magazine images.pdf`
- `Tmi PDF's/The Musician's Index Magazine images/`
- `Tmi PDF's/Tmi Homepage 1.jpg`
- `Tmi PDF's/Tmi Homepage 1-2.jpg`
- `Tmi PDF's/Tmi Homepage 2.png`
- `Tmi PDF's/Tmi Homepage 3.png`
- `Tmi PDF's/Tmi Homepage 4.png`
- `Tmi PDF's/Tmi Homepage 5.png`
- `Tmi PDF's/game show and venue skins/`
- `Tmi PDF's/Host , Julius , and extra/`
- `Tmi PDF's/Profiles/`
- `Tmi PDF's/Venue Skins Plus Seating/`

## 2) Visual/Environment Artifacts Present

### Foundation visuals
- `src/packages/foundation-visual/NeonFrame.tsx`
- `src/packages/foundation-visual/StageFrame.tsx`
- `src/packages/foundation-visual/MagazineFrame.tsx`
- `src/packages/foundation-visual/BillboardFrame.tsx`
- `src/packages/foundation-visual/AngledPanel.tsx`
- `src/packages/foundation-visual/SplitPanel.tsx`

### Widgets/cards/screens
- `src/packages/foundation-visual/ArticleFeatureCard.tsx`
- `src/packages/foundation-visual/SponsorSpotlightFrame.tsx`
- `src/packages/foundation-visual/LiveVideoShell.tsx`
- `src/packages/foundation-visual/ReactionBar.tsx`
- `src/packages/foundation-visual/NameThatTuneBoard.tsx`
- `src/packages/foundation-visual/CrownBadge.tsx`
- `src/packages/foundation-visual/LiveBadge.tsx`

### Effects/shapes/canvases
- `src/packages/foundation-effects/ReactionOverlayCanvas.tsx`
- `src/packages/foundation-effects/HexCluster.tsx`
- `src/packages/foundation-effects/glow.ts`
- `src/packages/foundation-effects/usePulse.ts`
- `src/packages/foundation-visual/AwkwardShapeCanvas.tsx`

### Venue/arena environment set
- `src/packages/foundation-visual/VenueSkinShell.tsx`
- `src/packages/foundation-visual/VenueEnvironment.tsx`
- `src/packages/foundation-visual/VenueSeatingGrid.tsx`
- `src/packages/foundation-visual/WorldDancePartyArena.tsx`
- `src/packages/foundation-visual/MarcelStageArena.tsx`
- `src/packages/foundation-visual/MonthlyIdolArena.tsx`
- `src/packages/foundation-visual/StageBackgroundLayer.tsx`
- `src/packages/foundation-visual/WinnerFrame.tsx`

## 3) Magazine Engine Mapping (Current)

### Core registries
- `src/packages/magazine-engine/issueRegistry.ts`
- `src/packages/magazine-engine/zoneMaps.ts`
- `src/packages/magazine-engine/contentRegistry.tsx`
- `src/packages/magazine-engine/visualRegistry.ts`

### Zone modules
- `src/packages/magazine-engine/rankingZones.tsx`
- `src/packages/magazine-engine/liveZones.tsx`
- `src/packages/magazine-engine/gameZones.tsx`
- `src/packages/magazine-engine/marketZones.tsx`

### Routing/pager
- `src/packages/magazine-engine/magazinePages.ts`
- `src/packages/magazine-engine/useMagazinePager.tsx`
- `src/packages/home/HomeV2.tsx`

## 4) Controlled Routing Hardening Added

### New centralized route registry
- `src/lib/routeRegistry.ts`

Includes:
- module route map
- belt-to-route map
- fallback route map
- route resolver helper for safe linking

### Existing routes helper expanded
- `src/lib/routes.ts`

Added route families:
- article, issue, room, venue, event, discover, rewards, seasonPass

### Missing route stubs created (no dead ends)
- `src/app/home/6/page.tsx`
- `src/app/home/7/page.tsx`
- `src/app/home/8/page.tsx`
- `src/app/home/9/page.tsx`
- `src/app/home/10/page.tsx`
- `src/app/home/11/page.tsx`
- `src/app/home/12/page.tsx`
- `src/app/home/13/page.tsx`
- `src/app/home/14/page.tsx`
- `src/app/home/15/page.tsx`
- `src/app/issues/[issueId]/page.tsx`
- `src/app/events/[eventId]/page.tsx`
- `src/app/discover/[id]/page.tsx`
- `src/app/season-pass/page.tsx`
- `src/components/routing/RouteStubPage.tsx`

Note:
- `/rooms/[roomId]` and `/venues/[venueId]` contracts are already satisfied by existing dynamic routes (`/rooms/[slug]`, `/venues/[slug]`) that resolve the same URL shape.

## 5) Build-Director Role Map (Locked)

### Home page role split
- Home 1: cover/crown entry + top-ten loop
- Home 2: editorial + discovery + charts
- Home 3: live rooms + events + cypher
- Home 4: game world + event tracker + prize loop
- Home 5: marketplace + ads + analytics
- Home 6-15: staged extension pages for charts, idol, dance party, cypher battles, game shows, rewards, sponsor drops, vault

### Interaction safety constraints
- overlay canvas must remain pointer-events safe
- every visible CTA must resolve via route registry
- content registry must resolve every zone in zone maps
- stubs allowed only as explicit placeholders with route contract

## 6) Next Wiring Chunks

1. Replace Home 7-15 placeholder zone renderers in `contentRegistry.tsx` with real components in small slices.
2. Wire Sponsor Giveaways zone to live feed (socket/polling adapter) behind a feature flag.
3. Wire issue/belt links to `routeRegistry.ts` for consistent fallback behavior.
4. Add route-click probe assertions for game/marketplace/issue routes.
5. Run Gemini audit pass after each chunk (fail-list only).
