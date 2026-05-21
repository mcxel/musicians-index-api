# TMI PDF IMAGE INVENTORY
> Generated: April 23, 2026 | Source: C:\Users\Admin\Documents\BerntoutGlobal XXL\Tmi PDF's

---

## ROOT FOLDER

### Tmi Homepage 1.jpg
- **Source:** Root PDF folder
- **Intended Route:** /home/1
- **Visible Sections:**
  - Full-screen magazine cover with dark background
  - Central orbit ring with animated artist frames (portrait cards)
  - Crown artist in center
  - Genre orbit labels around ring
  - Top navigation bar with TMI logo, search, profile icon
  - Genre selector belt (rap, R&B, pop, etc.)
  - Bottom status/tab bar
- **Clickable Zones:**
  - Artist portrait frames → /artists/:slug
  - Crown artist → /artists/:slug
  - Genre labels → genre filter
  - Search icon → /search
  - Profile icon → /profile or /login
  - Nav dots → /home/2, /home/3, /home/4, /home/5
- **Existing Component:** Home1LiveMagazine.tsx, ArtistPortalFace.tsx, GenreOrbitEngine.tsx
- **Missing:** Burst-after-transition animation, global pointer-events rule
- **Status:** ✅ PASS (artist click verified)

---

### Tmi Homepage 1-2.jpg
- **Source:** Root PDF folder
- **Intended Route:** /home/1-2 (sub-state of Home1, triggered by magazine open)
- **Visible Sections:**
  - Two-page magazine spread layout
  - Left page: Artist full-bleed portrait + bio + live button
  - Right page: Genre chart + trending tracks + weekly crown
  - Open magazine spine visible in center
  - Navigation arrows on left/right edges
  - Top navigation remains visible
- **Clickable Zones:**
  - Left page artist → /artists/:slug
  - Live button → /live/:slug
  - Genre chart entries → /genres/:slug
  - Trending tracks → /artists/:slug or /releases/:slug
  - Weekly crown → /artists/:slug
  - Navigation arrows → prev/next home page
- **Existing Component:** Home12Surface.tsx, MagazineOpenShell.tsx, MagazineFlipViewport.tsx
- **Missing:** Full magazine-open transition from Home1, left-page artist data binding, right-page chart data
- **Status:** ⚠️ PARTIAL — shell exists, animation chain incomplete

---

### Tmi Homepage 2.png
- **Source:** Root PDF folder
- **Intended Route:** /home/2
- **Visible Sections:**
  - Live World hub section
  - Featured artist large card (center)
  - Live rooms grid (4-6 cards showing active rooms)
  - "Going Live" countdown strip
  - Genre filter tabs at top
  - Trending now rail
  - Sponsor strip at bottom
- **Clickable Zones:**
  - Featured artist card → /artists/:slug
  - Live room cards → /live/:roomId
  - Genre tabs → genre filter
  - "Going Live" entries → /live/:slug
  - Trending entries → /artists/:slug
  - Sponsor strip → /sponsor/:slug
- **Existing Component:** Home2ArtifactSystem.tsx, LiveWorldScreen.tsx, LiveRooms.tsx, FeaturedArtist.tsx
- **Missing:** Artifact cards not rendered in actual /home/2 page, live room data, going-live countdown
- **Status:** ⚠️ PARTIAL — ArtifactSystem file exists, page not using it fully

---

### Tmi Homepage 3.png
- **Source:** Root PDF folder
- **Intended Route:** /home/3
- **Visible Sections:**
  - Genre browse grid (6–8 genre tiles with background colors)
  - Top 10 chart leaderboard strip
  - New releases row (album cards)
  - News/editorial strip
  - Trending artists row
  - Weekly battle results banner
- **Clickable Zones:**
  - Genre tiles → /genres/:slug
  - Top 10 entries → /artists/:slug
  - Album cards → /releases/:slug
  - News items → /articles/:slug
  - Trending artists → /artists/:slug
  - Battle results → /games/battle
- **Existing Component:** Home3ArtifactSystem.tsx, Top10Chart.tsx, TrendingArtists.tsx, NewReleases.tsx, NewsStrip.tsx
- **Missing:** Genre tiles not rendered as artifacts, chart data not bound
- **Status:** ⚠️ PARTIAL

---

### Tmi Homepage 4.png
- **Source:** Root PDF folder
- **Intended Route:** /home/4
- **Visible Sections:**
  - Shows & Events calendar strip (upcoming show cards)
  - Contests section (active contest cards with prize displays)
  - Billboard/sponsor placement zone (large rotating ad)
  - Store preview row (merch cards)
  - Season pass promo banner
  - Advertiser spotlight section
- **Clickable Zones:**
  - Show cards → /shows/:slug
  - Contest cards → /contests/:id
  - Billboard → /sponsor/:slug or /advertise
  - Merch cards → /store/:slug
  - Season pass banner → /season-pass
  - Advertiser spotlight → /advertiser/:slug
- **Existing Component:** Home4ArtifactSystem.tsx, ContestBanner.tsx, SponsorStrip.tsx, AdvertiserStrip.tsx
- **Missing:** Calendar data, contest data, billboard rotation logic
- **Status:** ⚠️ PARTIAL

---

### Tmi Homepage 5.png
- **Source:** Root PDF folder
- **Intended Route:** /home/5
- **Visible Sections:**
  - Full leaderboard grid of artist artifact cards
  - Rank number displayed on each card
  - Artist name, genre, score/XP
  - Weekly vs All-Time toggle
  - Filter by genre tabs
  - Crown/trophy indicators on top 3
- **Clickable Zones:**
  - Artist cards → /artists/:slug (VERIFIED)
  - Weekly/All-Time toggle → filter state
  - Genre filter tabs → genre filter
  - Crown indicators → /artists/:slug
- **Existing Component:** Home5ArtifactSystem.tsx
- **Missing:** Real rank data, genre filter wiring
- **Status:** ✅ PASS (leaderboard click verified)

---

## PROFILES FOLDER

### Adminisratation Hub.jpg
- **Source:** Profiles/
- **Intended Route:** /admin
- **Visible Sections:**
  - Header: "ADMINISTRATOR HUB" with Bernt branding
  - Overseer Deck panel (left): Shows active feeds HOME1–HOME5
  - Chain Command panel (center): Route map with live/dead status
  - Live Feed Explorer (right): Real-time feed cards per zone
  - System Status bar at bottom: build status, errors, route health
  - User count, active sessions, error count badges
  - Navigation links: Users, Bots, Games, Sponsors, Rooms, Audit, Economy
- **Clickable Zones:**
  - Feed cards → /admin/observatory or feed detail
  - Chain Command entries → route health detail
  - Navigation links → respective admin subpages
  - User count → /admin/users
  - Error badge → /admin/logs
- **Existing Component:** OverseerDeck.tsx, HomeFeedObserver.tsx
- **Missing:** OverseerDeck not mounting at /admin — must fix. Marcel/Jay Paul/Justin wiring needed.
- **Status:** ❌ /admin broken (not mounting) — must fix first

---

### Advertiser and sponser hub.jpg
- **Source:** Profiles/
- **Intended Route:** /advertiser or /sponsor
- **Visible Sections:**
  - Header: "ADVERTISER & SPONSOR HUB"
  - Campaign builder panel
  - Placement inventory grid (billboard/strip/overlay slots)
  - Analytics charts (impressions, clicks, conversions)
  - Deal/contract section
  - Payment tracking
  - Active campaigns list
  - Sponsored content placements on homepage preview
- **Clickable Zones:**
  - Create Campaign → /advertiser/campaigns/new or /sponsor/campaigns/new
  - Placement slots → /advertiser/placements
  - Analytics → /advertiser/analytics or /sponsor/analytics
  - Contracts → /advertiser/contracts or /sponsor/contracts
  - Payments → /advertiser/payments or /sponsor/payments
- **Existing Component:** SponsorDashboard.tsx, SponsorROIAnalytics.tsx, RevenueChart.tsx
- **Missing:** Campaign builder, placement inventory, deal gateway
- **Status:** ⚠️ PARTIAL — routes exist, UI incomplete

---

### Fan Sign up.png
- **Source:** Profiles/
- **Intended Route:** /signup?role=fan
- **Visible Sections:**
  - "FAN" account type header
  - Form: Name, Email, Password, Date of Birth
  - Profile photo upload
  - Genre preferences (checkbox grid)
  - "I'm a Fan" selector (vs performer/sponsor/advertiser)
  - Terms checkbox
  - Create Account button
  - Sign in link
- **Clickable Zones:**
  - Account type selectors → fork signup flow
  - Genre checkboxes → user preference
  - Create Account → POST /api/auth/signup
  - Sign in → /login
- **Existing Component:** app/signup/page.tsx (generic)
- **Missing:** Role fork (fan/performer/sponsor/advertiser), genre preference selector
- **Status:** ⚠️ PARTIAL — generic form only

---

### Performer Sign up.png
- **Source:** Profiles/
- **Intended Route:** /signup?role=performer
- **Visible Sections:**
  - "PERFORMER" account type header
  - Form: Stage Name, Real Name, Email, Password
  - Profile photo upload
  - Genre selection (primary + secondary)
  - Instrument/role selector (vocalist, rapper, DJ, producer, etc.)
  - Social links (optional)
  - Label/independent toggle
  - Tier selection preview
  - Terms checkbox
  - Create Account button
- **Clickable Zones:**
  - Account type fork
  - Genre selectors
  - Role selectors
  - Tier preview → /season-pass
  - Create Account → POST /api/auth/signup
- **Existing Component:** app/signup/page.tsx (generic)
- **Missing:** Performer-specific fields, instrument selector, tier preview
- **Status:** ⚠️ PARTIAL

---

### Sponsor Sign up.png
- **Source:** Profiles/
- **Intended Route:** /signup?role=sponsor
- **Visible Sections:**
  - "SPONSOR" account type header
  - Company name, contact name, email, password
  - Industry/category selector
  - Budget range selector
  - Campaign interest checkboxes (shows, contests, billboards, etc.)
  - Terms + contract acknowledgment
  - Create Account button
- **Existing Component:** app/signup/page.tsx (generic)
- **Missing:** Sponsor-specific fields, industry selector, budget range, campaign interests
- **Status:** ⚠️ PARTIAL

---

### Advertiser Sign up.png
- **Source:** Profiles/
- **Intended Route:** /signup?role=advertiser
- **Visible Sections:**
  - "ADVERTISER" account type header
  - Company name, brand name, email, password
  - Ad format preferences (display/video/overlay/strip)
  - Target audience selector
  - Budget/billing info
  - Terms + platform policy checkbox
  - Create Account button
- **Existing Component:** app/signup/page.tsx (generic)
- **Missing:** Advertiser-specific fields, ad format selector, audience targeting
- **Status:** ⚠️ PARTIAL

---

### season Pass.jpg
- **Source:** Profiles/
- **Intended Route:** /season-pass
- **Visible Sections:**
  - Three tier cards: BRONZE / SILVER / GOLD (or similar)
  - Each tier: icon, name, price, feature list
  - Current tier highlight
  - Upgrade button
  - "What's included" toggle
  - Tier color coding: bronze=orange, silver=gray, gold=yellow
  - Exclusive access badges (early access, backstage, etc.)
- **Clickable Zones:**
  - Tier cards → select/upgrade tier
  - Upgrade button → /billing or Stripe checkout
  - Feature toggle → accordion expand
- **Existing Component:** app/season-pass/page.tsx (stub)
- **Missing:** Tier card UI, feature list, Stripe checkout wiring
- **Status:** 🔲 PLACEHOLDER

---

## HOST, JULIUS, AND EXTRA FOLDER

### Host.png
- **Source:** Host , Julius , and extra/
- **Intended Route:** /hosts/:slug (host profile) or rendered inside show/event pages
- **Description:** Male MC/host character in formal performance attire — appears to be a general host avatar
- **Existing Component:** host/HostStageCard.tsx
- **Missing:** Host entry in hostRegistry.ts
- **Status:** ⚠️ PARTIAL

### Host 2.png
- **Source:** Host , Julius , and extra/
- **Description:** Female host character — formal DJ/MC style
- **Status:** ⚠️ PARTIAL — needs registry entry

### Host 3.png
- **Source:** Host , Julius , and extra/
- **Description:** Male host character — casual streetwear MC style
- **Status:** ⚠️ PARTIAL — needs registry entry

### Host 4.png
- **Source:** Host , Julius , and extra/
- **Description:** Female host — glamour/awards style
- **Status:** ⚠️ PARTIAL — needs registry entry

### Tiana monday night stage host.jpg
- **Source:** Host , Julius , and extra/
- **Intended Route:** /hosts/tiara or rendered in Monday Night Stage show
- **Description:** Tiara — Monday Night Stage host. Female character in stage performance outfit with lighting effects.
- **Assigned Show:** Monday Night Stage (/shows/monday-night-stage)
- **Existing Component:** host/HostStageCard.tsx
- **Missing:**
  - hostRegistry.ts entry for Tiara
  - /shows/monday-night-stage page
  - Tiara assigned as host in show config
- **Status:** ❌ NOT WIRED

### Julius.png
- **Source:** Host , Julius , and extra/
- **Intended Route:** /bots/julius or rendered as helper assistant across platform
- **Description:** Julius — animated cartoon mascot/helper character. Appears to be the platform guide/assistant bot.
- **Existing Component:** None
- **Missing:**
  - Bot registry entry for Julius
  - Helper overlay component
  - Julius dialogue script
- **Status:** 🆕 MISSING

### Bebo.jpg
- **Source:** Host , Julius , and extra/
- **Description:** Not a TMI asset — random external screenshot. SKIP.
- **Status:** ❌ NOT TMI ASSET

### Record Ralph.jpg
- **Source:** Host , Julius , and extra/
- **Intended Route:** /avatar-builder or /avatar-center
- **Description:** "CUSTOMIZE AVATAR" screen — shows:
  - Skin tone selector (5 circles at top)
  - 3D avatar character (DJ style, hoodie, headphones, vinyl record)
  - Accessory grid (unlocked items = green glow, locked = padlock icon)
  - Unlocked items: headphones, microphone
  - Locked items: multiple prop/clothing slots
  - Bottom row: party hat, guitar, mic, firecracker icons
  - "RECORD RALPH" branding on avatar hoodie
  - "SAVE" button at bottom
- **Clickable Zones:**
  - Skin tone circles → apply skin tone
  - Accessory slots (unlocked) → equip item
  - Accessory slots (locked) → show unlock requirement or store link
  - SAVE button → POST /api/avatar/save
- **Existing Component:** AvatarCreator.tsx, app/avatar-builder/, app/avatar-center/
- **Missing:**
  - Skin tone selector in AvatarCreator
  - Unlocked/locked accessory grid with visual states
  - SAVE API endpoint wiring
  - Record Ralph as default/example avatar name
- **Status:** ⚠️ PARTIAL

### BobbleHead Avatar extras 1/2/3.jpg
- **Source:** Host , Julius , and extra/ AND game show and venue skins/
- **Description:** External screenshots — not TMI design assets. SKIP.
- **Status:** ❌ NOT TMI ASSET

---

## GAME SHOW AND VENUE SKINS FOLDER

### images (27).jpg — Neon podium stage (single podium, purple/blue)
- **Intended Use:** Single-player quiz or debate game show skin
- **Route:** /games/trivia or /games/deal-or-feud
- **Status:** ⚠️ needs wiring as venue skin

### images (28).jpg — Three podium neon stage (pink/red)
- **Intended Use:** 3-player game show skin (trivia/lyric fill/deal-or-feud)
- **Route:** /games/trivia or /games/lyric-fill
- **Status:** ⚠️ needs wiring

### images (29).jpg — Three podium clean stage (blue spotlights)
- **Intended Use:** Formal game show or awards show backdrop
- **Route:** /games/* or /shows/awards
- **Status:** ⚠️ needs wiring

### images (30).jpg — Colorful quiz show set with podiums (red/yellow/blue)
- **Intended Use:** Multi-player trivia/name-that-tune game show
- **Route:** /games/name-that-tune or /games/trivia
- **Status:** ⚠️ needs wiring

### images (31).jpg — Concert hall stage with large blank screen
- **Intended Use:** Concert/live show venue skin
- **Route:** /live/:slug or /shows/:slug
- **Status:** ⚠️ needs wiring

### images (32).jpg — Round table interview studio (red chairs)
- **Intended Use:** Interview show skin (talk show format)
- **Route:** /shows/interviews or /interviews/:slug
- **Status:** ⚠️ needs wiring

### images (33).jpg — Large game show stage (dot matrix screen, blue)
- **Intended Use:** Tournament/contest show skin
- **Route:** /contests/:id or /games/tournaments
- **Status:** ⚠️ needs wiring

### images (34).jpg — TV studio (orange chairs, side screens)
- **Intended Use:** News/editorial show or host review show
- **Route:** /shows/:slug or editorial show
- **Status:** ⚠️ needs wiring

### images (35).jpg — Two-person debate/interview (LED walls)
- **Intended Use:** Battle rap or cypher skin
- **Route:** /games/battle or /cypher
- **Status:** ⚠️ needs wiring

### download (23)–(37).jpg — Outdoor amphitheater/concert venues
- **Intended Use:** Outdoor venue skins for Brick House / festival venues
- **Route:** /venues/:slug
- **Status:** ⚠️ needs wiring as venue skins

### Host 1–4.png (in this folder)
- **Same as Host.png–Host 4.png above** — duplicates in two folders
- **Status:** Same as above

---

## VENUE SKINS PLUS SEATING FOLDER

### images (2).jpg — Space/galaxy lounge (neon purple/pink, curved walls)
- **Intended Use:** Premium lounge venue skin — indoor concert/VIP room
- **Route:** /venues/galaxy-lounge or /rooms/:id
- **Status:** ⚠️ needs wiring

### images (3).jpg — XS Nightclub style (pool, luxury, warm lighting)
- **Intended Use:** Nightclub/party venue skin
- **Route:** /venues/brick-house or /rooms/:id
- **Status:** ⚠️ needs wiring

### images (4).jpg — Indoor festival stage (red overhead truss, capacity crowd)
- **Intended Use:** Festival venue skin — large capacity
- **Route:** /venues/:slug
- **Status:** ⚠️ needs wiring

### images (5).jpg — Conference seating (blue seats, auditorium)
- **Intended Use:** Awards/ceremony venue skin
- **Route:** /venues/:slug or /shows/awards
- **Status:** ⚠️ needs wiring

### images (6)–(22).jpg — Additional venue/seating variants
- **Intended Use:** Full venue skin library for /venues/designer and /venues/skins
- **Status:** ⚠️ needs cataloging and wiring into skin selector

### imgres.htm / imgres (1).htm
- **Description:** HTML files from web download — NOT design assets. SKIP.
- **Status:** ❌ NOT TMI ASSET

---

## SUMMARY COUNTS

| Source | Total Images | ✅ Wired | ⚠️ Partial | ❌ Broken | 🆕 Missing |
|---|---|---|---|---|---|
| Root (Homepage 1–5) | 6 | 2 | 4 | 0 | 0 |
| Profiles | 7 | 0 | 5 | 1 | 1 |
| Host/Julius/Extra | 11 | 0 | 4 | 3 | 2 |
| Game Show Skins | 20 | 0 | 17 | 3 | 0 |
| Venue Skins Seating | 22 | 0 | 20 | 2 | 0 |
| **TOTAL** | **66** | **2** | **50** | **9** | **3** |
