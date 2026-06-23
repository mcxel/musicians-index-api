# TMI PLATFORM — COMPLETE BUILD DIRECTIVE v2.0
### Build Director: Claude | Implementation: BlackBox | Authority: Marcel
### Status: Route to 100% Completion

---

## PART 1 — EVERYTHING CLAUDE BUILT (WITH DETAIL & CONTEXT)

### 1.1 ALL SIX HOMEPAGES

| Page | File | Component | Status |
|------|------|-----------|--------|
| Home 1 | `/home/1/page.tsx` | `Home1CoverPage.tsx` | Built — Claude design |
| Home 1-2 | `/home/1-2/page.tsx` | `Home12Surface.tsx` | Built — Claude design |
| Home 2 | `/home/2/page.tsx` | `MagazineShell.tsx` | Built — Claude design |
| Home 3 | `/home/3/page.tsx` | `LiveWorldSurface.tsx` | Built — Claude design |
| Home 4 | `/home/4/page.tsx` | `MarketplaceGrid.tsx` | Built — Claude design |
| Home 5 | `/home/5/page.tsx` | `ArenaBattleContainer.tsx` | Built — Claude design |

**Home 1 PROTECTED ASSETS (do not touch):**
- WorldUnderlay z-0 animated
- OrbitalWheel z-10 with 10 performer nodes
- Two moving rails (top LEFT, orbital zone RIGHT/opposite direction)
- MAGAZINE typewriter animation loop
- 3 video monitors INDEPENDENT timers: 9,500ms / 13,200ms / 17,000ms (staggered 2,300ms each)
- Toggleable side panels LEFT (PROMO/VENUE/ADS) RIGHT (RANKS/ADS/PROMO)
- Tabloid underlay: WHO TOOK THE CROWN / BATTLE NIGHT / CYPHER / CHALLENGE

**CRITICAL FIX — Home 1 masthead is TOO BIG:**
```tsx
// Home1CoverPage.tsx — shrink and reposition banner
// FROM: position fixed at top, height: 100vh
// TO: maxHeight: '250px', positioned above orbital wheel
<div style={{ maxHeight: '250px', marginBottom: '16px' }}>
  {/* Banner content */}
</div>
```

---

### 1.2 ADMIN HUBS (4 ACTIVE + 1 REMOVED)

| Hub | Route | Person | Permissions |
|-----|-------|---------|-------------|
| Marcel Founder | `/admin/marcel` | Marcel | Full control + submit + suggest |
| Big Ace AI CEO | `/admin/big-ace` | Big Ace | FULL FULL CONTROL + payout authority |
| Jay Paul Sanchez | `/admin/jay-paul` | Beat producer | Submit + suggest + observe |
| Justin | `/admin/justin` | Observer | Read-only + suggest only |
| **MICAH** | **REMOVED** | Diamond account for life | **No admin page** |

---

### 1.3 SIGN-UP PAGES → HUB ROUTING

| Role | Signup Route | After Submit → |
|------|-------------|----------------|
| Fan | `/auth/signup?role=fan` | `/hub/fan` |
| Artist | `/auth/signup?role=artist` | `/hub/performer` |
| Sponsor | `/auth/signup?role=sponsor` | `/hub/sponsor` |
| Advertiser | `/auth/signup?role=advertiser` | `/hub/advertiser` |

---

### 1.4 SEASON PASS — `/season-pass`
Animated instrument fretboard (Guitar/Drums/Saxophone/Piano). 15 levels. Rewards at L1, L3, L5, L7, L10, L12, L15.

### 1.5 PLAYLIST ENGINE
10 animated skins. 14+ media types. WebRTC lobby sync (same millisecond for all room members). Skin generator AI prompt.

### 1.6 MEMORY WALL SYSTEM
Fan + Performer. Floating masonry collage. Auto-generated memories. 5 themes (Classic/Ruby/Diamond/Gold/Neon). Avatar holographic share into room (non-blocking PIP).

### 1.7 BILLBOARD LIVE LOBBY WALL
10 wall types. 8 tile shapes. Season magazine themes. 13-second weighted rotation. One LiveSessionRegistry feeds all surfaces.

### 1.8 GAMES DISCOVERY NETWORK — `/games`
14 games. No dead clicks. Every game: Games page → game card → game lobby → AudienceScene → seat assigned → inside.

### 1.9 THREE CANISTERS (Performer only)
SponsorStampWallCanister, SponsorBubbleOrbitCanister, BookingMapCanister.

### 1.10 SYSTEM ARCHITECTURE BLUEPRINT
`TMI_SYSTEM_ARCHITECTURE_BLUEPRINT.md` — 13 laws, 16-pass order, complete route/component/dashboard map.

---

## PART 2 — WHAT'S MISSING / NEEDS FIXING

### 2.1 CRITICAL ROUTING FIXES (P0 — DO FIRST)

```typescript
// apps/web/middleware.ts
const LEGACY_REDIRECTS = {
  '/dashboard/fan': '/hub/fan',
  '/dashboard/performer': '/hub/performer',
  '/dashboard/sponsor': '/hub/sponsor',
  '/dashboard/advertiser': '/hub/advertiser',
  '/dashboard/venue': '/hub/venue',
  '/fan/theater': '/hub/fan', // NOT default landing
}

// apps/web/src/app/api/auth/callback/google/route.ts
const roleHubMap = {
  fan: '/hub/fan',
  performer: '/hub/performer',
  artist: '/hub/performer',
  sponsor: '/hub/sponsor',
  advertiser: '/hub/advertiser',
  venue: '/hub/venue',
}
// Google OAuth MUST route here, not to /fan/theater
```

### 2.2 LEGACY BLACKBOX UI TO REMOVE

```
REMOVE from ALL public/user pages:
□ Floating utility widget: "REVENUE / BOOKINGS / MESSAGES / NOTIFICATIONS"
  → File: SidebarOverlay.tsx or UtilityMenu.tsx — DELETE from public routes
  → Move admin-only items to /admin/* only

□ Fan Theater as default fan landing
  → /fan/theater is entertainment surface, NOT /hub/fan

□ Old BlackBox profile dashboard with redundant action buttons
  → Consolidate to: MESSAGE + VIDEO CALL primary, rest in "..." menu

□ All dead buttons (onClick does nothing)
□ All blank placeholder cards
□ Empty static playlists / memory walls
□ Micah's admin page (give Diamond account instead)
```

### 2.3 MISSING: PIP MONITORS

```tsx
// CREATE: apps/web/src/components/media/PIPMonitor.tsx

interface PIPMonitorProps {
  feeds: Array<{
    id: string
    label: string        // 'Stage A', 'Lobby Wall', 'Analytics', 'Messages'
    type: 'boardroom' | 'stage' | 'analytics' | 'messages' | 'lobby' | 'audience'
    feedUrl?: string
    isLive?: boolean
    viewerCount?: number
  }>
  layout: '1-large-4-small' | '2x2' | '3-strip' | '6-equal'
  onSwitchFeed: (feedId: string) => void
  onGroupMeet: () => void
  onCallPerson?: (personId: string) => void
}

// Admin Hub layout: 1 large main + 4 smaller independent monitors
// Each monitor shows DIFFERENT content — NEVER all the same feed
// Performer Hub: 1 large + 2 side monitors
// Fan Hub: 1 watch panel

// PIP card for avatar/memory shares in rooms (non-blocking):
interface PIPCardProps {
  position: 'top-right' | 'top-monitor' | 'side-panel'
  content: MemoryItem | PlaylistItem
  autoClose: number  // ms, default 10000
  reactions: string[]  // ['❤️','🔥','👏','😂']
  // MUST NOT block: avatars, chat, lobby wall, cameras, performer panel
}
```

**WHERE PIP monitors go:**
- Admin hubs (all 4): 1 large + 4 small independent
- Performer hub: 1 large + 2 side
- Fan hub: 1 watch panel
- Live rooms: PIP card (top-right, non-blocking, auto-dismiss 10s)

### 2.4 FAN HUB — COMPLETE COMPONENT LIST

```
Route: /hub/fan — MUST contain ALL of these:

CURRENTLY MISSING:
❌ Avatar lobby entry → AudienceScene fan view
❌ PIP video monitor → PIPMonitor.tsx
❌ Messaging panel (real-time) → MessagingPanel.tsx
❌ Inventory panel → InventoryPanel.tsx
❌ Saved content → SavedContentPanel.tsx
❌ Notification center → NotificationCenter.tsx

ALREADY BUILT (verify visible):
✅ PlaylistDashboardPanel (chevron canister)
✅ MemoryWallContainer (chevron canister)
✅ BroadcastLobbyWall feedType='fans'
✅ FriendsList
✅ TicketsPanel
✅ RewardsPanel + SeasonPassWidget
✅ FanLobbyPanel
```

### 2.5 PERFORMER HUB — COMPLETE COMPONENT LIST

```
Route: /hub/performer — MUST contain ALL of these:

CURRENTLY MISSING:
❌ PIPMonitor (1 large + 4 small, each independent feed)
❌ MessagingPanel in hub
❌ SeasonPassWidget inline
❌ Analytics with real data

ALREADY BUILT (verify visible):
✅ GoLiveStudio
✅ SponsorStampWallCanister (Performer only)
✅ SponsorBubbleOrbitCanister (Performer only)
✅ BookingMapCanister (Performer only)
✅ PlaylistDashboardPanel
✅ MemoryWallContainer
✅ MediaUploadWidget
✅ RevenuePanel (Big Ace payout gate)
```

### 2.6 PRODUCER SUPPLY ENGINE (JAY PAUL SANCHEZ)

```typescript
// CREATE: apps/web/src/lib/engines/ProducerSupplyEngine.ts
// Route: /hub/producer (NOT the admin page)

class ProducerSupplyEngine {
  getMissionBoard(): Mission[]     // What beats platform needs NOW
  getGenreGap(): GenreGap[]        // Which genres undersupplied
  getTrafficLights(): {            // Visual demand indicators
    genre: string
    status: '🟢 Complete' | '🟡 Needed Soon' | '🔴 Needed Immediately'
    available: number
    needed: number
  }[]
  submitBeat(beat: Beat): Promise<void>  // Routes to 8 destinations auto
  getUsageAnalytics(id: string): Stats
  getDemandForecast(): DemandForecast
}

// Beat auto-routing after upload:
// Beat Registry → CompetitionMusicEngine → PlaylistEngine
// → Marketplace → GameShows → Battles → Cyphers → DanceParties
```

### 2.7 COMPETITION MUSIC ENGINE

```typescript
// CREATE: apps/web/src/lib/engines/CompetitionMusicEngine.ts

// Rules by competition type:
// Battle    → Shared beat, locked, everyone on same beat
// Cypher    → Rotating OR shared OR DJ controlled
// Challenge → BYOM (Bring Your Own Music)

// Wire into: apps/web/src/app/api/rooms/create/route.ts
// When createRoom called → CME.resolveBeatSource() → inject playlistId
```

### 2.8 CULTURAL CHALLENGE ENGINE

```typescript
// CREATE: apps/web/src/lib/engines/CulturalChallengeEngine.ts

// Daily auto-generation:
// Monday: Drummer vs Drummer
// Tuesday: Country Singer vs Country Singer
// Wednesday: DJ 80s vs DJ 90s
// Thursday: Classic Rock vs Modern Rock
// Friday: Legends vs Next Wave Rap
// Saturday: Comedy Roast Night
// Sunday: World Dance Party

// Matchup axes: Temporal, Regional, Technological, Stylistic
// Integrates with: CompetitionMusicEngine, ProducerSupplyEngine,
//                  Billboard Wall, Home page, Event Scheduler
```

### 2.9 SEO FIXES

```
1. Submit to Bing Webmaster Tools: https://www.bing.com/webmasters
   (Google indexing ≠ Bing indexing — must submit separately)

2. Verify sitemap.xml: https://themusiciansindex.com/sitemap.xml
   Submit to both Google AND Bing Webmaster Tools

3. Verify robots.txt allows all major crawlers

4. Add to layout.tsx:
   <meta name="description" content="TMI - The Musician's Index">
   <meta property="og:title" content="The Musician's Index">
   <meta name="twitter:card" content="summary_large_image">

5. Add JSON-LD structured data:
   - Organization schema
   - WebSite schema with SearchAction
   - MusicGroup schema for artist profiles
```

### 2.10 AD SLOT FALLBACK LAW

```typescript
// apps/web/src/components/ads/AdRenderer.tsx
// Priority stack (NEVER blank):
const AdSlot = ({ zone, userTier }) => {
  if (userTier === 'DIAMOND' || userTier === 'PLATINUM') return null
  const sponsor = useSponsorSlot(zone)
  if (sponsor?.isActive) return <SponsorContent {...sponsor} />
  const ad = useAdInventory(zone)
  if (ad) return <AdSenseUnit {...ad} />
  return <AdvertiseHereCTA zone={zone} price={getSlotPrice(zone)} />
  // NEVER render: null | empty div | blank space
}
```

---

## PART 3 — BLACKBOX IMPLEMENTATION ORDER

```
PASS 1 (P0 — before new users land):
□ Fix middleware.ts redirects: /dashboard/* → /hub/*
□ Fix Google OAuth → /hub/[role]
□ Remove Fan Theater as default landing
□ Remove legacy utility menu widget
□ Remove Micah admin page, give Diamond account

PASS 2 (P0):
□ Home 1 banner resize — shrink to ~250px, position near orbital wheel
□ Preserve OrbitalWheel, WorldUnderlay, both rails, typewriter

PASS 3 (P1 — before soft launch):
□ Create PIPMonitor.tsx
□ Wire to all 4 admin hubs (1 large + 4 small)
□ Wire to performer hub (1 large + 2 side)
□ Wire to fan hub (1 watch panel)
□ Wire non-blocking PIP card to live rooms

PASS 4 (P1):
□ Fan hub: add avatar lobby, messaging, inventory, notifications, saved content
□ Performer hub: add PIP, messaging, season pass widget, real analytics

PASS 5 (P1):
□ Producer Supply Engine for Jay Paul hub
□ Competition Music Engine
□ Cultural Challenge Engine (daily matchup schedule)

PASS 6 (P1):
□ Profile completion: Fan LIVE NOW section, Performer LIVE NOW + JOIN button
□ All profile CTAs route to real destinations

PASS 7 (P1):
□ Ad slot fallback: sponsor → AdSense → "Advertise Here"
□ Diamond/Platinum = zero ads (enforce in AdRenderer)

PASS 8 (P2):
□ SEO: submit to Bing, verify sitemap, add structured data
□ Final Playwright 43/43 green
□ Full browser runtime test: signup → hub → all panels → no errors
```

---

## PART 4 — PLATFORM LAWS (IMMUTABLE — DO NOT CHANGE)

1. Big Ace approves ALL cash payouts
2. August 8 = Marcel's birthday = contest registration gate
3. Diamond hardcoded: facethebully916@gmail.com + bjmbeat@berntoutglobal.com
4. Micah = Diamond account, NO admin page
5. World Dance Party = DanceArena3D ONLY, NO SEATS
6. Crown = real performer by Challenge Score, NEVER seed order
7. Fan AND Performer both get Memory Wall
8. Sponsor Stamp/Orbit/Booking = Performer ONLY
9. All ad slots: fallback chain, NEVER blank
10. No placeholder pages — every route goes somewhere real
11. Claude = Architect, BlackBox = Wiring (never redesign Claude visuals)
12. One LiveSessionRegistry — no duplicate registries
13. Independent video tile timers — never synchronized
14. PIP monitors never block: avatars, chat, lobby wall, cameras
15. All prices = editable fields, never hardcoded

---

## PART 5 — CANONICAL ROUTE MAP

```
PUBLIC:
/ → /home/1
/home/1 → Home 1 Discovery Cover
/home/1-2 → Home 1-2 Billboard
/home/2 → Home 2 Magazine
/home/3 → Home 3 Live World
/home/4 → Home 4 Marketplace
/home/5 → Home 5 Arena/Sponsors
/games → Games Discovery Network
/games/[id] → Game Overview
/games/[id]/lobby → Game Lobby (AudienceScene)

REDIRECTS (301):
/dashboard/fan → /hub/fan
/dashboard/performer → /hub/performer
/fan/theater → /hub/fan (NOT default)

AUTH:
/auth/signup?role=fan → signup → /hub/fan
/auth/signup?role=artist → signup → /hub/performer
Google OAuth → callback → /hub/[role]

HUBS (auth required):
/hub/fan → Fan Hub (Claude design)
/hub/performer → Performer Hub (Claude design)
/hub/sponsor → Sponsor Hub
/hub/advertiser → Advertiser Hub
/hub/venue → Venue Hub
/hub/producer → Producer HQ (Jay Paul)

ADMIN (admin role required):
/admin/marcel → Marcel Founder Hub
/admin/big-ace → Big Ace CEO Hub
/admin/jay-paul → Jay Paul Producer Hub
/admin/justin → Justin Observer Hub

LIVE:
/live/rooms/[id] → Live room (performer)
/fan/live/[id] → Fan lobby
/battles/live/[id] → Battle room
/cypher/stage?room=[id] → Cypher room
/challenges/[id] → Challenge room
/venues/[id]/rooms/[id] → Venue room
```

---

## PART 6 — FINAL CERTIFICATION CHECKLIST

```
ROUTING:
[ ] /dashboard/fan → /hub/fan ✓
[ ] Google OAuth → /hub/[role] ✓
[ ] Fan Theater NOT default landing ✓
[ ] All game routes → real pages ✓

HOME 1:
[ ] Banner size ~250px, near orbital wheel ✓
[ ] Orbital Wheel visible ✓
[ ] WorldUnderlay animated ✓
[ ] MAGAZINE typewriter loops ✓
[ ] Both rails moving (top LEFT, orbital RIGHT) ✓
[ ] 3 video monitors independent timers ✓

FAN HUB:
[ ] PIP monitor visible ✓
[ ] Avatar lobby entry visible ✓
[ ] Playlist canister (chevron) ✓
[ ] Memory Wall (chevron) ✓
[ ] Messaging (real-time) ✓
[ ] Inventory visible ✓
[ ] No Fan Theater ✓
[ ] No BlackBox panels ✓

PERFORMER HUB:
[ ] PIP monitors (1 large + 4 small) ✓
[ ] Sponsor Stamp Wall ✓
[ ] Sponsor Orbit ✓
[ ] Booking Map ✓
[ ] Messaging ✓

ADS:
[ ] Empty sponsor → AdSense fallback ✓
[ ] Empty ad → "Advertise Here" CTA ✓
[ ] Diamond users see zero ads ✓

SEO:
[ ] Appears in Bing search ✓
[ ] sitemap.xml submitted to Bing ✓

BUILD:
[ ] pnpm build → exit code 0 ✓
[ ] TypeScript 0 errors ✓
[ ] Playwright 43/43 green ✓
[ ] Google signup → /hub/fan → all panels → no console errors ✓
```

---

*TMI_COMPLETE_BUILD_DIRECTIVE_v2.md — Claude, Build Director*  
*BlackBox: wire and test. Do not redesign. Do not rebuild. Just connect.*
