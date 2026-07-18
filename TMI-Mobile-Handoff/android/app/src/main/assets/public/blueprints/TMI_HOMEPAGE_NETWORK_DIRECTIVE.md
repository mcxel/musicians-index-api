# TMI HOMEPAGE NETWORK DIRECTIVE
### The Musician's Index — Complete 6-Channel Build Spec
### For: Blackbox AI · Version: 7.2 FINAL
### Authority: Marcel (Founder) · Certified by: Claude (Visual Architect)

---

## GOLDEN RULE — ONE QUESTION PER PAGE

| Page | Identity | Question It Answers | Primary Color |
|------|----------|---------------------|---------------|
| Home 1 | The Cover | What is happening? | Pink + Gold |
| Home 1-2 | The Index | Who is here? | Cyan + Gold |
| Home 2 | The Magazine | What should I read? | Gold + Magenta |
| Home 3 | The Live World | What should I watch? | Live Red + Cyan |
| Home 4 | The Marketplace | What can I buy? | Gold + Purple |
| Home 5 | The Command Center | What can I win? | Green + Magenta |

---

## PLATFORM LAWS (NON-NEGOTIABLE)

1. Big Ace must approve ALL cash payouts
2. August 8 = Marcel's birthday — hardcoded as contest registration gate
3. Diamond tier hardcoded: `facethebully916@gmail.com` + `bjmbeat@berntoutglobal.com`
4. World Dance Party = DanceArena3D ONLY — NO SEATS EVER
5. Crown holder = real performer by Challenge Score — NEVER seed order
6. No empty panels — every slot uses the fallback chain
7. No fake metrics in production — show 0 or — if no real data
8. Seed/maintenance accounts NEVER hold competitive positions
9. MODIFY FIRST → REPLACE SECOND → REBUILD LAST

---

## UNIVERSAL COMPONENTS (REQUIRED ON EVERY PAGE)

### 1. Sponsor Reel (top strip, every page)
```tsx
// File: apps/web/src/components/ads/SponsorReel.tsx
// Rotates every 15 seconds
// Priority: Internal inventory → Premium sponsor → AdSense → "Advertise Here" CTA
// Never renders blank
interface SponsorReelProps {
  zone: 'home1' | 'home1-2' | 'home2' | 'home3' | 'home4' | 'home5'
  adFree?: boolean // true for Diamond/Platinum tier
}
```
Visual: horizontal scrolling strip, gold text on dark background, scrolls LEFT

### 2. Event Reel (bottom strip, every page)
```tsx
// File: apps/web/src/components/events/EventReel.tsx
// Shows: Tonight | Tomorrow | This Weekend | Next Month | 6 Months Out
// Data source: EventEngine (promoters/venues create events → auto-populates)
// Scrolls RIGHT (opposite to sponsor reel)
```

### 3. BroadcastLobbyWall (universal, different feedType per page)
```tsx
// File: apps/web/src/components/media/BroadcastLobbyWall.tsx
interface BroadcastLobbyWallProps {
  feedType: 
    | 'performers'    // Home 1 — Discovery Wall
    | 'people'        // Home 1-2 — People Wall  
    | 'news'          // Home 2 — News Wall
    | 'broadcast'     // Home 3 — Broadcast Wall (main)
    | 'fans'          // Home 3 — Fan Lobby Wall
    | 'cypher'        // Home 3 — Cypher Wall
    | 'marketplace'   // Home 4 — Marketplace Wall
    | 'rewards'       // Home 5 — Rewards Wall
  columns: 3 | 4 | 6  // 4 for 8-tile wall, 6 for 12-tile wall
  rows: 1 | 2
  tileIntervals?: number[] // MUST be independent per tile — never synchronized
}

// INDEPENDENT TIMER LAW:
// Each tile gets its OWN setInterval — never shared
// Tile timers must be staggered in start time by ~2300ms each
// Example intervals: [9400, 13100, 16800, 11200, 17500, 14300, 10600, 15900, 12400, 18200, 9800, 16100]
```

Fallback chain per tile:
```
Live WebRTC/HLS feed
  ↓ (if offline)
Recorded video asset
  ↓ (if none)
Profile video
  ↓ (if none)
Profile image
  ↓ (if none)
Genre default avatar
  ↓ (if none)
Recruitment CTA ("Go Live", "Join Room", "Advertise Here")
```
**NEVER render a black box or empty div.**

### 4. Breaking News Strip
```tsx
// File: apps/web/src/components/news/BreakingNewsStrip.tsx
// Shows: Voting Live | World Premiere | New Artist Joined | Tickets Selling Fast
// Scrolls LEFT, red/magenta on dark bg
```

### 5. Stream & Win Radio Mini (per-page variant)
```tsx
// File: apps/web/src/components/radio/StreamWinWidget.tsx
interface StreamWinWidgetProps {
  variant: 'mini' | 'banner' | 'full' | 'revenue' | 'rewards'
  // mini → Home 1: Now Playing + Current DJ + Join button
  // banner → Home 2: Featured on Stream & Win
  // full → Home 3: Full radio environment (DJ booths, listener count, live requests)
  // revenue → Home 4: Top Selling Tracks, Top Selling Beats
  // rewards → Home 5: Listen 30min = XP, Listen 10hr = Badge
}
```

### 6. AdRenderer (unified ad slot)
```tsx
// File: apps/web/src/components/ads/AdRenderer.tsx
interface AdRendererProps {
  zone: 'leaderboard' | 'sidebar' | 'in-feed' | 'billboard'
  page: string
  hideForTiers?: string[] // ['DIAMOND', 'PLATINUM']
}
// Priority stack: Internal inventory → Premium sponsor → AdSense → "Advertise Here" CTA
```

---

## HOME 1 — THE COVER PAGE

**File:** `apps/web/src/app/home/1/page.tsx`  
**Component:** `Home1CoverPage.tsx`  
**Purpose:** First impression. Discovery. Energy. Get users excited.

### Layer Stack (Z-index — PROTECTED)
```
z-0:  WorldUnderlay (animated — NEVER REMOVE)
z-5:  PageShell
z-10: OrbitalWheel (PROTECTED ASSET — do not redesign)
z-20: MagazineBelt / SponsorBelt / DiscoveryBelt
z-50: HUD / Nav / Notifications
z-100: Chevrons / Modals
```

### Visual Structure (top to bottom)
1. **Beta bar** — red, "TMI BETA SEASON · Founding member"
2. **Nav** — TMI logo | page numbers 1 / 1-2 / 2 / 3 / 4 / 5 | Login + Sign Up
3. **Breaking News Strip** — scrolls LEFT (gold text)
4. **Masthead section**
   - "THE MUSICIAN'S INDEX" — per-letter color cycling (white→gold→green→red, staggered animation-delay)
   - "MAGAZINE" — typewriter animation: types in at 110ms/letter, holds 1 second, fades out, loops every ~3 seconds
   - Status badges: VOTING LIVE (pulsing), VOTES count (ticking), CROWN UPDATING
   - Challenge banner slider (◀/▶)
   - Action buttons: JOIN FREE | LOGIN | CHALLENGE SONG | CYPHER ARENA | MAGAZINE | SPONSOR | ADVERTISE
5. **3-Rail Orbital Zone**
   - LEFT: Toggleable side panel — tabs: PROMO / VENUE / ADS — with performer images
   - CENTER: WorldUnderlay scrolling behind OrbitalWheel in OPPOSITE direction
   - RIGHT: Toggleable side panel — tabs: RANKS / ADS / PROMO — with performer images
   - **WorldUnderlay** (behind orbital, OPPOSITE direction to top rail): scrolling tabloid panels
     - WHO TOOK THE CROWN (yellow bg)
     - BATTLE NIGHT CHAMPION (hot pink bg)
     - WHO'S GOT THE BARS? (cyan bg)
     - CHALLENGE THE CROWN (black/gold bg)
     - DJ BATTLE NIGHT (purple bg)
6. **Opposite-direction news rail** (behind orbital, scrolls RIGHT — old school news report feel)
7. **Video Monitors** — exactly 3 tiles with INDEPENDENT timers
   - Tile 0: interval 9,500ms
   - Tile 1: interval 13,200ms
   - Tile 2: interval 17,000ms
   - Start times offset by 2,300ms each — NEVER synchronized
8. **Sponsor Ad Rail** — 3 slots: Beats By TMX | BerntoutStudio AI | Advertise From $25
9. **News Belt + Interviews** — 2-column
10. **CTA buttons** — JOIN TMI | READ MAGAZINE | VOTE LIVE | JOIN BATTLE | SEE ROOMS | CYPHER | SPONSOR
11. **Live stats bar** (ticking): LIVE venues | WATCHING | TIPS | VOTES
12. **Bottom nav** — SIGN IN | + SUBMIT | OPEN GUIDE | BETA FEEDBACK
13. **Event Reel** — scrolls RIGHT

### Belt Champions (Current champions visible on Home 1)
```
Hip-Hop Champion | Comedy Champion | Dance Champion | DJ Champion
```

### Live Lobby Wall — Discovery Wall
```
feedType: 'performers'
Shows: Going live now | Starting soon | Trending | Most tipped | Most viewed
```

---

## HOME 1-2 — THE INDEX (BILLBOARD)

**File:** `apps/web/src/app/home/1-2/page.tsx`  
**Component:** `Home12BillboardPage.tsx`  
**Purpose:** Find people. Talent directory. Rankings truth.

### Reference Image: Tmi_Homepage_1-2.jpg
Open book magazine spread — two columns side by side, book spine in center

### Visual Structure
1. **Nav** (same as all pages)
2. **Sponsor Reel** — scrolls LEFT
3. **Genre selector strip** — Hip-Hop | Electronic | R&B | DJs | Comedy | Dance | Bands | Producers | Country | Rock | Comedy | Magic | Poetry | Spoken Word | Instrumental
4. **Open Book Spread**
   - CSS: perspective book effect, spine shadow in center
   - LEFT PAGE: "TOP TEN: [GENRE A]" — teal header on cyan background
   - RIGHT PAGE: "TOP TEN: [GENRE B]" — gold header on gold background
   - **Genre rotation every 8 seconds** with riseUp animation (translateY from 22px to 0, opacity 0 to 1)
   - Each card: face photo (👤 avatar) | rank badge (gold/silver/bronze for top 3) | name | genre | LIVE dot | VIEW ACCOUNT button | VOTE button
   - Cards show: Face | Tier | XP | Rank | Location | Live status
5. **People Wall** (below book)
   - feedType: 'people'
   - Shows: Who joined today | Fastest growing profiles | New signups
6. **Stream & Win** mini banner
7. **Event panels** — TONIGHT | TOMORROW | THIS FRIDAY
8. **Event Reel** — scrolls RIGHT

### Card specification
```tsx
interface BillboardCard {
  rank: number
  profilePhoto: string // fallback to emoji avatar
  displayName: string
  genre: string
  tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  xp: number
  location: string
  isLive: boolean
  viewers?: number
}
```

### Data source
```
BillboardEngine → getTopPerformersByGenre(genre, limit=10)
Route: /api/billboard/rankings?genre=hip-hop&limit=10
```

---

## HOME 2 — THE MAGAZINE

**File:** `apps/web/src/app/home/2/page.tsx`  
**Component:** `Home2MagazinePage.tsx`  
**Purpose:** Consume content. Rolling Stone meets Billboard.

### Reference Image: Tmi_Homepage_2.png
Three distinct belts: Editorial → Discovery → Marketplace

### Visual Structure
1. **Nav + Issue header** — "ISSUE: CURRENT WEEK" | Weekly Crown Winner badge
2. **Sponsor Reel** — scrolls LEFT (sponsors: Nike, Local Venue, Recording Studio, Restaurant, Tour Company)
3. **Editorial Belt** (Content)
   - Article Feature: large photo + "ARTICLE FEATURE:" label + title + READ / SHARE buttons
   - Music News: "LAST HOUR:" ticker — 4 scrolling headlines
   - Interviews: photo thumbnail + "THE INDEX SPEAKS: Interview with..."
   - Studio Recaps: "CYPHER HIGHLIGHTS: WEEKLY WRAP-UP"
4. **Discovery Belt** (Curation) — gold background
   - Genre Hexagon Cluster: POP / HIP HOP / GENRE CLUSTER / ROCK / R&B / ELECTRONIC / JAZZ (hex shape, clip-path, each a different color)
   - Top 10 Charts: numbered list with artist name + genre
   - Weekly Playlists — INDEX PICKS — LISTEN NOW button
   - A-Z Artist Directory — BROWSE → button
5. **Platform & Marketplace Belt**
   - The Store — Featured Merch (👕) — SHOP button
   - Booking Portal — "VENUES WE WORK WITH" — BOOK TALENT button
   - My Achievements — "CURRENT SCORE: 850 pts"
   - Sponsor Spotlight — "POWERED BY: [RETRO LOGO]" — SPONSOR TMI button
6. **News Lobby Wall** — 3 video tiles
   - feedType: 'news'
   - Shows: Trending stories | Most read articles | Breaking news
7. **Stream & Win** banner variant — "Featured on Stream & Win Radio"
8. **Event Reel** — scrolls RIGHT

### Data sources
```
CMS/ArticleAPI → getLatestArticles(limit=10)
BillboardEngine → getTopCharts(limit=10)
SponsorEngine → getActiveSponsorSpotlights()
```

---

## HOME 3 — THE LIVE WORLD

**File:** `apps/web/src/app/home/3/page.tsx`  
**Component:** `Home3LiveWorldPage.tsx`  
**Purpose:** Watch live content. The Network. The biggest page.

### Reference Image: Tmi_Homepage_3.png
Main Preview Lobby + 8-tile Lobby Wall + Discovery Belt

### Visual Structure
1. **Nav + Issue header**
2. **Sponsor Reel** — scrolls LEFT — "Sponsor a Room" CTA
3. **Activity Belt** header label — "LIVE WORLD (ACTIVITY BELT)"
4. **Main 2-column row:**
   - LEFT (larger): Main Preview Lobby
     - Large video player (WebRTC/HLS)
     - LIVE badge (pulsing red)
     - Performer name + genre + viewer count
     - Timer showing stream duration
     - Buttons: JOIN ROOM | VIEW PROFILE | TIP 💰
   - RIGHT: Lobby Wall
     - 8 tiles in 2×4 grid
     - feedType: 'broadcast'
     - Each tile: LIVE badge | viewer count | performer emoji | performer name
     - **Independent timers** — no two tiles change at same interval
5. **JOIN RANDOM ROOM** — star-shaped CTA button, gradient bg (pink→gold), animated float
6. **Cypher & Fan Live Lobby Wall** — 12 tiles in 2 rows of 6
   - Row 1 feedType: 'fans'
   - Row 2 feedType: 'cypher'
   - ALL 12 tiles have independent timers staggered by 1,800–2,100ms each
7. **Sponsor Ad Rail** — "SPONSORED LIVE STREAM — Your brand in the Live World"
8. **Discovery Belt** (Trends & Events) — gold label
   - World Premieres: countdown timer (HH:MM:SS:FF) + track artwork + progress bar
   - Event Calendar: Concerts | Saturday | Wednesday (colored pills)
   - Cypher Arena Gateway: gateway icon + "Go to active 1v1 battle rooms"
   - Stream & Win Score: "Score 0:50"
9. **Undiscovered Boost** — new artist tile
10. **World Dance Party** — "Every Friday · All Styles Welcome" — JOIN DANCE FLOOR button
11. **Stream & Win Radio** full variant — "WORLD RADIO STATION"
    - DJ booths
    - Listener count
    - Live requests
    - Dance rooms
    - Radio host camera
12. **Three Live Stages** (future 3D, currently 3 video panels)
    - LIVE STAGE A
    - LIVE STAGE B
    - LIVE STAGE C
13. **Camera System** — 7 camera views (toggle buttons):
    - Camera 1: Stage
    - Camera 2: Audience
    - Camera 3: DJ
    - Camera 4: Host/MC
    - Camera 5: Venue overview
    - Camera 6: Sponsor area
    - Camera 7: Winner spotlight
14. **Belt Champions** — Current belt holder | Previous holders | Tournament brackets
15. **Event Reel** — scrolls RIGHT

### Data sources
```
BroadcastEngine → getLiveRooms(feedType, limit)
DailyAPI → getActiveStreams()
EventEngine → getUpcomingEvents()
CrownGovernor → getCurrentBeltHolder()
```

### 3D / Avatar future spec (architecture must support):
```
Avatar World → 3D Venues → 3D Audience → 3D Seats
Silent Disco: users choose DJ A / DJ B / DJ C
Festival Grounds: multiple stages
VIP Dance Lounge: Diamond/Platinum members only
```

---

## HOME 4 — THE MARKETPLACE

**File:** `apps/web/src/app/home/4/page.tsx`  
**Component:** `Home4MarketplacePage.tsx`  
**Purpose:** Generate revenue. The Money Page.

### Reference Image: Tmi_Homepage_4.png
Sponsor Spotlight → Ad Marketplace → Inventory → Analytics → Deals

### What users can buy
```
Tickets | Beats | Instrumentals | Merch | NFTs | Season Passes | Backstage Passes | VIP Packages
```

### Visual Structure
1. **Nav + Issue header**
2. **Sponsor Reel** — scrolls LEFT
3. **Sponsor Spotlight section** — navigation [1] [2] [3] [4] tabs
4. **Main Billboard + Premium Carousel** (2-column)
   - LEFT: Main Billboard Ad
     - Large product image (🎧 headphones example)
     - "PREMIUM BRAND AD" label
     - BRAND TAKEOVER BANNER (gradient strip: pink→purple→cyan)
     - BUY THIS SLOT | PREVIEW buttons
   - RIGHT: Premium Ad Carousel — 3×2 grid (6 tiles)
     - Featured Brand Campaign
     - Sponsored Artist Spotlight
     - Sponsored Event
     - Artist Spotlight
     - Video Ad Previews
     - Interactive Ad Card
5. **Advertising Marketplace belt** (magenta label)
   - Campaign Builder: BUY AD PLACEMENT (magenta) | + NEW CAMPAIGN (cyan)
   - Audience Targeting: tag cloud (Fan 18-24 | Hip-Hop | Live Viewers | DJs)
   - Genre Targeting: 3 slider bars
   - Sponsorship Opportunities: Events ● | Cyphers ● | Livestreams ● (toggle switches)
6. **Inventory & Placements belt**
   - Placement Index: 10 placement types with checkboxes
     - Homepage Banners ✓ | Article Page Ads ✓ | Artist Profile Ads ✓
     - Live Overlays ○ | Video Pre/I-Roll ○ | Video Pre/Mid-Roll ○
     - Sponsored Cards ✓ | Newsletter/Push/Email Ads ○ | Store Placements AVAILABLE
   - Gateway / INVENTORY lock icon
7. **Analytics & Performance** — 7 metric tiles
   ```
   Impressions: 1,234,570 | Clicks: 31,573 | Engagement: $186,733
   Watch Time: 00:13:8 | Conversion Rate: 10.52% | Sales: $2,323 | ROI: -0.57%
   ```
   - Audience Demographics chart (age/location)
   - Page Heatmaps (article, live room)
   - Top Performing Ads carousel
8. **Deals & Contracts**
   - Progress bars: Brand Deals | Sponsorship Offers | Artist Partnerships | Venue Partnerships | Event Sponsors
   - Contract Manager status
   - Payment Tracking (Incoming/Outgoing)
   - Revenue Share (%)
   - SECURE DEAL GATEWAY (pulsing gold border)
9. **Marketplace Lobby Wall**
   - feedType: 'marketplace'
   - Shows: Recent Purchases | Top Selling Beats | Most Purchased Tickets
10. **Stream & Win revenue variant** — Top Selling Tracks | Top Selling Beats | Top Selling Radio Placements
11. **Event Reel** — scrolls RIGHT

### Data sources
```
AdManager → getActiveCampaigns(), getPlacementInventory()
StripeEngine → getSalesMetrics()
SponsorEngine → getDeals()
BeatMarketplace → getTopSellingBeats()
```

---

## HOME 5 — THE COMMAND CENTER (ARENA + SPONSORS DEEP)

**File:** `apps/web/src/app/home/5/page.tsx`  
**Component:** `Home5CommandCenterPage.tsx`  
**Purpose:** Retention. Community. Wins, achievements, rewards.

### Reference Image: Tmi_Homepage_5.png
Advertisers & Sponsors World + deep placement system + analytics

### What users can win / do
```
Challenges | Games | XP | Achievements | Rewards | Missions | Rankings
Top Fan | Top Performer | Top Venue | Top Writer | Top Promoter
```

### Visual Structure
1. **Nav + Issue header** — "ADVERTISERS & SPONSORS WORLD | PREMIUM ADS SPOTLIGHT"
2. **Sponsor Reel** — scrolls LEFT
3. **Top 3-panel row:**
   - Sponsor Spotlight: "YOUR BRAND HERE: FEATURED CAMPAIGNS" — GET FEATURED button
   - Brand Takeover Billboard: luxury car + luxury watch + "Brand Takeover Banner" strip
   - Sponsored Artist Pre-Roll: video tile + BUY PRE-ROLL AD button
4. **Advertising Marketplace belt** (gold label)
   - Row 1 (4 buttons): BUY AD PLACEMENT | CAMPAIGN BUILDER | AUDIENCE TARGETING | GENRE TARGETING
   - Row 2 (5 slots): EVENT SPONSORSHIPS | CYPHER SPONSORSHIPS | LIVESTREAM SPONSORSHIPS | ISSUE SPONSORSHIPS | JOIN US TO PLUG YOUR PRODUCT
   - "WOULD YOU LIKE TO SEE YOUR ITEM HERE? SIGN IN or CREATE AN ACCOUNT"
5. **Inventory & Placements (Blueprinted)** — 8 placement type cards each showing:
   ```
   "PLACE YOUR PRODUCT HERE"
   ```
   Types: Homepage Banner Slots | Article Page Ads | Artist Profile Ads | Live Room Overlays | Video Pre-Roll | Video Mid-Roll | Sponsor Belts | Store Placement Ads
6. **Analytics & Performance** — 6 metric tiles
   ```
   Impressions: 1.2M+ | Clicks: 35K+ | Engagement: 12% | Watch Time: 1:45 | Conversions/Sales | ROI: 150% Avg.
   ```
   - Interactive charts: Impressions line chart | Engagement bar chart
   - Audience Demographics (interactive)
   - Heatmaps (platform usage overlay)
   - Top Performing Ads
7. **Arena / Achievements section:**
   - Trophy Room: Badges | Championships | XP history
   - Belt System display: current holder + previous holders
   - Leaderboards: Top Fan | Top Performer | Top Venue | Top Writer | Top Promoter
   - Season Pass status
8. **Challenges & Rewards:**
   - Active Challenges (with timers)
   - XP rewards pipeline
   - Badge unlock conditions
9. **Deals & Contracts Payment Dashboard**
   - BRAND DEALS | SPONSORSHIP OFFERS
   - ARTIST PARTNERSHIPS | VENUE PARTNERSHIPS
   - EVENT SPONSORS
   - CONTRACT MANAGER — VIEW ACTIVE DEALS
   - PAYMENT TRACKING / REVENUE SHARE
10. **Rewards Lobby Wall**
    - feedType: 'rewards'
    - Shows: Challenge Winners | XP Leaders | Reward Claims
11. **Stream & Win rewards variant** — "Listen 30 min → Earn XP | Listen 10hr → Unlock Badge | Vote for Songs → Earn Rewards"
12. **Event Reel** — scrolls RIGHT

### Data sources
```
BattleGovernor → getCurrentChallenges(), getWinners()
XPEngine → getLeaderboard()
AchievementEngine → getUserBadges()
SponsorEngine → getActivePlacements()
```

---

## THREE TIME LAYERS (ALL PAGES)

Every page must communicate these three layers:

```
LAYER 1 — LIVE NOW (red/pulsing)
Things happening right now:
- Live concerts
- Live cyphers
- Live comedy battles
- Live dance parties
- Live DJ rooms
- Live Stream & Win broadcasts

LAYER 2 — COMING SOON (gold/countdown)
Tonight 8PM — Monday Night Cypher
Tomorrow — Comedy Showcase
Friday — World Dance Party
Saturday — Beat Producer Battle

LAYER 3 — FUTURE CALENDAR (cyan/calendar)
July Championship
August Talent Festival
September World Dance Finals
October Halloween Showcase
December Year-End Awards
```

Implementation:
```tsx
// File: apps/web/src/components/events/TimeLayerBelt.tsx
interface TimeLayerBeltProps {
  layer: 'live-now' | 'coming-soon' | 'future-calendar'
  page: string
  limit?: number
}
// Data source: EventEngine — auto-populates from promoter/venue/DJ submissions
```

---

## AD PRIORITY STACK (ALL PAGES)

```
Priority 1: Internal inventory (Tickets, Showcases, Merch, Artist promos)
Priority 2: Premium sponsor campaigns (paid direct)
Priority 3: AdSense / partner ads
Priority 4: "Advertise Here" recruitment CTA (NEVER blank)
```

Diamond/Platinum members see NO ads — enforce in `AdRenderer.tsx` via tier check.

---

## BELT & TROPHY SYSTEM VISIBILITY

| Page | What Shows |
|------|-----------|
| Home 1 | Current champions strip (Hip-Hop / Comedy / Dance / DJ) |
| Home 1-2 | Division leaders per genre |
| Home 3 | Full arena: belt holder + previous holders + brackets |
| Home 5 | Trophy room + badges + championship history + XP history |

---

## AVATAR & FACE PIPELINE (Architecture Ready)

One photo upload powers everything:
```
User Photo Upload
    ↓
Face Scan (future: cv2 / MediaDevices.getUserMedia)
    ↓
Face Texture
    ↓
Avatar Profile
    ↓ powers all of:
Profile Card | Lobby Wall tile | Orbital Wheel node | Article author photo | 3D Avatar
```

**Do not build 3D now — just ensure the data model supports it.**  
Store: `profileImageUrl`, `avatarTextureUrl`, `avatarModelUrl` on User

---

## VIDEO CAPTURE SPECIFICATIONS

```tsx
// MediaDevices.getUserMedia constraints
const constraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user'
  },
  audio: true
}

// Fallback chain for getUserMedia failure:
// 1. Try 720p/30fps
// 2. Try 480p/24fps
// 3. Try 360p/15fps
// 4. Show "Camera unavailable" CTA with profile photo

// MediaRecorder API for recording
// WebRTC (Daily.co) for live streaming
// HLS for broadcast playback
```

---

## INDEPENDENT VIDEO TILE TIMER SPEC

```typescript
// This is the LAW. Do not use a shared interval.

const TILE_INTERVALS = [9400, 13100, 16800, 11200, 17500, 14300, 10600, 15900, 12400, 18200, 9800, 16100]
const START_OFFSETS = [0, 2300, 4600, 6900, 9200, 11500, 13800, 16100, 18400, 20700, 23000, 25300]

tiles.forEach((tile, i) => {
  setTimeout(() => {
    setInterval(() => updateTile(i), TILE_INTERVALS[i])
  }, START_OFFSETS[i])
})

// Why: If all tiles start at the same time and run the same interval,
// they all flip simultaneously — this looks broken and amateur.
// Independent timers make the wall feel ALIVE.
```

---

## COMPONENT FILE MAP

```
apps/web/src/
├── app/
│   ├── home/
│   │   ├── 1/page.tsx                          ← Home 1: Cover
│   │   ├── 1-2/page.tsx                        ← Home 1-2: Billboard Index
│   │   ├── 2/page.tsx                          ← Home 2: Magazine
│   │   ├── 3/page.tsx                          ← Home 3: Live World
│   │   ├── 4/page.tsx                          ← Home 4: Marketplace
│   │   └── 5/page.tsx                          ← Home 5: Command Center
│   └── ...
├── components/
│   ├── ads/
│   │   ├── AdRenderer.tsx                      ← Universal ad slot
│   │   ├── SponsorReel.tsx                     ← Scrolling sponsor strip
│   │   └── AdPlacementEngine.ts                ← Priority stack logic
│   ├── media/
│   │   ├── BroadcastLobbyWall.tsx              ← Universal video wall
│   │   ├── LiveVideoPanel.tsx                  ← Single video tile
│   │   └── VideoCapture.tsx                    ← getUserMedia / WebRTC
│   ├── orbital/
│   │   └── OrbitalWheel.tsx                    ← PROTECTED — do not redesign
│   ├── events/
│   │   ├── EventReel.tsx                       ← Bottom event strip
│   │   ├── TimeLayerBelt.tsx                   ← Live Now / Coming Soon / Future
│   │   └── EventCalendar.tsx                   ← Event calendar panel
│   ├── radio/
│   │   └── StreamWinWidget.tsx                 ← Stream & Win (5 variants)
│   ├── navigation/
│   │   └── ChevronNavigation.tsx               ← Global chevrons (HIDDEN: /auth, /api only)
│   ├── news/
│   │   └── BreakingNewsStrip.tsx               ← Breaking news ticker
│   ├── magazine/
│   │   └── TabloidUnderlayPanels.tsx           ← Scrolling tabloid behind orbital
│   └── belts/
│       ├── BroadcastBelt.tsx                   ← Belt container
│       └── BroadcastPanel.tsx                  ← Fixed-size panel (overflow: hidden)
```

---

## BROADCASTPANEL LAW

```tsx
// EVERY visual box on every homepage MUST be a BroadcastPanel
// No feed component may resize, push, overflow, or destroy its container

const BroadcastPanel = styled.div`
  position: relative;
  overflow: hidden;          /* REQUIRED */
  min-height: ${p => p.minHeight}px;
  max-height: ${p => p.maxHeight}px;
  width: 100%;
`
// Children CANNOT expand the panel
// Children CANNOT escape the panel
// No dynamic heights allowed
```

---

## PLAYWRIGHT CERTIFICATION (MUST PASS BEFORE PUSH)

```bash
# Full 43-test suite
pnpm exec playwright test \
  tests/e2e/contest.smoke.spec.ts \
  tests/e2e/navigation.clickthrough.spec.ts \
  tests/e2e/p0_life_support.spec.ts \
  tests/e2e/phase13_5.spec.ts \
  tests/e2e/phase14_onboarding.spec.ts \
  tests/e2e/phase15_4_api_guards.spec.ts \
  tests/e2e/phase15_5_artist_admin.spec.ts \
  tests/e2e/phase15_rbac_boundaries.spec.ts \
  tests/e2e/phase17_3_onboarding_recovery.spec.ts \
  tests/e2e/scanner-checkin.spec.ts \
  --workers=1 --reporter=line

# Auth selectors: id="auth-email" and id="auth-password" (must match in auth/page.tsx)
# API route: /api/auth/login proxies to /api/auth/signin (confirmed)
# phase17_3 expects: /onboarding(\/fan)?$/
# HIDDEN_PATH_PREFIXES = ["/auth", "/api"] — contest routes visible

# Certification: LOCKED until 43/43 green
```

---

## REPORTING FORMAT (AFTER EVERY PASS)

```
Typecheck:        PASS / FAIL
Build:            PASS / FAIL (exit code 0)
Playwright:       XX/43 passed
Auth selectors:   VERIFIED MATCH / MISMATCH
Auth API:         VERIFIED / BROKEN
Chevrons:         VISIBLE on all home routes / MISSING on [route]
Home 1 isolation: Orbital ✓ | Underlay ✓ | No Lobby Wall ✓
Home 3 walls:     8-tile ✓ | 12-tile ✓ | Independent timers ✓
Current blocker:  [specific system blocking launch]
Files changed:    [list]
```

---

## PASS / FAIL CERTIFICATION CHECKLIST

### Home 1 PASS:
- [ ] Orbital Wheel visible immediately on load
- [ ] Artist images visible in wheel nodes
- [ ] WorldUnderlay animated and visible behind wheel
- [ ] Typewriter "MAGAZINE" animation loops (types → holds → disappears → repeats)
- [ ] Two moving rails: top (LEFT) + behind orbital (RIGHT / opposite direction)
- [ ] 3 video monitors with INDEPENDENT timers (not synchronized)
- [ ] Side panels toggle open/close with performer images
- [ ] No full LiveLobbyWall on Home 1
- [ ] Sponsor ad rail present
- [ ] All buttons navigate to real routes

### Home 1-2 PASS:
- [ ] Open book magazine spread (book spine visible)
- [ ] Genre rotation every 8 seconds with riseUp animation
- [ ] 10 compact performer cards per page with face/rank/vote/view
- [ ] Genre buttons switch left+right pages simultaneously
- [ ] Sponsor reel at top

### Home 2 PASS:
- [ ] Three belts present: Editorial | Discovery | Marketplace
- [ ] Genre hexagons render correctly (clip-path polygon)
- [ ] Top 10 Charts data visible
- [ ] News Lobby Wall (3 tiles) visible
- [ ] Stream & Win banner variant visible

### Home 3 PASS:
- [ ] Main Preview Lobby (large video) visible with LIVE badge
- [ ] Lobby Wall: exactly 8 tiles in 2×4 grid
- [ ] Cypher/Fan wall: exactly 12 tiles in 2 rows of 6
- [ ] ALL 20 tiles have independent timers — verified not synchronized
- [ ] JOIN RANDOM ROOM star button visible
- [ ] World Premiere countdown ticking
- [ ] No layout overflow / push

### Home 4 PASS:
- [ ] Sponsor Spotlight [1][2][3][4] nav
- [ ] Main Billboard Ad visible
- [ ] Premium Ad Carousel (6 tiles)
- [ ] Brand Takeover Banner strip
- [ ] Analytics 7-metric row
- [ ] Secure Deal Gateway (pulsing gold border)

### Home 5 PASS:
- [ ] "ADVERTISERS & SPONSORS WORLD" header
- [ ] Brand Takeover Billboard (luxury car)
- [ ] All placement types show "PLACE YOUR PRODUCT HERE"
- [ ] Analytics 6-metric row with charts
- [ ] Deals & Contracts Payment Dashboard

---

*TMI_HOMEPAGE_NETWORK_DIRECTIVE.md — Generated by Claude (Visual Architect)*  
*Applies to: All 6 TMI homepages + universal component system*  
*Status: LOCKED for Soft Launch*
