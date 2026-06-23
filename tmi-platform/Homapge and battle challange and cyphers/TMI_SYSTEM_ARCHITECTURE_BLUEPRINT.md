# TMI SYSTEM ARCHITECTURE BLUEPRINT
### The Musician's Index — Complete OS-Level Build Law
### Claude = Architect / Designer · BlackBox = Wiring / Integration / Testing
### Authority: Marcel (Founder) · Version: FINAL v1.0

---

## ROLE SEPARATION (NON-NEGOTIABLE)

| Agent | Responsibility |
|-------|---------------|
| Claude | Define systems · Design layouts · Create blueprints · Architect connections |
| BlackBox | Wire existing designs · Connect APIs · Place canisters · Fix build errors · Run tests |
| BlackBox MUST NOT | Redesign Claude's visual systems · Invent new layouts · Replace working components |

---

## CORE ENGINE REGISTRY — THE OS CANISTERS

These five engines are the platform's nervous system. Every page and dashboard mounts them.

| Engine | File | Responsibility | Data Hook |
|--------|------|---------------|-----------|
| `PlaylistEngine` | `src/lib/engines/PlaylistEngine.ts` | Media state, queuing, cross-room WebRTC sync | `playlistId` |
| `MemoryWallEngine` | `src/lib/engines/MemoryWallEngine.ts` | Storage, collage, theme logic, auto-generation | `ownerId`, `collectionId` |
| `PresenceEngine` | `src/lib/engines/PresenceEngine.ts` | WebRTC, lobby wall, avatar sync, room presence | `userId`, `roomId` |
| `RewardEngine` | `src/lib/engines/RewardEngine.ts` | XP math, collection unlocking, badges, trophies | `userId`, `tier` |
| `AdRevenueEngine` | `src/lib/engines/AdRevenueEngine.ts` | Tier-based ad injection, point logic | `tier`, `userRole` |

---

## 1. PLAYLIST SYSTEM

### Purpose
A living animated media room — not a song list. Old-school MySpace inspiration, TMI broadcast network style.

### Who Gets It
- Fan: personal playlist ✓
- Performer: performer playlist ✓
- Venue: event playlist ✓
- Sponsor: sponsored playlist ✓
- Admin: view-only ✓

### What It Accepts
Uploaded audio · Uploaded video · YouTube links · Spotify links · Apple Music · SoundCloud · Tidal · Pandora · Beat/instrumental · Comedy clips · Dance videos · Music videos · Ticket/event links · Artist profile links · Beat marketplace links · Any website URL

### Modes
- Personal Playlist — fans collect favorites
- Performer Playlist — showcase songs, videos, live sets, beats
- Radio Playlist — Stream & Win rotation, XP earned per listen
- Event Playlist — concerts, battles, dance-offs, cyphers
- Sponsor Playlist — brand can sponsor, ads between tracks

### Skins (10 animated skins)
Submarine · Neon Club · Radio Station · Cypher Arena · Concert Stage · Game Show · Velvet Theater · DJ Booth · Magazine · World Dance Party

### Skin Generator
Text prompt → AI generates: background + animated frame + button style + equalizer behavior + transitions + player layout

### Lobby Sync (WebRTC)
When enabled: everyone in the room hears the same song at the same millisecond. Host controls playback. No delays. Uses `PresenceEngine` broadcast channel.

### Dashboard Placement
- Collapsible chevron canister on all dashboards
- Closed: compact face showing current track + count
- Open: full animated player with skin stage
- CSS-scoped — never bleeds into parent layout

### Components Required
```
PlaylistPlayer.tsx
PlaylistSkinRenderer.tsx
PlaylistSkinGenerator.tsx
PlaylistMediaCard.tsx
PlaylistEmbedWidget.tsx
PlaylistSharePanel.tsx
PlaylistDashboardPanel.tsx (canister wrapper)
PlaylistLobbySync.ts (WebRTC sync engine)
```

### XP Rules
- Upload track: +10 XP
- Track played 100 times: +25 XP
- Playlist reaches 1,000 plays: +100 XP (auto-memory generated)
- Shared to lobby: +5 XP

---

## 2. MEMORY WALL SYSTEM

### Purpose
The emotional heart of TMI. A motion-collage container — part photo wall, part trophy case, part concert scrapbook, part social share, part avatar-powered room experience.

### Who Gets It
- Fan: full memory wall ✓
- Performer: full memory wall ✓
- Venue: venue memories ✓ (event-focused)
- Sponsor: sponsor/campaign memories ✓
- Admin: review-only view ✓

### Memory Types
```
IMAGE     — uploaded photos, concert shots, screenshots
VIDEO     — performance clips, fan clips, room clips, backstage
AUDIO     — voice notes, song snippets, crowd chants, radio moments
TROPHY    — battle wins, crown holds, championship achievements
TICKET    — purchased event tickets (auto-generated on purchase)
BADGE     — earned badges, tier upgrades, collection completions
EVENT     — attended concerts, joined cyphers, dance parties
PLAYLIST  — playlist milestones (auto-generated)
SONG      — song releases, beat drops (auto-generated)
NFT       — NFT minted/sold (auto-generated)
ARTICLE   — magazine features (auto-generated)
CONCERT   — concert attendance (auto-generated on ticket purchase)
CYPHER    — cypher participations (auto-generated)
BATTLE    — battle history (auto-generated on outcome)
VENUE     — venue visits (auto-generated)
```

### Automatic Memory Generation (MemoryGeneratorService)
```
Ticket Purchased          → Concert Memory (auto)
Battle Won               → Champion Memory (auto)
Playlist hits 1K plays   → Playlist Achievement Memory (auto)
Artist featured in TMI   → Magazine Cover Memory (auto)
Top 100 reached          → Chart Memory (auto)
XP milestone hit         → Achievement Memory (auto)
Trophy earned            → Trophy Memory (auto)
NFT minted               → NFT Memory (auto)
```

### Wall Themes (Unlock via XP/Events)
| Theme | Unlock |
|-------|--------|
| Classic | Default (everyone) |
| Ruby Wall | Ruby glow, floating gems | 500 XP |
| Diamond Wall | Crystal reflections, holographic | 2,000 XP or Diamond tier |
| Gold Hall of Fame | Trophy cases, gold frames | Win 5 battles |
| World Tour Wall | Concert tickets, venue pins | Attend 10 concerts |
| Magazine Cover Wall | Memories as magazine covers | TMI magazine feature |
| Neon Cypher Wall | Graffiti, music-reactive lighting | Join 25 cyphers |
| Arena Champion Wall | Belts, trophies, battle history | Hold the crown |

### Collections (Addiction Loop)
```
Concert Collection     — Attend 10 concerts   → Exclusive wall skin + XP + Badge
Cypher Legend         — Join 25 cyphers       → Animated graffiti frame
Stream & Win Master   — Listen 100 hours      → Radio-themed Memory Wall
Fan Legend            — 50 memories + 10 tickets + 5 trophies → Legendary frame
```

### Timeline Organization (auto-sorted)
Today · This Week · This Month · This Year · All Time
AND: Concerts · Battles · Cyphers · Stream & Win · Playlists · Tickets · Trophies · Friends · Venues

### Avatar Sharing (Room Broadcast)
1. User taps `Avatar → Share Memory`
2. Avatar pulls out holographic memory card
3. Card animates into the room
4. Displayed as non-blocking card (top monitor, side panel, or PIP)
5. Everyone in room sees it
6. Reactions available: ❤️ Love · 🔥 Fire · 👏 Applause · 😂 Laugh
7. +5 XP for sharer, +1 XP for reactors
8. Does NOT block: avatars, live cameras, chat, lobby wall, performer panel

### Room Share Rule
Memory appears as:
- Floating picture-in-picture card (top-right)
- Autoplays 10 seconds (audio/video)
- Interactable (Like / Pin / Dismiss)
- Broadcast via OmniPresenceEngine event: `room-memory-share`

### Dashboard Placement
- Collapsible chevron canister (same pattern as playlist)
- Closed: 3–5 latest memories as small thumbnails + count badge
- Open: full floating masonry collage with themed background
- Tiles float independently with random timing + rotation
- Hover: lift + shadow effect

### Components Required
```
MemoryWallContainer.tsx
MemoryTile.tsx
MemoryWallPopout.tsx
MemoryUploader.tsx
MemorySharePanel.tsx
MemoryWallCollage.tsx
MemoryWallMotionGrid.tsx
MemoryWallViewer.tsx
MemoryWallAvatarShare.tsx
MemoryGeneratorService.ts
ThemeRegistry.ts
CollectionEngine.ts
```

### Prisma Schema
```prisma
model MemoryItem {
  id           String     @id @default(cuid())
  ownerId      String
  ownerType    String     // fan | performer | venue | sponsor
  type         MemoryType
  title        String
  description  String?
  mediaUrl     String
  thumbnailUrl String?
  sourceType   String?    // upload | auto-generated | ticket | battle | etc.
  visibility   Visibility @default(PUBLIC)
  themeId      String     @default("CLASSIC")
  xpEarned     Int        @default(0)
  reactions    Json?
  shareCount   Int        @default(0)
  roomId       String?
  eventId      String?
  ticketId     String?    @unique
  playlistId   String?
  venueId      String?
  avatarId     String?
  collectionId String?
  createdAt    DateTime   @default(now())
  collection   MemoryCollection? @relation(fields: [collectionId], references: [id])
  @@index([ownerId])
}

model MemoryCollection {
  id           String   @id @default(cuid())
  userId       String
  name         String
  progress     Int      @default(0)
  completed    Boolean  @default(false)
  rewardTheme  String?
  memories     MemoryItem[]
}

enum MemoryType {
  IMAGE VIDEO AUDIO TROPHY TICKET BADGE EVENT
  PLAYLIST SONG NFT ARTICLE CONCERT CYPHER BATTLE VENUE
}

enum Visibility {
  PRIVATE FRIENDS ROOM PUBLIC
}
```

### Build Order
```
Pass 1:  Prisma schema + MemoryGeneratorService
Pass 2:  MemoryUploader (context-aware auto-tagging)
Pass 3:  MemoryWallContainer + popout animation
Pass 4:  Animated tiles (staggered masonry, floating motion)
Pass 5:  ThemeRegistry + unlock system
Pass 6:  CollectionEngine + XP hooks
Pass 7:  Playlist integration
Pass 8:  Avatar sharing via OmniPresenceEngine
Pass 9:  Room sharing (PIP broadcast)
Pass 10: Homepage embedding
Pass 11: Sponsor & venue memory hooks
Pass 12: Admin analytics
```

---

## 3. STREAM & WIN SYSTEM

### Fan Earning
- 15 XP per minute of listening
- Bonus XP at milestones: 1hr / 10hr / 50hr / 100hr
- Vote for songs: +2 XP per vote
- Anti-farming: session caps, no duplicate-listen stacking

### Performer Earning
- Per-play royalty on radio rotation
- Bonus when song enters Top 10
- Tip income during live radio sessions

### Song Rotation
- Submitted via performer submission router
- Curated by RadioPlaylistEngine
- Genre-balanced rotation
- No single artist dominates airtime

### Listening Party Mode
- Host creates room, playlist synced to all listeners via PlaylistEngine
- Everyone hears same track (WebRTC sync)
- XP distributed to all participants

### Homepage: Home 3 integration
- Full radio environment on /home/3
- DJ booths, listener count, live requests, dance rooms, radio host camera

---

## 4. VIDEO BROADCAST SYSTEM

### Capture
```javascript
const constraints = {
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
  audio: true
}
navigator.mediaDevices.getUserMedia(constraints)
```

Fallback chain: 720p → 480p → 360p → "Camera unavailable" with profile photo

### WebRTC (Daily.co)
- `DAILY_API_KEY` environment variable
- `DAILY_DOMAIN=themusiciansindex`
- Performer go-live → `PerformerLiveControls` toggle → `GlobalLiveSessionRegistry` → `LiveSurfacePropagationEngine` fires across 8 surfaces

### Lobby Walls (BroadcastLobbyWall)
```typescript
interface BroadcastLobbyWallProps {
  feedType: 'performers' | 'fans' | 'audience' | 'battles' | 'cyphers' | 'challenges' | 'sponsors' | 'venues' | 'worldConcerts' | 'premieres'
  columns: 3 | 4 | 6
  rows: 1 | 2
  tileIntervals?: number[] // INDEPENDENT — never synchronized
}
```

### Independent Timer Law
Tile 0: 9,400ms · Tile 1: 13,100ms · Tile 2: 16,800ms · Tile 3: 11,200ms · Tile 4: 17,500ms
Start offsets staggered by 2,300ms each — never synchronize.

### Fallback Chain (per tile)
Live WebRTC → Recorded video → Profile video → Profile image → Genre avatar → Recruitment CTA

---

## 5. HOMEPAGE NETWORK

| Route | Identity | Question | Primary Component |
|-------|----------|----------|-------------------|
| `/home/1` | The Cover | What is happening? | `MagazineOrbitalContainer` |
| `/home/1-2` | The Billboard | Who is here? | `BillboardLiveWall` |
| `/home/2` | The Magazine | What should I read? | `MagazineShell` |
| `/home/3` | Live World | What should I watch? | `LiveWorldSurface` |
| `/home/4` | Marketplace | What can I buy? | `MarketplaceGrid` |
| `/home/5` | Arena | What can I win? | `ArenaBattleContainer` |

### Home 1 Protected Assets
- `WorldUnderlay` — z-index 0, never removed
- `OrbitalWheel` — z-index 10, never redesigned
- Two moving rails: top (left) + orbital underlay (right/opposite direction)
- "MAGAZINE" typewriter animation: 110ms/letter → hold 1s → fade → loop
- 3 video monitors with INDEPENDENT timers (9,500ms / 13,200ms / 17,000ms)

---

## 6. DASHBOARD NETWORK

### Fan Dashboard
```
Playlist canister (PlaylistDashboardPanel)
Memory Wall canister (MemoryWallContainer)
Rewards / XP tracker
Stream & Win radio widget
Live Now section (3 tiles)
Upcoming events
Notification center
Profile quick-edit
Messages
```

### Performer Dashboard
```
Playlist canister
Memory Wall canister
Submission router (Stream & Win Radio, Battle, Cypher, Contest, Release, Playlist)
Live tools (go-live, room creation)
Season pass progress
Revenue dashboard (tips, ticket sales, beat sales) — Big Ace payout gate
Sponsor Stamp Wall canister (SponsorStampWallCanister) — Performer only
Sponsor Bubble Orbit canister (SponsorBubbleOrbitCanister) — Performer only
Booking Map canister (BookingMapCanister) — Performer only
Analytics & stats
Messages
```

### Sponsor Dashboard
```
Campaign control
Top sponsored artists (ROI rank)
Live marketplace bidding
Performance billboard tiers
Ad billboard rankings
Run Ad / Boost Budget / Target Audience
Choose Placement / Auto Optimize / Deep Analytics
Watch Ad preview
Analytics (impressions, clicks, engagement, watch time, conversion, sales, ROI)
Deals & Contracts / Contract Manager / Secure Deal Gateway
Sponsor memories (campaign memories, giveaway memories)
Messages
```

### Advertiser Dashboard
```
Campaign builder (name, budget slider, campaign type, duration, audience)
Campaign Type: Video Ads, Banner Ads, Sponsored Reactions, Sponsored Rooms
Ad Priority Stack: Internal inventory → Premium sponsor → AdSense → "Advertise Here" CTA
Analytics (1.2M+ impressions, 35K+ clicks, 12% engagement, 150% ROI)
Inventory & Placements (blueprinted)
Deals & Contracts
Messages
```

### Venue Dashboard
```
Booking Map canister (read-only — venues see incoming requests)
Event calendar
Ticket management (digital + printable)
Camera system (7 camera views)
Performer booking requests (accept/decline)
Analytics
Revenue
Messages
```

### Promoter Dashboard
```
Event campaigns
Ticket tracking
Artist booking management
Analytics
Points
Messages
```

### Writer Dashboard
```
Article editor
Issue management
Submission review queue
Analytics (article performance)
Magazine cover memory generator
Messages
```

---

## 7. ADMIN DASHBOARD NETWORK

### Marcel (Founder) — `/admin/marcel`
Permissions: Full control + suggestion + submit
Special: Music submission router (Stream & Win, Battle, Cypher, Contest, Release)
Playlist manager, Memory Wall, all analytics

### Big Ace (AI CEO) — `/admin/big-ace`
Permissions: FULL FULL CONTROL — highest authority
Special: Payout approval gate (ALL cash payouts require Big Ace approval)
Cross-business visibility (TMI + all BerntttGlobal businesses)
AI mandate board, emergency stop

### Jay Paul Sanchez (Beat Producer) — `/admin/jay-paul`
Permissions: Submit beats + suggest + observe stats
Special: Beat submission router (Battle, Cypher, S&W Radio, Dance Battle, Games, Contest)
Beat AI learning (submissions teach platform AI pattern recognition)
Earnings dashboard (payout requires Big Ace approval)

### Justin (Observer) — `/admin/justin`
Permissions: Read-only platform health + submit suggestions
Special: No approve/block/payout access (locked)
Observation monitors, activity log, analytics view

### Micah (Dev Assistant) — `/admin/micah`
Permissions: Submit songs + suggest + dev tasks
Special: Coding task queue with VS Code deep-link
"Push buttons with Marcel" shared task list
Build/deploy status monitor (Playwright, TypeScript, Vercel)

### All Admin Hubs Share
- TV Screen Router: 1 large main monitor + 4 smaller independent monitors
- Each monitor shows different content (never same feed)
- Group meeting button
- Messaging / unified inbox
- Profile switcher Fan ↔ Performer

---

## 8. AVATAR SYSTEM

### Current State
- Emoji/gradient avatar circles with initials
- Profile image upload
- Avatar identity stored on User model

### Architecture Supports (future-ready)
```
Face upload → Face texture → Avatar profile → Lobby wall → Orbital wheel → 3D avatar
```
One upload powers: Profile card · Lobby wall tile · Orbital wheel node · Article author photo · Future 3D avatar

### Avatar Inventory
- Clothing items (unlocked via XP/season pass)
- Props (sparkler, jester hat, mic)
- Emotes
- Skin colors/styles

### Avatar Memory Sharing
Avatar → Share Memory → holographic card animates into room → appears as non-blocking PIP

---

## 9. POINTS / REWARDS / COLLECTIONS

### XP Sources (examples)
| Action | XP |
|--------|----|
| Upload memory | +10 |
| Share memory | +5 |
| Receive 10 reactions | +15 |
| Attend event (ticket) | +20 |
| Win battle | +100 |
| Hold crown 1 week | +500 |
| Playlist 1K plays | +100 |
| Stream & Win: 1hr | +15 |
| Magazine feature | +200 |

### Anti-Abuse
- No XP farming from duplicate uploads
- Session caps on Stream & Win
- Repeat reaction limits
- Suspicious mass uploads flagged to admin
- Media ownership/permission required

### Tier Colors (unlockable)
Ruby · Sapphire · Emerald · Platinum · Diamond · Obsidian · Neon Cyan · Neon Magenta · Gold · Rose Gold

---

## 10. TROPHY / BELT / CONTEST SYSTEM

### Who Can Compete
- Performers (artists, DJs, comedians, dancers, poets) ✓
- Fans: voting only, not competing ✓

### Who Can Vote
- Fans ✓
- Performers (for other performers) ✓
- Never self-vote (enforced)

### Who Can Submit
- Performers: submit to battles, cyphers, challenges ✓
- Marcel: direct submission ✓
- Jay Paul Sanchez: beat submissions ✓
- Micah: song submissions ✓

### Crown Governor
```typescript
// NEVER use performers[0] or seed order
getTopPerformer(activeGenre) from PerformanceRating table
```

### Challenge Score Formula
```
S = (V×0.30) + (A×0.20) + (W×0.15) + (C×0.15) + (Sh×0.10) + (T×0.10) + (Wi×0.05) + (J×0.05) − fraudPenalty
```
V=Votes · A=Attendance · W=WatchTime · C=Comments · Sh=Shares · T=Tips · Wi=Wins · J=JudgeScore

### Division Brackets
Rookie (0–999) → Prospect (1000–1299) → Contender (1300–1599) → Elite (1600–1899) → Champion (1900–2199) → Legend (2200+)

### Champion Memory Auto-Generation
When belt is won → `MemoryGeneratorService` creates Champion Memory → appears in winner's Memory Wall → shared to room

---

## 11. SPONSOR STAMP WALL CANISTER

### Who Gets It
**Performer only**

### Design
NASCAR-style high-density patchwork grid of sponsor logos. Scrollable rail. Lazy-loaded logos.

### Slot Rules
- Free tier: 20 slots max (`SponsorSlotRegistry` enforces)
- Paid tiers: more slots by tier
- Diamond: unlimited visibility
- Major sponsors display larger
- Prize sponsors earn extra points
- Expired sponsors do not render

### Components
```
SponsorStampWallCanister.tsx
SponsorSlotRegistry.ts
SponsorCard.tsx (popup on click: coupon codes, promo video, direct link)
```

### Routes
```
GET /api/sponsors/slots
GET /api/sponsors/performer/[performerId]
POST /api/sponsors/book
```

---

## 12. SPONSOR BUBBLE ORBIT CANISTER

### Who Gets It
**Performer only**

### Design
Cinematic floating bubbles orbiting a center performer node. Uses Framer Motion layout for smooth paths.

### OrbitPhysics
- Major sponsors: inner ring, larger bubbles, faster orbit
- Local sponsors: outer ring, smaller bubbles
- No two bubbles overlap (OrbitPhysics collision prevention)
- Orbit speed based on sponsorship weight
- Click bubble: burst animation → opens sponsor interactive offer

### Components
```
SponsorBubbleOrbitCanister.tsx
OrbitPhysics.ts
```

### Routes
```
GET /api/sponsors/performer/[performerId]/orbit
```

---

## 13. BOOKING MAP CANISTER

### Who Gets It
**Performer only**

### Design
Dual-pane: Mapbox/Leaflet interactive map (left) + Logistics side panel (right).

### VenueBookingRegistry
- Store booking requests
- Match venues to performers
- Track: booking status, deposit status, ticket status, event date, room route

### BookingOpportunityRegistry
Filters: performer type, genre, city, distance, price range, venue size, event type, sponsor availability, livestream availability

### LogisticsAutomationService
**ESTIMATE ONLY — NO AUTO-CHARGE**
- Quote travel distance
- Estimate hotel/ride costs (editable inputs, adjustable in real time)
- All prices stored as adjustable fields (never hardcoded — inflation-proof)
- Distance trigger: if show > 100 miles → auto-prompt Logistics Bundle
- Payment execution: LATER, after Stripe/escrow confirmed

### Routes
```
GET /api/bookings/opportunities
POST /api/bookings/request
GET /api/logistics/quote
```

### Hotel & Ride Pricing Rule
All prices are editable input fields. Can be updated in real time at any time. Never hardcoded in components.

---

## ROUTE-TO-COMPONENT MAP

```
/home/1                    → MagazineOrbitalContainer + WorldUnderlay + OrbitalWheel
/home/1-2                  → BillboardLiveWall + GenreRotation
/home/2                    → MagazineShell (3 belts: Editorial + Discovery + Marketplace)
/home/3                    → LiveWorldSurface + BroadcastLobbyWall + StreamWinRadio
/home/4                    → MarketplaceGrid + SponsorSpotlight + AdMarketplace
/home/5                    → ArenaBattleContainer + AdvertiserWorld

/dashboard/fan             → Fan dashboard (playlist + memory wall + rewards + stream & win)
/dashboard/performer       → Performer dashboard (all tools + sponsor canisters + booking map)
/dashboard/sponsor         → Sponsor dashboard (campaigns + analytics + sponsor memories)
/dashboard/advertiser      → Advertiser dashboard (campaign builder + placements + analytics)
/dashboard/venue           → Venue dashboard (booking map read-only + events + cameras)
/dashboard/promoter        → Promoter dashboard (campaigns + tickets + tracking)
/dashboard/writer          → Writer dashboard (editor + articles + analytics)

/admin/marcel              → Marcel founder hub (full control)
/admin/big-ace             → Big Ace AI CEO hub (full authority)
/admin/jay-paul            → Jay Paul beat producer hub
/admin/justin              → Justin observer hub
/admin/micah               → Micah dev assistant hub

/auth/signup?role=fan      → Fan sign up → /dashboard/fan
/auth/signup?role=artist   → Artist sign up → /dashboard/performer
/auth/signup?role=sponsor  → Sponsor sign up → /dashboard/sponsor
/auth/signup?role=advertiser → Advertiser sign up → /dashboard/advertiser
/season-pass               → Season Pass (guitar/drum/sax/piano animated fretboard)
/playlist/[id]             → Standalone playlist page with skin + embed
/profile/[slug]            → User profile with memory wall + playlist + sponsor orbit
```

---

## DASHBOARD CANISTER MAP

| Canister | Fan | Performer | Venue | Sponsor | Advertiser | Admin |
|----------|-----|-----------|-------|---------|------------|-------|
| PlaylistDashboardPanel | ✓ | ✓ | ✓ | ✓ | — | view |
| MemoryWallContainer | ✓ | ✓ | ✓ | ✓ | — | review |
| SponsorStampWallCanister | — | ✓ | — | — | — | — |
| SponsorBubbleOrbitCanister | — | ✓ | — | — | — | — |
| BookingMapCanister | — | ✓ | ✓(RO) | — | — | — |
| StreamWinWidget | ✓ | ✓ | ✓ | ✓ | ✓ | view |
| BroadcastLobbyWall | view | ✓ | ✓ | view | — | monitor |
| RewardsDashboard | ✓ | ✓ | — | ✓ | — | monitor |
| SubmissionRouter | — | ✓ | — | — | — | Marcel+Jay |
| LiveTools | — | ✓ | ✓ | — | — | — |
| AdRevenueEngine | — | — | — | ✓ | ✓ | ✓ |
| VideoMonitors | — | — | — | — | — | ✓ (all 5 hubs) |

---

## AD INJECTION RULE

```typescript
// AdRevenueEngine — applied globally
const AdInject = (tier: string): boolean => {
  if (tier === 'DIAMOND' || tier === 'PLATINUM') return false; // Zero ads
  return true; // Inject single responsive rail ad
}
// Placement: RailComponent (right-side or bottom) — NEVER floating over content
// Priority: Internal inventory → Premium sponsor → AdSense → "Advertise Here" CTA
```

---

## BLACKBOX IMPLEMENTATION ORDER

```
Pass 1:  Stabilize build — pnpm build must exit code 0
Pass 2:  Fix next.config.js mixed App/Pages router
Pass 3:  Confirm Playwright 43/43 green (auth selectors + API routes)
Pass 4:  Deploy Prisma schema (MemoryItem, MemoryCollection, SponsorSlot, Booking)
Pass 5:  Create shared registries:
         - MediaBroadcastEngine
         - PlaylistEngine
         - MemoryWallEngine
         - PointRegistry
         - AvatarRegistry
         - RewardRegistry
         - LivePresenceRegistry
         - SponsorSlotRegistry
         - VenueBookingRegistry
         - LogisticsAutomationService (estimates only, no charges)
Pass 6:  Wire PlaylistDashboardPanel to Fan + Performer dashboards
Pass 7:  Wire MemoryWallContainer to Fan + Performer dashboards + all profiles
Pass 8:  Wire MemoryGeneratorService to: ticket purchase, battle outcome, playlist milestone, magazine feature
Pass 9:  Place SponsorStampWallCanister on Performer dashboard only
Pass 10: Place SponsorBubbleOrbitCanister on Performer dashboard + profile only
Pass 11: Place BookingMapCanister on Performer dashboard only
Pass 12: Verify homepages 1–5 match Claude blueprint (no redesigning)
Pass 13: Wire all API routes
Pass 14: Wire fallback states (no empty panels — RecruitmentCTA everywhere)
Pass 15: Run full build + Playwright + smoke tests
Pass 16: Deploy to Vercel
```

---

## TESTING CHECKLIST (FULL CERTIFICATION)

```
[ ] Build exits code 0
[ ] TypeScript: 0 errors
[ ] Playwright: 43/43 passed

HOME PAGES:
[ ] Home 1: Orbital Wheel visible, WorldUnderlay animated, MAGAZINE typewriter loops
[ ] Home 1: 3 video monitors with independent timers (not synchronized)
[ ] Home 1-2: Genre rotation every 8s with riseUp animation
[ ] Home 2: Three belts present (Editorial, Discovery, Marketplace)
[ ] Home 3: 8-tile Lobby Wall + 12-tile Fan/Cypher wall, all independent timers
[ ] Home 4: Sponsor Spotlight + Billboard + Marketplace + Analytics + Deals
[ ] Home 5: Advertisers World layout

DASHBOARDS:
[ ] Fan dashboard: Playlist canister present + Memory Wall canister present
[ ] Performer dashboard: Playlist + Memory Wall + Sponsor Stamp + Orbit + Booking Map
[ ] Sponsor dashboard: Campaign builder + Analytics + Deals

CANISTERS:
[ ] PlaylistDashboardPanel: closes cleanly, opens with animation, no layout bleed
[ ] MemoryWallContainer: closed shows 3-5 tiles, open shows floating masonry collage
[ ] MemoryWallAvatarShare: card animates out, PIP appears in room
[ ] SponsorStampWallCanister: 20-slot limit enforced for free tier
[ ] SponsorBubbleOrbitCanister: bubbles orbit independently, no overlap
[ ] BookingMapCanister: venue pins clickable, logistics estimates adjustable

SECURITY:
[ ] Diamond/Platinum tier: zero ads shown
[ ] Free tier: single rail ad injected
[ ] Big Ace approval gate: no payout bypasses
[ ] Memory anti-abuse: no duplicate upload XP farming

AUTH:
[ ] Fan signup → routes to /dashboard/fan
[ ] Artist signup → routes to /dashboard/performer
[ ] Sponsor signup → routes to /dashboard/sponsor
[ ] Advertiser signup → routes to /dashboard/advertiser
[ ] All admin routes require correct role
```

---

## PLATFORM LAWS (IMMUTABLE)

1. Big Ace must approve ALL cash payouts — no exceptions
2. August 8 = Marcel's birthday — hardcoded contest registration gate
3. Diamond hardcoded: `facethebully916@gmail.com` + `bjmbeat@berntoutglobal.com`
4. World Dance Party = DanceArena3D ONLY — NO SEATS EVER
5. Crown holder = real performer by Challenge Score — NEVER seed order
6. No empty panels — every slot uses fallback chain
7. No fake metrics in production — show 0 or — if no real data
8. Sponsor/booking/stamp wall/orbit = Performer only (fans do not get these)
9. Memory Wall = Fan AND Performer both get it
10. Booking Map = Performer only
11. Hotel/ride logistics = ESTIMATES ONLY until Stripe/escrow confirmed
12. All prices are editable fields — never hardcoded (inflation-proof)
13. Claude = Architect. BlackBox = Wiring. BlackBox must not redesign Claude's visuals.

---

*TMI_SYSTEM_ARCHITECTURE_BLUEPRINT.md*
*Generated by Claude — System Architect*
*Status: FINAL — this document is build law*
