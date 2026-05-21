# TMI CANON ASSET ARCHAEOLOGY — ARTIFACT MAP
**Build Director Pass — May 2026**
**Source: `Tmi PDF's/` + `Tmi pdf 2 li/` — 370 assets scanned, 0 invented**

---

## SCAN SUMMARY

| Folder | Files | Category |
|---|---|---|
| `Tmi PDF's/` root | 12 | Homepages (HP1–HP5 + variants) |
| `game show and venue skins/` | 36 | Venues · Game Stages |
| `Venue Skins Plus Seating/` | 39 | Venue skins · Seating references |
| `Lobbies/` | 11 | Lobby inspiration references |
| `Profiles/` | 7 | Admin · Fan · Artist · Sponsor · Advertiser · SeasonPass |
| `The Musician's Index Magazine images/` | 88 | Magazine · UI screens · Rooms · Dashboards |
| `Host , Julius , and extra/` | 12 | Host characters · Mascot · Avatars |
| `_converted_webp_all/` | 370 | All of above in .webp — primary build source |
| `Tmi pdf 2 li/` | 3 | Magazine PDF originals |

**Total canonical assets: 370 converted + 3 PDF originals**

---

## PHASE 2 — CLASSIFICATION

### MAGAZINE
| File(s) | What It Shows |
|---|---|
| `img00001.jpg` | Promotional Hub — 2×2 live artist card grid |
| `img00010.jpg` | Monday Game Night hub screen |
| `img00025.jpg` | Rooms Directory — filter chips + 3×3 room cards |
| `img00040.jpg` | Fan Dashboard — cinema seating view + tip/react rail |
| `img00060.jpg` | Audience silhouette + screen — virtual seat environment |
| `img00070.jpg` | Artist Dashboard — live preview + reaction buttons + playlist cards |
| `img00002–img00088` (remaining) | Magazine article spreads, editorial layouts, index pages |
| `The Musician's Index Magazine images.pdf` | Full magazine — page-turn source |
| `Tmi pdf 2 li/The Musician fini.pdf` | Secondary magazine layout |

### PROFILES
| File | What It Shows |
|---|---|
| `Fan Sign up.png` | Fan onboarding — form + avatar Quick Pick + subscription tier row |
| `Performer Sign up.png` | Artist onboarding — same shell, "JOIN THE STAGE" variant |
| `Sponsor Sign up.png` | Sponsor onboarding — logo placement mockup + tier pills (LOCAL/RISING/FEATURED/GLOBAL) |
| `Advertiser Sign up.png` | Advertiser onboarding — campaign type grid + analytics preview |
| `Advertiser and sponser hub.jpg` | Advertiser Hub — full command center (campaign/targeting/placement/analytics) |
| `season Pass.jpg` | Season Pass / Artist Dashboard — guitar neck level track + rank display |
| `Adminisratation Hub.jpg` | Big Ace Admin — full overseer deck (12 panel layout) |

### ADMIN
| File | What It Shows |
|---|---|
| `Adminisratation Hub.jpg` | Overseer Deck: Chain Command, TV Screen Router, Live Feed Explorer, Bot Roster/Summon, Money & Billing, Account Linker, Artist Analytics & Revenue, Magazine & Index Analytics, Unified Inbox |

### VENUES
| File(s) | What It Shows |
|---|---|
| `download (7).jpg` | Modern nightclub — circular LED ceiling, VIP booth ring, open floor |
| `images (2).jpg` | Neon space lounge — galaxy ceiling, curved LED screens, DJ platform |
| `images (8).jpg` | Classic auditorium — fixed row seating, wooden stage, curtain |
| `download (23).jpg` | Outdoor amphitheater — tiered bench seating, open-air stage |
| `images (10–22).jpg` | Additional venue skin variants — concert halls, clubs, arenas |
| `Venue Skins Plus Seating/ (all 39)` | Seating grid layouts, row configurations, floor plans |
| `Lobbies/ (all 11)` | Lobby inspiration — movie theater / hotel / bar lobby references |

### GAMES
| File(s) | What It Shows |
|---|---|
| `download (28).jpg` | Neon game show stage — center podium, spotlights, marquee lightbulb frame |
| `images (28).jpg` | Quiz/battle arena — 3 podiums, pink/blue neon, center stage |
| `img00010.jpg` | Monday Game Night hub — game tile grid + ON AIR host panel |
| `Host.png` | Bobby Stanley — Deal or Feud 1000 host + Deal Zone / Feud Board |
| `BobbleHead Avatar extras (1–3)` | Avatar bobblehead variants for game players |

### SPONSORS
| File | What It Shows |
|---|---|
| `Sponsor Sign up.png` | Sponsor onboarding + logo placement preview |
| `Advertiser and sponser hub.jpg` | Sponsor/Advertiser unified command hub |
| `Tmi Homepage 4.png` | Sponsor Spotlight Belt — billboard ad + premium carousel + brand takeover |
| `Tmi Homepage 5.png` | Advertisers & Sponsors World full screen |

### ADVERTISERS
| File | What It Shows |
|---|---|
| `Advertiser Sign up.png` | Advertiser onboarding |
| `Advertiser and sponser hub.jpg` | Advertiser Hub command center |
| `Tmi Homepage 4.png` | Advertising Marketplace belt |
| `Tmi Homepage 5.png` | Inventory & Placements / Analytics / Deals & Contracts |

---

## PHASE 3 — DECONSTRUCTION

### ADMIN (Adminisratation Hub.jpg)
**STRUCTURE**
- Overseer bar: Quick Dock · Tax Loss · Alerts · Chain Pulse · Staff Meeting · Sanction Group · Approve Queue
- Left column: Chain Command panel · Big Ace Overseer card · Artist hierarchy tree · Money & Billing · Bot Roster & Summon · Unified Inbox
- Center: TV Screen Router (boardroom live feed) · Live Feed Explorer (search + genre filter + live cards + cypher event tiles)
- Right column: Security Sentinel Wall (threat level + vulnerability alerts) · Account Linker (OAuth providers) · Artist Revenue & Buyouts · Live Billboard Rankings

**INTERACTIONS**
- Tab switcher: TV BOARD / BOARDROOM LIVE
- Live feed search bar with genre pills (Hip-Hop, Top Trending)
- Revenue charts with time toggles
- Inbox thread list with unread badges
- Approve/Sanction action buttons

**CONTENT**
- Revenue: $44.1M displayed (live counter)
- Bot sentinel count: 100 SENTINELS
- Threat Level: STABLE
- Billboard rankings: ranked list with artist names + scores
- Sponsor segment banners in live feed

**MOTION**
- Chain Pulse ticker (moving strip)
- Live feed updates (new event cards slide in)
- Revenue counter ticks up

**LOGIC**
- Routes: `/admin` · `/admin/live-feed` · `/admin/revenue` · `/admin/bots` · `/admin/billing`
- Purchases: booking approve/deny
- Analytics: artist revenue splits

---

### PROFILES — FAN SIGN UP
**STRUCTURE**
- Hero left: crowd illustration + "#54 Billboard Fans / 23,410" badge
- Form right: neon marquee-bordered card — Username / Email / Password / Artist Name (optional) / Role
- Benefits checklist: Earn Tips & Points · Host Mini Cyphers · Start Beat Battles
- Quick Pick avatar row: 4 avatar bubbles (FREE / BRONZE / SILVER / HOST)
- Subscription tier row: 5 cards (FREE / BRONZE / SILVER / GOLD / PLATINUM → Diamond)
- CTA: "JOIN THE CROWD" orange pill button · "JOIN THE STAGE" (bottom)

**INTERACTIONS**
- Avatar bubble tap = select
- Tier card tap = highlight + select
- Form fields: standard text inputs + Role dropdown

**CONTENT**
- Billboard rank badge
- Tier labels + icons
- Benefits list with lock/unlock icons

**MOTION**
- Neon marquee border on form card (moving dot lights)
- Confetti particles background

**LOGIC**
- Routes: `/signup?role=fan` → role selector → tier selection → `/onboarding`
- Purchases: tier subscription via Stripe

---

### PROFILES — ARTIST SIGN UP
Same shell as Fan with:
- Hero: artist 3D avatar waving
- Fields add: Artist Name · Genre · Role
- CTA: "JOIN THE STAGE"
- Route: `/signup?role=artist`

---

### PROFILES — SPONSOR SIGN UP
**STRUCTURE**
- Hero left: stage with YOUR LOGO overlays on screens/banners
- Form right: Company Name / Brand Name / Email / Password / Industry
- Tier pills horizontal row: LOCAL · RISING · FEATURED · GLOBAL
- Benefits 2-col: Sponsor Directly / Artist Profiles / Local+Global Reach
- CTA: "START SPONSORING ARTISTS"

**LOGIC**
- Route: `/signup?role=sponsor`
- Tier maps to ad inventory level

---

### PROFILES — ADVERTISER SIGN UP
**STRUCTURE**
- Hero left: analytics dashboard preview + world map + viewer counters (+127,882 Views / 4,791,245 Vws)
- Form: Company Name / Email / Password
- Campaign Type grid: Video Ads · Banner Ads · Sponsored Reactions · Sponsored Rooms
- Additional: Daily Budget / Campaign Duration / Target Audience
- Feature list: Real-Time Analytics · Audience Targeting · Ad Placement Control · ROI Tracking · A/B Testing
- CTA: "LAUNCH CAMPAIGN"

**LOGIC**
- Route: `/signup?role=advertiser`

---

### ADVERTISER HUB
**STRUCTURE**
- Title bar: ADVERTISER HUB — Unified Ad & Sponsorship Command Center
- Panel 1 — Campaign Control: Name input · Budget progress bar (Ticketing up) · 3/5 Active Slots counter
- Panel 2 — Top Sponsored Artists (ROI Rank): ranked list with colored dots
- Panel 3 — Audience Targeting: Genre toggles (Hip-Hop/Electronic) · Location (USA/Global) · Launch Campaign / Duplicate Campaign CTAs
- Panel 4 — Live Ad Placement: artist page preview embed + follow button + like/views/shares counters
- Sidebar — Live Marketplace: current bidding rates
- Sidebar — Performance + Billboard: Bronze/Gold/Diamond tier cards with prices ($350 / $95+ / $3.09+)
- Sidebar — Ad Billboard rankings: username + metric rows
- Action rail bottom: RUN AD · $BOOST BUDGET · TARGET AUDIENCE · CHOOSE PLACEMENT · AUTO OPTIMIZE · DEEP ANALYTICS
- Reaction strip: $ TIP · Clap · Wave · Hert · (chevrons)
- WATCH AD module

**INTERACTIONS**
- Toggle switches: genre on/off · location on/off
- Launch / Duplicate buttons
- Bid on tier cards
- Watch ad modal

**LOGIC**
- Route: `/advertiser/hub` → `/advertiser/campaigns` → `/advertiser/analytics`

---

### SEASON PASS / ARTIST DASHBOARD
**STRUCTURE**
- Artist photo top-left: face + rank badge (#1 OVERALL)
- Guitar neck center: vertical fretboard — each fret = a level milestone
  - Fret icons: crown · music note · Beat Battle badge · 100K badge · lock (locked)
  - Level labels right: L1 Top 20 Fan (Sparkler item) · L3 New Song · L5 Battle Ticket (Jester Hat) · L7 100K Badge · L10 Private Studio · L12 NFT Track · L15 Main Stage (microphone)
- Stats: 120K Followers · 945 Streams · Progress 60%
- Season Pass card inset top-right: "SEASON PASS: THE RISE · #1"
- CTA: "BUY / UPGRADE SEASON PASS" amber pill button
- Nav: ← Go Back · 🎙 · 🔊

**INTERACTIONS**
- Fret tap = level detail expand
- BUY/UPGRADE → Stripe checkout

**MOTION**
- Progress fill animates up the guitar neck
- Level unlock animation (glow burst)

**LOGIC**
- Routes: `/season-pass` · `/artist/dashboard`
- Purchases: Season Pass tier upgrade

---

### HOMEPAGE 1 — MAGAZINE COVER (TMI Entry)
**STRUCTURE**
- Nav: THE MUSICIAN'S INDEX logo · Read Magazine · Live World · Play Games · Marketplace · About Us · Log In
- Center: 3D book (magazine) on geometric retro background (blue/purple/teal/yellow)
- Magazine cover: "Who took THE MUSICIANS INDEX" — performer grid with crown, voting live badge, cypher arena open badge

**MOTION**
- Page turn on hover/click
- Voting counter updates in real time

**LOGIC**
- Routes: `/` → `/magazine` · `/live` · `/games` · `/marketplace`

---

### HOMEPAGE 2 — EDITORIAL + DISCOVERY BELTS
**STRUCTURE**
- Issue header: TMI logo · CURRENT WEEK · WEEKLY CROWN WINNER Glows [CROWN] · Search · Notifications · Profile icon
- **Editorial Belt**: Article Feature card · Music News ticker (Last Hour headlines) · Interviews card · Studio Recaps (Cypher Highlights)
- **Discovery Belt**: Genre Cluster hexagons (Hip-Hop/Pop/Rock/R&B/Electronic/Jazz) · Top 10 Charts ranked list · Weekly Playlists / Index Picks · A-Z Artist Directory link
- **Platform & Marketplace Belt**: The Store (featured merch) · Booking Portal · My Achievements (850 pts) · Sponsor Spotlight (powered by Retro Logo)

**INTERACTIONS**
- Genre hexagon tap → genre filter
- Chart row tap → artist profile
- Sponsor spotlight → advertiser link

---

### HOMEPAGE 3 — LIVE WORLD BELT
**STRUCTURE**
- **Live World Activity Belt**: Main Preview Lobby (large featured live stream) · Lobby Wall (2×4 grid thumbnails all tagged LIVE)
- JOIN RANDOM ROOM starburst button
- **Discovery Belt — Trends & Events**: World Premieres countdown (01:14:32:05) · New Track preview card · Event Calendar (Concerts/Saturday/Wednesday)
- Undiscovered Boost: "New Artist of the Day!" with avatar
- Cypher Arena GATEWAY button
- Stream & Win score (0:50)
- Number badges (1-6) indicating homepage section slots

**INTERACTIONS**
- Main lobby card → join room
- Lobby Wall thumbnail → join room
- JOIN RANDOM ROOM → random room assignment
- Countdown → premiere event
- GATEWAY → `/games/cypher-arena`

---

### HOMEPAGE 4 — SPONSOR SPOTLIGHT BELT
**STRUCTURE**
- **Sponsor Spotlight**: Main Billboard Ad (full-width) · Premium Ad Carousel (rotating) · Brand Takeover Banner
- **Advertising Marketplace**: Campaign Builder · Buy Ad Placement · Audience Targeting · Dual Targeting
- **Inventory & Placements**: Placement Index map · Gateway
- **Analytics & Performance**: metric cards
- **Deals & Contracts**: contract gateway

---

### HOMEPAGE 5 — ADVERTISERS & SPONSORS WORLD
**STRUCTURE**
- Premium Ads Spotlight: Your Brand Here / Featured Campaigns / Sponsored Artist Pre-Ad
- Advertising Marketplace detailed (Video/Banner/Sponsored Rooms)
- Inventory & Placements Blueprints
- Analytics & Performance counters
- Deals & Contracts / Event Sponsors section

---

### ROOMS DIRECTORY (img00025)
**STRUCTURE**
- Filter chips: Genre · Mode · Venue · Hype · Starting Soon
- Sections: FEATURED TONIGHT · RISING ROOMS · YOUR FOLLOWED ARTISTS LIVE NOW
- Room card (3×3 grid): Genre badge · 3D performer avatar · venue type · % fill bar · viewer count + 🐝 hype · JOIN button · PREVIEW button · queue timer
- Sample rooms: HipHop (Club 48%) · DJ/Dance (Hall 66%) · R&B (Arena 43%) · Beat Battle (Club 61%) · Rap (Hall 80%) · Dance (Club 57%) · DJ/Dance · Open Mic · Soul

**INTERACTIONS**
- Filter chip toggle
- JOIN → enter room
- PREVIEW → watch-only

**LOGIC**
- Route: `/rooms` · `/rooms/[id]`

---

### MONDAY GAME NIGHT HUB (img00010)
**STRUCTURE**
- Header: MONDAY / WED-SUN toggle · coin counter 350 · notification bell
- Title: "GAME NIGHT — FEEL THE GLOW" neon sign
- ON AIR panel: 3D host avatar · countdown timer 03:21 · prize text · JOIN QUEUE / PREVIEW / PRACTICE buttons · crown icon
- Avatar grid right: 4×6 player bubbles (currently in queue)
- Game tiles (2×3):
  - NAME THAT TUNE (LIVE · 350 PLAYERS · waveform bars)
  - DEAL OR NO DEAL (127 PLAYERS · TIP badge)
  - 1 vs 10000 (DIFFICULT · 9:00 PM · cassette icon)
  - COVER ART ZOOM (221 PLAYERS · zoomed album icon)
  - LYRIC FILL (126 PLAYERS · 80's HITS · music note)
  - DJ MIX-OFF (62 PLAYERS · SPONSOR badge · DJ deck)
- SPONSOR MISSION ticker (bottom): "Complete Mission · Glow Stick Pack unlock"
- Bottom ticker: Top Artist last week · 18-streak by Yumi · New Neon Pack drops

**INTERACTIONS**
- Game tile tap → enter game
- JOIN QUEUE → lobby entry
- SPONSOR MISSION → `/games/sponsor-mission`

---

### FAN DASHBOARD (img00040)
**STRUCTURE**
- Dark cinema perspective: audience silhouettes facing screen (seating depth illusion)
- TRIVIA shortcut icon top right
- Left side rail: Profile · options · playback · phone · more
- Action strip: $ TIP · ❤ · 👋 · ❤ · 🔊 · ⭐
- Fan Points: 1,235 — Earn by watching ads
- Progress bar (fan seat proximity)
- "Watch ads to move closer!" with Watch Ads CTA
- Earn with sponsors: food/drink icons
- Bottom CTAs ×2: "Watch ads to move closer" repeating

**LOGIC**
- Route: `/fan/dashboard` · `/rooms/[id]/fan-view`
- Revenue: ad watch → fan points → seat upgrade

---

### ARTIST DASHBOARD (img00070)
**STRUCTURE**
- Live preview window: animated crowd
- Reaction buttons: LOVE · DANCE · CLAP · SING + volume control
- LIVE chip + GO LIVE button
- "Calculate your total earnings!" panel → VIEW ANALYTICS button
- Playlist cards: USA HOHPP Playlist (Hip-Hop · Track 1/2) · Hip-Hop Playlist (3 tracks) each with ▶ PLAY
- Update Feed rail: UPDATE · PREMIUM VERSION $6.99 · TRIVIA · ANALYTICS
- Daily Spin wheel + PLAY button
- Logout top right

**LOGIC**
- Route: `/artist/dashboard`
- Revenue: tip earnings · stream earnings · analytics

---

### HOST CHARACTERS
| Character | Type | Visual |
|---|---|---|
| Julius | Meerkat mascot | Flat cap, VIP tickets, microphone, confetti, chicken prop, magician hat — platform mascot/emcee |
| Bobby Stanley | 3D human host | Black man, glasses, suit, red tie, microphone — Deal or Feud 1000 host |
| Tiana | 3D human host | Woman, red+purple leather jacket, gold chains, TG monogram mic — Monday Night Stage Host |
| Bebo | Character | Additional cast member |
| Record Ralph | Character | Additional cast member |
| Bobblehead Avatars (×3) | Player avatar | Bobblehead style player representations |
| Host 2/3/4 | Human hosts | Additional host variants |

---

## PHASE 4 — REBUILD AS ARTIFACTS

### MAGAZINE
```
MagazineShell.tsx          — page layout, nav bar, issue header, belt slots
MagazineCover.tsx          — 3D book cover, voting overlay, live badges
MagazinePageSpread.tsx     — 2-column editorial spread
EditorialBelt.tsx          — Article Feature + Music News + Interviews + Studio Recaps
DiscoveryBelt.tsx          — Genre hexagon cluster + Charts + Playlists + Directory
MarketplaceBelt.tsx        — Store card + Booking Portal + Achievements + Sponsor Spot
PromotionalHubGrid.tsx     — 2×2 live artist cards (JOIN/HIGHLIGHT/HYPE)
PageTurnEngine.ts          — page turn animation state + transitions
MagazineIssueHeader.tsx    — logo + issue date + crown winner + search + nav icons
```

### PROFILES / ONBOARDING
```
OnboardingShell.tsx        — hero left + neon marquee form right — shared across all roles
FanSignUpForm.tsx          — Fan-specific fields + JOIN THE CROWD CTA
ArtistSignUpForm.tsx       — Artist-specific (Genre/Role) + JOIN THE STAGE CTA
SponsorSignUpForm.tsx      — Company/Brand/Industry + tier pills + START SPONSORING CTA
AdvertiserSignUpForm.tsx   — Campaign type grid + budget/duration + LAUNCH CAMPAIGN CTA
AvatarQuickPick.tsx        — 4-bubble avatar selector (FREE/BRONZE/SILVER/HOST)
SubscriptionTierRow.tsx    — 5-card horizontal tier selector (FREE→DIAMOND)
NeonMarqueeBorder.tsx      — animated dot-light marquee border for form cards
BillboardRankBadge.tsx     — "#54 Billboard Fans / count" badge
SignupHeroIllustration.tsx — slot for role-specific hero art
```

### ADMIN
```
AdminOverseerDeck.tsx      — full overseer shell (12-panel layout)
ChainCommandPanel.tsx      — hierarchy tree + action buttons
TVScreenRouter.tsx         — live boardroom feed switcher
LiveFeedExplorer.tsx       — search + genre filter + live event cards
BotRosterPanel.tsx         — bot list + summon + status indicators
MoneyBillingPanel.tsx      — revenue figure + split breakdown
AccountLinkerPanel.tsx     — OAuth provider connection row
ArtistRevenuePanel.tsx     — artist rev chart + billboard rankings
MagazineAnalyticsPanel.tsx — magazine content performance metrics
UnifiedInboxPanel.tsx      — message thread list
SecuritySentinelWall.tsx   — threat level + vulnerability alert feed
OverseerTopBar.tsx         — Quick Dock + Tax Loss + Alerts + Chain Pulse strip
```

### VENUES
```
VenueShell.tsx             — outer container, background skin slot, atmosphere layer
VenueWallSkin.tsx          — swappable wall texture/image (neon club / space lounge / auditorium / outdoor)
VenueFloorSkin.tsx         — floor texture layer
VenueSeatRenderer.tsx      — grid of seat objects (occupied/empty/VIP states)
VenueStageShell.tsx        — stage platform + spotlight cones + performer zone
VenueBillboardShell.tsx    — screen/billboard mount (content slot)
VenueLightingLayer.tsx     — ambient glow, spotlight sweep, LED strip
VenueCrowdLayer.tsx        — audience silhouettes (depth layered, fan avatar bubbles)
VenueAudienceView.tsx      — fan perspective: cinema-style seats → screen
VenueLobbyShell.tsx        — entry lobby (movie theater / bar / hotel variants)
GameShowStageShell.tsx     — neon podiums + marquee frame + spotlight rig
```

### ROOMS DIRECTORY
```
RoomsDirectoryShell.tsx    — filter chips + section headers + card grid
RoomCard.tsx               — genre badge + avatar + venue type + fill bar + JOIN/PREVIEW
RoomFilterChips.tsx        — Genre / Mode / Venue / Hype / Starting Soon toggles
RoomFillBar.tsx            — percentage fill progress bar
RoomSectionHeader.tsx      — FEATURED TONIGHT / RISING / FOLLOWED labels
```

### GAMES
```
GameNightHubShell.tsx      — ON AIR panel + avatar queue grid + game tile grid + ticker
GameTile.tsx               — title + player count + live badge + icon + tap handler
OnAirHostPanel.tsx         — host avatar + countdown + prize + JOIN QUEUE / PREVIEW / PRACTICE
SponsorMissionTicker.tsx   — scrolling bottom ticker strip
PlayerQueueGrid.tsx        — avatar bubble grid (queue display)
GameShowStageShell.tsx     — (see VENUES above)
```

### HOSTS / CHARACTERS
```
HostAvatar.tsx             — renders host character image (Julius / Bobby / Tiana / Bebo)
HostOnAirFrame.tsx         — ON AIR framed box with host + microphone
JuliusEmcee.tsx            — Julius mascot component (idle / hype / react states)
TianaHost.tsx              — Tiana 3-pose Monday Night host
BobbyStanleyHost.tsx       — Bobby Stanley Deal or Feud host
BobbleheadPlayerAvatar.tsx — bobblehead avatar for game queues
```

### SPONSOR / ADVERTISER
```
SponsorHubShell.tsx        — sponsor command center shell
SponsorLogoPlacementPreview.tsx — stage mockup with YOUR LOGO overlays
SponsorTierPills.tsx       — LOCAL / RISING / FEATURED / GLOBAL pill selector
AdvertiserHubShell.tsx     — advertiser command center shell
CampaignControlPanel.tsx   — name + budget bar + active slots counter
AudienceTargetingPanel.tsx — genre/location toggles + launch CTA
LiveAdPlacementPreview.tsx — artist page embed preview
PerformanceBillboardTiers.tsx — Bronze/Gold/Diamond tier cards with prices
AdBillboardRankings.tsx    — ranked advertiser list
AdActionRail.tsx           — RUN AD / BOOST / TARGET / PLACEMENT / OPTIMIZE / ANALYTICS strip
LiveMarketplaceSidebar.tsx — current bidding rates
WatchAdModule.tsx          — watch ad CTA + reward display
SponsorSpotlightBelt.tsx   — homepage belt: Main Billboard + Premium Carousel + Brand Takeover
AdInventoryBlueprint.tsx   — placement index map
```

### SEASON PASS
```
SeasonPassGuitarNeck.tsx   — vertical guitar fretboard with level milestones
SeasonPassFret.tsx         — individual fret: icon + level label + locked/unlocked state
SeasonPassLevelBadge.tsx   — level number + reward name + item icon
BuyUpgradeSeasonPassCTA.tsx — amber pill CTA → Stripe checkout
ArtistRankBadge.tsx        — #1 OVERALL etc. overlaid on artist photo
```

### DASHBOARDS
```
FanDashboardShell.tsx      — cinema perspective view + side rail + action strip + fan points
ArtistDashboardShell.tsx   — live preview + reaction buttons + GO LIVE + earnings + playlist cards
FanActionStrip.tsx         — TIP / ❤ / 👋 / 🔊 / ⭐ row
ReactionButtonRow.tsx      — LOVE / DANCE / CLAP / SING buttons (artist side)
FanPointsProgress.tsx      — points display + proximity bar + "Watch ads to move closer"
DailySpinWheel.tsx         — spin wheel + PLAY button
UpdateFeedRail.tsx         — UPDATE / PREMIUM / TRIVIA / ANALYTICS vertical rail
PlaylistCard.tsx           — playlist name + track list + ▶ PLAY
EarningsCalculatorPanel.tsx — "Calculate your total earnings" → VIEW ANALYTICS
```

---

## PHASE 5 — REUSABLE ENVIRONMENT ASSETS

These must exist as **components, not image layers**:

### WALLS
```tsx
// VenueWallSkin.tsx
// Props: variant = "neon-club" | "space-lounge" | "auditorium" | "outdoor" | "game-show" | "dark-space"
// Renders: background gradient + texture overlay + ambient glow border
```

### FLOORS
```tsx
// VenueFloorSkin.tsx
// Props: variant = "hardwood" | "led-tile" | "dark-carpet" | "concrete" | "grass"
// Renders: floor plane with perspective transform
```

### SEATS
```tsx
// VenueSeatRenderer.tsx
// Props: rows, cols, occupied[], vip[], onSeatClick
// Renders: grid of seat objects — filled (avatar), empty (dim), VIP (gold glow)
// Each seat: rounded rectangle, glow on hover, avatar bubble when occupied
```

### STAGES
```tsx
// VenueStageShell.tsx
// Props: variant = "neon-podium" | "concert-platform" | "game-show" | "outdoor-amphitheater"
// Renders: raised platform + performer zone + spotlight cones
```

### SCREENS / BILLBOARDS
```tsx
// VenueBillboardShell.tsx
// Props: content (ReactNode), position = "back-wall" | "side" | "overhead"
// Renders: screen frame + content slot + optional glow border
```

### LIGHTS
```tsx
// VenueLightingLayer.tsx
// Props: variant = "spotlight" | "led-strip" | "ambient" | "strobe"
// Renders: SVG/CSS light cone overlays, animatable
```

### CROWD / SPAWN
```tsx
// VenueCrowdLayer.tsx
// Props: avatars[], density = "sparse" | "medium" | "packed"
// Renders: layered depth rows of audience avatars / silhouettes

// CrowdZone.tsx — designated crowd area with capacity counter
// HostZone.tsx  — host spawn point (microphone stand, podium position)
// SpawnPoint.tsx — performer entry/exit marker
```

### LOBBY
```tsx
// VenueLobbyShell.tsx
// Props: variant = "cinema" | "bar" | "hotel" | "club"
// Renders: lobby environment + entrance arch + wait area
```

### NEON MARQUEE BORDER
```tsx
// NeonMarqueeBorder.tsx
// Props: color, speed, children
// Renders: animated dot-light border around any card (from sign-up form canon)
```

### GLOW STRIP
```tsx
// NeonGlowStrip.tsx
// Props: colors[], direction = "horizontal" | "vertical", height
// Renders: gradient strip (used in ticket, venue walls, stage edges)
```

---

## PHASE 6 — REPORT

### FILES SCANNED
- **370** converted .webp assets
- **3** PDF originals (magazine source)
- **12** homepage reference screens (HP1–HP5 + variants)
- **7** profile/role reference screens
- **88** magazine UI screens
- **39** venue skin + seating references
- **36** game show + venue skin references
- **11** lobby inspiration references
- **12** host character assets

**SKIPPED**: zip archives (6 total — `.zip` files in `Tmi PDF's/`) · duplicate `_converted_webp/` subfolder (superseded by `_converted_webp_all/`) · `preview_converted.html` / `preview_converted_all.html` (tooling artifacts) · `imgres.htm` / `imgres (1).htm` (browser artifacts)

### ASSETS CLASSIFIED
| Category | Count |
|---|---|
| MAGAZINE | 176 (88 img + 88 converted) |
| VENUES | 72 |
| SEATING | 74 |
| HOSTS / CHARACTERS | 22 |
| PROFILES / ADMIN | 14 |
| HOMEPAGES | 12 |
| **TOTAL** | **370** |

### REUSABLE ARTIFACTS IDENTIFIED
**58 named components** across:
- Magazine: 9
- Profiles/Onboarding: 10
- Admin: 11
- Venues/Environment: 11
- Rooms Directory: 5
- Games: 5
- Hosts: 6
- Sponsor/Advertiser: 13
- Season Pass: 5
- Dashboards: 9

**12 reusable environment primitives** (walls, floors, seats, stages, screens, lights, crowd, lobby, spawn, glow)

### SURFACES NEEDING REPAIR / BUILD

#### ADMIN (needs wiring or rebuild from canon)
- `/admin/live-feed` — LiveFeedExplorer not wired to canon layout (TV screen router + genre filter + live event tiles)
- `/admin/overseer` or `/admin/big-ace` — Missing OverseerTopBar chain pulse strip, Security Sentinel Wall
- `/admin/bots` — exists but missing BotRosterPanel summon UI from canon

#### PROFILES / ONBOARDING
- `/signup` — Missing NeonMarqueeBorder, AvatarQuickPick, SubscriptionTierRow per canon
- `/signup?role=sponsor` — SponsorTierPills (LOCAL/RISING/FEATURED/GLOBAL) missing
- `/signup?role=advertiser` — CampaignTypeGrid missing

#### ADVERTISER
- `/advertiser/hub` — AdvertiserHubShell not built to canon (missing Campaign Control, Live Ad Placement preview, Performance + Billboard tiers, AdActionRail)

#### VENUES
- No VenueShell / VenueWallSkin / VenueSeatRenderer built as components yet
- `/venue/[id]` — needs full canon rebuild from venue skin references
- VenueAudienceView (cinema fan perspective) — not built

#### ROOMS
- `/rooms` — RoomsDirectoryShell exists but RoomCard fill bar + avatar + venue type not canonical
- Room lobby missing VenueLobbyShell slot

#### GAMES
- GameNightHubShell missing OnAirHostPanel with host avatar + countdown (game-night page exists but lacks this)
- GameShowStageShell — not built as a reusable component

#### SEASON PASS
- `/season-pass` — SeasonPassGuitarNeck (fretboard visual) not built — canon shows guitar neck track, not card grid
- BuyUpgradeSeasonPassCTA not wired to Stripe

#### MAGAZINE
- `/magazine` — MagazineCover (3D book) not built; EditorialBelt, DiscoveryBelt, MarketplaceBelt need canon layouts
- PromotionalHubGrid (2×2 live card) — not built

#### HOSTS
- HostAvatar components not built as reusable — Julius, Bobby Stanley, Tiana all need component wrappers
- JuliusEmcee not used in game night hub despite being the game mascot

#### FAN DASHBOARD
- `/fan/dashboard` — FanDashboardShell cinema perspective not built; FanPointsProgress + "watch ads" mechanic missing

---

## BUILD PRIORITY ORDER (Revenue-First)

1. **Stripe-connected paths**: Season Pass CTA → Stripe · Advertiser signup → campaign purchase · Sponsor signup → tier purchase
2. **Onboarding**: NeonMarqueeBorder + AvatarQuickPick + SubscriptionTierRow on all 5 signup forms
3. **Admin canon**: OverseerTopBar + LiveFeedExplorer wired
4. **Rooms**: RoomCard canonical + VenueShell primitive built
5. **Magazine**: MagazineCover + EditorialBelt + DiscoveryBelt canonical
6. **Hosts**: Julius + Tiana + Bobby wired into GameNight + Rooms
7. **Venue environment**: VenueSeatRenderer + VenueStageShell as reusable components
8. **Fan Dashboard**: cinema view + fan points + ad-watch mechanic

---

*This document is the source of truth for all build passes. No imagination — canon assets only.*
*Updated: 2026-05-03 | Build Director: Claude Code*
