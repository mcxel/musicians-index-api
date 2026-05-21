# HOMEPAGE_COMPOSITION_SYSTEM.md
## Belt-Based Vertical Homepage — Layout Engine + Bot Management
### BerntoutGlobal XXL / The Musician's Index

---

## HOMEPAGE ARCHITECTURE

The homepage is a vertical "magazine issue" composed of named Belt sections.
Each belt has an identity, content sources, ad slots, and a bot owner.
The homepage assembler bot runs every 15 minutes to refresh stale sections.

---

## BELT DEFINITIONS

### Belt 0: COVER (Magazine Cover — top of page)
```
ID: BELT_COVER
Bot Owner: cover-generator-bot
Content: artist collage grid (weekly cypher participants)
Crown position: center-featured artist
Rank overlays: 1–9 numbered positions
Refresh: every Sunday (new cover week)
Ad slots: none (editorial prestige zone)
Visual: from TMI_UI_DESIGN_SYSTEM.md → Cover Page spec
```

### Belt 1: LIVE WORLD (Activity Belt)
```
ID: BELT_LIVE_WORLD  
Bot Owner: lobby-assembly-bot
Content slots:
  LIVE_MAIN_PREVIEW  → featured live artist (viewers_asc: 0-viewer gets position 1)
  LOBBY_WALL         → 8-tile live artist grid (sorted viewers_asc)
  JOIN_RANDOM_ROOM   → star CTA button
Refresh: real-time via WebSocket
Ad slots: none (live activity zone — no ads interrupting live content)
```

### Belt 2: EDITORIAL (Content Belt)
```
ID: BELT_EDITORIAL
Bot Owner: editorial-assembly-bot
Content slots:
  EDITORIAL_FEATURE  → featured article with large photo
  NEWS_TICKER        → scrolling music news headlines (last hour)
  INTERVIEW_CARD     → latest interview/profile
  STUDIO_RECAP       → cypher highlights weekly wrap-up
Refresh: every 30 minutes
Ad slots:
  EDITORIAL_SPONSOR_STRIP    → "presented by" brand strip (top of belt)
  EDITORIAL_INLINE_1         → between feature and news (advertiser)
```

### Belt 3: DISCOVERY CURATION (Genre + Charts)
```
ID: BELT_DISCOVERY
Bot Owner: discovery-assembly-bot
Content slots:
  GENRE_CLUSTER      → hexagon grid of genres (POP, HIP HOP, R&B, ROCK, JAZZ, ELECTRONIC)
  TOP_10_CHARTS      → live rankings list
  WEEKLY_PLAYLISTS   → Index Picks editorial curation
  AZ_DIRECTORY       → A-Z artist directory link
Refresh: every 60 minutes
Ad slots:
  DISCOVERY_GENRE_SPONSOR    → one genre hexagon can be sponsored (branded color)
  DISCOVERY_CHART_SPONSOR    → "Charts sponsored by" label
```

### Belt 4: PLATFORM MARKETPLACE
```
ID: BELT_MARKETPLACE
Bot Owner: marketplace-assembly-bot
Content slots:
  FEATURED_MERCH     → The Store highlight item
  BOOKING_PORTAL     → Venues accepting bookings teaser
  MY_ACHIEVEMENTS    → current user score/rank card (personalized)
  SPONSOR_SPOTLIGHT  → prestige sponsor slot
Refresh: every 4 hours
Ad slots:
  MARKETPLACE_SPONSOR_PRIMARY   → large sponsor card (premium)
  MARKETPLACE_POWERED_BY        → "Powered By [RETRO LOGO]" placement
```

### Belt 5: TRENDS & EVENTS
```
ID: BELT_TRENDS
Bot Owner: events-assembly-bot
Content slots:
  WORLD_PREMIERES    → countdown to exclusive drop
  EVENT_CALENDAR     → upcoming concerts/listening parties
  UNDISCOVERED_BOOST → New Artist of the Day (discovery-first featured)
  CYPHER_ARENA       → gateway to active 1v1 battle rooms
  STREAM_WIN_SCORE   → Stream & Win current score widget
Refresh: every 15 minutes
Ad slots:
  TRENDS_COUNTDOWN_SPONSOR      → brand wrapping countdown timer
  TRENDS_EVENT_SPONSOR          → event calendar powered-by
```

### Belt 6: ADVERTISER NETWORK (Paid Belt)
```
ID: BELT_ADVERTISER
Bot Owner: ad-placement-bot
Content: all paid. Never shows editorial content.
Slots:
  ADV_HERO_STRIP     → full-width banner
  ADV_TILE_1         → large tile ad
  ADV_TILE_2         → medium tile ad
  ADV_TILE_3         → medium tile ad
  ADV_LOCAL          → geo-targeted local business ad
  ADV_HOUSE          → house ad (fallback when inventory empty)
Refresh: per campaign rules
Rules:
  - no two ads from same advertiser in same belt
  - no competitor categories adjacent
  - auto-collapse to 3 tiles if < 3 campaigns active
  - always show house ad if all slots empty
```

### Belt 7: PARTY LOBBY TEASER
```
ID: BELT_PARTY
Bot Owner: party-assembly-bot
Content: active party lobbies users can join, friend activity
Slots:
  PARTY_ACTIVE_LOBBIES  → 3 public party lobbies with join buttons
  PARTY_FRIEND_ACTIVITY → friends currently in rooms/shows
Refresh: real-time
```

---

## HOMEPAGE COMPOSITION ENGINE

```typescript
// apps/api/src/modules/home/home-composition.service.ts

interface BeltConfig {
  id: string;
  order: number;
  visible: boolean;
  content: ContentSlot[];
  adSlots: AdSlot[];
  botOwner: string;
  refreshIntervalMs: number;
  fallback: FallbackConfig;
}

// Composition rules
const COMPOSITION_RULES = {
  // never show 2 ad belts back to back
  maxAdjacentAdBelts: 1,
  
  // editorial must appear before first ad
  editorialBeforeFirstAd: true,
  
  // minimum editorial belts above the fold on mobile
  minEditorialAboveFold: 1,
  
  // if no live content: replace BELT_LIVE_WORLD with BELT_EDITORIAL
  emptyLiveFallback: 'BELT_EDITORIAL',
  
  // discovery-first: BELT_LIVE_WORLD always sorts artists viewers_asc
  lobbyWallSort: 'viewers_asc',
  
  // cover refreshes Sunday midnight
  coverRefreshCron: '0 0 * * 0',
};
```

---

## BELT ADMIN CONTROL CENTER

Route: `/admin/homepage`

Controls:
- Belt visibility toggle per belt (60s propagation)
- Slot override (pin specific content to a slot)
- Ad slot inventory view
- Belt order drag-and-drop reorder
- Emergency cover override (change magazine cover image)
- Preview mode (see homepage as different user types)

---

## HOMEPAGE BOTS

| Bot | Owns | Refresh |
|---|---|---|
| cover-generator-bot | BELT_COVER | Weekly Sunday |
| lobby-assembly-bot | BELT_LIVE_WORLD | Real-time |
| editorial-assembly-bot | BELT_EDITORIAL | 30min |
| discovery-assembly-bot | BELT_DISCOVERY | 60min |
| marketplace-assembly-bot | BELT_MARKETPLACE | 4h |
| events-assembly-bot | BELT_TRENDS | 15min |
| ad-placement-bot | BELT_ADVERTISER | Per campaign |
| party-assembly-bot | BELT_PARTY | Real-time |
