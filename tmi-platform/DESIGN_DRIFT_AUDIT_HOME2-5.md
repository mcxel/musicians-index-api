# DESIGN DRIFT AUDIT — HOME 2, 3, 4, 5
## Blueprint vs. Runtime Implementation
### Audit Date: 2026-06-23

---

## SOURCE OF TRUTH
- **Canonical spec**: `TMI_HOMEPAGE_NETWORK_DIRECTIVE.md` (v7.2 FINAL, Authority: Marcel)
- **Current runtime**: Active pages at `/home/2`, `/home/3`, `/home/4`, `/home/5`
- **Assessment method**: Visual structure + component audit + visual hierarchy comparison

---

## HOME 2 — THE MAGAZINE

### CANONICAL SPEC (What SHOULD exist)
```
Primary Question: "What should I read?"
Primary Color: Gold + Magenta
Structure: 3 Belts (Editorial → Discovery → Marketplace)

BELT 1 — EDITORIAL (Content)
├─ Article Feature: large photo + "ARTICLE FEATURE:" label + title + READ/SHARE buttons
├─ Music News: "LAST HOUR:" ticker — 4 scrolling headlines
├─ Interviews: photo thumbnail + "THE INDEX SPEAKS: Interview with..."
└─ Studio Recaps: "CYPHER HIGHLIGHTS: WEEKLY WRAP-UP"

BELT 2 — DISCOVERY (Curation) [GOLD BG]
├─ Genre Hexagon Cluster: POP/HIP HOP/ROCK/R&B/ELECTRONIC/JAZZ (clip-path hexagons, different colors)
├─ Top 10 Charts: numbered list + artist name + genre
├─ Weekly Playlists: "INDEX PICKS" + LISTEN NOW button
└─ A-Z Artist Directory: BROWSE → button

BELT 3 — MARKETPLACE (Store/Booking/Achievements/Sponsors)
├─ The Store: "Featured Merch" (👕) — SHOP button
├─ Booking Portal: "VENUES WE WORK WITH" — BOOK TALENT button
├─ My Achievements: "CURRENT SCORE: 850 pts"
└─ Sponsor Spotlight: "POWERED BY: [LOGO]" — SPONSOR TMI button

ADDITIONAL (every page):
├─ Nav + Issue header: "ISSUE: CURRENT WEEK" | Weekly Crown Winner badge
├─ Sponsor Reel: scrolls LEFT (Nike, Local Venue, Recording Studio, etc.)
├─ News Lobby Wall: 3 video tiles (Trending stories | Most read | Breaking news)
├─ Stream & Win banner: "Featured on Stream & Win Radio"
└─ Event Reel: scrolls RIGHT
```

### CURRENT RUNTIME (`Home2NewsDeskSurface.tsx`)
```
Actual Structure:
├─ Nav + masthead ✓
├─ Sponsor Reel ✓
├─ Feature grid (2fr 1fr 1fr) [articles/interviews/studio-recaps] ✓
├─ Live Lobby Strip [HOME2LIVE WALL — SHOULD NOT BE HERE] ✗
├─ Billboard Live Wall [BROADCAST WALL — NOT MAGAZINE] ✗
├─ Editorial Rail ✓ (editorial content)
├─ Discovery Rail ✓ (but unclear visual hierarchy)
├─ Premieres Rail ? (not in spec)
├─ Monetization Rail ? (vague, not in spec)
├─ Marketplace Rail ? (not in spec)
├─ Sponsor Article Strip ? (not in spec)
├─ Read Next Rail ? (not in spec)
├─ Trending Issue Rail ? (not in spec)
└─ Event Reel ✓
```

### DRIFT ANALYSIS

| Element | Canonical | Current | Status | Gap |
|---------|-----------|---------|--------|-----|
| **EDITORIAL BELT** | Feature + News + Interviews + Recaps (4-part) | Feature grid only | ✗ INCOMPLETE | News ticker missing, recaps unclear |
| **DISCOVERY BELT** | Genre hexagons + Charts + Playlists + Directory | Single discovery rail | ✗ WEAK | No hexagon cluster, no charts display, no directory |
| **MARKETPLACE BELT** | Store + Booking + Achievements + Sponsors (4 parts) | Monetization rail (unclear) | ✗ MISSING | No clear store, booking, achievements, sponsors display |
| **Live Content** | News Lobby Wall (3 tiles) only | Live Lobby Strip + Billboard Live Wall | ✗ WRONG | **Should not have LIVE rooms — this is MAGAZINE page** |
| **Visual Hierarchy** | 3 distinct belts with clear color/spacing | Unclear belt boundaries | ✗ WEAK | All content blurs together |
| **Sponsor Reel** | Scrolls LEFT, gold text | Present | ✓ OK | |
| **Event Reel** | Scrolls RIGHT | Present | ✓ OK | |

### KEY VIOLATIONS (Priority order)
1. **Live content contamination** — Home 2 has Home3 live room tiles (should be magazine-only)
2. **Missing hexagon genre cluster** — Discovery belt lost its most distinctive visual
3. **No charts/rankings display** — Top 10 disappeared
4. **Marketplace belt vague** — Store, booking, achievements not visually distinct
5. **Editorial belt incomplete** — News ticker missing, recaps unclear
6. **Visual hierarchy collapse** — Can't tell where one belt ends and next begins

---

## HOME 3 — THE LIVE WORLD

### CANONICAL SPEC (What SHOULD exist)
```
Primary Question: "What should I watch?"
Primary Color: Live Red + Cyan
Structure: 2-column main + 12-tile walls + Discovery + Radio/Stages

MAIN ROW (2-column):
├─ LEFT (larger): Main Preview Lobby
│  ├─ Large video player (WebRTC/HLS)
│  ├─ LIVE badge (pulsing red)
│  ├─ Performer name + genre + viewer count
│  ├─ Timer: stream duration
│  └─ Buttons: JOIN ROOM | VIEW PROFILE | TIP 💰
└─ RIGHT: Lobby Wall (8 tiles, 2×4 grid)
   ├─ LIVE badge | viewer count | performer emoji | performer name
   └─ **Independent timers** (no synchronization)

WALLS (12-tile rows):
├─ JOIN RANDOM ROOM: star-shaped CTA (pink→gold gradient, animated float)
├─ Cypher & Fan Lobby Wall: 12 tiles in 2 rows of 6
│  ├─ Row 1: feedType='fans' (independent timers)
│  └─ Row 2: feedType='cypher' (independent timers)
└─ All 12 tiles: staggered timers 1,800–2,100ms each

DISCOVERY & INFRASTRUCTURE:
├─ World Premieres: countdown (HH:MM:SS:FF) + track artwork + progress bar
├─ Event Calendar: Concerts | Saturday | Wednesday (colored pills)
├─ Cypher Arena Gateway: "Go to active 1v1 battle rooms"
├─ Stream & Win Score: "Score 0:50"
├─ Undiscovered Boost: new artist tile
├─ World Dance Party: "Every Friday · All Styles Welcome" — JOIN button
├─ Stream & Win Radio full: DJ booths + Listener count + Requests + Dance rooms
├─ Three Live Stages (3 video panels)
│  ├─ LIVE STAGE A
│  ├─ LIVE STAGE B
│  └─ LIVE STAGE C
├─ Camera System: 7 toggle buttons (Stage | Audience | DJ | Host/MC | Venue | Sponsor | Winner)
├─ Belt Champions: current holder | previous holders | tournament brackets
└─ Event Reel: scrolls RIGHT

DATA: Independent timers on EVERY tile (never synchronized)
```

### CURRENT RUNTIME (`Home3LiveWorldSurface.tsx`)
```
Actual Structure:
├─ Nav + masthead [LIVE WORLD] ✓
├─ Sponsor Reel ✓
├─ Activity Belt header ✓
├─ Main 2-column row ✓ (Preview Lobby + Lobby Wall)
├─ Game Show Audience Wall [NOT IN SPEC] ✗
├─ Activity Belt: Rooms | Burst Rooms layout ✓ (partial)
├─ Audience Cam: Director Windows (partial) ? 
├─ Broadcast Deck Wall ✓ (but unclear purpose)
├─ Audience Field ? (not in spec)
├─ Avatar Mini Preview ? (not in spec)
├─ Main Preview Lobby (different component) ? (duplicate?)
├─ Live Lobby Wall Grid ✓ (3-column: Lobby A, B, C)
├─ Live Events ✓ (matches calendar concept)
├─ Event Calendar Strip ✓
├─ Premiere Rail ✓ (matches world premieres)
├─ Join Rail ? (not in spec)
├─ Occupancy Rail ? (not in spec)
├─ Host Rail ? (not in spec)
├─ Weekly Contest Rail ✓
├─ Winner Replay Wall ✓
├─ Global Live Belt ? (not in spec)
└─ Widget Drawer ✓
```

### DRIFT ANALYSIS

| Element | Canonical | Current | Status | Gap |
|---------|-----------|---------|--------|-----|
| **Main Preview Lobby** | 1 large + 8-tile right wall | Main Preview Lobby present | ✓ PRESENT | But styling may differ |
| **8-tile Lobby Wall** | 2×4, feedType='broadcast', independent timers | Appears present | ✓ PRESENT | Verify timer stagger |
| **12-tile Fan+Cypher Walls** | 2 rows of 6, independent timers | Live Lobby Grid (3-col) | ? UNCLEAR | Different layout (3-col vs 6-col) |
| **JOIN RANDOM ROOM** | Star-shaped, pink→gold gradient, float | Not obvious | ✗ MISSING | No prominent CTA |
| **World Premieres** | Countdown timer (HH:MM:SS:FF) + artwork | Premiere Rail present | ✓ OK | Format unclear |
| **Event Calendar** | Colored pill buttons | Event Calendar Strip | ✓ OK | |
| **World Dance Party** | "Every Friday" prominent section + JOIN button | Not obvious in audit | ✗ MISSING | Need verification |
| **Stream & Win Radio** | Full radio environment (DJ booths, requests) | Global Live Belt? | ? UNCLEAR | Not clearly labeled |
| **Three Live Stages** | 3 video panels, labeled A/B/C | Not obvious | ✗ MISSING | Verify in code |
| **Camera System** | 7 toggle buttons (Stage/Audience/DJ/Host/Venue/Sponsor/Winner) | Not obvious | ✗ MISSING | Verify if exists |
| **Belt Champions** | Current + Previous + Brackets display | Not obvious | ✗ MISSING | |
| **Game Shows** | Not in Home 3 spec | Home3GameShowAudienceWall present | ✗ WRONG LOCATION | Should be Home 5 or separate |

### KEY VIOLATIONS (Priority order)
1. **Game Shows placed on Home 3** — These should be on Home 5 (Command Center) or separate /games page
2. **Missing JOIN RANDOM ROOM CTA** — No prominent "Join random" call-to-action
3. **World Dance Party not prominent** — Should have dedicated section
4. **Layout confusion** — Multiple "lobby wall" components (Grid, Broadcast Deck, etc.)
5. **Missing Camera System** — 7-camera toggle interface not visible
6. **Missing Belt Champions display** — Championship/crown status not shown
7. **Unclear Stream & Win Radio** — Full radio environment not clearly visible

---

## HOME 4 — THE MARKETPLACE

### CANONICAL SPEC (What SHOULD exist)
```
Primary Question: "What can I buy?"
Primary Color: Gold + Purple
Structure: Sponsor Spotlight → Ad Marketplace → Inventory → Analytics → Deals

SPONSOR SPOTLIGHT:
├─ Navigation tabs [1] [2] [3] [4]
└─ Main Billboard: Large product image + "PREMIUM BRAND AD" + Brand Takeover Banner

PREMIUM CAROUSEL (right side):
├─ 3×2 grid (6 tiles)
├─ Featured Brand Campaign
├─ Sponsored Artist Spotlight
├─ Sponsored Event
├─ Artist Spotlight
├─ Video Ad Previews
└─ Interactive Ad Card

AD MARKETPLACE BELT:
├─ Campaign Builder: BUY AD PLACEMENT (magenta) | + NEW CAMPAIGN (cyan)
├─ Audience Targeting: tag cloud (Fan 18-24 | Hip-Hop | DJs | etc.)
├─ Genre Targeting: 3 slider bars
└─ Sponsorship Opportunities: Events ● | Cyphers ● | Livestreams ● (toggles)

INVENTORY & PLACEMENTS:
├─ Placement Index: 10 types with checkboxes
├─ Homepage Banners ✓ | Article Ads ✓ | Profile Ads ✓
├─ Live Overlays ○ | Pre-Roll ○ | Mid-Roll ○
├─ Sponsored Cards ✓ | Newsletter Ads ○ | Store Placements AVAILABLE
└─ Gateway / inventory lock icon

ANALYTICS & PERFORMANCE (7 tiles):
├─ Impressions: 1,234,570 | Clicks: 31,573 | Engagement: $186,733
├─ Watch Time: 00:13:8 | Conversion: 10.52% | Sales: $2,323 | ROI: -0.57%
├─ Demographics chart (age/location)
├─ Page Heatmaps (article, live room)
└─ Top Performing Ads carousel

DEALS & CONTRACTS:
├─ Brand Deals | Sponsorship Offers | Artist Partnerships | Venue Partnerships | Event Sponsors
├─ Contract Manager status
├─ Payment Tracking (Incoming/Outgoing)
├─ Revenue Share (%)
└─ SECURE DEAL GATEWAY (pulsing gold border)

MARKETPLACE LOBBY WALL:
├─ feedType: 'marketplace'
├─ Recent Purchases | Top Selling Beats | Most Purchased Tickets
└─ Stream & Win revenue variant: Top Selling Tracks | Beats | Radio Placements

UNIVERSAL (every page):
├─ Nav + Issue header
├─ Sponsor Reel (scrolls LEFT)
└─ Event Reel (scrolls RIGHT)
```

### CURRENT RUNTIME (`Home4AdMagazine.tsx`)
```
Actual Structure: [NEED TO AUDIT]
- File appears to be Home4AdMagazine, not Home4MarketplacePage
- Primary focus appears to be advertising/magazine rather than marketplace/commerce
- No obvious marketplace/purchase/deal interface visible in component name
```

### DRIFT ANALYSIS

| Element | Canonical | Current | Status | Gap |
|---------|-----------|---------|--------|-----|
| **Sponsor Spotlight** | Tabbed interface [1][2][3][4] | Unknown (need audit) | ? UNCLEAR | |
| **Premium Billboard** | Large product + Brand Takeover | Unknown | ? UNCLEAR | |
| **Premium Carousel** | 3×2 grid of 6 campaign tiles | Unknown | ? UNCLEAR | |
| **Ad Marketplace** | Campaign Builder + Audience/Genre Targeting | Unknown | ? UNCLEAR | |
| **Inventory/Placements** | 10-type index with checkboxes | Unknown | ? UNCLEAR | |
| **Analytics** | 7 metric tiles + charts | Unknown | ? UNCLEAR | |
| **Deals & Contracts** | Brand/Sponsorship/Artist/Venue/Event panels | Unknown | ? UNCLEAR | |
| **Marketplace Lobby Wall** | 3 video tiles (recent/top beats/tickets) | Unknown | ? UNCLEAR | |
| **Page Identity** | "The Marketplace" — Revenue/Commerce focus | Named "AdMagazine" — Magazine/Ads focus | ✗ MISMATCH | **Major naming/purpose drift** |

### KEY VIOLATIONS (Priority order)
1. **File naming mismatch** — Currently `Home4AdMagazine` not `Home4MarketplacePage`
2. **Missing marketplace UI** — Campaign builder, ad targeting, inventory placements not visible
3. **Missing commerce focus** — Should be "buy stuff" not "read ads"
4. **Missing deals/contracts interface** — Revenue tracking, payment oversight not visible
5. **Missing analytics dashboard** — 7-metric performance tracking not visible

---

## HOME 5 — THE COMMAND CENTER

### CANONICAL SPEC (What SHOULD exist)
```
Primary Question: "What can I win?"
Primary Color: Green + Magenta
Structure: Advertisers & Sponsors World + Arena + Rewards

SPONSOR WORLD (top):
├─ Sponsor Spotlight: "YOUR BRAND HERE" — GET FEATURED
├─ Brand Takeover: luxury car + luxury watch + "Brand Takeover Banner"
└─ Sponsored Artist Pre-Roll: video tile + BUY PRE-ROLL AD

AD MARKETPLACE BELT:
├─ Row 1 (4 buttons): BUY AD PLACEMENT | CAMPAIGN BUILDER | AUDIENCE TARGETING | GENRE TARGETING
├─ Row 2 (5 slots): EVENT SPONSORSHIPS | CYPHER SPONSORSHIPS | LIVESTREAM SPONSORSHIPS | ISSUE SPONSORSHIPS | JOIN US
└─ Inventory: 8 placement cards ("PLACE YOUR PRODUCT HERE" for each type)

ANALYTICS & PERFORMANCE (6 tiles):
├─ Impressions: 1.2M+ | Clicks: 35K+ | Engagement: 12% | Watch Time: 1:45
├─ Conversions/Sales | ROI: 150% Avg.
├─ Impressions line chart | Engagement bar chart
├─ Audience Demographics | Heatmaps | Top Performing Ads

ARENA / ACHIEVEMENTS:
├─ Trophy Room: Badges | Championships | XP history
├─ Belt System: current holder + previous holders
├─ Leaderboards: Top Fan | Top Performer | Top Venue | Top Writer | Top Promoter
└─ Season Pass status

CHALLENGES & REWARDS:
├─ Active Challenges (with timers)
├─ XP rewards pipeline
└─ Badge unlock conditions

DEALS & CONTRACTS PAYMENT:
├─ BRAND DEALS | SPONSORSHIP OFFERS
├─ ARTIST PARTNERSHIPS | VENUE PARTNERSHIPS | EVENT SPONSORS
├─ CONTRACT MANAGER — VIEW ACTIVE DEALS
└─ PAYMENT TRACKING / REVENUE SHARE

REWARDS LOBBY WALL:
├─ feedType: 'rewards'
├─ Challenge Winners | XP Leaders | Reward Claims
└─ Stream & Win rewards: Listen 30min → XP | 10hr → Badge | Vote → Rewards

UNIVERSAL:
├─ Nav + Issue header
├─ Sponsor Reel (scrolls LEFT)
└─ Event Reel (scrolls RIGHT)
```

### CURRENT RUNTIME (`Home5BattleCypherSurface.tsx`)
```
Actual Structure:
├─ Nav + masthead [CBC ARENA] ✓
├─ Sponsor Reel ✓
├─ Challenge Economy intro ✓ (partial match to "Challenges & Rewards")
├─ Arena/Battle focus ✓ (matches "Trophy/Leaderboards" concept)
├─ Game Show Audience Wall [NOT IN SPEC] ✗
├─ Battle Density Rail ? (not in spec)
├─ Submission Pulse Rail ✓ (matches "challenges")
├─ Challenge section ✓ (matches spec partially)
├─ Battles section ✓ (matches arena concept)
├─ Ciphers section ✓ (matches arena concept)
├─ Weekly Contest Rail ✓
├─ Winner Replay Wall ✓
├─ Global Live Belt ? (not in spec)
└─ Event Reel ✓
```

### DRIFT ANALYSIS

| Element | Canonical | Current | Status | Gap |
|---------|-----------|---------|--------|-----|
| **Sponsor World** | Sponsor Spotlight + Brand Takeover + Pre-Roll | Not obvious | ✗ MISSING | Audit needed |
| **Ad Marketplace** | 4-button row + 5 sponsorship slots + 8 inventory cards | Not obvious | ✗ MISSING | Audit needed |
| **Analytics Dashboard** | 6 metric tiles + charts + demographics | Not obvious | ✗ MISSING | Audit needed |
| **Arena/Trophy Room** | Badges | Championships | XP history | Battles section present | ✓ PARTIAL | Details unclear |
| **Belt System** | Current + Previous holders display | Not obvious | ✗ MISSING | Verify if present |
| **Leaderboards** | Top Fan/Performer/Venue/Writer/Promoter | Not obvious | ✗ MISSING | Verify if present |
| **Challenges** | Active Challenges + XP pipeline + Badges | Challenge section present | ✓ PARTIAL | Details unclear |
| **Deals/Contracts** | Brand/Sponsorship/Artist/Venue/Event | Not obvious | ✗ MISSING | Audit needed |
| **Rewards Lobby Wall** | 3 video tiles (Winners | XP | Claims) | Not obvious | ✗ MISSING | Audit needed |
| **Game Shows** | Not in Home 5 spec | Home5GameShowAudienceWall present | ✗ WRONG | Should be Home 3 or separate |

### KEY VIOLATIONS (Priority order)
1. **Missing Sponsor/Ad world** — Home 5 should have deeper sponsor interface (currently appears arena-focused)
2. **Missing Analytics Dashboard** — 6-metric tracking not visible
3. **Missing Deals/Contracts Interface** — Payment tracking, revenue shares not visible
4. **Missing Leaderboards** — Top Fan/Performer/Venue/Writer/Promoter not displayed
5. **Missing Belt System display** — Crown/championship belt holders not shown
6. **Arena/Challenges incomplete** — Present but missing details

---

## SUMMARY: DRIFT SEVERITY

### By Page (Critical → Moderate → Minor)

**HOME 2 — CRITICAL**
- Live content contamination (wrong page)
- Discovery belt incomplete (no hexagons)
- Marketplace belt vague
- Visual hierarchy collapse

**HOME 3 — HIGH**
- Game shows misplaced
- JOIN RANDOM ROOM missing
- World Dance Party not prominent
- Belt Champions missing
- Camera System missing

**HOME 4 — CRITICAL**
- Entire marketplace architecture unclear
- File naming wrong (AdMagazine vs Marketplace)
- Commerce focus missing
- Analytics missing

**HOME 5 — HIGH**
- Sponsor/Ad world missing
- Analytics missing
- Deals/Contracts missing
- Leaderboards missing

---

## CONVERGENCE PRIORITY (Next Steps)

1. **HOME 2** — Remove live content, rebuild discovery hexagons, clarify marketplace belt
2. **HOME 3** — Audit game shows placement, add JOIN RANDOM CTA, verify world dance party, add belt champions
3. **HOME 4** — Rename component, rebuild entire ad marketplace/inventory/analytics interface
4. **HOME 5** — Add sponsor/ad depth, add analytics, add deals/contracts, add leaderboards

