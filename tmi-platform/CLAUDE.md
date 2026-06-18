# TMI Platform — CLAUDE.md
# Instructions for Claude Code in this repository

## WHO YOU ARE IN THIS PROJECT

You are the assembly director for The Musician's Index (TMI) platform.
Your role is NOT to build new systems — everything is already built.
Your role IS to:
1. Connect existing files to each other
2. Wire existing engines to their consumers
3. Create minimal glue (session helpers, role guards, seed data, product constants)
4. Fix broken or missing imports/exports
5. Never redesign visual canon

## PROJECT OWNER

Marcel Dickens — founder/owner of BernoutGlobal LLC and TMI.
He needs revenue active fast. Cash pressure is real.
Always prioritize money paths over perfection.

## WHAT EXISTS (do not re-create these)

- 300+ Next.js app routes in `apps/web/src/app/`
- 90+ component folders in `apps/web/src/components/`
- 90+ lib folders in `apps/web/src/lib/`
- All magazine engine files (19 lib files, 19+ components)
- All bot system files (`lib/bots/`)
- All admin components (`components/admin/`)
- All HUD components (`components/hud/`)
- All homepage artifacts (01, 012, 02, 03, 04, 05)
- Homepage routes home/1 through home/15
- Auth routes: login, signup, account-recovery
- Stripe: client.ts, webhook proxy, checkout route
- API routes: auth (login, logout, register, session, provision), stripe (checkout, customer, products, webhook)

## YOUR PRIORITY ORDER

1. **Revenue paths** — auth → stripe → subscriptions/tips/sponsor/advertiser payments
2. **Homepage visible** — home/1-5 fully working with real data
3. **Onboarding complete** — all 6 roles can sign up
4. **Admin active** — Marcel can see users + revenue
5. **Bots running** — minimum 62 bots activated
6. **Content live** — Magazine Issue 1 with 5+ articles

## NEVER DO THESE

- Do not redesign TMI visual canon
- Do not refactor working systems
- Do not delete asset files
- Do not change color palette (cyan/fuchsia/gold/purple/dark-space)
- Do not make routes that worked stop working
- Do not leave `href="#"` in any links
- Do not add `// TODO` comments — either do it or skip it
- Do not create documentation files unless asked

## STYLE CONVENTIONS

- TypeScript strict mode (tsconfig is set)
- `"use client"` only on components that need client-side hooks
- Tailwind + inline styles both acceptable (repo uses both)
- Motion: framer-motion is available
- Icons: emoji acceptable, heroicons acceptable
- No external API calls from client components without error handling

## ASSEMBLY COMMANDS

When asked to "wire" something:
1. Find the source file (engine/lib)
2. Find the consumer (page/component)
3. Import the source into the consumer
4. Pass correct props
5. Verify types match

When asked to "activate" something:
1. Find the activation function in the engine
2. Find where it should be called (provider/layout/page)
3. Add the call with correct parameters
4. Do not remove any existing calls

## TESTING

- `pnpm typecheck` — run after every batch of changes
- `pnpm build` — run after major wiring changes
- Never mark anything done if typecheck has errors in files you touched

---

## TMI PLATFORM CONSTITUTION v1.0 (LOCKED — 2026-06-15)

Established by Marcel Dickens. Applies to ALL agents, ALL sessions, ALL builds forever.
This is the architecture. Do not redesign it.

---

### Tier Canon (FINAL — no exceptions)

```
FREE  →  PRO  →  RUBY  →  SILVER  →  GOLD  →  PLATINUM  →  DIAMOND
```

Ruby replaces Bronze permanently. Never use Bronze. All six steps above RUBY are in all-caps.
TypeScript identifiers in code may use mixed case (Silver, Gold) for legacy compatibility — the canonical names are all-caps above.

---

### Rule 1 — Upload Pipeline (Single Source of Truth)

Every performer's data originates from one place and flows down:

```
Dashboard Upload
  ↓ PerformerRegistry (apps/web/src/lib/performers/PerformerRegistry.ts)
  ↓ Profile Page     (/performers/[slug])
  ↓ Article Page     (/articles/performer/[slug])
  ↓ Magazine         (/magazine/article/[slug])
  ↓ Discovery Rails  (<DiscoveryRail />)
  ↓ Home Pages       (Home 1 orbital, Home 1-2 billboard, rankings)
```

One upload → appears everywhere. **No duplicate media systems. No duplicate profile systems. No duplicate article systems.** Never hardcode performer name/image/bio/songs/merch in a page — always read from `getPerformerBySlug()` or `PERFORMER_REGISTRY`.

---

### Rule 2 — Media Priority Chain (Live First, Always)

When rendering any performer image or video slot, use this priority order:

```
1. 🔴 LIVE VIDEO     (if performer.isLive — links to liveRoomRoute + audience + JOIN NOW)
2.    MOTION POSTER  (introVideoUrl or motionPosterUrl — 2-3 sec NBA/NFL/UFC style loop)
3.    STATIC IMAGE   (profileImageUrl — always required as final fallback)
```

Live content always wins. Static images are the last resort.

`PerformerIdentity` carries `introVideoUrl?` and `motionPosterUrl?` for motion poster support.

Applies to: Profile pages, Article pages, Home discovery cards, Billboard cards, Ranking cards.

---

### Rule 3 — Rankings Are XP-Driven, Never Manual

Rank is computed from platform activity:
- XP (primary signal)
- Achievements, engagement (tips/likes/shares), battles/cyphers, streams, bookings, audience growth, fan activity

**Never write `rank: 3` manually.** Use `computeRanks()` from PerformerRegistry. Performers literally climb: `#87 → #42 → #12 → #3 → #1` through what they do on the platform.

---

### Rule 4 — Crown Rotation

```
Overall Crown  → Maximum hold: 2 months
Genre Crowns   → Maximum hold: 1 month (Hip-Hop, R&B, Country, Rock, Gospel, Comedy, Dance, Producer, etc.)
```

After hold expires, rotation window opens — next qualified performer takes the throne. Prevents permanent monopoly and keeps every genre moving. `crownSince?: string` on `PerformerIdentity` tracks the start date. `getCrownRotationStatus()` checks expiry.

---

### Rule 5 — Home Page Structure

```
Home 1    → The Crown (Overall #1 + Genre #1s under it)
Home 1-2  → Billboard / Discovery Wall
Home 2    → Magazine / News
Home 3    → Live World
Home 4    → Marketplace / Sponsors
Home 5    → Arena / Competitions
```

**Home 1 gets ONE Overall Crown** — the most prestigious position on the platform. Genre crowns are listed below it. Overall Crown = highest XP/engagement across ALL categories.

---

### Rule 6 — Discovery Rails Are Mandatory on Every Page

Every major page must include `<DiscoveryRail />` for:
- Related Articles
- Related Performers
- Related Live Rooms
- Related Battles
- Related Sponsors
- Related Venues

**No dead ends.** `apps/web/src/components/discovery/DiscoveryRail.tsx` is the canonical component.

---

### Rule 7 — Visual Design Language (Images 77, 78, 84, 85)

Blueprint images 77, 78, 84, 85 define the design language for ALL surfaces:
- Performer Profiles, Performer Articles, Magazine Articles, News Pages, Sponsor Features, Discovery Walls

Color palette: dark purple/navy (`#050510`, `#0a0614`) + neon cyan/fuchsia/gold. Bold display fonts. Card-based layouts. Never deviate.

---

### Rule 8 — Registry First (No Duplicate Sources)

**Never create a new content source if a registry already exists.**

Canonical registries:
- `PerformerRegistry` — `apps/web/src/lib/performers/PerformerRegistry.ts`
- `VenueRegistry` — `apps/web/src/lib/venues/VenueRegistry.ts`
- `SponsorRegistry` — `apps/web/src/lib/commerce/SponsorRegistry.ts`
- `magazineIssueData` — `apps/web/src/lib/magazine/magazineIssueData.ts`
- `XpActionRegistry` — `apps/web/src/lib/xp/XpActionRegistry.ts`

**Pages render FROM registries. Registries do not render from pages.** This single rule prevents the largest category of technical debt on this platform.

---

### Rule 9 — Everything Earns XP

All platform activities contribute to progression. Canonical XP actions are in `apps/web/src/lib/xp/XpActionRegistry.ts`. Every action maps to XP → Achievements → Rank → Leaderboards → Crown Eligibility.

Actions that earn XP:
- Reading articles, watching streams, battles, cyphers, comments, shares
- Tips, fan club membership, bookings, ticket purchases
- Profile completion, daily login, audience growth

This ties magazine + live rooms + sponsors + games + performer ecosystem into **one unified progression engine**, not five separate systems.

---

### Rule 10 — Platform Identity

TMI is not a music website. It is:

```
Magazine  +  Billboard  +  Live Streaming Platform  +  Competition Network
+  Marketplace  +  Ranking System  +  Social Network
```

All builds must serve this multi-system identity simultaneously. No page should feel like only one of those things.

---

### Rule 11 — Content Freshness (Priority Order for Every Surface)

Every homepage surface, feed, or listing must prioritize content in this order:

```
1. LIVE        — actively happening right now
2. RECENT      — last 48 hours
3. POPULAR     — high engagement, timeless
4. ARCHIVE     — historical / legendary
```

Examples:
- **Home 1**: Current Crown → Live Crown Contenders → Recent Winners → Historical Legends
- **Home 2**: Breaking News → Recent Articles → Popular Articles → Archive Issues
- **Home 3**: Live Rooms → Starting Soon → Trending Rooms → Past Highlights

This rule prevents old content from burying new creators. New performers must be able to surface.

Implementation: `apps/web/src/lib/content/ContentFreshness.ts` provides `sortByFreshness()`.

---

### Rule 12 — No Empty Inventory (Ad Slot Fallback Chain)

Every ad/sponsor slot must follow this fallback chain — never show an empty box:

```
1. Paid Sponsor        — live paying advertiser from SponsorRegistry
2. Platform Promotion  — internal TMI feature (upgrade CTA, new tool, event)
3. Ad Network          — Google AdSense or programmatic
4. Advertise Here CTA  — direct link to /sponsors/advertise
```

Implementation: `getAdSlotForZone(zone)` in `apps/web/src/lib/commerce/SponsorRegistry.ts`.

---

### Rule 13 — Every Article Is a Hub

**Performer article pages** must always contain (in order):
Article → Song Preview → Live Room link → Merch → Tip → Fan Club → Comments → Related Articles → Related Performers

**News article pages** must always contain (in order):
Story → Video → Poll → Sponsor → Related Stories → Related Live Rooms → Related Performers

This turns every article into a deep content destination. Google reviewers and users should never reach a dead end inside an article. This rule is especially important for AdSense approval.

---

### Rule 14 — No Empty Surface

**Every visible surface must resolve to a real destination. No exceptions.**

Never acceptable on any production surface:
- Placeholder text, "Coming Soon", "TBD", stub copy, lorem ipsum
- `href="#"` dead links or `onClick={() => {}}` no-op buttons
- Empty image containers, broken image slots, missing fallbacks
- Routes that return `notFound()` or `null` without a meaningful fallback
- Fake profiles, demo data presented as real users
- Buttons that visually exist but do nothing

**Universal Fallback Chains:**

```
Performer Slot  → Registry performer → Genre Top → DiscoveryRail placeholder with /performers CTA
Sponsor Slot    → getAdSlotForZone() (Rule 12 chain always produces content)
Image Slot      → profileImageUrl → motionPosterUrl → /images/tmi-placeholder.jpg
Video Slot      → introVideoUrl → motionPosterUrl → staticImageUrl (Rule 2)
Profile Route   → getPerformerBySlug() → /performers index (never 404)
Article Route   → magazineIssueData → /magazine (never 404)
Live Room Route → getLiveRoom() → /live/lobby (never 404)
Button/CTA      → Must navigate, submit, or open something — no dead interactions
```

Every button click, every link tap, every card touch must immediately navigate to or trigger a real thing. Instantaneous response. No async loading states that resolve to empty. No visual elements that look interactive but aren't.

This rule was established 2026-06-15 by Marcel Dickens. Applies to all surfaces, all agents, all sessions, forever.

---

### Rule 15 — Profile + Lobby Canister Integration

**Every profile, lobby, dashboard, and room must include the connected canister system.**

A profile is not `photo + bio`. It is `identity + media + memories + messages + bookings + store + avatar + inventory + lobby`.

#### The 11 Canonical Canisters

```
1.  Playlist Canister       — plays uploaded songs; embeds in profile, lobby, room, magazine
2.  Memory Wall Canister    — captures moments; follows user everywhere
3.  Booking Canister        — book/request performer; embeds in profiles, venues, magazine
4.  Messaging Canister      — DMs + group threads; embeds in profiles, lobbies, live rooms
5.  Store Canister          — merch/beats/NFT; embeds in performer profiles, lobbies
6.  Avatar Creation Center  — create/edit avatar; accessible from any profile
7.  Avatar Workspace        — dress/pose/preview; embeds in profile + lobby
8.  Inventory Canister      — items/emotes/props; follows user into every room
9.  Public Lobby            — open audience lobby; discoverable from home/1-2, profiles
10. Private Lobby           — invite-only; accessible from performer profile + messaging
11. Live Lobby Wall         — grid of all active rooms; embedded in Home 1-2, Home 3, profiles
```

#### Canister Embedding Matrix

Every canister must be embeddable (not just a standalone page) inside:

| Surface | P🎵 | M🧠 | B📅 | 💬 | 🛒 | 👤A | 🎮AW | 📦Inv | 🌐PL | 🔒PL | 🔴LLW |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Fan Profile | ✅ | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Performer Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Writer Profile | ✅ | ✅ | — | ✅ | — | ✅ | — | — | ✅ | — | — |
| Venue Profile | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | ✅ | ✅ |
| Sponsor Profile | — | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Live Room | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — |
| Magazine Article | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | — | ✅ |
| Billboard Wall | ✅ | — | — | ✅ | — | ✅ | — | ✅ | ✅ | — | ✅ |

Legend: P=Playlist, M=MemoryWall, B=Booking, 💬=Messaging, 🛒=Store, A=Avatar, AW=AvatarWorkspace, Inv=Inventory, PL=PublicLobby/PrivateLobby, LLW=LiveLobbyWall

#### Canonical Canister Files

```
components/canisters/           ← canonical location for all canister components
  PlaylistCanister.tsx
  MemoryWallCanister.tsx
  BookingCanister.tsx
  MessagingCanister.tsx
  StoreCanister.tsx
  AvatarCreationCenter.tsx
  AvatarWorkspace.tsx
  InventoryCanister.tsx
  PublicLobbyCanister.tsx
  PrivateLobbyCanister.tsx
  LiveLobbyWallCanister.tsx
```

Existing source implementations (DO NOT DUPLICATE — wrap into canisters):
- Playlist: `components/media/PlaylistEngine.tsx`
- Memory Wall: `components/memory/MemoryWall.tsx`
- Avatar Creator: `components/AvatarCreator.tsx`
- Inventory: `components/InventoryPanel.tsx`
- Lobby system: `components/lobby/` (31 files)
- Activity timeline: `components/canisters/ActivityTimelineCanister.tsx`

#### Success Condition

```
Performer uploads song
  ↓ appears in profile Playlist Canister
  ↓ can be played in any lobby (Playlist Canister embedded)
  ↓ can be shared in magazine article (Playlist Canister embedded)
  ↓ fans can message the performer (Messaging Canister)
  ↓ fans can book/tip/buy merch (Booking + Store Canisters)
  ↓ moments captured to Memory Wall (Memory Wall Canister)
  ↓ avatar and inventory follow user everywhere
```

**Do not build these as separate pages only.** Build them as reusable canisters that can appear inside any surface listed in the embedding matrix above.

#### Avatar Workspace — Ultrarealistic Bobblehead + Face Scan

Per Marcel Dickens (2026-06-15): Avatars are ultrarealistic bobblehead characters (head 2.5x scale, PBR textures, not flat cartoon). Users can scan their face so they look like themselves in the crowd.

- **Face scan pipeline**: user photographs face → landmarks detected → mapped to bobblehead UV texture → preview in AudienceScene seat → saved to inventory → follows user into every room
- **Full body in dance mode**: World Dance Party rooms show full-body avatars on a dance floor, not just heads in seats. BPM sync. Dance emote icons trigger animations. Social interaction between avatars.
- **Two entry paths to any audience seat**:
  1. Avatar Lobby (`FanLobbyWall`, `AvatarLobbyCanvas`) → room tile → LobbyEntryFlow → AudienceScene
  2. Live Video Panel / Billboard Tile anywhere on platform → LobbyEntryFlow → AudienceScene

Both paths MUST route through `LobbyEntryFlow`. Never drop users directly into `/live/rooms/[id]` without seat assignment.

#### Progressive Stadium Fill (established 2026-06-15)

When a performer goes live, audience seats fill progressively like a real stadium — never instantly full. Bot sit-ins fill empty seats with unique ultrarealistic avatars. Real users replace bots when they join. Max bot fill: 92% (room never looks artificially 100% full).

- Fill timing: 0%→12% instantly, then +6% every 250ms until 92%
- Fill order: front rows first (closest to performer), back rows last  
- Bot avatars: must all appear different (no two identical on screen)
- Bot yield: when real user takes a seat, that specific bot vacates
- `AudienceScene.tsx` accepts `occupancyRatio` prop (0–1) for this effect
- `BotCrowdFillEngine.ts` manages fill logic (already built in `lib/live/`)

Blueprint references: `tmi_memory_wall_sponsor_booking_canisters.html`, `tmi_playlist_engine_complete.html`, `tmi_3d_character_system.html`, `tmi_billboard_live_lobby_wall_system.html`

This rule was established 2026-06-15 by Marcel Dickens. Applies to all surfaces, all agents, all sessions, forever.

---

### Rule 16 — Broadcast Preview Canon v2 (Director Camera System)

Billboard previews must feel like a context-aware live television broadcast (UFC/NBA style), not a static webcam feed. The `BroadcastDirectorEngine` must dynamically adjust camera shot probability based on Room Type and Room State.

**Dynamic Broadcast Profiles:**
*   **Battle Profile:** 80% Audience Battle View (Split Screen) / 10% Backstage / 10% Host. Must respect `BattleBroadcastStateMachine` (Solo → Split → VS → Live).
*   **Cypher Profile:** 75% Active Performer / 15% Crowd/Circle / 10% Host.
*   **Challenge Profile:** 85% Current Performer / 10% Crowd / 5% Host.
*   **Fan Lobby Profile:** 60% Host Camera / 30% Avatar Lounge / 10% Host Interjection.
*   **World Dance Party Profile:** 50% DJ / 30% Dance Floor / 10% Crowd / 10% Host.

Do not use a single universal probability table. The camera system must be aware of Room Type, Room State, Active Performer, and Host Type.

*Established 2026-06-16 by Marcel Dickens.*

---

### Rule 17 — Ticket & Merchandise Inventory Authority

Performers are distributors of event inventory, never creators of it. Only Venues and Promoters can mint ticket or merchandise inventory; Admin can on their behalf.

**Authority matrix:**

| Action | Fan | Performer | Promoter | Venue | Sponsor | Advertiser | Admin |
|---|---|---|---|---|---|---|---|
| Create Event | ❌ | Limited | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create Ticket/Merch Inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Allocate Inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Sell Allocated Inventory | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Sponsor Artist/Event/Venue | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Buy Ad Placements | ❌ | Optional | Optional | Optional | Optional | ✅ | ✅ |
| Create Ad Inventory | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Ticket Allocation Engine flow:**
```
Venue Creates Event
  ↓ Venue Creates Inventory (quantity, tiers, pricing)
  ↓ Promoter Receives Allocation (optional)
  ↓ Performer Receives Allocation
  ↓ Fan Purchases / Receives Gifted Ticket
  ↓ Ticket Redeemed
  ↓ Revenue Settlement
```

A performer-facing UI must never show "Create Ticket." It shows: **Request Ticket Allocation**, **Manage Allocated Tickets**, **Sell Tickets**, **Gift Tickets** — communicating that they distribute inventory, not originate it. Same model applies to merchandise: Artist/Venue/Promoter/Brand create merch; an Affiliate Seller (e.g. a performer) receives allocated inventory and sells it, never mints new stock.

**Every ticket tracks:** Ticket ID, Event ID, Venue ID, Promoter ID, Current Owner, Original Inventory Source, Price, Status, Redeemed?, Transfer History.
**Every allocation tracks:** Allocation ID, Created By, Assigned To, Quantity, Remaining, Sold, Gifted, Revenue Generated.

**Known gap as of 2026-06-18**: `lib/tickets/ticketEngine.ts`'s `createTicket()` currently has zero authority checks and zero inventory/capacity tracking — any caller can mint unlimited tickets of any tier. This rule is not yet enforced in code; the Ticket Allocation Engine implementing it has not been built.

*Established 2026-06-18 by Marcel Dickens.*

---

### Platform Constitution Summary

17 rules. Non-negotiable. Applies forever.

| # | Rule | Key File |
|---|------|----------|
| Tier | FREE→PRO→RUBY→SILVER→GOLD→PLATINUM→DIAMOND | PerformerRegistry.ts |
| 1 | Upload Pipeline — one source, everywhere | PerformerRegistry.ts |
| 2 | Media Priority — LIVE → MOTION → STATIC | All performer image slots |
| 3 | XP-Driven Rankings — never manual | computeRanks() |
| 4 | Crown Rotation — 2mo overall / 1mo genre | getCrownRotationStatus() |
| 5 | Home Structure — 1=Crown, 1-2=Billboard, 2=Magazine, 3=Live, 4=Market, 5=Arena | home/ routes |
| 6 | Discovery Rails — mandatory, no dead ends | DiscoveryRail.tsx |
| 7 | Visual Canon — dark purple + neon, Images 77/78/84/85 | All UI components |
| 8 | Registry First — pages consume, registries own | All lib/ files |
| 9 | Everything Earns XP — one progression engine | XpActionRegistry.ts |
| 10 | Platform Identity — Magazine+Billboard+Live+Competition+Market+Rankings+Social | All surfaces |
| 11 | Content Freshness — LIVE→RECENT→POPULAR→ARCHIVE | ContentFreshness.ts |
| 12 | No Empty Inventory — Paid→Platform→AdNetwork→Advertise CTA | getAdSlotForZone() |
| 13 | Every Article Is a Hub — article+preview+live+merch+tip+fanclub+comments+discovery | Article pages |
| 14 | No Empty Surface — every button, link, card, image resolves to a real destination | All surfaces |
| 15 | Canister Integration — every profile/lobby/room includes Playlist+MemoryWall+Booking+Messaging+Store+Avatar+Inventory+Lobby canisters | components/canisters/ |
| 16 | Broadcast Preview Canon v2 — 70% Audience, 20% Backstage/DJ, 10% AI Host rotation | BroadcastDirectorEngine.ts |
| 17 | Ticket & Merchandise Inventory Authority — Venue/Promoter create+allocate, Performer distributes only | ticketEngine.ts |
