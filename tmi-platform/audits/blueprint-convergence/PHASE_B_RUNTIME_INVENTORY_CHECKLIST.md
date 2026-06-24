# RUNTIME INVENTORY — Phase B Checklist

**Objective:** Catalog all existing systems, components, routes, and engines in the actual codebase.  
**Date Started:** 2026-06-23  
**Scope:** Complete scan of `apps/web/src/` repository

---

## RUNTIME INVENTORY SCHEMA

For each system category, checklist status:
- ✅ EXISTS (found and confirmed)
- ⚠️ PARTIAL (incomplete or fragmented)
- ❌ MISSING (not found in repo)
- 🔄 DUPLICATE (multiple versions found)
- ⓘ REFERENCE (code reference only, not implemented)

---

# SECTION A: HOMEPAGE ROUTES (5 Primary + 10+ Secondary)

## Home Pages (5 Core)

- [ ] **`/home/1`** — Home 1 (Crown page)
  - Files: `apps/web/src/app/home/1/page.tsx`
  - Components: Home1Page.tsx, OrbitalPanel.tsx
  - Status: ✅ EXISTS (verify real data wiring)

- [ ] **`/home/1-2`** — Home 1-2 (Billboard)
  - Files: `apps/web/src/app/home/1-2/page.tsx`
  - Components: BillboardGenreRotation.tsx
  - Status: ✅ EXISTS (verify real data wiring)

- [ ] **`/home/2`** — Home 2 (Magazine)
  - Files: `apps/web/src/app/home/2/page.tsx`
  - Components: MagazinePage.tsx
  - Status: ✅ EXISTS (verify real data wiring)

- [ ] **`/home/3`** — Home 3 (Live World)
  - Files: `apps/web/src/app/home/3/page.tsx`
  - Components: LiveWorldPage.tsx, LiveLobbyWall.tsx
  - Status: ✅ EXISTS (verify live status propagation)

- [ ] **`/home/4`** — Home 4 (Marketplace)
  - Files: `apps/web/src/app/home/4/page.tsx`
  - Components: MarketplacePage.tsx
  - Status: TBD (verify if exists)

- [ ] **`/home/5`** — Home 5 (Arena/Games)
  - Files: `apps/web/src/app/home/5/page.tsx`
  - Components: ArenaEventShell.tsx, GamesDiscovery.tsx
  - Status: ⚠️ PARTIAL (Arena exists, Games incomplete)

## Discovery/Sidebar Pages

- [ ] **`/home/1-3`** — Secondary homes (implied but unverified)
- [ ] **`/home/1-4`**, **`/home/1-5`** — Tier-based variants (if any)

---

# SECTION B: DASHBOARD ROUTES (6 Roles × Multiple Variants)

## Fan Dashboard

- [ ] **`/dashboard/fan`** — Primary fan hub
  - Files: `apps/web/src/app/dashboard/fan/page.tsx`
  - Status: TBD (verify if merged with /hub/fan)

- [ ] **`/hub/fan`** — Fan hub (may be canonical)
  - Files: `apps/web/src/app/hub/fan/page.tsx`
  - Status: ✅ EXISTS (verify real data)

## Performer Dashboard

- [ ] **`/dashboard/artist`** — Primary artist hub
  - Files: `apps/web/src/app/dashboard/artist/page.tsx`
  - Status: TBD

- [ ] **`/hub/performer`** — Performer hub (may be canonical)
  - Files: `apps/web/src/app/hub/performer/page.tsx`
  - Status: ✅ EXISTS (verify real data)

## Writer Dashboard

- [ ] **`/dashboard/writer`** — Writer hub
  - Status: TBD

## Venue Dashboard

- [ ] **`/dashboard/venue`** — Venue hub
  - Status: TBD

## Sponsor Dashboard

- [ ] **`/dashboard/sponsor`** — Sponsor hub
  - Status: TBD

## Admin Dashboards (5 Variants)

- [ ] **`/admin`** — Primary admin
- [ ] **`/admin/marcel`** — Marcel's personal hub
- [ ] **`/admin/overseer`** — Big Ace's overseer deck
- [ ] **`/admin/moderation`** — Moderation hub
- [ ] **`/admin/analytics`** — Analytics dashboard

**Status for All Admin Dashboards:** TBD (verify how many exist)

---

# SECTION C: LIVE ROUTES (Rooms, Arena, Messaging)

## Live Rooms

- [ ] **`/live/rooms/[id]`** — Generic live room page
  - Components: AudienceScene.jsx
  - Status: ⚠️ PARTIAL (exists but incomplete)

- [ ] **`/live/lobby`** — Lobby entry point
  - Status: ✅ EXISTS (verify if canonical entry)

- [ ] **`/live/battles`** — Battles list/directory
  - Status: ⚠️ PARTIAL

- [ ] **`/live/cyphers`** — Cyphers list/directory
  - Status: ⚠️ PARTIAL

- [ ] **`/live/challenges`** — Challenges list/directory
  - Status: ⚠️ PARTIAL

## Arena Event Routes

- [ ] **`/arena/[id]`** — Individual arena event
  - Components: ArenaEventShell.tsx
  - Status: ⚠️ PARTIAL (incomplete voting/judging)

- [ ] **`/arena`** — Arena hub/discovery
  - Status: ⚠️ PARTIAL

---

# SECTION D: PROFILE ROUTES (3 Role Types)

## Fan Profile

- [ ] **`/profile/fan/[slug]`** — Public fan profile
  - Status: ✅ EXISTS (verify real data)

- [ ] **`/account/fan`** — Fan account settings
  - Status: TBD

## Performer Profile

- [ ] **`/profile/performer/[slug]`** — Public performer profile
  - Status: ✅ EXISTS (verify real data + media priority chain)

- [ ] **`/account/performer`** — Performer account settings
  - Status: TBD

## Writer Profile

- [ ] **`/profile/writer/[slug]`** — Public writer profile
  - Status: TBD

---

# SECTION E: MAGAZINE & CONTENT ROUTES

## Magazine Pages

- [ ] **`/magazine`** — Magazine hub/index
  - Status: ✅ EXISTS (verify data source)

- [ ] **`/magazine/[issue]`** — Issue view
  - Status: ⚠️ PARTIAL

- [ ] **`/magazine/[issue]/[article]`** — Article view
  - Status: ⚠️ PARTIAL

- [ ] **`/article/[slug]`** — Direct article route (alternative)
  - Status: TBD

## Article Pages

- [ ] **`/articles`** — Articles list
  - Status: TBD

- [ ] **`/articles/[slug]`** — Article detail
  - Status: TBD

---

# SECTION F: MARKETPLACE & COMMERCE ROUTES

## Store

- [ ] **`/store`** — Marketplace hub
  - Status: TBD

- [ ] **`/store/playlists`** — Playlist skins store
  - Status: TBD

- [ ] **`/store/merch`** — Merch/cosmetics store
  - Status: TBD

- [ ] **`/store/beats`** — Beat marketplace
  - Status: TBD

## Checkout

- [ ] **`/checkout`** — Stripe checkout page
  - Status: ✅ EXISTS (verify Stripe integration)

---

# SECTION G: AUTHENTICATION & ONBOARDING

## Auth Routes

- [ ] **`/login`** — Login page
  - Status: ✅ EXISTS

- [ ] **`/signup`** — Signup page (generic)
  - Status: ✅ EXISTS

- [ ] **`/signup?role=[role]`** — Role-specific signup
  - Roles: fan, performer, writer, venue, sponsor, advertiser
  - Status: TBD (verify all 6 variants)

- [ ] **`/account-recovery`** — Password reset
  - Status: ✅ EXISTS

## Session

- [ ] **`/api/auth/session`** — Session endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/login`** — Login endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/logout`** — Logout endpoint
  - Status: ✅ EXISTS

---

# SECTION H: COMPONENTS (90+ Folders Expected)

## Canisters (11 Expected)

- [ ] PlaylistCanister
- [ ] MemoryWallCanister
- [ ] BookingCanister
- [ ] MessagingCanister
- [ ] StoreCanister
- [ ] AvatarCreationCenter
- [ ] AvatarWorkspace
- [ ] InventoryCanister
- [ ] PublicLobbyCanister
- [ ] PrivateLobbyCanister
- [ ] LiveLobbyWallCanister

**Status:** Count how many exist in `apps/web/src/components/canisters/`

## Audience & Avatar Components

- [ ] **AudienceScene.jsx** — Core audience rendering
  - Status: ✅ EXISTS (verify 9 venue types + 8 seating layouts)

- [ ] **AvatarCreator.tsx** — Avatar creation UI
  - Status: ✅ EXISTS (verify real 3D or flat)

- [ ] **AvatarLobbyCanvas.tsx** — Avatar lobby rendering
  - Status: 🔄 DUPLICATE (multiple copies found, consolidate)

- [ ] **BotCrowdFillEngine** — Bot crowd fill logic
  - Status: ⚠️ PARTIAL (exists but incomplete)

- [ ] **SeatingMeshEngine** — Seating system
  - Status: ✅ EXISTS (verify convergence with canonical engine)

## Video & Monitor Components

- [ ] **MonitorRuntime** — Floating/docked monitors
  - Status: ❌ MISSING (spec'd in FILE 20, not found)

- [ ] **VideoTileMoodEngine** — 7 tile modes
  - Status: ❌ MISSING (spec'd in FILE 20, not found)

- [ ] **BroadcastDirectorEngine** — Camera switching
  - Status: ⚠️ PARTIAL (may exist as BroadcastPanel)

## Messaging Components

- [ ] **MessengerShell** — Chat UI
  - Status: ❌ MISSING (spec'd in FILE 20, not found)

- [ ] **ConversationStore** — Message storage
  - Status: ❌ MISSING (spec'd in FILE 20, not found)

## Admin Components

- [ ] **AdminHub**
- [ ] **ModeratorPanel**
- [ ] **OverseerDeck**
- [ ] **Analytics Dashboard**

**Status:** TBD (verify how many exist)

---

# SECTION I: ENGINES & REGISTRIES (Critical)

## Canonical Registries (Core)

- [ ] **PerformerRegistry** (`lib/performers/PerformerRegistry.ts`)
  - Status: ✅ EXISTS (verify data freshness)

- [ ] **VenueRegistry** (`lib/venues/VenueRegistry.ts`)
  - Status: ✅ EXISTS (verify all 31 skins + 10 colors)

- [ ] **GlobalLiveSessionRegistry** (`lib/live/GlobalLiveSessionRegistry.ts`)
  - Status: ✅ EXISTS (verify all 8 propagation targets)

- [ ] **SponsorRegistry** (`lib/commerce/SponsorRegistry.ts`)
  - Status: ✅ EXISTS

- [ ] **magazineIssueData** (`lib/magazine/magazineIssueData.ts`)
  - Status: ✅ EXISTS (verify MAGAZINE_ISSUE_1 data)

- [ ] **XpActionRegistry** (`lib/xp/XpActionRegistry.ts`)
  - Status: ✅ EXISTS (verify all XP actions)

## Missing/Needed Registries

- [ ] **GameSessionRegistry** — Games system
  - Status: ❌ MISSING (blocking Home 5 games)

- [ ] **VotingRegistry** — Arena voting
  - Status: ❌ MISSING (Arena voting incomplete)

- [ ] **PlaylistArtifactEngine** — Playlist skins
  - Status: ⚠️ PARTIAL (engine exists, UI not built)

- [ ] **BeatInventoryEngine** — Beat marketplace
  - Status: ⚠️ PARTIAL

- [ ] **CompetitionMusicEngine** — Competition beats
  - Status: ⚠️ PARTIAL

## Engines

- [ ] **OrbitalLayoutEngine** — Home 1 orbit animation
  - Status: ✅ EXISTS (verify stagger timings)

- [ ] **GenreRotationEngine** — Billboard rotation
  - Status: ⚠️ PARTIAL (exists, needs real data)

- [ ] **ArenaEventShell** — Battle/Cypher/Challenge
  - Status: ⚠️ PARTIAL (missing voting/judging)

- [ ] **AudienceRenderingEngine** — Canvas crowd
  - Status: ⚠️ PARTIAL

- [ ] **AudioDuckingEngine** — Auto-ducking
  - Status: ❌ MISSING (spec'd in FILE 20)

- [ ] **LiveRoutingEngine** — 8-surface propagation
  - Status: ⚠️ PARTIAL (registry exists, wiring incomplete)

- [ ] **BotDJEngine** — Bot announcer
  - Status: ✅ EXISTS (verify coverage)

- [ ] **HostShowAssignmentEngine** — Host assignment
  - Status: ✅ EXISTS (unaudited)

---

# SECTION J: API ROUTES (20+ Expected)

## Authentication APIs

- [ ] **`/api/auth/login`** — Login endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/logout`** — Logout endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/register`** — Register endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/session`** — Session endpoint
  - Status: ✅ EXISTS

- [ ] **`/api/auth/provision`** — Provision endpoint
  - Status: TBD

## Live APIs

- [ ] **`/api/live/go`** — Go Live trigger
  - Status: ✅ EXISTS (verify real data)

- [ ] **`/api/live/audience`** — Audience data
  - Status: ✅ EXISTS (verify real occupancy)

- [ ] **`/api/live/seat-presence`** — Seat assignment
  - Status: ✅ EXISTS

- [ ] **`/api/live/reactions`** — Reaction tracking
  - Status: TBD

- [ ] **`/api/live/votes`** — Arena voting
  - Status: ❌ MISSING (blocking arena)

## Stripe APIs

- [ ] **`/api/stripe/checkout`** — Checkout session
  - Status: ✅ EXISTS (verify Stripe key)

- [ ] **`/api/stripe/customer`** — Customer management
  - Status: ✅ EXISTS

- [ ] **`/api/stripe/products`** — Product listing
  - Status: ✅ EXISTS

- [ ] **`/api/stripe/webhook`** — Webhook handler
  - Status: ✅ EXISTS (verify middleware permissions)

## Performer APIs

- [ ] **`/api/performers`** — List performers
  - Status: ✅ EXISTS

- [ ] **`/api/performers/[slug]`** — Get performer
  - Status: ✅ EXISTS

- [ ] **`/api/performers/upload`** — Upload song
  - Status: TBD

---

# SECTION K: SCHEMAS & DATA MODELS

## Prisma Schemas (Check `schema.prisma`)

- [ ] **User** — Core user model
  - Fields: id, email, role (enum: FAN | PERFORMER | WRITER | VENUE | SPONSOR | ADVERTISER)
  - Status: ✅ EXISTS

- [ ] **Performer** — Performer profile
  - Fields: userId, rank, xp, tier, crownSince, etc.
  - Status: ✅ EXISTS

- [ ] **Venue** — Venue/room model
  - Fields: id, name, skinType, colorVariant, capacity, etc.
  - Status: ✅ EXISTS

- [ ] **LiveSession** — Active live room
  - Fields: id, performerId, venueId, startTime, viewerCount, etc.
  - Status: ✅ EXISTS

- [ ] **Magazine** — Magazine issue
  - Fields: issueId, title, articles, publishedAt, etc.
  - Status: ✅ EXISTS

- [ ] **Article** — Magazine article
  - Fields: id, title, slug, performerId, viewCount, etc.
  - Status: ✅ EXISTS

- [ ] **Playlist** — User playlist
  - Fields: id, ownerId, name, skinType, tracks, etc.
  - Status: ✅ EXISTS

- [ ] **Stripe Payment/Subscription** — Commerce
  - Fields: userId, stripeCustomerId, subscriptionTier, etc.
  - Status: ✅ EXISTS

---

# SECTION L: COUNTS & INVENTORY

## Venue Skins (31 Expected × 10 Colors = 310 Total)

- [ ] **Theater** — 4 skins (Classic, Concert Hall, Lecture Hall, Church)
  - Status: TBD (verify component count)

- [ ] **Arena** — 3 skins (Stadium, Split, Amphitheater)
  - Status: TBD

- [ ] **Club** — 2 skins (Luxury, Basement)
  - Status: TBD

- [ ] **GameShow** — 10 skins
  - Status: TBD

- [ ] **Battle** — 2 skins (Octagon, Versus)
  - Status: TBD

- [ ] **Cypher** — 1 skin (Circle)
  - Status: TBD

- [ ] **Outdoor** — 3 skins (Festival, Rooftop, Mountain)
  - Status: TBD

- [ ] **Special** — 6 skins (Monday Night, Dance Party, World Release, Dirty Dozens, Dance Off, +1)
  - Status: TBD

**TOTAL VENUE SKINS FOUND:** ___/31  
**COLOR VARIANTS VERIFIED:** ___/10 per skin  
**LAUNCH BLOCKING IF INCOMPLETE:** YES (venues core to events)

---

# SECTION M: MISSING SYSTEMS (Blocking Launch)

- [ ] **GameSessionRegistry** — Games discovery blocked
- [ ] **AudioDuckingEngine** — Omni-presence incomplete
- [ ] **MessengerShell** — Messaging system incomplete
- [ ] **VideoTileMoodEngine** — Video modes incomplete
- [ ] **MonitorRuntime** — Monitor system incomplete
- [ ] **VotingRegistry** — Arena voting incomplete

**COUNT:** ___/6 blocking systems identified

---

# PHASE B COMPLETION CHECKLIST

## Route Audit

- [ ] Count existing routes vs. FILE index (expected: 50+)
- [ ] Identify dead routes (404, redirects)
- [ ] Verify route → component → data wiring

## Component Audit

- [ ] Count existing components vs. FILE index (expected: 90+)
- [ ] Identify duplicate components (consolidate)
- [ ] Verify Rule 15 canisters (11 expected)

## Engine Audit

- [ ] Count registries (expected: 6+ canonical + 3-5 missing)
- [ ] Verify all critical engines exist or identify missing ones
- [ ] Check data freshness (real vs. fake)

## API Audit

- [ ] Count endpoints (expected: 20+)
- [ ] Verify middleware permissions (401s on stripe webhook?)
- [ ] Check for orphaned endpoints

## Canister Audit

- [ ] Count implemented canisters (expected: 3-5 of 11)
- [ ] Identify which 6 are still missing
- [ ] Verify embedding matrix per Rule 15

## Venue Audit

- [ ] Count venue skins (expected: 31)
- [ ] Count color variants (expected: 10 per skin)
- [ ] Verify seating layout types (8)

## Launch Blocking

- [ ] Identify which systems block launch
- [ ] Prioritize by revenue impact
- [ ] Create build/wiring task list

---

**PHASE B OUTPUT: RUNTIME_INVENTORY.md (Comprehensive)**  
**Feeds into: CONVERGENCE_MATRIX.md (Blueprint ↔ Runtime mapping)**

