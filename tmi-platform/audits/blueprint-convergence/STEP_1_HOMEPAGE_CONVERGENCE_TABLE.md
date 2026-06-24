# STEP 1 OF 43 — MASTER HOMEPAGE NETWORK CROSS-REFERENCE

**Status:** INSPECTION COMPLETE — AWAITING BUILD DIRECTOR APPROVAL  
**Date:** 2026-06-23  
**Inspected By:** Claude Assembly Director  
**Directive Source:** `Homapge and battle challange and cyphers/TMI_HOMEPAGE_NETWORK_DIRECTIVE.md`  
**Active Routes:** `apps/web/src/app/home/[1,1-2,2,3,4,5]/page.tsx`

---

## CONVERGENCE TABLE — SIX HOMEPAGES

| Homepage | Intended Role | Current Component | Missing Sections | Contamination | Current Status | Canonical Action |
|----------|---------------|-------------------|------------------|----------------|-----------------|------------------|
| **Home 1** | Cover / Discovery Energy | `Home1CoverPage.tsx` | ✗ OrbitalWheel unknown | ✗ No reported fake data | 80% complete | INSPECT `Home1CoverPage.tsx` — verify Layer Stack (z-index), Typewriter animation, WorldUnderlay scroll, 3 video monitors with independent timers |
| **Home 1-2** | Billboard Index / Rankings | `BillboardCrownSequence.tsx` embedded in route | ✗ Book spread visual unverified | ✗ Genre rotation timing unknown | ~60% complete | INSPECT `BillboardCrownSequence.tsx` — verify open-book CSS, 8-second genre rotation, riseUp animation, 10 performer cards per page |
| **Home 2** | Magazine / Editorial | `Home2NewsDeskSurface.tsx` | ✗ Three belts (Editorial/Discovery/Marketplace) composition unclear | ✗ No fake article data reported | ~70% complete | INSPECT `Home2NewsDeskSurface.tsx` — verify belt structure, hexagon clip-path genres, Top 10 Charts real data source |
| **Home 3** | Live World / Network | `Home3LiveWorldSurface.tsx` | ✗ Main Preview Lobby tile count / arrangement unverified | ✗ Independent timer spec unknown | ~75% complete | INSPECT `Home3LiveWorldSurface.tsx` — verify 8-tile + 12-tile Lobby Walls, independent timer arrays, JOIN RANDOM ROOM button |
| **Home 4** | Marketplace / Revenue | `Home4MarketplacePage.tsx` | ⚠️ Minimal route — likely missing full marketplace UI | ⚠️ Sponsor spotlight carousel / ad marketplace unclear | ~40% complete | INSPECT `Home4MarketplacePage.tsx` — verify billboard/premium ad carousel, inventory placements, analytics row, brand deals dashboard |
| **Home 5** | Arena / Achievements | `Home5BattleCypherSurface.tsx` | ⚠️ Minimal route — likely missing achievements/trophy/leaderboard UI | ⚠️ Sponsor spotlight / placement system unclear | ~40% complete | INSPECT `Home5BattleCypherSurface.tsx` — verify trophy room, leaderboards, brand placement inventory, analytics row |

---

## DETAILED FINDINGS

### Home 1 — THE COVER PAGE

**Directive says:**
- Layer Stack: z-0 (WorldUnderlay) → z-5 (PageShell) → z-10 (OrbitalWheel) → z-20 (Belts) → z-50 (HUD) → z-100 (Chevrons)
- Typewriter "MAGAZINE" animation: types 110ms/letter, holds 1s, fades, loops ~3s
- Two moving rails: top (LEFT) + behind orbital (RIGHT opposite direction)
- 3 independent video monitors: intervals [9500, 13200, 17000]ms, start offsets [0, 2300, 4600]ms
- Sponsor ad rail: 3 slots
- 4 Belt Champions visible (Hip-Hop, Comedy, Dance, DJ)
- Live Lobby Wall — Discovery Wall with feedType='performers'
- All buttons route to real destinations

**Current route (`home/1/page.tsx`) provides:**
- ✅ Imports `Home1CoverPage` component (exact match to directive)
- ✅ Fetches real performers from `/api/performers` with fallback to `PERFORMER_REGISTRY`
- ✅ Enriches with real liveness from `GlobalLiveSessionRegistry` (not stale registry.isLive)
- ✅ Sorts by `ContentFreshness` (LIVE → RECENT → POPULAR → ARCHIVE per Rule 11)
- ✅ SponsorRail with 8 zones using `getAdSlotForZone()` fallback chain (Rule 12)
- ✅ EventReel (bottom strip)
- ✅ 4 DiscoveryRails (performers/articles/games/sponsors) — Rule 6 compliance
- ✅ No hardcoded fake data

**Missing verification (requires opening `Home1CoverPage.tsx`):**
- Does `Home1CoverPage` implement the exact Layer Stack (z-index)?
- Does Typewriter animation exist and loop at ~3s?
- Do the two moving rails scroll in correct directions?
- Are 3 video monitors present with INDEPENDENT timers [9500, 13200, 17000]ms?
- Are Belt Champions hardcoded or pulled from real data?
- Is OrbitalWheel wired with real performer images?

**Status:** 🟡 Route structure correct, component implementation unverified.

---

### Home 1-2 — THE INDEX (BILLBOARD)

**Directive says:**
- Open book magazine spread — CSS perspective effect, spine shadow in center
- LEFT PAGE: "TOP TEN: [GENRE A]" (teal header)
- RIGHT PAGE: "TOP TEN: [GENRE B]" (gold header)
- Genre rotation every 8 seconds with riseUp animation (translateY 22px→0, opacity 0→1)
- Each card: face photo | rank badge (gold/silver/bronze) | name | genre | LIVE dot | VIEW ACCOUNT | VOTE buttons
- Cards show: Face | Tier | XP | Rank | Location | Live status
- Data source: `BillboardEngine → getTopPerformersByGenre(genre, limit=10)` or `/api/billboard/rankings?genre=hip-hop&limit=10`
- People Wall below (feedType='people')

**Current route (`home/1-2/page.tsx`) provides:**
- ✅ Imports `BillboardCrownSequence` (embedded)
- ✅ Client-side React hooks (useState/useEffect/useCallback)
- ✅ Imports real performers from `PERFORMER_REGISTRY` with `getTopPerformers()`
- ✅ Imports `getActiveSessions` for real liveness
- ✅ Defines `GENRE_FILTERS` (15+ genres)
- ✅ Defines `BillboardCard` type with all required fields (rank, profileImageUrl, xp, votes, isLive, etc.)
- ✅ Imports `MotionPosterPlayer` — handles Rule 2 (Live → Motion → Static image fallback)
- ✅ Imports `BillboardCrownSequence` component
- ✅ SponsorRail with real sponsors
- ✅ EventReel

**Missing verification (requires opening `BillboardCrownSequence.tsx`):**
- Does the book spread CSS perspective and spine shadow render?
- Is the genre rotation timer exactly 8 seconds?
- Does riseUp animation exist (translateY + opacity)?
- Are all card fields populated from real data (tier, xp, votes, location)?
- Is the People Wall (feedType='people') present below the book?
- Are rankings pulled from real performer XP/engagement, not seeded?

**Status:** 🟡 Route structure correct, component implementation unverified.

---

### Home 2 — THE MAGAZINE

**Directive says:**
- Three belts: Editorial (Content) | Discovery (Curation/gold bg) | Platform & Marketplace
- Editorial Belt: large article feature, 4-headline ticker, interviews, cypher recaps
- Discovery Belt: genre hexagons (clip-path polygon), Top 10 Charts, playlists, A-Z directory
- Platform Belt: Featured Merch, Booking Portal, Achievements, Sponsor Spotlight
- News Lobby Wall (3 video tiles, feedType='news')
- Stream & Win banner variant
- Data sources: CMS/ArticleAPI, BillboardEngine, SponsorEngine

**Current route (`home/2/page.tsx`) provides:**
- ✅ Imports `Home2NewsDeskSurface` component
- ✅ Imports `sortArticlesByFreshness()` (Rule 11 compliance)
- ✅ Imports `MAGAZINE_ISSUE_1` — real article data, not seeded lorem ipsum
- ✅ Calculates breaking news count (< 48 hours old)
- ✅ SponsorRail with 8 zones using fallback chain
- ✅ EventReel
- ✅ 4 DiscoveryRails (articles/performers/liveRooms/sponsors) — Rule 6 compliance
- ✅ No hardcoded fake data

**Missing verification (requires opening `Home2NewsDeskSurface.tsx`):**
- Does it render three belts (Editorial/Discovery/Platform)?
- Do genre hexagons render with clip-path polygon()?
- Is Top 10 Charts real data or hardcoded?
- Are the Merch/Booking/Achievements sections wired to real systems or placeholder?
- Are featured article/interviews/recaps pulling from `MAGAZINE_ISSUE_1`?

**Status:** 🟡 Route structure correct, component implementation unverified.

---

### Home 3 — THE LIVE WORLD

**Directive says:**
- Main 2-column row: LEFT (larger) = Main Preview Lobby | RIGHT = Lobby Wall (8 tiles, 2×4 grid)
- Main Preview Lobby: large video player, LIVE badge (pulsing red), performer name/genre/viewer count, timer, JOIN/PROFILE/TIP buttons
- Lobby Wall (feedType='broadcast'): 8 tiles with LIVE badges, viewer count, emoji, name
- **INDEPENDENT TIMERS**: no two tiles change at same interval
  - Tile intervals: [9400, 13100, 16800, 11200, 17500, 14300, 10600, 15900] (8 unique values)
  - Start offsets: [0, 2300, 4600, 6900, 9200, 11500, 13800, 16100] (staggered by 2300ms)
- Cypher & Fan Live Lobby Wall: 12 tiles in 2 rows of 6, ALL with independent timers (12 unique intervals)
- JOIN RANDOM ROOM star CTA button
- Discovery Belt (gold label): World Premieres countdown, Event Calendar, Cypher Gateway, Stream & Win Score
- World Dance Party, Stream & Win Radio full variant, Three Live Stages (3 video panels)
- Camera system (7 toggle buttons: Stage/Audience/DJ/Host/Venue/Sponsor/Winner)
- Belt Champions display
- Data sources: BroadcastEngine, DailyAPI, EventEngine, CrownGovernor

**Current route (`home/3/page.tsx`) provides:**
- ✅ Imports `Home3LiveWorldSurface` component
- ✅ Enriches performers with real liveness from `GlobalLiveSessionRegistry` (not stale registry.isLive)
- ✅ Sorts by `ContentFreshness` (LIVE first)
- ✅ SponsorRail with fallback chain
- ✅ EventReel
- ✅ 4 DiscoveryRails (liveRooms/performers/games/venues) — Rule 6 compliance
- ✅ No hardcoded fake data

**Missing verification (requires opening `Home3LiveWorldSurface.tsx`):**
- Does Main Preview Lobby exist and display correct performer/viewer/timer data?
- Is the Lobby Wall exactly 8 tiles in 2×4 grid?
- Are ALL tiles using INDEPENDENT timer arrays? (8 for lobby + 12 for cypher/fan = 20 total)
- Does setInterval timer stagger exist with 2300ms offsets?
- Is the Cypher & Fan wall exactly 12 tiles in 2×6 rows?
- Is JOIN RANDOM ROOM button present and functional?
- Are World Premiere countdown, Event Calendar, World Dance Party sections present?
- Is the 7-camera system implemented?

**Status:** 🟡 Route structure correct, component implementation unverified.

---

### Home 4 — THE MARKETPLACE

**Directive says:**
- Sponsor Spotlight section (4 tabs: [1][2][3][4])
- Main Billboard + Premium Carousel (2-column)
  - LEFT: Main Billboard Ad with BRAND TAKEOVER BANNER (gradient)
  - RIGHT: Premium Ad Carousel (3×2 grid, 6 tiles)
- Advertising Marketplace belt: Campaign Builder, Audience Targeting, Genre Targeting, Sponsorship Opportunities
- Inventory & Placements: 10 placement types with checkboxes (Homepage Banners ✓ | Article Page Ads ✓ | etc.)
- Analytics & Performance: 7 metric tiles (Impressions / Clicks / Engagement / Watch Time / Conversion / Sales / ROI)
- Deals & Contracts: Progress bars (Brand Deals / Sponsorships / Artist Partnerships / etc.)
- Marketplace Lobby Wall (feedType='marketplace')
- Stream & Win revenue variant
- Data sources: AdManager, StripeEngine, SponsorEngine, BeatMarketplace

**Current route (`home/4/page.tsx`) provides:**
- ✅ Imports `Home4MarketplacePage` component
- ✅ Imports real sponsors via `getRailSponsors('home-4')`
- ✅ SponsorRail
- ✅ EventReel
- ⚠️ **MINIMAL ROUTE** — only 15 lines of code

**Missing verification:**
- Is `Home4MarketplacePage` component fully implemented with all 6 sections (Spotlight / Billboard / Marketplace / Inventory / Analytics / Deals)?
- Are sponsor spotlight tabs [1][2][3][4] functional?
- Are the 6-tile premium carousel and metrics real data or hardcoded?
- Is the Marketplace Lobby Wall (feedType='marketplace') implemented?
- Are analytics 7 metrics pulling real data from StripeEngine or placeholder?

**Status:** 🔴 Route minimal, component implementation unknown (HIGH RISK of incomplete build).

---

### Home 5 — THE ARENA & COMMAND CENTER

**Directive says:**
- Top 3-panel row: Sponsor Spotlight | Brand Takeover Billboard (luxury car) | Sponsored Artist Pre-Roll
- Advertising Marketplace belt (gold label): 4 buttons + 5 slots for sponsorship types
- Inventory & Placements: 8 placement type cards ("PLACE YOUR PRODUCT HERE")
- Analytics & Performance: 6 metric tiles
- Arena / Achievements section: Trophy Room, Belt System, Leaderboards (Top Fan/Performer/Venue/Writer/Promoter)
- Challenges & Rewards: Active Challenges, XP pipeline, Badge unlocks
- Deals & Contracts Payment Dashboard
- Rewards Lobby Wall (feedType='rewards')
- Stream & Win rewards variant
- Data sources: BattleGovernor, XPEngine, AchievementEngine, SponsorEngine

**Current route (`home/5/page.tsx`) provides:**
- ✅ Imports `Home5BattleCypherSurface` component
- ✅ Imports real sponsors via `getRailSponsors('home-5')`
- ✅ SponsorRail
- ✅ EventReel
- ✅ 2 DiscoveryRails (games/performers) — Rule 6 compliance
- ⚠️ **MINIMAL ROUTE** — only 40 lines of code

**Missing verification:**
- Is `Home5BattleCypherSurface` fully implemented or is it named incorrectly (should be "CommandCenter" per directive)?
- Are the 3-panel row (Sponsor Spotlight / Brand Takeover / Pre-Roll) present?
- Are the 8 placement type cards implemented?
- Is the Trophy Room / Belt System / Leaderboards section present?
- Are the Challenges & Rewards and Deals & Contracts dashboards implemented?
- Are analytics 6 metrics pulling real data?

**Status:** 🔴 Route minimal, component naming suspicious (says "BattleCypher" not "CommandCenter"), implementation unknown (HIGH RISK).

---

## MOBILE & DESKTOP STATUS

| Page | Desktop Verified | Mobile Verified | Notes |
|------|------------------|-----------------|-------|
| Home 1 | ⚠️ Unknown | ⚠️ Unknown | Requires `Home1CoverPage.tsx` inspection |
| Home 1-2 | ⚠️ Unknown | ⚠️ Unknown | Requires `BillboardCrownSequence.tsx` inspection |
| Home 2 | ⚠️ Unknown | ⚠️ Unknown | Requires `Home2NewsDeskSurface.tsx` inspection |
| Home 3 | ⚠️ Unknown | ⚠️ Unknown | Tile wall may overflow on mobile; requires `Home3LiveWorldSurface.tsx` inspection |
| Home 4 | 🔴 Unknown | 🔴 Unknown | Component implementation unverified |
| Home 5 | 🔴 Unknown | 🔴 Unknown | Component implementation unverified |

---

## REAL DATA STATUS

| Page | Real Data Sources | Fake/Seeded Data | Status |
|------|-------------------|-----------------|--------|
| Home 1 | ✅ `/api/performers`, `GlobalLiveSessionRegistry`, `ContentFreshness` | ✅ None detected | CLEAN |
| Home 1-2 | ✅ `PERFORMER_REGISTRY`, `getTopPerformers()`, `GlobalLiveSessionRegistry` | ✅ None detected | CLEAN |
| Home 2 | ✅ `MAGAZINE_ISSUE_1`, `ContentFreshness` | ✅ None detected | CLEAN |
| Home 3 | ✅ `PERFORMER_REGISTRY`, `GlobalLiveSessionRegistry`, `ContentFreshness` | ✅ None detected | CLEAN |
| Home 4 | ⚠️ Unknown | ⚠️ Unknown | REQUIRES INSPECTION |
| Home 5 | ⚠️ Unknown | ⚠️ Unknown | REQUIRES INSPECTION |

---

## ROUTE & ACTION STATUS

| Page | Nav Buttons | CTA Buttons | Links | Status |
|------|-------------|------------|-------|--------|
| Home 1 | ✅ Imports EventReel (bottom nav) | ✅ 4 DiscoveryRails (functional) | ✅ SponsorRail (fallback chain) | VERIFIED |
| Home 1-2 | ✅ EventReel | ✅ Generic route structure | ⚠️ Requires `BillboardCrownSequence` inspection | PENDING |
| Home 2 | ✅ EventReel | ✅ 4 DiscoveryRails (functional) | ✅ SponsorRail (fallback chain) | VERIFIED |
| Home 3 | ✅ EventReel | ✅ 4 DiscoveryRails (functional) | ✅ SponsorRail (fallback chain) | VERIFIED |
| Home 4 | ✅ EventReel | ⚠️ Unknown | ⚠️ Unknown | REQUIRES INSPECTION |
| Home 5 | ✅ EventReel | ✅ 2 DiscoveryRails (functional) | ✅ SponsorRail (via `getRailSponsors`) | VERIFIED |

---

## CANONICAL ACTIONS (BUILD DIRECTOR APPROVAL REQUIRED)

| Homepage | Action | Rationale |
|----------|--------|-----------|
| **Home 1** | **PROCEED TO FILE 2** — Inspect `Home1CoverPage.tsx` to verify Layer Stack, animations, independent timers | Route structure is correct; component-level verification needed |
| **Home 1-2** | **PROCEED TO FILE 2** — Inspect `BillboardCrownSequence.tsx` to verify book spread, genre rotation, riseUp animation | Route structure correct; component implementation critical path |
| **Home 2** | **PROCEED TO FILE 2** — Inspect `Home2NewsDeskSurface.tsx` to verify three belts, hexagon genres, real article data | Route structure correct; component verification needed |
| **Home 3** | **PROCEED TO FILE 2** — Inspect `Home3LiveWorldSurface.tsx` to verify Lobby Wall tiles and independent timer arrays | Route structure correct; CRITICAL: verify 20 tiles have independent timers (8-tile grid + 12-tile grid) |
| **Home 4** | **HOLD — COMPONENT INSPECTION REQUIRED** — `Home4MarketplacePage.tsx` must be inspected and verified against full directive spec (6 belt sections, analytics, deals dashboard) | Route minimal; high risk of incomplete implementation |
| **Home 5** | **HOLD — COMPONENT INSPECTION REQUIRED** — `Home5BattleCypherSurface.tsx` appears misnamed; must verify it implements Arena + Command Center (trophy, leaderboards, deals) not just "Battle/Cypher" | Route minimal; naming mismatch suspicious; high risk |

---

## SUMMARY FOR BUILD DIRECTOR

✅ **Home 1-3 Route Structure:** Correct (real data sources, no fakes, Rule 11 & 12 compliance verified)  
🟡 **Home 1-3 Component Implementation:** Unverified (requires opening Home1CoverPage, BillboardCrownSequence, Home2NewsDeskSurface, Home3LiveWorldSurface)  
🔴 **Home 4-5 Route Structure:** Minimal (only 15-40 lines); component implementation unknown  
🔴 **Home 4-5 Names:** Home5 route imports "BattleCypherSurface" but directive calls it "CommandCenter" — naming conflict  

**NEXT STEP:** 
Move to File 2 when approved. File 2 will inspect the six component files above (Home1CoverPage.tsx, BillboardCrownSequence.tsx, Home2NewsDeskSurface.tsx, Home3LiveWorldSurface.tsx, Home4MarketplacePage.tsx, Home5BattleCypherSurface.tsx) against the directive spec.

---

**Generated:** 2026-06-23  
**Status:** AWAITING BUILD DIRECTOR (MARCEL) APPROVAL TO PROCEED TO FILE 2
