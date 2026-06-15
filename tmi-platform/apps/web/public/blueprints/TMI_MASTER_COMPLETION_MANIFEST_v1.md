# TMI MASTER COMPLETION MANIFEST — v1.0
**The Musician's Index / BerntoutGlobal LLC**
*Synthesized from: Gemini session, ChatGPT session, Claude session — June 2026*
*Prepared by: Claude AI (Design Director / Visual Captain)*

---

## CORE RULE — READ FIRST
> **TRUST > FEATURES**
> **MODIFY FIRST → REPLACE SECOND → REBUILD LAST**
> Every task must improve **Trust**, **Revenue**, or **User Retention** or it goes to backlog.
> No certification = no completion. Proof required.

---

## WHAT WAS ANALYZED (Source Documents)

### Document 1 — Gemini Session
Covered: Orbital tile refactor (4:5 portrait tiles), dual billboard architecture (Industry/Discovery), starburst transition engine, recruitment banner rotation, belt/trophy governor, meritocracy engine with Elo/MMR divisions (Rookie→Legend), Crown Governor replacing seed[0], bot governance (Real/Staff/Simulation/Maintenance), seed account governance, Challenge Score formula, revenue certification loops, Phase A/B/C/D launch sequence, TMI Meritocracy Engine spec, typecheck/build error resolution (LiveVideoShell.tsx, Stripe API version), tsconfig.tsbuildinfo cache bug causing alternating errors.

### Document 2 — ChatGPT Session
Covered: 3D civilization engine (AvatarLODGovernor, PBR materials, WebRTC, WebKit bridge), GlobalEventSyncHeartbeat, WorldTimeAuthority, PersistentAvatarStateStore, MemoryArtifactGenerator, LegendaryMomentDetector, CrowdReconstructionEngine, VenueFailoverCoordinator, HumanityBenchmark system, SpatialAudioMesh, FriendSeatGroupEngine, RelationshipMomentumEngine, CrowdAttentionEngine, VenueCinematicProfile, PerformanceBudgetGovernor, Admin Revenue Command Center, seat persistence migration (SeatReservation Prisma model), Home1CoverPage animation refactor (useRef bypass for orbital rotation), useLiveSessionHeartbeat hook, LiveSessionCleanupGovernor, GlobalLiveSessionRegistry, go-live → propagation chain, SSH key setup (github_dickensmarcell), Home 1-2 billboard rotation engine, cinematic lighting (Obsidian LUT, volumetric bloom, PBR), avatar fidelity (GLTF 2.0, subsurface scattering), subscription tier ad split (Free→Diamond), Stripe webhook certification, force-dynamic route hardening.

### Document 3 — Continuation/Completion Brief
Covered: Final 100% completion lock, must-launch vs post-launch vs backlog sorting, visual certification report requirements, systems certification report requirements, email protection, admin KPI dashboard, mobile access certification, live loop proof, memory wall / polaroid capture engine, social/viral mixtape loop, rehearsal room venue (first post-launch venue), placeholder purge rule, revenue visibility rule, agent role assignments.

---

## WHAT IS CONFIRMED COMPLETE (Do NOT rebuild)

| System | File/Location | Status |
|--------|--------------|--------|
| pnpm typecheck | apps/web | PASS (0 errors after cache purge) |
| pnpm build | apps/web | PASS (1,147+ pages) |
| /404 + /500 prerender fix | pages/ + app/ | FIXED |
| LiveVideoShell.tsx | src/components/live/ | FIXED |
| Stripe API version | beats/checkout + stripe/webhook | FIXED (2026-02-25.clover) |
| tsconfig.tsbuildinfo | apps/web/ | PURGE on each run |
| CHANNEL_ROTATION ticker | Home1CoverPage.tsx | COMPLETE |
| BillboardColumnPulse | src/components/ | COMPLETE (Industry/Discovery/Challenge tabs) |
| ArenaEventShell | src/components/live/ | COMPLETE |
| AudienceScene | src/components/live/ | COMPLETE |
| VideoPanelCurtain | src/components/live/ | COMPLETE |
| WorldRuntime.ts | src/lib/world/ | COMPLETE |
| WorldLobby.tsx | src/components/home/ | COMPLETE |
| useLiveSessionHeartbeat | src/hooks/ | COMPLETE |
| LiveSessionCleanupGovernor | src/lib/broadcast/ | COMPLETE |
| GlobalLiveSessionRegistry | src/lib/broadcast/ | COMPLETE |
| SeatReservation (Prisma) | packages/db/prisma/ | MIGRATED |
| force-dynamic route hardening | All dynamic API routes | APPLIED |
| Seat reserve API | api/seats/reserve/ | HARDENED |
| CrowdReconstructionEngine | src/lib/ | COMPLETE |
| WorldStateReplicator | src/lib/ | COMPLETE |
| Admin Revenue Command Center | /admin/revenue/ | COMPLETE |
| SSH Key (github_dickensmarcell) | ~/.ssh/ | ACTIVE |
| All 11 lobby walls | src/app/rooms/ | COMPLETE |
| 31 venue skins | src/components/venue/ | COMPLETE |
| Challenge Arena page | /rooms/challenge-arena | COMPLETE |
| All Home 1-5 routes | src/app/home/ | ROUTES EXIST |
| go-live → propagation chain | api/live/ + GlobalLiveSessionRegistry | WIRED |

---

## PHASE A — VISUAL TRUTH (Claude's Domain)
*Priority: FIRST. Nothing else matters if the first 3 seconds fail.*

### A1 — Home 1 Three-Rail Anchor Layout
**File:** `apps/web/src/components/home/Home1CoverPage.tsx`
**Problem:** Page "leaks" — masthead floats, side margins dead, no anchoring.
**Fix:**
```tsx
// Replace fluid container with:
<div style={{
  display: 'grid',
  gridTemplateColumns: 'minmax(200px, 1fr) auto minmax(200px, 1fr)',
  width: '100vw',
  minHeight: '100vh',
  gap: 0
}}>
  {/* LEFT RAIL — Magazine + Promotion + Trending */}
  {/* CENTER — Masthead + Orbital + Banner */}
  {/* RIGHT RAIL — Live Rankings + Ads + Sponsors */}
</div>
```
**Deliverable:** Screenshot showing masthead anchored, no blank margins, rails filled.

### A2 — Per-Letter Logo Color Cycling
**File:** `apps/web/src/components/home/Home1CoverPage.tsx`
**Problem:** Title stays static teal. Not cycling.
**Fix:**
```tsx
// Split "THE MUSICIAN'S INDEX" into individual <span> elements
// Each span gets animation-delay: (letterIndex * 0.08)s
// CSS: @keyframes typeColor { 0%{color:#fff} 25%{color:#FFD700} 50%{color:#00FF7F} 75%{color:#E63000} 100%{color:#fff} }
// animation: typeColor 4s ease-in-out infinite
// Letter T=delay 0s, H=0.08s, E=0.16s ... X=1.36s
// Result: wave of color sweeps T→X continuously
```
**Deliverable:** Screenshot showing each letter cycling independently.

### A3 — Orbital Tiles (4:5 Portrait, No Cropping)
**File:** `apps/web/src/components/home/Home1CoverPage.tsx` (orbital node section)
**Problem:** Circular avatar bubbles, faces cropped, flags tiny, no metadata.
**Fix spec:**
```
Each orbital node card must show:
  TOP LEFT:  Rank badge (#1 gold, #2 silver, #3 bronze)
  TOP RIGHT: Country flag emoji + country code (🇺🇸 USA)
  CENTER:    Motion asset / profile image
             aspect-ratio: 4/5
             object-fit: cover
             object-position: center center
  BOTTOM 25% overlay (semi-transparent dark gradient):
    LEFT:  Performer name (bold white, min 12px)
           Genre pill (small rounded tag)
    RIGHT: Live pulse dot (green = LIVE, grey = offline)
           Audience count (e.g. "2,431 watching")
  
  ROUTING: 
    if (isLive && liveRoomId) → /live/rooms/[id]
    else → /articles/performer/[slug]

  FALLBACK CHAIN:
    premiumMotionAsset (5-7s) → motionAsset (2-4s) → profileVideo → profileImage → genreDefault
```
**Do NOT:** Use circular clips. Do NOT crop at top. Do NOT show only initials.
**Deliverable:** Screenshot of 10 orbital tiles with metadata visible, no cropped faces.

### A4 — Starburst Transition (Genre Switch)
**File:** `apps/web/src/components/home/Home1CoverPage.tsx`
**Problem:** Genre rotation switches abruptly without animation.
**Fix:**
```
Sequence:
  1. Current genre visible (8-10 seconds)
  2. starburst = true → CSS rays/particles animate from center outward
  3. Current performers fade opacity: 1 → 0
  4. Genre label fades out
  5. Starburst expands to fill orbital area
  6. New genre label fades in
  7. New 10 performers fade in
  8. starburst = false
  9. Cycle repeats

CSS @keyframes starburstRay {
  0% { transform: scaleY(0); opacity: 1; }
  50% { transform: scaleY(1); opacity: 0.8; }
  100% { transform: scaleY(1.5); opacity: 0; }
}
// 12-16 rays radiating from orbital center
// Duration: 800ms. MUST complete before next genre appears.
```
**Deliverable:** Screen recording showing starburst completing before genre swap.

### A5 — ActiveGenre Synchronization (Home 1 ↔ Home 1-2)
**Files:** `apps/web/src/providers/GenreContext.tsx` (create if missing)
**Problem:** Home 1 and Home 1-2 rotate independently. Must sync.
**Fix:**
```tsx
// Create GenreContext provider at layout level
// Both Home1CoverPage and Home1-2 consume useGenreContext()
// When starburst triggers on Home 1, genreIdx updates in context
// Home 1-2 reads same genreIdx and switches simultaneously
// No localStorage needed — context persists during session
```
**Deliverable:** Side-by-side confirmation that both pages show same genre.

### A6 — Recruitment Banner Full Rotation
**File:** `apps/web/src/components/home/Home1CoverPage.tsx` (CHANNEL_ROTATION array)
**Problem:** Banner has some messages but missing structured performer/role/B2B/CTA rotation.
**Replace CHANNEL_ROTATION with:**
```tsx
const CHANNEL_ROTATION = [
  // PERFORMER GENERAL
  '🎵 ALL PERFORMERS WELCOME — JOIN NOW',
  '🌍 FREE GLOBAL PROMOTION FOR ALL ARTISTS',
  '📈 CLIMB THE GLOBAL RANKINGS TODAY',
  '🔍 GET DISCOVERED WORLDWIDE — SIGN UP FREE',
  // DJs
  '🎧 DJs WANTED — JOIN DJ BATTLE NIGHT',
  '🎧 DJ DISCOVERY CHARTS NOW OPEN',
  '🎧 SUBMIT YOUR MIX — DJs WELCOME',
  '🎧 DJ SHOWCASE — ALL STYLES ACCEPTED',
  // COMEDY
  '😂 DIGITAL COMEDY NIGHT — COMEDIANS WANTED',
  '😂 JOKE-OFF BATTLES — ALL COMEDY STYLES ACCEPTED',
  '😂 STAND-UP · IMPROV · SKETCH — ALL WELCOME',
  '😂 COMEDY SHOWCASE — JOIN THE ROTATION',
  // DANCE
  '💃 DANCE-OFF CHALLENGES — DANCERS WANTED',
  '💃 ALL DANCE CREWS WELCOME — SIGN UP NOW',
  '💃 DANCE SHOWCASE — ALL STYLES ACCEPTED',
  '💃 BRING YOUR MOVES — SHOWCASE YOUR CREW',
  // PRODUCERS / MUSIC
  '🎹 PRODUCERS WANTED — BEAT BATTLES LIVE',
  '🎹 PRODUCER SHOWCASE — SUBMIT INSTRUMENTALS',
  '🎤 SINGERS WELCOME — VOCAL SHOWCASE OPEN',
  '🎸 BANDS WANTED — LIVE PERFORMANCE SLOTS OPEN',
  '🥁 ALL INSTRUMENTALISTS WELCOME',
  '🎭 ACTORS · MAGICIANS · SPOKEN WORD ARTISTS',
  // BUSINESS / B2B
  '🏢 VENUES WANTED — BOOK TALENT DIRECT',
  '📣 PROMOTERS WANTED — PROMOTE SHOWS WORLDWIDE',
  '💼 SPONSORS WANTED — ADVERTISE FROM $25',
  '📺 ADVERTISERS WANTED — REACH LIVE AUDIENCES',
  // REVENUE / CTA
  '🎟 SELL TICKETS THROUGH TMI',
  '💰 EARN TIPS LIVE — PERFORMERS & DJs',
  '📅 GET BOOKED — LIST YOUR AVAILABILITY',
  '🏆 CHALLENGE YOUR SONG — SONG FOR SONG',
  '⚔️ JOIN BATTLE ARENA — COMPETE TONIGHT',
  '🎤 CYPHER ARENA OPEN — DROP IN ANYTIME',
];
```

### A7 — Home 1-2 Billboard Rotation (Genre Cycling + Rich Cards)
**File:** `apps/web/src/app/home/1-2/page.tsx`
**Problem:** Locks on one genre, cards show only initials and numbers.
**Fix:**
```
CATEGORIES to rotate through (every 10 seconds):
  Hip Hop, R&B, Rock, Country, Pop, EDM, Latin, Jazz, Blues, Gospel,
  Reggae, Metal, Folk, Classical, Instrumental, Beat Makers, Producers,
  DJs, Comedians, Joke-Offs, Dance-Offs, Dance Crews, Actors, Magicians,
  Poets, Content Creators, Fans, Venues, Promoters, Sponsors, Advertisers,
  Writers, Guitarists, Drummers, Pianists, Violinists, Bassists,
  Saxophonists, Trumpet Players,
  ALSO: Best Bands, Best Rap Groups, Best Choirs, Best Groups,
  Most Participating Fan, Top Tipper This Week, Best Overall Performer,
  Last Week's Game Winners, Showcase MVP, Audience Favorites

EACH CARD must show:
  - Profile image (portrait, 4:5, object-fit:cover, NO INITIALS ONLY)
  - Rank number
  - Performer name (bold)
  - City / State / Country
  - Country flag emoji
  - Genre/Category
  - Fan count
  - Likes count
  - Live status badge (green = LIVE, grey = offline)
  - Tier/badge (Rookie, Contender, Elite, Champion, Legend)

ROTATION RULE:
  - Different performers in each cycle (not same 10 forever)
  - Different category every 10 seconds
  - Manual arrows still work (override auto-rotation)
  - Category label visibly changes with starburst or fade
  - Colors shift per category (DJ=purple/cyan, Comedy=blue, Dance=pink, etc.)
```

### A8 — Showcase System UI
**Files:** Homepage, navigation, room pages
**Add visible UI for:**
- DJ Showcase
- Comedy Showcase
- Dance Showcase
- Singer Showcase
- Band Showcase
- Producer Showcase
- Instrumentalist Showcase
- Actor Showcase
- Magician Showcase
- Spoken Word Showcase
*(Alongside existing Battles and Cyphers — these are for performers who want exposure without competing)*

### A9 — CTA Conversion Audit
**Every screen must answer: "What does this person click next?"**
- Make primary CTA buttons large, high-contrast, impossible to miss
- Dead buttons: REMOVE or wire up
- Placeholder text: REPLACE with real content or clear "coming soon" label
- Every profile page needs clear back navigation
- No dead ends (404 without branded fallback)

### A10 — Mobile First Certification
**Test at: 390px / 430px / 768px / desktop**
- No horizontal overflow
- No clipped orbital images
- No unreadable text (min 12px)
- No hidden/overlapping buttons
- Bottom nav does not block CTAs
- Tab bars scroll horizontally if needed
- Orbital fits on mobile without scrolling

---

## PHASE B — MERITOCRACY ENGINE (Blackbox's Domain)

### B1 — Crown Governor (CRITICAL — Replace Big Ace)
**Problem:** `performers[0]` (Big Ace, seed order) is hardcoded as crown holder.
**Fix:**
```typescript
// In Home1CoverPage.tsx, replace:
// const crowdHolder = performers[0]
// With:
async function getTopPerformer(genre: string): Promise<Performer> {
  const result = await prisma.performanceRating.findFirst({
    where: { genre, accountType: 'REAL_USER' },
    orderBy: { challengeScore: 'desc' }
  });
  return result ?? GENRE_DATA[genre].performers[0]; // fallback only
}
```
**Rule:** Crown must belong to current #1 performer by Challenge Score for active genre. Seed accounts NEVER hold crown.

### B2 — Challenge Score Engine
**Formula:**
```
S = (V × 0.30) + (A × 0.20) + (W × 0.15) + (C × 0.15) + (Sh × 0.10) + (T × 0.10) + (Wi × 0.05) + (J × 0.05) - fraudPenalty

Where:
  V  = Audience Votes (unique verified viewers only)
  A  = Live Attendance
  W  = Watch Time (minutes)
  C  = Completion Rate (% who stayed to end)
  Sh = Shares
  T  = Tips (dollar value, normalized)
  Wi = Challenge Wins
  J  = Judge Scores (panel or community)
  fraudPenalty = detected bot votes / artificial inflation
```
**Recalculate:** After EVERY performance event, not weekly/monthly.
**File:** `apps/web/src/lib/scoring/ChallengeScoreEngine.ts`

### B3 — Division System (Rookie → Legend)
**Public tiers:**
```
Rookie     (0 – 999)
Prospect   (1,000 – 1,299)
Contender  (1,300 – 1,599)
Elite      (1,600 – 1,899)
Champion   (1,900 – 2,199)
Legend     (2,200+)
```
**Hidden:** `skillRating` (MMR), `confidenceRating` (data reliability score)
**Rules:**
- Promotion: 10 wins + 85% audience approval + watch time above threshold
- Relegation: 10 straight losses + poor retention
- Discovery Protection: First 5 performances only match other newcomers (`isProtected: true`)
- Genre-specific: Rap rating ≠ Comedy rating ≠ DJ rating — separate per genre
**Schema addition:**
```prisma
model PerformanceRating {
  id             String  @id @default(uuid())
  userId         String
  genre          String
  challengeScore Float   @default(0)
  skillRating    Int     @default(800)
  division       String  @default("Rookie")
  isProtected    Boolean @default(true)
  performanceCount Int   @default(0)
  @@unique([userId, genre])
}
```

### B4 — Belt & Trophy Governor
**Rules:**
- Champion notified of defense: 48h notice
- Champion must appear for defense or forfeit
- Missed defense → Forfeit Warning → Title Vacated → Interim Champion created OR passed to next ranked contender
- Inactive champions (no performance in 30 days) → automatic title vacancy review
**File:** `apps/web/src/lib/governance/BeltTrophyGovernor.ts`

### B5 — Anti-Fraud Governor
```typescript
// Vote integrity rules:
// 1. Unique viewers only — same IP/device = 1 vote
// 2. Velocity check: if votes spike +500 in <60s from non-returning users → cap at 1.5x previous average
// 3. User quality multiplier: verified/returning accounts = 1.25x weight, ghost/new = 0.5x weight
// 4. Watch time floor: votes from viewers <30s watch time = 0.25x weight
// 5. Flag for manual review: >300% normal vote velocity in any 5-minute window
```

### B6 — Bot/Seed Account Governance
**Account classes (add `accountType` to User model):**
```prisma
enum AccountType {
  REAL_USER     // Eligible for ranks, wins, charts, belts, tips, revenue
  STAFF         // Visible hosts/mods — no rank/vote/win/earn
  SIMULATION    // Load testing — no rank/vote/win/earn/appear in charts
  MAINTENANCE   // Invisible health monitors — no rank/vote/win/earn/appear anywhere
}
```
**Hard rules:**
- `canRank: false` for STAFF, SIMULATION, MAINTENANCE
- `canVote: false` for MAINTENANCE, SIMULATION
- `canWinChallenges: false` for all non-REAL_USER
- `canAppearOnCharts: false` for all non-REAL_USER
- Maintenance agents: prefix ID with `maint_`, invisible in all user-facing lists
- Simulation agents: prefix ID with `sim_`, excluded from all analytics
- Staff agents: prefix ID with `staff_`, visible but clearly labeled as TMI Staff

**TMI Service Network Tiers:**
```
Tier 1 — Venue Staff (visible):
  DJ Nova (Host), Comedy Concierge, Stage Director, Audience Guide,
  Sponsor Host, Ticket Assistant, Producer Assistant, Promoter Assistant

Tier 2 — Maintenance Agents (invisible):
  Seat Monitor, Stream Monitor, Queue Monitor, Ticket Monitor,
  Sponsor Monitor, Billboard Monitor, WebRTC Monitor, Payment Monitor

Tier 3 — Simulation Accounts:
  Fan Alpha-Gamma, DJ Test One, Comedian Test One, Venue Test One

Tier 4 — Guardian Network:
  Watch broken routes, 404s, failed uploads, failed livestreams,
  database issues, security alerts, performance degradation
```

### B7 — Founder/Seed Account Rule (PERMANENT)
```
Founder Status ≠ Champion
Founder Status ≠ Crown Holder
Founder Status ≠ Chart Position
Founder Status ≠ Belt/Trophy

Founder Badge = permanent honor badge only
Big Ace, Marcel, Justin, Jay = founder badge only
Crown/Chart/Belt belongs to whoever earned it through Challenge Score
```

---

## PHASE C — REVENUE CERTIFICATION

### C1 — Revenue Loop Verification Checklist
Every loop must prove: `Checkout → Webhook → Database → UI Visibility → Analytics → Admin Dashboard`

| Revenue Stream | Stripe Event | DB Model | UI Evidence | Admin Dashboard |
|---------------|-------------|----------|-------------|-----------------|
| Fan Membership ($4.99) | checkout.session.completed | Subscription | Badge on profile | Revenue Today |
| Performer Membership | checkout.session.completed | Subscription | Performer verified badge | Revenue Today |
| Tips | payment_intent.succeeded | Tip + LedgerEntry | Tip animation | Tips Today |
| Beat Sale | checkout.session.completed | BeatLicense + LedgerEntry | License in buyer vault | Beat Revenue |
| Advertiser ($25) | checkout.session.completed | AdCampaign + Placement | Ad visible on page | Ads Running |
| Sponsor Purchase | checkout.session.completed | SponsorPlacement | Logo on rail | Sponsors Active |
| Ticket Purchase | checkout.session.completed | Ticket | Ticket in fan wallet | Tickets Sold |

### C2 — Admin KPI Dashboard (Single Source of Truth)
**Route:** `/admin/observatory` or `/admin/kpi`
**Must show (live from database, NO fake numbers):**
```
Today's Revenue          Active Performers
New Users Today          Live Rooms Now
Tickets Sold Today       Tips Sent Today
Ads Currently Running    Sponsors Active
Failed Payments          Failed Webhooks
Failed Uploads           WebRTC Failures
Support Tickets Open     Bot Health Status
Newest Members           Newest Performers
```
**Rule:** If a purchase succeeds in Stripe but doesn't appear here → LOOP FAILS CERTIFICATION

### C3 — Ticket System (Digital + Printable)
**Digital tickets:** QR code, scan on entry, check-in record
**Printable tickets:**
```typescript
// Use react-pdf to generate on-demand after Stripe confirms
// Venue can customize: name, date, seat, logo, any text
// Bots can auto-generate using same NFT tech pipeline
// Download link sent via email receipt
// /tickets/print/[ticketId] route
// /api/tickets/render endpoint → returns PDF blob
```
**Brick-and-mortar sales:** POS-style flow, cash or card, print immediately
**Batch print:** `/tickets/print-batch` for venue staff

### C4 — Subscription Tier Ad Split
```
FREE tier     → most ads (highest frequency)
FAN tier      → moderate ads
ARTIST tier   → fewer ads
VIP tier      → minimal ads
SPONSOR tier  → no ads
DIAMOND tier  → completely ad-free
```
**Implementation:** Middleware checks `user.tier` before serving ad slots. Diamond users (`bjmbeat@berntoutglobal.com`, `facethebully916@gmail.com`, SKEET) bypass all ad injection.

---

## PHASE D — LIVE STREAM CERTIFICATION

### D1 — Go Live → Propagation Chain Verification
```
1. Performer clicks "GO LIVE NOW"
2. Camera/mic permission dialog opens
3. Local preview appears in performer view
4. POST /api/live/go → GlobalLiveSessionRegistry creates liveSessionId
5. useLiveSessionHeartbeat starts (ping every 20s)
6. Homepage live tile appears within 5 seconds (LiveSyncProvider polls every 4s)
7. Lobby wall video tile activates
8. Audience joins via /live/rooms/[id]
9. Performer sees audience count, avatar bubbles, chat, tips
10. Admin observatory shows stream health
11. Tip button works → Stripe → webhook → LedgerEntry
12. Revenue dashboard updates
```
**10-minute live test requirement:** Stream must not disappear, heartbeat must stay healthy, viewer count must update.

### D2 — WebRTC / Media Capture
**Verify on desktop AND mobile:**
- `navigator.mediaDevices.getUserMedia({video: true, audio: true})`
- MediaRecorder API functional
- WebRTC peer connection established
- Stream reconnect on dropout (< 5 second recovery)
- Mobile camera orientation handled
- WebKit/WKWebView bridge working for iOS

### D3 — Video Panel / Lobby Wall
- All 11 lobby walls confirmed live-wired
- Video tiles show LIVE status when performer active
- Billboard Live lobby walls have video tiles everywhere
- Curtain system (VideoPanelCurtain.tsx): 10s/30s/1min countdown, curtain opens, fires onPerformanceStart

---

## PHASE E — EMAIL SYSTEM

### E1 — Required Emails
| Email Type | Trigger | From Address | Contains |
|-----------|---------|-------------|---------|
| Signup confirmation | User registers | support@themusiciansindex.com | Verify link |
| Email verification | Click verify | support@themusiciansindex.com | Confirmed |
| Password reset | Request reset | support@themusiciansindex.com | Reset link |
| Purchase receipt | Stripe success | support@themusiciansindex.com | Amount, item, receipt |
| Ticket receipt | Ticket purchase | support@themusiciansindex.com | QR code, ticket PDF link |
| Sponsor confirmation | Sponsor purchase | support@themusiciansindex.com | Placement details |
| Advertiser confirmation | Ad purchase | support@themusiciansindex.com | Campaign details |
| Webhook failure alert | Stripe webhook fails | support@themusiciansindex.com | Admin notification |
| Performer go-live notification | If enabled | support@themusiciansindex.com | Fan notification |

### E2 — Email Protection
- SPF, DKIM, DMARC records set for `themusiciansindex.com`
- Resend API key active in production Vercel env vars
- `EMAIL_FROM=support@themusiciansindex.com` in Vercel
- No spam triggers in subject lines
- Mobile-formatted HTML emails
- No broken links in any email template

---

## PHASE F — PROFILE COMPLETION (All User Types)

### F1 — Required Fields (Every Profile Type)
```
ALL profiles must have:
  - Profile image (camera binding, device registry)
  - Display name
  - Bio/description
  - Location (city, state, country, flag)
  - Social links
  - Live session state (LIVE badge when active)
  - Fallback media chain (motion → photo → genre default)
  - Messages tab
  - Articles/news tab
  - Memories/moments tab
  - Rewards/achievements tab
  - Return navigation
  - No dead action buttons

PERFORMER profiles add:
  - Beats/tracks upload
  - Booking availability
  - Tier/badge display
  - Fans list
  - Analytics tab
  - Subscription tier visual
  - Challenge Score display
  - Division/rank badge

FAN profiles add:
  - Tickets wallet
  - Fan clubs list
  - Tips sent history
  - Points/XP display
  - Achievements

VENUE profiles add:
  - Events calendar
  - Seating map
  - Ticket management
  - Revenue dashboard link

SPONSOR/ADVERTISER profiles add:
  - Active campaigns
  - Placement visibility
  - Analytics/impressions
  - Budget tracker

PROMOTER profiles add:
  - Events promoted
  - Revenue earned
  - Commission history
```

---

## PHASE G — MISSING COMPONENTS (Build These)

### G1 — Memory Wall / Polaroid Capture
**Purpose:** Retention engine — buy ticket → attend → capture moment → share → return
```
Files to create:
  src/components/memory/PolaroidCaptureButton.tsx
  src/components/memory/PolaroidPop.tsx
  src/components/memory/MemoryWall.tsx
  src/lib/memory/captureVideoFrame.ts
  src/lib/memory/MemoryWallEngine.ts

Routes:
  /profile/[slug]/memories
  /hub/fan/memories
  /hub/performer/memories
  /hub/venue/memories

Privacy rules:
  - Public rooms: capture allowed
  - Private rooms: capture disabled unless host allows
  - Youth/protected rooms: disabled by default
  - No hidden recording
```

### G2 — Founding Member Program (Badge System)
```
On signup for first N users, automatically assign:
  FOUNDING PERFORMER badge
  FOUNDING FAN badge
  FOUNDING ADVERTISER badge
  FOUNDING VENUE badge
  FOUNDING PROMOTER badge
  FOUNDING SPONSOR badge

These badges are HISTORICAL — never affect competition, rankings, or charts.
Display on profile as a permanent honor.
```

### G3 — Showcase Awards (Non-Battle Recognition)
```
Awards that don't require competition:
  Showcase MVP
  Audience Favorite
  Most Improved
  Most Shared
  Most Booked
  Most Watched
  
These give non-battle performers meaningful achievements.
Wire into MemoryArtifactGenerator for auto-generation.
```

### G4 — Venue Operations Deck
```
Route: /hub/venue/operations
Features:
  - Print tickets (PDF, custom branding)
  - Manage physical entry lists
  - Update digital billboard walls in real-time
  - Brick-and-mortar POS sales
  - Batch ticket operations
  - QR scanner integration
```

### G5 — Artist Production Hub
```
Route: /hub/performer/studio
Features:
  - Upload motion assets (2-4s loops)
  - Upload premium motion assets (5-7s)
  - Manage avatar wardrobe
  - Schedule "World Release" countdown
  - Beat upload + metadata
  - Track analytics per upload
```

---

## PLACEHOLDER PURGE RULE

Every visible placeholder on launch day must be one of:
1. **LIVE DATA** — real user, real venue, real event, real metric
2. **SYSTEM DATA** — clearly labeled Staff/Maintenance account
3. **LAUNCH SEED DATA** — clearly identified, replaceable by real users

**NEVER on launch day:**
- Fake revenue numbers
- Fake viewer counts
- Fake tip amounts
- Fake fan counts
- Fake like counts
- Seed account in crown position
- Seed account in chart position
- Seed account holding belt/trophy

If data is not real, show: `0` or `—` or `LIVE DATA PENDING`

---

## VERCEL ENVIRONMENT VARIABLES (Confirm All Active)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_FAN_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ARTIST_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_VIP_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_MONTHLY=price_...
DAILY_API_KEY=ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7
DAILY_DOMAIN=themusiciansindex
TICKET_SECRET=[32-char random]
ADMIN_EMAILS=berntmusic33@gmail.com,bigace@berntoutglobal.com
DIAMOND_EMAILS=facethebully916@gmail.com,bjmbeat@berntoutglobal.com
EMAIL_FROM=support@themusiciansindex.com
RESEND_API_KEY=[your resend key]
NEXT_PUBLIC_APP_URL=https://themusiciansindex.com
DATABASE_URL=[production postgres URL]
```

---

## MUST LAUNCH / POST-LAUNCH / BACKLOG SORT

### MUST LAUNCH NOW
- [x] Build stable (0 errors)
- [ ] Home 1 three-rail anchor
- [ ] Home 1 orbital tiles (4:5, no cropping)
- [ ] Home 1 starburst transition
- [ ] Home 1 letter-by-letter logo color
- [ ] Home 1-2 rotating rich cards
- [ ] Recruitment banner full rotation
- [ ] Crown Governor (no Big Ace)
- [ ] Challenge Score Engine
- [ ] Division system
- [ ] Bot governance (REAL_USER / STAFF / SIMULATION / MAINTENANCE)
- [ ] Seed accounts excluded from charts
- [ ] Membership purchase → badge
- [ ] Tips → ledger → dashboard
- [ ] Advertiser purchase → placement → dashboard
- [ ] Sponsor purchase → placement → dashboard
- [ ] Beat sale → license → dashboard
- [ ] Ticket purchase → QR → printable
- [ ] Go Live → propagation → homepage tile
- [ ] WebRTC camera/mic working
- [ ] Admin KPI dashboard (real data only)
- [ ] All email types working
- [ ] Mobile access (390/430/768)
- [ ] No horizontal overflow anywhere
- [ ] No dead buttons
- [ ] No fake metrics

### POST-LAUNCH (Next Sprint)
- [ ] Full 3D avatars (GLTF, PBR materials)
- [ ] Ultra-realistic 3D venues
- [ ] Face scan identity engine
- [ ] Advanced clothing/emotes/props
- [ ] NFT ticket art customization
- [ ] Full auction system
- [ ] Advanced booking department
- [ ] Monthly magazine automation
- [ ] Memory Wall / Polaroid capture
- [ ] Social/viral mixtape sharing
- [ ] Rehearsal Room Venue (first new venue type)
- [ ] Advanced AI bot behaviors
- [ ] Raspberry Pi / OpenCV native camera
- [ ] iOS/macOS WebKit app wrapper
- [ ] World concert sync event
- [ ] Humanity Benchmark testing (20-avatar stress test)

### BACKLOG (Future)
- Extra games beyond current set
- Extra venue skin packs
- Complex ML-based recommendations
- Advanced simulation/crowd AI
- Physical hardware kiosk expansion
- Global event sync heartbeat (128 BPM simultaneous drops)
- CinematicWorldEngine (PBR lighting pass)
- AvatarLODGovernor (LOD for 50+ avatars)
- SpatialAudioMesh / VoiceDuckingEngine
- MemoryArtifactGenerator NFT auto-creation
- Cross-device controller input (gamepad API)

---

## FINAL CERTIFICATION COMMANDS

```bash
# 1. Clear stale cache
rm -f apps/web/tsconfig.tsbuildinfo
rm -rf apps/web/.next

# 2. Type check
pnpm -C apps/web typecheck
# REQUIRED: exit code 0, 0 errors

# 3. Build
pnpm -C apps/web build  
# REQUIRED: exit code 0, 0 errors

# 4. Route smoke test (dev server running)
curl -I http://localhost:3000/home/1
curl -I http://localhost:3000/home/1-2
curl -I http://localhost:3000/home/2
curl -I http://localhost:3000/home/3
curl -I http://localhost:3000/home/4
curl -I http://localhost:3000/home/5
curl -I http://localhost:3000/live/rooms
curl -I http://localhost:3000/admin/observatory

# 5. Revenue loop test
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Then test each purchase type
pnpm exec ts-node scripts/verify-beat-sale.ts
```

---

## AGENT ROLE ASSIGNMENTS

### CLAUDE (Visual Captain — Phase A)
Fix what users see. Modify existing files only. No new architecture.
- Home 1 three-rail anchor
- Orbital tiles (4:5, metadata, routing)
- Starburst transition
- Letter color cycling
- Recruitment banner
- Home 1-2 rich cards + rotation
- Showcase UI
- Mobile certification
- CTA audit

### BLACKBOX (Systems Director — Phase B/C/D)
Build and patch systems. Audit before building.
- Crown Governor
- Challenge Score Engine
- Division/Matchmaking
- Belt/Trophy Governor
- Bot governance schema
- Revenue loop certification
- Admin KPI dashboard
- Email system
- Live loop certification
- Ticket printing

### GEMINI (Audit Gate — No Building)
PASS/FAIL only. Certification is LOCKED until Gemini signs off.
- Build passes
- Home 1 visual passes
- Home 1-2 rotation passes
- Mobile passes
- Stripe passes
- Email passes
- Live loop passes
- Revenue dashboard accurate

### MARCEL (Head of Sales)
While agents work:
- 4 advertisers at $25 = first $100
- 20 performers
- 20 fans
- 5 DJs
- 2 promoters
- 2 venues
- Writers

---

## PLATFORM LAWS (Non-Negotiable — Never Override)

1. Big Ace must approve all cash payouts
2. August 8 = Marcel's birthday (contest registration gate)
3. Diamond tier hardcoded: facethebully916@gmail.com + bjmbeat@berntoutglobal.com
4. World Dance Party = DanceArena3D only, NO SEATS EVER
5. Crown holder = real performer, never seed order
6. Founder badge ≠ Champion status
7. TRUST > FEATURES — always
8. Fake metrics never go to production
9. Seed accounts never hold competitive positions
10. Code existence ≠ visual verification — proof required

---

*End of TMI Master Completion Manifest v1.0*
*Claude AI — Design Director / Visual Captain*
*BerntoutGlobal LLC / The Musician's Index*
