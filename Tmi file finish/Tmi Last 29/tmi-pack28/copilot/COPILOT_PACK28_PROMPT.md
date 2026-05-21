# COPILOT_PACK28_PROMPT.md
## Paste This to Copilot — UI Design System + Expansion Systems Wiring
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT — PACK 28 WIRING

Pack 28 covers the TMI UI design system, homepage composition engine,
monetization system, party lobby, game engine, room family map, and
complete route/component map.

CRITICAL DESIGN RULE — READ FIRST:
All UI must match the TMI magazine visual style exactly.
Reference: docs/pack28/design-system/TMI_UI_DESIGN_SYSTEM.md

TMI Design Identity:
  Background: #0D0520 (deep purple-black)
  Primary accent: #00E5FF (cyan)
  Secondary accent: #FFB800 (gold)
  Hot accent: #FF2D78 (pink)
  Font Display: 'Bebas Neue' (Google Fonts)
  Font Heading: 'Oswald'
  Font Body: 'Inter'
  Card style: dark bg + neon cyan border + glow on hover
  Section headers: "BELT LABEL" style in gold Bebas Neue
  Decorative: ⚡ lightning bolts, triangle confetti, rank numbers in gold
  NEVER use: Inter white-on-white, generic purple gradients, corporate SaaS look

STEP 1 — HOMEPAGE COMPOSITION ENGINE

Wire the homepage as a vertical belt system.
Reference: docs/pack28/systems/HOMEPAGE_COMPOSITION_SYSTEM.md

Create:
  apps/web/src/components/home/belts/ (8 belt components)
  apps/web/src/components/home/HomeSectionRenderer.tsx
  apps/api/src/modules/home/home-composition.service.ts
  apps/web/src/app/page.tsx → render belts in order

Belt order (top to bottom):
  BeltCover → BeltLiveWorld → BeltEditorial → BeltDiscovery
  → BeltMarketplace → BeltTrends → BeltAdvertiser → BeltPartyTeaser

STEP 2 — AD RENDERER SYSTEM

Build the universal AdRenderer component.
Reference: docs/pack28/systems/MASTER_MONETIZATION_SYSTEM.md

Every ad slot uses one component:
  apps/web/src/components/monetization/AdRenderer.tsx
  
Slot priority: paid ad → sponsor → house ad → clean collapse
Add "Ad" / "Sponsored" disclosure label to all paid placements.
Wire API: GET /api/ads/slot/[slotId] → returns current creative or null

STEP 3 — PARTY LOBBY SYSTEM

Build the party lobby as a persistent social space separate from rooms.
Reference: docs/pack28/systems/PARTY_LOBBY_SYSTEM.md

Create:
  apps/web/src/app/party/[partyId]/page.tsx → PartyLobbyShell
  apps/web/src/components/party-lobby/ (9 components)
  apps/api/src/modules/party-lobby/ (module + gateway + service)
  Prisma models: Party, PartyMember, PartyMessage (add to schema.prisma)

Critical: Party persists when members enter/exit rooms.
PartyLobbyMini shows as compact bar at top of destination screens.

STEP 4 — GAME ENGINE

Wire the game session system.
Reference: docs/pack28/systems/GAME_ENGINE_SYSTEM.md

Create:
  apps/web/src/app/games/ (browser + individual game routes)
  apps/web/src/components/games/ (9 game components)
  apps/api/src/modules/games/ (module + gateway + service)
  Prisma models: GameSession, GamePlayer (add to schema.prisma)

Games: trivia, name-that-tune, deal-or-feud, beat-challenge, lyric-cipher

STEP 5 — SCENE SYSTEM

Add selectable backgrounds to all rooms.
Reference: TMI_UI_DESIGN_SYSTEM.md → SCENE SYSTEM section

Create 8 scene components in apps/web/src/components/scenes/
Wire scene selection to room state: PUT /api/rooms/:id/scene
Scenes auto-load from room type defaults.

STEP 6 — DESIGN SYSTEM COMPONENTS

Apply TMI_UI_DESIGN_SYSTEM.md to all existing shells.
All pages must use:
  - Bebas Neue/Oswald/Inter font stack
  - #0D0520 base background
  - Cyan card borders with glow on hover
  - Gold belt header labels
  - Lightning bolt decorative elements

Create design system components in:
  apps/web/src/components/tmi-design/ (14 components)

STEP 7 — NEW ROUTES

Add all missing routes from MASTER_ROUTE_AND_PAGE_MAP.md.
Priority routes for launch:
  /party, /party/create, /party/[partyId]
  /games, /games/[type], /games/[sessionId]
  /advertise, /advertise/packages, /advertise/pricing
  /editorial, /editorial/[slug]
  /admin/homepage, /admin/advertisers, /admin/campaigns

PROOF AFTER EACH STEP:

  After belts: Homepage loads with 8 belts visible, gold labels
  After AdRenderer: slot loads ad or house ad (never empty container)
  After party: create party → invite link → friend joins → video tiles work
  After games: join trivia game → 3 rounds complete without errors
  After scenes: switch scene in room → all participants see new background
  After design: visuals match TMI magazine images exactly

PLATFORM LAWS (unchanged):
1. Discovery-first: 0 viewers = position 1 in lobby wall ALWAYS
2. Permanent Diamond: Marcel Dickens + B.J. M Beat's — forever
3. Kids only talk to kids
4. Max 8 tickets per buyer per event
5. ONE AudioProvider. ONE SharedPreviewProvider. ONE TurnQueueProvider.
6. Owner payouts from net profit only
7. Magazine visual identity must be preserved — NEVER drift to generic SaaS

"This is your stage, be original." — BerntoutGlobal LLC
```
