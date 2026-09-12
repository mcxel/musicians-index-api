# TMI Platform — CLAUDE.md
# Instructions for Claude Code in this repository

> **AI Navigation:** Every agent reads [`MASTER_AI_NAVIGATION.md`](MASTER_AI_NAVIGATION.md) first.
> General lookup (engines, registries, routes, archive, bots, 3D tiers): [§1–8](MASTER_AI_NAVIGATION.md#1-where-to-look-by-task-type) · [§ 3D upgrade map](MASTER_AI_NAVIGATION.md#3d--avatar--environment-upgrade-map).
> Media players (Fan + Performer dual experience): [§ MEDIA PLAYER DUAL-EXPERIENCE MAP](MASTER_AI_NAVIGATION.md#media-player-dual-experience-map).
> Split screens / dual monitors / battle VS: [§ SPLIT SCREEN CANON](MASTER_AI_NAVIGATION.md#split-screen-canon).
> Front/back of house + lobby walls + home rotation: [§ FRONT/BACK OF HOUSE + LOBBY WALL CANON](MASTER_AI_NAVIGATION.md#frontback-of-house--lobby-wall-canon).

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

## TRUST & SAFETY RUNTIME (LOCKED — 2026-07-29)

- **TrustSafetyRuntime** (`apps/web/src/lib/trustSafety/`) is the platform-wide engine (always on): EvidenceVault, EnforcementEngine Level 0–4, TrustScore (internal only), plus scaffold detection engines.
- **ScamDefenseCenter** is an Observatory Intelligence Deck *client* of that runtime — not where detection lives. Mount BELOW the Live Channel Ticker only.
- FTC impersonation / scam threat context informs report-reason taxonomy; this is product safety framing, **not legal advice**.
- Complements (does not replace) `ModerationEngine` + Report/ModerationAction for account strikes/bans.
- **FREEZE:** no further Flight Deck shell refactors (CanonOverseerShell / LayoutRuntime / Two-Deck) without an architectural defect — slot Intelligence widgets only.

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

### Meta-Rule: Certification Requirement (Locked 2026-06-25)

> **Every new system must be accompanied by an automated certification before it becomes part of the canonical runtime.**

This governance principle applies to all rules below and all future systems:

- Before merging a new runtime → must have a test suite
- Before merging a new engine → must have passing Level 1 tests  
- Before connecting to canonical systems → must pass Level 2 integration tests
- Before declaring "done" → must pass Level 3 experience certification

Three-level certification framework:
1. **Level 1: Runtime Certification** (Automated, technical correctness)
2. **Level 2: Integration Certification** (Automated, signal flow through canonical systems)
3. **Level 3: Experience Certification** (Human judgment, subjective quality)

See `CERTIFICATION_FRAMEWORK.md` for complete testing methodology.

*Locked by Build Director, 2026-06-25.*

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

**The ticket system belongs to Venues and Promoters only — TMI is the alternative to Ticketmaster, not a fan/performer feature.** Ticket inventory, allocation, and sale authority are never associated with Fan or Performer accounts in any way. Only Venues and Promoters can create, allocate, or sell ticket inventory; Admin can on their behalf. Performers do not request, manage, distribute, or sell tickets — that capability was removed from the performer role entirely (it previously existed in a "distribute allocated tickets" form; it no longer does).

**Authority matrix:**

| Action | Fan | Performer | Promoter | Venue | Sponsor | Advertiser | Admin |
|---|---|---|---|---|---|---|---|
| Create Event | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create Ticket Inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Allocate Ticket Inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Sell Ticket Inventory | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Buy/Own a Ticket | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sponsor Artist/Event/Venue | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Buy Ad Placements | ❌ | Optional | Optional | Optional | Optional | ✅ | ✅ |
| Create Ad Inventory | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Note: a performer (or anyone) can still *buy/own/redeem* a ticket like any consumer — that's the "Buy/Own a Ticket" row. What's removed is any role in the inventory/allocation/selling side of the system.

**Ticket Allocation Engine flow:**
```
Venue Creates Event
  ↓ Venue Creates Inventory (quantity, tiers, pricing)
  ↓ Promoter Receives Allocation (optional)
  ↓ Venue/Promoter Sells Directly to Fans
  ↓ Ticket Redeemed
  ↓ Revenue Settlement
```

There is no performer step in this pipeline. A performer-facing UI must never show any ticket creation, allocation, distribution, or selling controls — not even a "Sell Tickets" or "Gift Tickets" affordance. (Merchandise is a separate system from tickets and is not covered by this restriction — Rule 17's prior "Affiliate Seller" model for merch, where a performer receives allocated merch inventory from Artist/Venue/Promoter/Brand and sells it without minting new stock, is unchanged.)

**Every ticket tracks:** Ticket ID, Event ID, Venue ID, Promoter ID, Current Owner, Original Inventory Source, Price, Status, Redeemed?, Transfer History — Current Owner may be a Fan (the buyer); no other step in the ticket's lifecycle ever references a Fan or Performer account.
**Every allocation tracks:** Allocation ID, Created By, Assigned To, Quantity, Remaining, Sold, Gifted, Revenue Generated — Created By and Assigned To are always Venue, Promoter, or Admin.

**Known gap as of 2026-06-18**: `lib/tickets/ticketEngine.ts`'s `createTicket()` currently has zero authority checks and zero inventory/capacity tracking — any caller can mint unlimited tickets of any tier. This rule is not yet enforced in code; the Ticket Allocation Engine implementing it has not been built.

*Established 2026-06-18 by Marcel Dickens. Performer-association removed 2026-06-19 by Marcel Dickens.*

---

### Rule 18 — Visual Identity Formula + Profile/Avatar/Route Integrity

**The TMI Visual Formula (locked):** 40% 1980s Entertainment Magazine (Rolling Stone/Billboard/Source/Vibe/XXL covers, big typography, bold cover art) + 30% Vice City nightlife (hot pink, electric cyan, neon purple, sunset gradients, reflective glass) + 20% Live Broadcast (LIVE indicators, audience counts, lower thirds, tickers — award show / sports broadcast / PPV energy) + 10% Spatial World (bobblehead avatars, seated audiences, lobby spaces, friend clusters — a living venue, not a game).

Master statement: *"TMI should feel like walking through a living 1980s entertainment magazine inside a neon Vice City nightlife district, while every concert, battle, article, lobby, and audience exists inside a shared 3D broadcast universe populated by ultra-realistic bobblehead versions of real people."*

Per-surface targets: Home 1 = "1985 MTV + Vice City Boulevard + Magazine Cover." Home 2 = "Magazine Headquarters." Home 3 = "Broadcast Control Center." Home 4 = "Entertainment District." Home 5 = "Fight Night + Apollo Theater + Battle Arena." No flat grey panels (use glass/glow/neon-edge/broadcast frames), no empty space (every space carries motion/discovery/audience/media/live content — see Rule 14), no dead buttons.

**Avatar standard:** Not anime, not cartoon, not Fortnite/Roblox/MetaHuman style. Target is **Ultra-Realistic Bobblehead** — real face proportions, recognizable likeness, slightly oversized head, expressive eyes, stylized realism, high-quality materials/hair/clothing. A face scan of a real person must produce a recognizable bobblehead of that person, never a generic numbered avatar. Pipeline: Phone Face Scan → Face Identity Engine → Bobblehead Avatar Builder → Wardrobe/Props/Emotes → Venue Seat Binding → Video Presence Overlay → Memory Wall/Profile Display. Bots are never flat icons — every bot/audience avatar uses this same rendering runtime. **Ownership is Fan-only as of 2026-07-18 (see Rule 26's Identity Policy)**: Fans create/wear/customize a bobblehead of themselves; Performers and Bands do not own or customize one — they're represented by real photo/video/live camera instead. The rendering runtime itself is never removed from a performer's world: the audience filling a performer's live room is still rendered as fan bobbleheads, seated and reacting — a performer just never becomes one.

**No Orphan Routes/Roles/Cards rule:** every account type (Fan, Performer, Sponsor, Advertiser, Promoter, Venue) must have its own real, wired destination set — not a shared generic dashboard. Every route, card, button, widget, canister, dashboard, and profile page must either (1) route to the correct role page, (2) be wired into the correct dashboard, (3) be converted into current design, or (4) be deleted. Nothing sits unused. Finish function first (real data, real wiring — Rules 8 and 14), then apply the visual layer last.

**Known gap as of 2026-06-18**: the bobblehead avatar pipeline does not exist in the codebase — confirmed via direct audit (see [[project_blueprint_vs_reality_2026_06_18]] memory and the avatar-system audit earlier this session). What exists are ~50 avatar-related components (creation studios, customizers, inventory rails) using flat/emoji/2D representations, not face-scan-driven 3D bobbleheads. This is real, unbuilt, multi-session work, not a wiring task.

**Asset Realization Directive (2026-06-20)**: uploaded reference folders (`_converted_webp visual Blueprint`, `Dashboard and venues`, `game show and venue skins` — host portraits for Julius/Record Ralph/Tiana/Host 1-4/Bebo, bobblehead concept art, venue/dashboard HTML mockups, magazine page mockups) are **concept references, not finished systems**. None of the uploaded PNGs/JPGs/HTML mockups are runtime code; nothing should be treated as a "use this image" task. The locked long-term target, expanding the Rule 18 avatar pipeline above into five runtime systems:

- **HostCharacterRuntime** — Julius/Record Ralph/Tiana/etc. become real entities with idle animation, blink/breathe/gesture, introductions, announcements, audience interaction, event hosting, queue management. Not static portraits.
- **AvatarRuntime** — the face-scan→bobblehead pipeline (Rule 18) made concrete: face capture → Face Identity Layer (proportions/eyes/nose/jaw/beard/hair/glasses) → a shared `TMI Base Body` (5 male + 5 female builds) wearing the user's face → a shared `TMI Humanoid Rig` (walk/run/jump/sit/stand/dance/wave/point/clap/cheer/laugh/celebrate/bow) → facial animation (blink/smile/laugh/surprise/talk) → lip sync tied to voice. Target likeness: **85-95% recognizable, not photorealistic** — "Real Human + Premium Collectible Figure + subtle bobblehead (10-15% oversized head, not a cartoon head)." Seated behavior (lean back, look at stage, clap, talk to neighbors, glow sticks) and stage behavior (seat→stand→walk→stage, not a teleport) are both required, not just a static seated pose.
- **VenueRuntime** — stage/seating/audience/lighting/props/screens/sponsor displays as one explorable environment, not a background image. This is the same Venue Runtime already being converged this session (`UniversalVenueRenderer`/`ArenaEventShell`) — this directive does not introduce a second venue system, it's the same one.
- **AudienceRuntime** — same canonical seat/presence/reaction systems already being converged this session (`audienceRuntimeEngine`, `tmiFanAvatarSeatAssignment`+friends, `SeatingMeshEngine` capability), expanded with avatar occupancy. Every seat is still a real user or a clearly-labeled system character — never fake attendance (Rule 14/20/21 apply unchanged).
- **GameShowRuntime** — contestants/host/audience/scoring/timers/rounds/automation/broadcasting as one functioning interactive system (overlaps with Rule 21's Official Automated Events).
- LOD for crowd performance (full avatar → simplified → billboard → point-cloud at distance) remains correctly staged as *after* the above runtime systems exist (per the SeatingMeshEngine/point-cloud staging decision already locked this session) — do not build LOD before there's a real avatar to downgrade.

**Scope honesty**: a real face-capture → rigged-3D-avatar → lip-synced pipeline is a computer-vision + 3D-animation engineering project requiring dedicated 3D/ML specialists and tooling (rigging software, a face-mesh/landmark model, a render pipeline) — this is not achievable by wiring existing repository files, and is explicitly **not** something to fake a stub version of (a flat-image "avatar" presented as if it does facial animation would itself be a Rule 20 violation). The realistic near-term assembly-director work is: (1) wire the existing reference host portraits as static sprites into a real, simple idle-motion component (CSS/Framer Motion blink/sway) using already-installed `framer-motion` — a real, honest, smaller step toward `HostCharacterRuntime`, not the full vision — and (2) keep the Venue/Audience Runtime convergence already underway moving, since AvatarRuntime depends on it existing first. Building the actual face-capture/rigging/lip-sync pipeline is multi-session, likely multi-specialist work to scope separately, not something to begin speculatively inside an assembly session.

*Established 2026-06-18 by Marcel Dickens. Asset Realization Directive added 2026-06-20.*

---

### Rule 19 — Beat System Separation + Store Role Split + Playlist Skin Economy

**Beat systems — three engines, never merged:** `BeatSubmissionRouter.ts`/`BeatQueueEngine.ts` (Producer Submission Vault — intake, review, routes approved beats to one or both destinations below), `BeatStoreCommerceEngine.ts`/`BeatInventoryEngine.ts` (Beat Marketplace — leases, exclusives, commerce), `CompetitionMusicEngine.ts` (Competition Beat Vault — runtime music for battles/cyphers/challenges/game shows). **A beat sold exclusively in the Marketplace must never remain usable in competitions** — enforced via `isBeatExclusivelySold()` in `BeatInventoryEngine.ts`, consulted by `getBeatsByGenreForBattle()`/`getBeatsByGenreForCypher()` in `CompetitionMusicEngine.ts`. These three engines currently use different data/ID schemes (the Competition Vault's `BEAT_REGISTRY_SEED` doesn't yet share IDs with real Marketplace beats) — the exclusivity check is real and wired, but a full canonical-beat unification (one `beatId` across all three, a real rights-policy schema distinguishing commercial license from runtime/competition license) is a separate, larger build, not yet done.

**Store role split:**
- **Fan Store** — avatar cosmetics, **Avatar Lobby Skins** (the fan's personal pre-show hangout space — explicitly modeled as a movie theater lobby / concert entrance / VIP lounge, where fans socialize with friends and listen to playlists before a show starts, not a venue itself), emotes, props.
- **Performer Store** — **Venue Skins** (the actual stage/show environment), stage effects, lighting, Beat Marketplace access, producer services, promotion tools.
- **Shared Store** — Playlist Skins, Memory Wall frames, seasonal/cosmetic packs — both Fan and Performer buy from this one.
- Beat licenses are never sold in the Fan Store — they're a Performer/Producer commerce domain (contracts, rights tracking, payouts), not a cosmetic.

**Playlist Skin Economy — every skin obtainable via exactly one of four paths** (built in `lib/artifacts/PlaylistArtifactEngine.ts`'s `SKIN_REGISTRY` + `canEquipSkin()`):
1. **Free** — `tmi_classic`, `tmi_dark`, `tmi_neon`. Every account gets these on signup.
2. **Tier reward** — `chrome` (Silver), `vice_neon` (Gold), `broadcast` (Platinum), `signature` (Diamond). Unlocked by reaching that membership tier, or by bot gift / tournament prize.
3. **Points** (common, 250-500 points) — `tree`, `baby`, `house`, `hand`, `train`, `car`.
4. **Premium** (real money, $0.99-$3.99 by rarity) — `submarine`/`rocket` ($0.99), `shark`/`dj_face` ($1.99), `helicopter`/`ufo` ($2.99), `robot` ($3.99).

**Known gap as of 2026-06-19**: the playlist skin engine/data model is built; no purchase UI (Stripe checkout, points-spend flow, or skin-picker) exists yet to actually buy or equip any of this.

**Legal note**: the beat marketplace's licensing model (creator retains ownership, platform gets a promotion + commerce + runtime license, exclusive sales handled via written/clickwrap consent, minors require parent/guardian-cosigned agreements, DMCA takedown workflow required) needs **real legal counsel** before launch — this is regulatory/contract law (COPPA, copyright transfer formalities, state minor-contract rules, DMCA safe harbor), not a technical decision Claude can make or implement as binding terms. The technical data model can and should support whatever an attorney specifies (contract-version-accepted timestamps, guardian-consent records, DMCA agent workflow), but the agreement text itself is out of scope for this assembly-director role.

*Established 2026-06-19 by Marcel Dickens.*

---

### Rule 20 — Launch Certification Standard (aka "the Reality Rule")

This is the final gate, not a new principle — it formalizes Rules 14/17 (No Empty Surface, no fake live/data) into an explicit checklist for declaring any page, route, or system actually launch-ready. Marcel independently named this same standard "the Reality Rule" on 2026-06-20 — same rule, not a second one (per Rule 21/8's own anti-duplication doctrine, applied here to documentation rather than code). A page is **certified** only when all of the following are true:

1. **No Fake Data** — no mock users/performers/viewer counts/live status/room counts/tickets/purchases/revenue/messages/playlists/statistics/rankings. If real data doesn't exist yet, show an honest empty state (`No active rooms`, `No messages yet`, `No saved clips yet`) — never a plausible-looking fabricated number. The hash-of-the-slug fake "Diamond" tier and fake view-count clips found and removed on 2026-06-19 (see [[project_public_fan_profile_fix_2026_06_19]]) are the canonical example of what this rule forbids.
2. **No Dead Buttons** — every control must Open (canister/drawer/panel/overlay/modal), Route (to a real page), Execute (a real action), Connect (to a real engine), or show an honest empty state. If it does none of those, delete it.
3. **No Fake Live** — a LIVE badge must come from `GlobalLiveSessionRegistry` (or whatever the canonical Live Engine becomes after Tier-1 convergence), never `isLive: true`, `Math.random()`, or a hash value.
4. **Every Monitor Must Be Real** — every video panel/monitor/broadcast wall/preview screen must display a real live stream, playlist, memory clip, avatar scene, room preview, or real video — or honestly say `No media available`. Never a placeholder/demo/stock image presented as live content.
5. **Every Profile Must Be Functional** — for each role (Fan/Performer/Writer/Producer/Venue/Sponsor/Admin), confirm the profile can actually upload, message, save memories, use playlists, manage media, go live, join rooms, view rooms, and return to rooms. Finish the control or remove it — never leave it half-wired.
6. **Every Route Must Be Certified** — maintain a route ledger (KEEP / REMOVE / MERGE / REDIRECT) per the Route + Role + File Orphan Audit methodology (see [[project_route_orphan_audit_2026_06_19]]). No orphan routes, no forgotten prototypes.
7. **One Source of Truth Per Engine** — Discovery, Live, Profile, Memory, Playlist, Messaging, Avatar, Ticket. When duplicates are found: inventory strengths → merge → redirect old surfaces to the canonical version → delete the old version only after the replacement is verified. Never run two competing systems indefinitely (see Rule 19 for the Beat System's three-engines-by-design exception — that one is intentional separation, not duplication).
8. **Visual Honesty** — no `Revenue Today: $12,000`, no `3,000 viewers`, no `Diamond Member` badge unless it is backed by a real number/status. A page that *looks* finished is not the bar — a page that *is* real is.

**The Four Acceptable States**: every widget, panel, monitor, card, and button must be in exactly one of these — Real Data (`3 messages`, `2 playlists`), Loading (`Loading playlists…`), Empty (`No playlists yet. Create your first playlist.`), or Error (`Unable to load playlists. Retry.`). No fabricated middle state. Before adding any data to a surface, the test is: *where does this come from* — Database, API, Engine, Registry, User Upload, Live Session, Payment System? If that question has no answer, the data doesn't belong on the page.

A page or system is launch-certified only when every button, monitor, video panel, route, upload, playlist, memory save, message, live indicator, profile, ticket, purchase, ranking, and statistic on it is real — and every placeholder, stub, mock object, and fake-success state has been removed, not just visually hidden.

*Established 2026-06-19 by Marcel Dickens.*

---

### Rule 21 — Venue Runtime Convergence + Official Automated Events

**Core law: there is one Venue Runtime, not separate products per event type.** Go Live, Mini Concert, World Concert, Mini Release, World Release, Battle, Cypher, Challenge, Comedy Show, Game Show, Fan Lobby, and Dance Party are all **modes** of the same runtime — the runtime stays the same, only the mode changes. Do not build `ConcertRuntime`, `BattleRuntime`, `CypherRuntime` etc. as separate systems.

**Audience System Law**: there must be exactly one membership system, one seat system, one presence system, one reaction system, one avatar system, one audience-perspective system platform-wide. Never let "Audience System A/B/C/D" evolve in parallel — but convergence means **inheriting the strongest capability from each duplicate into the canonical system, never just deleting the "losing" one** (see [[project_audience_runtime_wiring_2026_06_19]] for the case study: `SeatingMeshEngine`, found 2026-06-20, looked like a duplicate to retire, but actually held real capabilities — seat reclaim-on-return, client-persisted claims, avatar-seat binding — missing from the canonical `audienceRuntimeEngine`. The fix was inheriting those capabilities into the canonical engine via the existing `useSeatSession` hook, not deleting either system). **Known gap as of 2026-06-20**: a Venue Runtime Divergence Audit found **four independent seat-assignment systems** — `audienceRuntimeEngine.ts`/`/api/live/audience` (canonical, most-adopted: ArenaImmersivePanel, VenueImmersiveRoom, UniversalLobbyEntry, chat — now also carries real seat-reclaim + avatar-binding, inherited from SeatingMeshEngine), `tmiFanAvatarSeatAssignment.ts`+`tmiAudienceSeatPresenceEngine.ts`/`/api/live/seat-presence` (converged onto the canonical one's seatId), `SeatingMeshEngine`/`/api/seats/[roomId]` (World Concert's persistent reservation system, tied to a `TicketRecord` type — its data model not yet merged, just its capability; still flagged for Rule 17 review before any deeper merge), and Monthly Idol's custom occupancy-percentage model (`ShowRoomEnvironmentShell` — no seat objects at all, lowest priority to converge).

**Duplicate Route Convergence rule**: when multiple routes/components accomplish the same thing (confirmed for Cypher: 15 candidate routes; Dirty Dozens: 5; Monthly Idol: 4; World Concert: 3 — see [[project_audience_runtime_wiring_2026_06_19]] for the located canonical path per type), do not arbitrarily delete down to one. Analyze each candidate's strengths (audience handling, camera, chat, monetization, reliability) and **inherit the best of each into the canonical route** — `Canonical = A's audience handling + B's camera + C's chat + D's monetization`, not "delete everything but A." **Mark superseded systems `LEGACY` in code comments; never delete until the replacement is verified working.** Replace first, delete second.

**Official Automated Events** (platform-owned flagship events — Monday Night Stage, Monthly Idol, Battle of the Bands, World Championships, Dirty Dozens Championship, Seasonal/Annual events): these are created, scheduled, hosted, judged, and broadcast-directed by TMI's own bot/host systems, not dependent on a human host. TMI Event Bots are responsible for the full lifecycle — pre-event (create/schedule/registration/brackets/promo), live operations (seating, round/timer/transition control, judging, rule enforcement), broadcast direction (camera switching, replays, highlights — no human director required), competition management (brackets, ties, no-shows, re-seeding, rankings), and post-event (winners, trophies, XP, memory wall archives, leaderboards). Humans remain contestants, performers, audience, optional judges, sponsors, VIP guests — never operations staff for an Official event. **Outcomes must still come from real rules** (real votes, real judging criteria, real participation/competition results) — bots run the *operation*, never fabricate the *result*. This is a large, multi-session build; check for existing partial implementations (`HostShowAssignmentEngine.ts`, `HostIdentityRegistry.ts`, `ShowHostRegistry.ts`, `hostEngine.ts`, `BattleFormatRulesEngine.ts` were found to already exist as of 2026-06-20, unaudited for wiring) before building anything new — this rule does not override Rule 8 (Registry First) or the "you are an assembly director, not a system builder" directive at the top of this file.

**Event Creation Matrix** (non-Official events unless noted):

| Who | Can Create | Can Always Join Instead |
|---|---|---|
| Anyone (any tier) | — | Cyphers, Battles, Challenges, Dance Parties, Concerts, Releases |
| Gold Performer | Mini Concerts, Mini Releases, Mini Cyphers, Mini Battles, Dirty Dozens, Dance-Offs, Comedy Rooms, Talent Showcases | any existing event instead |
| Gold DJ | Mini Dance Parties, Dance Halls, Genre Rooms, Listening/Release Parties | World Dance Party instead |
| Gold Dancer | Dance-Offs, Mini Dance Parties | World Dance Party instead |
| Gold Comedian | Comedy Rooms, Comedy Battles, Comedy Challenges, Talent Showcases | — |
| Official TMI Bots only | Monday Night Stage, Monthly Idol, Battle of the Bands, World Championships, Seasonal/Annual Events, Official Game Shows | n/a — these are bot-created by design |

Official Game Shows (Deal or Feud, Name That Tune, Circle and Squares, Championship Shows) remain platform/bot-host-only — users participate but never create the official format.

**Event Runtime is the sole authority for event creation.** A performer (or DJ/Dancer/Comedian per the matrix above) only *requests* an event — Go Live, Mini Concert, Mini Release, Mini Cypher, Mini Battle, etc. The Event Runtime is what actually creates the event record, issues its ID, and registers it with every dependent system (ticketing, seat assignment, rankings, automation). A performer never creates an event record directly. This is the same principle as ticket issuance below, generalized: **tickets are platform-issued, seats are platform-assigned, revenue is platform-settled, event records are platform-created — never performer-issued/assigned/calculated/created.** A pasted "Automatic Ticket Engine" proposal received 2026-06-20 described performers directly creating events and setting ticket price/capacity — that contradicts this rule and Rule 17 both; flagged, not implemented. The correct model is Performer *requests* → Venue Runtime/Ticket Engine/Seat Engine/Revenue Engine (Venue/Promoter/Admin-authoritative per Rule 17) *creates and owns* the record.

**No Empty Platform rule (extends Rule 14, never weakens it)**: if participation is low, the platform's job is to generate more real opportunities — rotate genres/regions/challenge types, open the next scheduled matchup, surface a fresh bot-hosted event — never to fabricate users, viewers, or applause. A room that fails to fill in its time window rotates to the next opportunity rather than sitting empty or faking a crowd. This is the same rule as Rules 14/20, applied to event *supply* rather than just surface *content*.

#### World vs Mini Naming Convention (amendment, locked 2026-07-24)

Every event type on the platform follows the same two-tier naming split, making the Official-vs-user-created distinction (established above) legible from the UI itself, not just enforced server-side:

| Official (World) | User-Created (Mini) | Creator |
|---|---|---|
| World Dance Party | Mini Dance Party | World: DJ Record Ralph (bot) only, on platform schedule. Mini: any qualified Gold DJ, instantly. |
| World Concert | Mini Concert | World: platform-scheduled. Mini: qualified Gold Performer, instant ("releasing right now"). |
| World Release Party | Mini Release Party | World: platform-scheduled. Mini: qualified Gold Performer, instant. |
| Monday Night Stage / Battle of the Bands | Mini Battle | World: bot-only flagship. Mini: any qualified user, instant. |
| Cypher Championship (flagship) | Mini Cypher | same split |
| Challenge Arena (flagship) | Mini Challenge | same split |
| Open Mic Showcase (flagship) | Mini Showcase | same split |

**Correction to the Event Creation Matrix above**: the former "Gold DJ/Gold Dancer → World/Mini Dance Parties" rows were wrong and are superseded (fixed 2026-07-24) — a Gold DJ or Gold Dancer can only ever create the Mini version. World Dance Party is created exclusively by the DJ Record Ralph bot on the platform schedule, the same as Monday Night Stage/Monthly Idol/Battle of the Bands are exclusively bot-created. No human-controlled account, regardless of tier, ever creates a "World" event — that authority belongs to Official Automated Events only (above).

**Visual badge convention**: 🌍 WORLD prefixes every official/flagship event card, tile, and live-wall entry; ⭐ MINI prefixes every user-created instant event. This is a Rule 20 visual-honesty requirement, not decoration — a user must always be able to tell which kind of event they're looking at without opening it.

**No separate publish step**: the moment a qualified user creates a Mini event, the Event Runtime (per "Event Runtime is the sole authority" above) must register it with the correct live discovery surface immediately — Mini Battle → Battle Live Wall, Mini Cypher → Cypher Live Wall, Mini Challenge → Challenge Wall, Mini Dance Party → Dance Party Wall, Mini Concert → Concert Wall, Mini Release Party → Release Wall, Go Live → General Live Feed. There is no separate "publish" action a creator has to take beyond the creation click itself.

**Scope honesty (2026-07-24 audit)**: World Dance Party is real and live (DJ Record Ralph hosts it). The underlying Battle/Cypher/Challenge competition engines are real (`EventOrchestrator`, `BattleFormatRulesEngine`, `CompetitionIntegrityEngine`), but there is no one-click "create a Mini Battle/Cypher/Challenge" UI yet, no 🌍/⭐ badges anywhere on the platform, and no auto-publish-to-live-wall wiring. Mini Concert, Mini Release Party, and Mini Showcase have no real creation flow at all yet. The cinematic join sequence discussed alongside this convention (venue visible immediately → seat reserved → arrival animation → ring-priority progressive asset loading → sit → ready) is not built anywhere — `LobbyEntryFlow` (Rule 15) already enforces the seat-assignment routing requirement that sequence would sit on top of, but no arrival-animation or progressive-loading layer exists yet. This is documented direction, not a claim that badges, one-click Mini creation, or the arrival animation exist in code — do not build a stub version of any piece of it (a badge with no real World/Mini distinction behind it, an animation that plays before a real seat is assigned, etc. would itself violate Rule 20).

*Established 2026-06-20 by Marcel Dickens. World vs Mini Naming Convention amendment added 2026-07-24.*

---

### Rule 24 — Three-Lane Rewards Ecosystem + Sponsor Prize Distribution + Discovery Missions (locked 2026-06-21, not yet implemented)

TMI rewards everyone who contributes to the ecosystem, not creators/competitors only. This extends Rule 9 (Everything Earns XP) by organizing reward-earning activity into three lanes, and extends Rule 23 (Revenue-First Rewards Governor) by giving those lanes a currency/payout model to plug into — it does not loosen Rule 23's financial gating. A fan who streams 100 songs this month should feel as rewarded as a performer competing on stage.

**The three lanes:**

1. **Competitive Rewards** — Battles, Cyphers, Dance-Offs, Joke-Offs, talent challenges, game shows. Rewards: cash prizes (Cash Prize Mode only, per Rule 23), sponsor prizes, VIP tickets, equipment, featured placement.
2. **Engagement Rewards** — listening to songs, watching performances, attending live rooms, voting, reviewing music, reading magazine articles, sharing content. Rewards: XP, coins, reward points, sponsor giveaways, merch drawings, premium membership trials, meet & greets.
3. **Community Rewards** — helping new users, moderating rooms, inviting friends, supporting artists, positive participation. Rewards: community badges, VIP access, early feature access, exclusive events, sponsor gifts.

**Sponsor Prize Distribution**: when a sponsor donates a prize pool (e.g. headphones, gift cards, merch bundles), the same pool can be auto-distributed across multiple activity types in one pass — battle winners, top listeners, random attendees, most active voters, most supportive fans — rather than being tied to a single contest. Goal: "you don't have to be the best performer to win something."

**Discovery Missions**: lightweight quests that turn platform-wide exploration into a reward loop — e.g. "Discover 10 New Artists" (XP + sponsor raffle entry + badge), "Listen to 25 New Songs" (VIP drawing entry + profile frame + Diamond trial), "Read 5 Magazine Features" (coins + merch raffle + backstage pass drawing).

**Anti-Pay-to-Win**: none of these three lanes may let a paid tier purchase competitive advantage in judged outcomes (votes, rankings, battle results) — paid tiers may unlock cosmetic/access perks and bonus engagement-lane multipliers, never a competitive-lane outcome. This is the same boundary Rule 23's Cash Prize Mode already respects (bots run the operation, never fabricate the result — see Rule 21's Official Automated Events) extended to the reward layer.

**XP / Coin / Cash separation**: XP (progression/rank, Rule 3/9) and Coins (engagement-lane currency, spendable on cosmetics per Rule 19's Playlist Skin Economy or similar) are platform-internal and may be granted freely in Launch Mode. Cash and cash-equivalent prizes remain fully gated by Rule 23's phase model and Prize Budget Engine — this rule adds *where rewards come from* (three lanes + sponsor pools + missions), Rule 23 still governs *what currency may be paid out and when*.

**Scope honesty**: none of this exists as code yet — no Sponsor Prize Distribution Engine, no Discovery Missions Engine, no lane-aware reward router. This is documented direction only, status **FUTURE APPROVED FEATURE**, **Priority: Post Soft Launch**, **Certification Impact: NONE**. Do not build any part of this before the current soft-launch certification priorities (signup/login, profiles, messaging, live rooms, video/audio, discovery, magazine, rankings, Stripe/monetization, tickets, bookings, Home 1-5 stabilization, avatar system restoration, production deployment) are done. Do not build a stub/fake version of any of these engines (that would violate Rule 20).

*Established 2026-06-21 by Marcel Dickens.*

---

### Platform Constitution Summary

25 rules. Non-negotiable. Applies forever.

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
| 17 | Ticket Authority — Venue/Promoter only, no Fan/Performer association anywhere in the pipeline; merch's performer-affiliate-seller model is unchanged | ticketEngine.ts |
| 18 | Visual Identity Formula (40% Magazine/30% Vice City/20% Broadcast/10% Spatial) + Ultra-Realistic Bobblehead avatars + No Orphan Routes/Roles | All surfaces, avatar pipeline |
| 19 | Beat System Separation (Submission Vault/Marketplace/Competition Vault never merged) + Store Role Split (Fan/Performer/Shared) + Playlist Skin Economy (free/points/premium/tier) | BeatInventoryEngine.ts, CompetitionMusicEngine.ts, PlaylistArtifactEngine.ts |
| 20 | Launch Certification Standard — no fake data/dead buttons/fake live/fake monitors; every profile functional; route ledger; one engine per system; visual honesty | All surfaces, final launch gate |
| 21 | Venue Runtime Convergence — one runtime, many modes; one audience/seat/presence system (4 found, 2 converged); inherit-best-of-breed on duplicate routes, mark LEGACY don't delete; Official Automated Events run by bots on real outcomes; No Empty Platform = rotate opportunities, never fake crowds; World vs Mini naming convention (🌍/⭐ badges, World=bot-only, Mini=qualified-user-instant) for every event type | audienceRuntimeEngine.ts, ArenaEventShell.tsx |
| 22 | Adaptive Platform Rule — every major runtime may Observe/Measure/Recommend, never silently rewrite; major behavioral changes require Build Director approval; canonical registries stay source of truth while runtimes learn | All runtimes, future analytics layer |
| 23 | Revenue-First Rewards Governor — 3 reward phases (Launch=XP/cosmetics, Growth=platform credits, Cash=real money) gated by real financial health checks; no payout system may ever place the platform in a loss position; auto scale-down, not human-approved | Future RewardsEngine, PrizeBudgetEngine |
| 24 | Three-Lane Rewards Ecosystem — Competitive/Engagement/Community lanes reward performers AND fans/listeners/readers/voters/sponsors/venues; sponsor prize pools auto-distribute across activity types; Discovery Missions quest layer; anti-pay-to-win; XP/Coin/Cash separation (Cash still Rule-23-gated). Post soft-launch, certification-impact none | Future SponsorPrizeDistributionEngine, DiscoveryMissionsEngine |
| 25 | Radio Network + Participation Economy — 20 launch channels (2/genre + Slow Jam room), real-submission-only rotation; SocialRadioRoomEngine (shared timeline, local mixer, speaking presence, bot DJ); participation-based rotation (not inactivity timer) with hit-song protection; contextual Opportunity Engine for boosts (exposure only, never rank). Not yet implemented | BotDJEngine.ts, SubmissionEngine.ts (real groundwork) |

---

### Rule 22 — Adaptive Platform Rule (locked 2026-06-20, not yet implemented)

**Every major runtime (Event, Host, Avatar, Venue, Audience) should eventually support a learning loop**: Observe (what happened) → Measure (analytics — retention, votes, tips, chat activity, XP) → Recommend (what worked better) → Improve (apply, with approval). This is a **future-phase capability, not something built today** — no analytics pipeline, no recommendation engine, and no "Build Director approval" workflow exist yet in this codebase. Locking this here is documentation of intent, not a claim that it's implemented; do not build a fake/stub version of "the platform learns" that doesn't actually learn (that would itself violate Rule 20).

**The non-negotiable boundary, regardless of when this gets built**: AI may recommend improvements; AI may never silently rewrite core platform rules, canonical registries, or host/show assignments. The Host Canonicalization work (see [[project_host_canonicalization_2026_06_20]]) is the explicit example of what "canonical registries remain the source of truth" protects — future learning/optimization systems must read FROM that canonical ledger, never silently re-derive or overwrite it. Major behavioral changes always require explicit owner (Build Director) approval, the same standard already applied throughout this session to every registry conflict resolved.

**Event Runtime ≠ Host Runtime** (locked same day): Mini/casual events (Mini Battle, Mini Cypher, Mini Dance-Off, Mini Challenge, Mini Concert, Mini Comedy Show, Mini Showcase) get the full Event Engine (scoring, rankings, VS animations, sound effects, audience reactions, XP, rewards) with **host optional** — an Automated Announcer covers the no-host case ("Round One begins now," "Voting is open," "Winner detected"). Official branded shows (Monthly Idol, Monday Night Stage, Deal or Feud 1000, Circle & Squares, Battle of the Bands, Yearly Championships, Dirty Dozens Finals) get the same Event Engine **plus** real hosts/judges/commentary/personality on top. Host backup coverage is required for the branded-show list above; casual/quick events do not require a host at all. Neither the Event Runtime nor the Hosted/Automated split exist as code yet — locked as direction, not built.

*Established 2026-06-20 by Marcel Dickens.*

---

### Rule 23 — Revenue-First Rewards Governor (locked 2026-06-21, not yet implemented)

**No contest, reward, payout, scholarship, giveaway, or prize pool may ever place the platform into a loss position.** The platform pays operating costs first, infrastructure second, reserves third, rewards last. This is a permanent financial safety rule, not a launch-only restriction — it governs every future reward/prize system TMI ever builds.

**Three reward phases, gated by real financial state, not by calendar or ambition:**

1. **Launch Mode (current, bank balance low/unknown)** — contest rewards are XP, badges, titles, trophies, crown points, ranking points, profile cosmetics, special frames, exclusive emotes, playlist placement, homepage/billboard/magazine features, season pass progress, founder rewards, digital collectibles. **No automatic cash payouts of any kind.** Example: 1st place = +10,000 XP + Billboard feature + Magazine article + Gold trophy. Costs the platform almost nothing.
2. **Growth Mode** — unlocks only after a real, measured trigger (e.g., monthly revenue exceeds a set floor AND operating reserve covers a set number of months). Adds gift cards, merch credits, ticket credits, platform credits, sponsor rewards — money stays inside the TMI ecosystem, still no large cash payouts.
3. **Cash Prize Mode** — unlocks only after reserve account funded, infrastructure funded, taxes reserved, emergency reserve funded, and monthly profit is positive. Only then: cash prizes, revenue shares, tournament pools.

**Automatic Safety Governor**: if at any point cash reserve drops below minimum, OR monthly profit goes negative, OR emergency fund drops below threshold — cash rewards disable automatically and every contest converts back to XP/titles/features/credits/trophies. **No human approval required for the scale-down; it is automatic.** This is the same "AI may recommend, never silently override platform health" boundary as Rule 22, applied to money specifically: the governor can only ever scale rewards *down* to protect the platform, never authorize new cash exposure on its own.

**Prize Budget Engine**: every contest has a budget derived from real revenue, never an arbitrary promise. `PrizePool = ContestRevenue × AllocationRate`, and the pool may never be exceeded. For venue-hosted contests, the venue sets prize budget / ticket price / free-ticket count / backstage count / VIP count at creation time, and the system validates affordability before publishing — reject, don't publish, if the venue can't cover what it's promising.

**Ticket/access credits over cash at launch**: concert tickets, VIP passes, backstage access, meet & greets, digital season passes, premium membership time, and merch credits are the preferred reward currency before Phase 3 — they feel valuable to the winner while costing the platform very little, since they're drawn from existing inventory/access rather than the bank account.

**Scope honesty**: none of this — RewardsEngine, PrizeBudgetEngine, the phase-gating logic, the automatic governor — exists as code yet. Locking this here is documentation of intent and a permanent financial guardrail for whenever a rewards/prize/payout system gets built, the same treatment as Rule 22's Adaptive Platform Rule. Do not build a stub/fake version of "the governor protects the platform" that doesn't actually check real financial data (that would itself violate Rule 20).

*Established 2026-06-21 by Marcel Dickens.*

---

### Rule 25 — Radio Network + Participation Economy (locked 2026-06-22, not yet implemented)

TMI Radio is the direct-to-listener alternative to traditional radio promotion: `Artist → Upload → Submit → Review → Rotation → Listeners`, with no label/promoter gatekeeping. This rule locks the full target architecture as documented direction. **Scope honesty applies to the entire rule**: none of the systems named below exist as code yet, beyond the two real building blocks noted in each section. Do not build any part of this before current soft-launch certification priorities are done, and do not build a stub/fake version of any engine named here (that would violate Rule 20) — a "participation meter" that doesn't track real activity, or a "speaking presence" indicator that doesn't detect real speech, is exactly the fake-feature pattern this whole Constitution exists to prevent.

**Launch radio network**: 20 official channels, 2 per genre (Hip-Hop, R&B/Soul, Pop, Rock, Country, EDM/DJ, Gospel/Christian, Jazz/Blues, Latin/World, Comedy/Spoken Word) plus one `Slow Jam Meet & Greet Room` (social/chill lounge — explicitly *not* framed as a dating product, moderation and report/block required). Channels launch empty but active — never seeded with fake songs or fake artists. Honest empty state per channel: *"Waiting for approved songs. Submit music to enter this station."* Real flow: `Member Upload → Song Submission → Bot/Moderator Review → Approved Track → Genre Playlist → Radio Rotation`. `SubmissionEngine.ts` (`apps/web/src/lib/submissions/SubmissionEngine.ts`) and the real `/submit` page already implement the submission half of this — the radio-rotation half does not exist yet.

**Playlist Universe** (naming not finalized — working name only): radio-sourced playlists live in their own section, distinct from personal/performer playlists, but any user can add a radio playlist's tracks into their own playlist. Saved alongside personal playlists in the user's Media Locker. When a radio playlist fills, the system should be able to auto-spin up a new playlist of the same kind/genre, auto-named, with stats tracked per playlist (plays, saves, shares, completion rate) — not just per song.

**SocialRadioRoomEngine** — each room is a live social venue, not a static playlist page: GTA-radio-style bot DJ automation (station intro, song intro/outro, artist shoutout, sponsor mention, points announcement, commercial break, milestone callouts) playing real member-submitted rotation, **shared station timeline** (every listener in a room hears the same song/host-break/commercial at the same moment — no per-user timelines), **local audio mixer** (each listener independently controls Music / Room Voices / Bot DJ / Effects volume — local mix only, never affects the shared timeline), video chat with `SpeakingPresenceWidget` (tile lifts/glows + voice ring when a mic is hot; avatar + message bubble when camera is off; bubble-only for text), reusing existing venue/lobby environments rather than building flat new pages. `BotDJEngine.ts` (`apps/web/src/engines/performance/BotDJEngine.ts`, 214 lines — persona roster + templated `announceRoom`/`pickBeat`/`reactToSkip`/`hypePlayers`/`announceWinner` actions) is real, existing groundwork for the dialogue layer, currently scoped to battle/competition contexts; extending it into a genre-/song-aware `RadioDialogueEngine` is the natural next step, not a from-scratch build. `SpeakingPresenceWidget`, `RoomAudioMixer`, and the synchronized shared-timeline transport (WebSocket/WebRTC-level work) do not exist in any form — this is the genuinely greenfield, multi-session part of this rule.

**Background/cross-device listening is mandatory, not optional**: screen-off mobile, background browser tab, app background mode, and picture-in-picture on TV must all keep audio playing — audio-only/mini-player/background-audio modes are a hard requirement, not a nice-to-have.

**Participation-based rotation, not a pure inactivity timer**: a song's place in rotation is tied to a `ParticipationScore` (logins, uploads, shares, fan responses, live sessions, promotion activity) feeding a per-artist **Participation Meter** (0→100%, milestone tiers at 25/50/75/100% — Bronze/Silver/Gold/Diamond Rotation — using existing repo sound effects/animation assets for the fill and level-up moments). Reaching 100% grants **Radio Credits** (rotation days), consumed daily while the song stays active; re-engaging refills the meter and credits. Warning state surfaces around 7 days of zero participation; full removal to **Archive Rotation** (Media Locker, not deleted) around 14 days — Diamond/Verified accounts get a longer exception window (~30 days). **Hit-song protection**: a track with high listens/saves/shares/completion-rate auto-extends into a **Legacy Rotation** tier regardless of the artist's current participation, so a breakout song never disappears because the artist stepped away. A parallel, simpler **Listener Participation Meter** exists for fans (fills from listening/reacting/sharing/discovering/inviting), rewarding XP/badges/skins/cosmetics only — never cash, per Rule 23.

**RadioIntegrityEngine (anti-cheat)**: listener points are only awarded when real engagement is likely — real session/tab-active checks, human-activity signals (reactions, chat, navigation), and explicit abuse-pattern detection (muted-for-hours, mass-tab farms, auto-refresh farms, bot listening). A muted background tab must not silently farm points.

**RadioBoostEngine + Opportunity Engine (contextual, not an open storefront)**: artists can spend Radio Credits/points or pay cash for **additional exposure time** in rotation — never a purchased rank or chart position; chart position stays earned (listens/saves/shares/completion-rate) per Rule 20's visual-honesty standard. Boosts are explicitly **not** displayed as an upfront "Buy Promotion" store — they surface contextually inside an **Opportunity Dock** in the Performer HQ, triggered only at meaningful moments: participation meter just filled, rotation nearing expiration, a track outperforming its genre cohort, a fresh release just uploaded, a near-Top-10 chart position, or a real listener-growth spike. Points-funded boosts are always presented before the cash option. A boosted-but-rejected song (low completion/saves/shares despite the boost) returns to normal rotation early — spend does not override real listener signal. Future expansion (not launch-scope): a `Radio Promotion Center` bundling song boosts, playlist-cover features, album promotion, release launches, and station/battle/concert sponsorships into one revenue surface — itself gated by the same contextual-trigger philosophy, not a permanent open storefront.

**Dependency note**: this rule's monetization layer (boosts, commercial breaks, sponsor mentions inside radio rooms) is a specific application of Rule 12's `getAdSlotForZone()` fallback chain and Rule 24's Three-Lane Rewards Ecosystem — it does not introduce a competing ad/reward system, it extends the existing ones into the radio surface once built.

#### Stream & Win Radio Protocol v1 (amendment, locked 2026-07-06)

Locked by Marcel Dickens after live user feedback: artists submit songs and then hit a "what's next?" void. This amendment defines the full post-submission chain. **Scope honesty**: like the rest of Rule 25, this is documented direction — the rotation/room/notification systems named here are not built yet. The one near-term assembly task is the honest post-submission status copy (Phase 1 below), which requires no backend.

**Song-driven, not playlist-driven.** The playlist is only the container; individual songs enter the rotation pool. Accepted sources: TMI uploads, TMI Media Locker playlists, and external links (Spotify, Apple Music, YouTube Music, SoundCloud) — any URL, subject to validation.

**The Chain (every submission moves through visible states — no silence, no mystery):**

```
Submitted → Validated → Ready → Queued → Now Playing → Recently Played → Cooling Down → Eligible Again
```

1. **Phase 1 — Submit**: immediate UI feedback: "✅ Submission received. Your songs are being prepared for Stream & Win Radio rotation. You'll be notified when they go active." Until radio rooms exist, the honest interim copy is "Playlist will be available soon" — never a fake "you're live" state (Rule 20).
2. **Phase 2 — Validation**: system verifies reachability, metadata, duplicates, ownership rules. Status shows 🟡 Preparing.
3. **Phase 3 — Activation ("the Go signal")**: status 🟢 Ready. Notification cascade: in-app notification + dashboard badge + message-center message + optional email — "Your playlist is ready. Join any Stream & Win Radio room to begin earning Rotation Credits." The message is "you're eligible to participate," never "your song is playing."

**Join ANY room — participation is community-wide.** Artists never hunt for "their" room; every Stream & Win room feeds one shared ecosystem. Room types: **Mixed Radio** (everything, like real radio), **Genre Radio** (optional stations), **Mood Radio** (Workout / Party / Chill / Night Drive / Sunday Morning / Independent Spotlight / New Releases).

**Dynamic room start — never block participation on a threshold** (thresholds govern *spawning new rooms*, not whether artists may participate):
- **1–4 submissions**: room still goes live; rotation fills with real content only — featured songs, trending songs, new releases, sponsored music, TMI editorial picks, community tracks already in public rotation (a Rule 12-style fallback chain for rotation content; never fake tracks or fake artists — this refines the earlier "launch empty" language: honest fill beats empty, fake fill stays forbidden).
- **5–10 submissions**: full community session, majority of rotation from participants.
- **~20–25 active artists**: auto-spawn an additional room/channel (Hip Hop Radio A → B → C) to keep wait times short.

**The cardinal participation rule: artists are NEVER rewarded for listening to their own music.** Rotation Energy/Credits come only from community activity: listening to other artists, chatting, voting, discovering/following artists, sharing songs, inviting fans, joining discussions, staying active. Enforced by RadioIntegrityEngine (anti-cheat section above).

**Rotation Energy** (replaces bare "boosts" as the placement signal): each song's next-rotation eligibility is decided by Rotation Energy (community activity) + Freshness (new releases get an initial lift) + Membership Capacity + Community Response (likes/saves/shares/completion). Energy buys *increased opportunity and smarter placement* — more rotation frequency, discovery priority, featured slots — never a guaranteed play count and never a purchased chart position (Rule 20 visual honesty; consistent with RadioBoostEngine above).

**Membership = capacity + multiplier, never a substitute for participation** (canonical tiers only — FREE→PRO→RUBY→SILVER→GOLD→PLATINUM→DIAMOND, never "Bronze"):
- **Active-song capacity**: FREE 1 → PRO 3 → RUBY 5 → SILVER 10 → GOLD 20 → PLATINUM 35 → DIAMOND 50+ songs active in rotation at once.
- **Rotation Credit multiplier**: FREE 1× → PRO/RUBY 1.25–1.5× → SILVER 1.5× → GOLD 2× → PLATINUM 3× → DIAMOND 4×. Everyone grows through participation; members grow faster and can promote more of their catalog — paid tiers expand *what you can promote*, they never replace community engagement or buy judged outcomes (Rule 24 anti-pay-to-win).
- **Featured Sessions (GOLD+)**: scheduled hosted broadcasts (Album Release Party, Listening Party, Producer Showcase, Label Showcase) — additive scheduled events, never replacements for public rooms.

**Radio Control Center (artist dashboard widget)**: status light (🟡/🟢), current room, queue position ("18 songs ahead"), estimated play time, Rotation Credits, participation level, boost multiplier, [JOIN ROOM] / [NOW PLAYING] / [NEXT UP]. All numbers real or honestly empty (Rule 20 four-states).

**"Now Playing / Up Next" monitor**: visible queue (Now Playing: Artist A → Up Next: Artist B → After That: **YOU**) plus real listener count — anticipation instead of wondering whether the system works. Surfaces platform-wide via the Opportunity Feed ("🎧 Hip Hop Radio has 84 listeners", "⭐ Your playlist is currently playing") — real data only, from the canonical live registry.

**Fans earn too**: listener points for joining rooms, listening, liking, following, saving, sharing, merch/ticket purchases — the Listener Participation Meter above; XP/badges/cosmetics only, never cash (Rule 23). Circular economy: Listen → Earn Points → Spend in Store → Support Artist.

**Session Launch Model (refinement, same day)** — how a submitted playlist actually goes live:

- **Threshold gates *session launch*, never participation.** A new Stream & Win listening session opens once ~4–5 artists have joined for that session. Until then, submitted artists see an honest **waiting room** state — "🎧 Waiting Room: Artists Joined: 4 of 5 · Your playlist will activate when the session begins" — with real counts from a real session registry only (Rule 20 four-states; until that registry exists, generic honest copy — "launches once enough artists have joined" — never a fabricated count). Artists can always join *existing* live rooms meanwhile (the dynamic-room-start rules above are unchanged).
- **Session-open notification cascade**: when the threshold is met and the session launches, every participating artist gets in-app notification + email + profile/dashboard badge — "Your Stream & Win session is live. Your playlist is now available."
- **Playlist available three ways** once active: (1) **join the room** and stream it with everyone live, (2) **save it** to your own profile/Media Locker, (3) **stream it solo** from your profile anytime. Community streaming and solo streaming coexist — solo plays never earn Rotation Credits (cardinal rule above).
- **Artist dashboard widget** (extends the Radio Control Center above): [▶ JOIN RADIO ROOM] / [🎧 OPEN PLAYLIST] / [➕ SAVE PLAYLIST] / [👥 INVITE FANS].
- **"One more artist" opportunity ping**: at 4-of-5, the platform-wide Opportunity Feed may surface "🔥 1 more artist needed! Join Stream & Win Radio now to launch the next listening session and earn bonus Rotation Credits" — real waiting-room state only, never a manufactured scarcity prompt.
- **Balanced rotation**: session rotation ordering must preserve newcomer exposure — newer/less-established artists still get real placement alongside high-Energy tracks (consistent with Rule 11 freshness and the anti-pay-to-win boundary).

*Established 2026-06-22 by Marcel Dickens. Stream & Win Protocol v1 amendment added 2026-07-06; Session Launch Model refinement same day.*

---

### Rule 26 — Role-Specific Provisioning (locked 2026-07-14, enforced)

**Account type MUST be chosen before registration completes, and provisioning MUST respect that choice exclusively.** Fans do not receive Performer resources. Performers do not receive Fan resources. Each role gets its own experience, permissions, and surface.

#### The Hierarchy

```
Signup Form
    ↓
[Role Selection: FAN|PERFORMER|BAND|VENUE|PROMOTER|SPONSOR|ADVERTISER]
    ↓
Account Creation + Registration
    ↓
USER_REGISTERED event
    ↓
USER_ROLE_ASSIGNED event (carries chosen role)
    ↓
Role-specific provisioning plugin
    ↓
Only that role's resources created
```

#### Role Provisioning Matrix

Every account gets common resources (profile, wallet, notifications) **plus** role-specific resources **only**:

| Resource | FAN | PERFORMER | BAND | VENUE | PROMOTER | SPONSOR | ADVERTISER |
|---|---|---|---|---|---|---|---|
| **Profile** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Wallet & XP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Avatar & Inventory** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | | | | | | | |
| **Fan Lobby Access** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Personal Playlist** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Fan Yopho Canvas** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | | | | | | | |
| **Artist Profile** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Media Locker** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Beat Lab** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Performer Booking** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Performer Yopho Canvas** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Performer Live Access** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | | | | | | | |
| **Venue Profile** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Booking Workspace** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Ticket Management** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| | | | | | | | |
| **Sponsor Workspace** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Reward Distribution** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| | | | | | | | |
| **Advertiser Dashboard** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Campaign Workspace** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Billing & Analytics** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### Implementation

**Provisioning Route** (`/api/auth/provision`):
```javascript
// Accept either roles array (from signup) or accountType (legacy)
const accountType = body.roles?.[0]?.toUpperCase() || body.accountType?.toUpperCase() || "FAN";

// Provision role-specific resources conditionally
if (accountType === "FAN") {
  // Create: fan_profile, fan_live_lobby_access, personal_playlist, fan_canvas
}
if (accountType === "PERFORMER") {
  // Create: artist_profile, media_locker, beat_lab, booking, performer_canvas
}
// etc. — no resource created unless explicitly in that role's block
```

**EventBus Routing**:
```
USER_REGISTERED
  ↓
USER_ROLE_ASSIGNED
  ├── FAN → FanProvisioningPlugin
  ├── PERFORMER → PerformerProvisioningPlugin
  ├── BAND → BandProvisioningPlugin
  ├── VENUE → VenueProvisioningPlugin
  ├── PROMOTER → PromoterProvisioningPlugin
  ├── SPONSOR → SponsorProvisioningPlugin
  └── ADVERTISER → AdvertiserProvisioningPlugin
```

Each plugin subscribes **only** to the role it handles. No role-agnostic provisioning that checks role inside. Each role owns its own provisioning chain.

#### Fan Experience (Complete, Not Limited)

Fans are not "limited performers." They have their own **full creative experience**:

- ✅ Upload music to personal playlists (unlimited tracks, personal)
- ✅ Go live in Fan Live Lobby (social, can invite friends, non-ticketed)
- ✅ Create personal Yopho canvases (scrapbook/collection aesthetic)
- ✅ Earn XP and climb Fan leaderboards (separate from performer rankings)
- ✅ Participate in fan articles and community features
- ❌ Do not create: world concerts, world release parties, battles, cyphers, challenges, official game shows, ticketed events

#### Identity Policy — Avatar & Inventory is Fan-only (added 2026-07-18)

**Real identity for Performers, virtual identity for Fans — not the same experience wearing two skins.**

- **Performers (and Band)** are represented by their **real** identity: real profile photos, real cover/banner images, YoPho customization, music, videos, live camera, playlists, magazine articles, tour dates, merchandise, Memory Wall, broadcast tools. They must **never** see Avatar Studio, Avatar Inventory, avatar wardrobe/clothing, avatar emotes, avatar customization, avatar seating, Fan avatar lobbies, or an avatar profile card. If a performer ever sees avatar-ownership UI, that's a Rule 26 violation — gate it, don't leave it exposed.
- **Fans** get the full Avatar World: create their bobblehead, wear clothing, buy accessories, unlock animations, sit in venues, walk lobbies, join VIP areas, dance, cheer, use emotes, collect inventory.
- **The avatar rendering engine itself is never removed from a performer's live room.** When a performer goes live, the venue's audience is still rendered as fan avatars — seat-fill, audience reactions, the whole Rule 15/18 AudienceRuntime stays fully active. The performer doesn't own or customize an avatar; they direct an audience made of them. Performer-facing controls over that audience (spotlight, bring on stage, move to VIP, remove, highlight, trigger crowd animations/waves, launch polls, venue lighting) are **Audience Controls**, not avatar customization, and stay in scope for performers.
- Enforcement mechanism: `apps/web/src/components/auth/RoleGate.tsx` — wrap any avatar-ownership/customization UI in `<RoleGate allow={['FAN']}>`. Checks the real Prisma `Role` enum value from `/api/auth/session`, not the legacy `lib/auth/roles.ts` `TMIRole` permission-matrix type (that type predates this policy, uses `"MEMBER"` instead of `"FAN"`, and has no `BAND`/`WRITER`/`PROMOTER`/`JUDGE` — known inconsistency, not yet reconciled, do not use it for role gates until it is).

#### Consequences of Rule 26 Violation

If a system ever:
- Creates performer resources for a fan account on signup → **hard failure, immediate rollback**
- Allows fan to schedule a performer-only event (world concert, battle) → **permission error, not silently allowed**
- Shows performer-only UI to a fan account → **404 or role check required, never assume role**
- Defaults a role to PERFORMER when not explicitly selected → **hard failure on registration**

Then the provisioning system has failed Rule 26 and must be fixed before ship.

#### Audit Checklist

Before declaring provisioning complete:

1. **Signup sends role** → Inspect Network tab, POST /api/auth/register contains `roles` or `role` parameter
2. **Registration receives role** → Database shows correct `role` field on User table
3. **Provision reads role** → POST /api/auth/provision receives `roles` array from signup (or `accountType` for legacy), uses first role
4. **Role-specific plugins run** → Inspect logs, only role-specific provisioning steps appear
5. **No role-agnostic provisioning** → No plugin subscribes to `USER_REGISTERED` without checking role
6. **UI respects role** → Fan cannot see performer dashboard, performer cannot see fan lobby from their own account

*Established 2026-07-14 by Marcel Dickens. Fixed provisioning routing 2026-07-14 (commit f7b22f3f).*

---

### Rule 27 — Visual Composition Engine + Creator Commerce (locked 2026-08-27)

**The YoPho and every other visual surface must be powered by one canonical Visual Composition Engine, not a separate editor per surface.**

#### Source Allowance vs. Layer Count (strictly separated)

**Free tier source allowance:**
```
1 background source   (static or animated/window-style)
+ 2 user-imported image sources
```
This governs what the user **brings in**. It does not cap the total composition-layer count.

**System layers are unlimited and separate from source allowance.** A free user may still compose with:
```
BACKGROUND  →  UNDERLAY  →  CONTENT  →  TEXT  →  MEDIA  →  OVERLAY  →  FX  →  HUD/IDENTITY
```
including: overlays, underlays, frames, borders, masks, glows, particles, stickers, shapes, gradients, light leaks, smoke/fog, rain/snow, stars, sparkles, animated textures, motion trails, shadows, reflections, blur/depth layers, color filters, lens effects, animated windows/portals, waveform/equalizer layers, playlist/media-player widget, quote/text layer, chat-bubble layer, badges, QR/Artist ID/Fan ID layer, event/release labels, magazine-style headline layers.

#### Text System (certified layer types)
```
PLAIN TEXT · CHAT BUBBLE · THOUGHT BUBBLE · COMIC BURST · CAPTION BAR
LOWER THIRD · NEON SIGN · STICKER LABEL · QUOTE CARD · MAGAZINE HEADLINE
HANDWRITTEN NOTE · TYPEWRITER CARD · TEXT MESSAGE · SOCIAL COMMENT
RIBBON · BANNER · FLOATING TEXT
```
Each with variants: rounded · sharp · cloud · angular · glass · neon · comic · retro · luxury · graffiti · chrome · holographic.

#### Animation Behaviors (any eligible layer)
```
ENTER · EXIT · LOOP · PULSE · FLOAT · BOUNCE · SLIDE · SPIN · DRIFT
PARALLAX · ZOOM · SHAKE · GLOW · FADE · TYPE-ON · BEAT REACT
```
Controls: speed, delay, intensity, direction, loop/no-loop, opacity, start/end time, layer depth.
**Every animated composition must have a Reduced Motion fallback, battery/performance fallback, and static thumbnail fallback.** No rich card may become a broken card on weaker devices.

#### Canonical Composition Engine Pipeline
```
Sources → Layers → Styling → Motion → Interaction → Audio/Beat → Preview → Save Draft → Publish/Export → Re-edit
```
Supports: layer ordering, lock/unlock, hide/show, duplicate, group/ungroup, opacity, blend modes, crop/mask, clipping, rotation, perspective, depth/parallax, blur, glow, shadow, outline, gradients, chroma, animation timing, entrance/exit, looping, beat sync, snapping/alignment, safe zones, undo/redo, version history, templates, scenes.

#### Scenes (timed + event-driven state sequences)
```
INTRO → MAIN CARD → PLAYLIST → QUOTE → CTA → LOOP
```
Transitions: TIME · TAP · HOVER · PLAYBACK_START · TRACK_CHANGE · LIVE_STATUS_CHANGE · COUNTDOWN_COMPLETE.

#### Dynamic Widgets (first-class layer type)
Playlist widget, quote card, live-status indicator, countdown, event ticket, Artist ID, song card, QR/share card, supporter/fan counter, merchandise card, social link card, chat bubble, magazine clipping, etc. — **widgets must reference canonical platform data, never copy-and-freeze it as editable fake values** (Rule 20).

#### Canonical Project Schema
```
VisualCompositionProject {
  projectId, ownerId, surfaceType, sources[], layers[], scenes[], widgets[],
  motionConfig, themeBinding, entitlementRefs[], draftVersion, publishedVersion,
  compositionSchemaVersion, createdAt, updatedAt
}
```
Surface types: `YOPHO | PUBLIC_PROFILE | PLAYLIST_ART | ARTIST_ID | MAGAZINE_FEATURE | EVENT_POSTER | RELEASE_ART`
Layer types: `IMAGE | BACKGROUND | TEXT | CHAT_BUBBLE | SHAPE | OVERLAY | UNDERLAY | MASK | FRAME | PARTICLE | WIDGET | MEDIA | QR | BADGE | FX`

Schema versioning is mandatory from day one — compositions may live for years. A migration layer must upgrade old projects without corrupting them.

#### Commerce Model (locked)
```
FREE            starter set of text, overlays, bubbles, frames, basic motion/effects
$1.99/month     Creator Tools add-on — advanced capability bundle (animation controls, masking, beat-reactive, export, etc.)
$0.99–$1.99     one-time permanent packs (Chat Bubble Pack, Neon Overlay Pack, Cinematic FX Pack, Comic Pack, etc.)
BUNDLES         themed packs: Comic · Neon · Hip-Hop · Country · Cinematic · Magazine · Retro · Galaxy · Luxury · etc.
```
Laws:
- **Subscription = ongoing creator capability. One-time purchase = permanent ownership.**
- Purchased packs remain owned if the monthly Creator Tools plan is cancelled.
- **Try Before You Buy**: any locked asset is previewable inside the real composition — watermarked, non-publishable until entitled.
- Every asset/tool displays its exact state: `FREE · OWNED · $0.99 · $1.99 · CREATOR TOOLS · TIER · POINTS · LIMITED`

#### Unified Asset Entitlement Registry
One registry, not one per surface. A purchased pack registers its compatible surfaces:
`Owned asset → compatible surfaces: YOPHO | PROFILE | PLAYLIST | ARTIST ID`
Entitlement types are distinct: `ASSET_ENTITLEMENT | TOOL_CAPABILITY | SURFACE_COMPATIBILITY`.

#### Project Safeguards (mandatory)
Autosave drafts, named projects, duplicate/remix, version history, restore previous version, cloud project library, crash-recovery draft.
My Creations area: Drafts · Published · Templates · Purchased Assets · Favorites · Archived.
Creators must be able to return months later to an editable project, not only a flattened export.

#### Templates (non-flattening)
Templates remain editable compositions with semantic slots. Example: *New Single Release* = artwork slot + artist name + track title + release date + streaming/playlist widget + animated accent + CTA. User replaces content; design is retained.

#### Product Laws (locked forever)
1. Basic creation must remain genuinely useful for free.
2. Profile color is always free.
3. Imported source limits and system-decoration layers are separate concepts.
4. Purchased packs remain owned.
5. Subscriptions unlock ongoing capabilities; they do not erase permanent purchases.
6. Preview before purchase wherever technically possible.
7. No fake engagement, followers, reactions, audiences, or rewards may be decorative assets.
8. User creations remain editable projects, not flattened exports only.
9. Every animation has accessibility/performance fallback.
10. Entitlements come from one canonical registry, never hardcoded UI flags.
11. The same composition engine must be reusable across TMI instead of a new editor per route.
12. Every editor route must end somewhere real: save, publish, export/share, add to profile/playlist, or return to editable project.

*Established 2026-08-27 by Marcel Dickens.*

---

### Rule 28 — Canonical Avatar System + Herser Asset Binding (locked 2026-08-27)

**We do not build a second avatar/rig/environment system. The runtime connects to the canonical Herser-built assets.**

#### The Hard Binding Directive
```
HERSER CANONICAL ASSETS
→ existing bobblehead avatar meshes
→ existing canonical skeleton/rig
→ existing clothing/attachment sockets
→ existing environment/world geometry
→ existing room dimensions (square-root canonical dimensions)
→ existing seat meshes + seat anchors
→ existing collision/navmesh
→ existing spawn/stage/audience anchors
        ↓
TMI CANONICAL AVATAR RUNTIME
        ↓
Quick Panel · Avatar Creation Center · Fan Lobby · Venue · Go Live · Public Profile · Overseer
```

No runtime component may silently generate a replacement skeleton, placeholder avatar, substitute chair geometry, or alternate venue dimensions when a canonical Herser asset exists.

#### Canonical Asset Registries (required before any avatar work)
A **Canonical Asset Binding Audit** must produce:
```
CanonicalAvatarAssetRegistry    — avatar GLBs/FBXs, rig IDs, skeleton version, body archetypes
CanonicalRigRegistry            — rig ID → skeleton version → animation graph ID
CanonicalWardrobeSocketRegistry — socket → bone → mesh variant → collision profile
CanonicalEnvironmentRegistry    — venue ID → world asset ID → collision → navmesh → dimensions
CanonicalSeatRegistry           — seat ID → room ID → section → row → sitAnchor → standAnchor → lookAt
CanonicalAnimationRegistry      — animation ID → rig compatibility → LOD requirements
```

Every avatar resolves: `avatarId → canonicalMeshAssetId → canonicalRigId → bodyArchetype → rigVersion → animationGraphId → wardrobeCompatibilityProfile`

Every venue resolves: `venueId → canonicalWorldAssetId → collisionAssetId → navmeshAssetId → seatLayoutId → spawnAnchorSetId → stageAnchorSetId → audienceAnchorSetId → environmentDimensions`

#### No Substitute Asset Gate
During development, if a canonical asset binding is missing the system must **fail visibly** with a diagnostic instead of manufacturing a fake replacement:
```
CANONICAL_RIG_NOT_BOUND
CANONICAL_AVATAR_NOT_BOUND
CANONICAL_ENVIRONMENT_NOT_BOUND
CANONICAL_SEAT_LAYOUT_NOT_BOUND
CANONICAL_COLLISION_NOT_BOUND
```
Observatory must report any active fallback clearly. Development certification cannot pass while a fallback is being mistaken for a finished Herser asset.

#### Rig/Environment Compatibility Certification (required per venue)
```
AVATAR RIG · BODY SCALE · GROUND CONTACT · DOOR CLEARANCE · STAIR CLEARANCE
SEAT FIT · SIT ANIMATION · STAND ANIMATION · NAVMESH · COLLISION
PROP SOCKETS · CAMERA HEIGHT · LOD
```
If Herser's world was authored around a specific avatar scale, that scale is authoritative — normalize the runtime to it once, certify it, never silently resize avatars to "make them fit."

#### Avatar Quick Panel vs. Full Creation Center
Both surfaces render the same real rigged avatar, same equipped outfit, same animation system. Neither may fall back to a static PNG.

**Avatar Quick Panel** (instant, from Hub / Account menu / Venue HUD / Fan Lobby HUD):
```
live 3D avatar viewport → ROTATE · ZOOM · IDLE · WAVE · DANCE · EMOTE · PROP
current look picker → QUICK CHANGE (hair/hat/glasses/top/shoes/accessory)
→ FULL AVATAR STUDIO link
```

**Full Avatar Creation Center** (`/avatar/studio`) — deep editing:
```
BODY · FACE · HAIR · SKIN · EYES · FACIAL HAIR
WARDROBE: TOPS · JACKETS · BOTTOMS · OUTFITS · SHOES · JEWELRY · GLASSES · ACCESSORIES · PROPS
MOTION: IDLES · WALK · RUN · DANCE · EMOTES · POSES · PROP TESTS
MY LOOKS · MARKETPLACE · TEST AVATAR · SAVE DRAFT · EQUIP / PUBLISH
```

#### AvatarPreviewMotionDirector (canonical — not freeform)
Context-aware preview motions bound to edit actions:
- hair changed → head turn / hair-check pose
- jacket equipped → shoulder roll
- shoes changed → step / foot showcase
- glasses equipped → look toward camera
- full outfit → turntable spin / signature pose

Animation uses layer blending: `LOCOMOTION + UPPER-BODY ACTION + FACIAL EXPRESSION + PROP ACTION + ADDITIVE IDLE`

#### Draft vs. Equipped Appearance
```
DRAFT AVATAR      → local preview only
EQUIP / PUBLISH   → validate ownership + rig/body compatibility + LOD exists
                  → LiveAvatarSyncService broadcasts new loadout
                  → current rooms receive appearance update (no session restart)
```

#### Saved Looks (first-class)
`MY LOOKS`: EVERYDAY · BATTLE NIGHT · WORLD DANCE PARTY · CONCERT · MONDAY NIGHT STAGE · BUSINESS · FAN LOBBY · FORMAL · CUSTOM
Includes: hair, clothing, shoes, accessories, props preset, default idle, optional emote wheel.
One press equips the complete loadout. Operations: DUPLICATE · RENAME · FAVORITE · DELETE · SET DEFAULT.

#### Blender's Role (manufacturing backend only)
Blender runs as a headless pipeline for asset creation, NOT as a live browser operation:
```
NEW ASSET → normalize → canonical skeleton compatibility → skin/weights → sockets
          → materials → collision checks → LOD generation → texture optimization
          → validation report → GLB export → asset registry → live runtime
```
The web 3D engine loads certified assets; Blender manufactures and certifies them ahead of runtime.

#### One Identity Law
```
ONE ACCOUNT
→ ONE CANONICAL AVATAR
→ EDIT FOREVER
→ MANY SAVED LOOKS
→ ONE CURRENT EQUIPPED LOOK
→ EVERY AUTHORIZED 3D EXPERIENCE

ONE GO LIVE
→ ONE ROOM
→ ONE LIVE SESSION
→ REAL AUDIENCE PRESENCE
→ MANY VIEWPORTS
```

#### Route Map (locked)
```
/avatar/studio          — complete creation/editing
/avatar/closet          — inventory
/avatar/looks           — saved appearances
/avatar/test            — QA environments (Avatar QA Lab: flat floor / stairs / chair row / VIP booth / dance floor / stage edge / prop test / lighting tunnel)

Hub AVATAR button       → AvatarQuickPanel
Quick Panel → FULL STUDIO → /avatar/studio workspace/overlay
Venue HUD AVATAR        → QuickPanel
Public Profile          → read-only Avatar Showcase
/admin/observatory      → avatar/runtime health inspection
```

#### Canonical Runtime Architecture
```
AvatarRuntime
├── AvatarIdentityService
├── AvatarLoadoutService
├── AvatarWardrobeRegistry
├── AvatarPreviewMotionDirector
├── AvatarAnimationGraph
├── AvatarFacialRuntime
├── AvatarPhysicsDirector
├── AvatarEntitlementResolver
├── AvatarDraftService
├── AvatarSavedLookService
├── AvatarPresenceBridge
├── LiveAvatarSyncService
└── AvatarAssetRecoveryDirector
```

#### Error Recovery Codes
```
AVATAR_001_RIG_LOAD · AVATAR_002_MATERIAL · AVATAR_003_WARDROBE · AVATAR_004_COLLISION
AVATAR_005_SPAWN · AVATAR_006_SEAT · AVATAR_007_LOD · AVATAR_008_PROP
AVATAR_009_ANIMATION · AVATAR_010_SYNC
```
Each maps to an automatic recovery policy: retry → fallback asset → fallback outfit → safe spawn → LOD downgrade. User stays in session whenever possible.

#### Scope Honesty (2026-08-27)
The face-capture → rigged-3D-avatar → lip-synced pipeline remains multi-session, multi-specialist work (computer-vision + 3D-animation). Do not fake a stub version. The near-term work is: (1) connect the runtime to the existing Herser assets via the canonical registries, (2) wire the Avatar Quick Panel and Creation Center to those registries, (3) run the Avatar QA Lab certification. The full face-scan pipeline is scoped separately and cannot begin before the canonical rig/environment binding is complete.

*Established 2026-08-27 by Marcel Dickens.*

---

### Rule 29 — Three-Tier Venue Authority Separation (locked 2026-09-06)

**The profile/account shell is not the venue.** A profile is a window into a venue; the venue is an independent, authoritative runtime. This was locked after a 2026-09-06 UI convergence audit found `CurtainCanister.tsx` (already dead/unmounted) built as if curtain control were a per-account capability — the correction is architectural, not just a dead-code deletion: nothing that mutates a venue may ever be modeled as a Rule 15 canister or live inside the personal profile/account shell again.

**Four distinct authorities, never collapsed into each other:**

```
PERSON           → controls themselves (account/profile/identity)
VENUE            → controls the world (the room/session/3D environment)
VENUE OPERATOR   → controls authorized venue presentation, from inside the venue
LIVE PROGRAM     → controls what is broadcast/distributed externally
```

**The tier architecture:**

```
TIER 1 — PERSONAL / ACCOUNT SPACE
─────────────────────────────────
Universal Account Shell, Profile, Public Profile, Notifications, Billing,
Security, Privacy, Subscriptions, personal preferences, Discovery/navigation,
read-only Venue Preview.

NO: Curtains, stage mechanics, house lights, venue mixer, audience
administration, Jumbotron director, venue production controls.

                    ENTER / GO LIVE
                           ↓

TIER 2 — VENUE RUNTIME
─────────────────────────────────
Keyed by venueId / roomId / liveSessionId / experienceId — never userId/profileId.
3D world, stage, audience, seating, collision, spatial audio, Jumbotrons,
venue cameras, occupancy, experience runtime, venue state, telemetry.
The venue exists independently of any single user — if a performer steps
away, the venue's physical state (lighting, seating) persists.

                           ↓
                    AUTHORIZED ⚙ (contextual, not a permanent global rail)

TIER 3 — VENUE OPERATOR OVERLAY
─────────────────────────────────
Curtains, intermission, countdowns, house lights, stage FX, stage mechanics,
venue audio, audience modes, seating management, Jumbotron controls,
camera/scene controls, experience-specific controls, safety controls,
production overlays. Audience-facing (curtains, Jumbotron) vs operator-only
(the button that controls them) are different render layers — the audience
never sees Tier 3 controls, only their Tier 2 effects.
```

**Alongside all three — not underneath the profile, not owned by the venue:**

```
LIVE PROGRAM / BROADCAST SESSION
─────────────────────────────────
GO LIVE, Program Mixer, Preview/Program, Record, Share Screen, CAST,
Destination Bezel (YouTube/Facebook/Twitch/Kick/Custom), broadcast health,
external egress.
```

The Broadcast Destination Bezel is accessible from inside Venue Tools for operator convenience, but is **owned by the Live Program/session, not the venue** — provider credentials and distribution never become venue-owned just because the venue gear links to them.

**Ownership chains (the law, not a suggestion):**

```
FORBIDDEN:                          REQUIRED:
ProfileShell                        Active Venue
  → CurtainSystem                     → authorized Venue Gear (⚙)
                                       → VenueCapabilityResolver
                                       → VenueCommandBus
                                       → VenuePresentationDirector
                                       → CurtainDirector
                                       → authoritative VenuePresentationState
                                       → synchronized audience rendering
```

`VenuePresentationDirector` children: `CurtainDirector`, `LightingDirector`, `StageOverlayDirector`, `JumbotronDirector`, `SponsorOverlayDirector`, `ScoreboardDirector`, `CrowdPresentationDirector`, `TransitionDirector`, `ProgramLayoutBridge`.

**Read path vs write path** — profile/home/discovery previews consume a read-only feed and never receive mutation authority:

```
READ:  VenueRuntime → VenuePresentationSnapshot → Profile/Home/Discovery previews
WRITE: Authorized user inside venue → VenueCommandBus → VenueRuntime
```

`VenuePresentationSnapshot` may expose: venue name, experience, live/offline, approved thumbnail/program frame, curtain visual state, current performer, legitimate audience count, event status. It must never expose: operator mutation tokens, venue command authority, private mixer controls, stage authorization, broadcast credentials, admin capability.

**Curtain state is authoritative and synchronized**, not a local boolean per browser: `CLOSED → OPENING → OPEN → CLOSING → INTERMISSION → COUNTDOWN → HOLD → ERROR`, each transition carrying `transitionId`, `effectiveAt`, `duration`, `requestedBy`, `authorizedBy`, and an incrementing `venuePresentationVersion`. Late joiners fetch current state rather than replaying the transition from the start; a refreshed operator's browser reconnects to existing state rather than resetting to defaults.

**Role authority is resolved, not assumed from presence** — being physically in the venue does not grant control:

```
VenueGearButton → VenueCapabilityResolver → HudControlRegistry → VenueCommandBus
→ VenuePresentationDirector → authoritative venue state → renderer → audience
```

`HOST`/`AUTHORIZED PRODUCER` get venue presentation (+ program) controls, `PERFORMER` gets performer-specific controls, `FAN`/`GUEST` get audience-only or permitted-guest controls respectively.

**Venue tools are manifest-driven per experience, not one global control list** — a `VenueToolManifest` resolves from experience + venue capabilities + operator role + current venue state, so a Battle (Curtain, Intro, Round State, A/B Stage, Lighting, Jumbotron, Audience Reaction, Scoreboard, Camera, Safety), a Cypher (Curtain, Rotation, Active Performer, Group Stage, Lighting, Jumbotron, Audio, Audience), and Regular Go Live (Curtain, Lighting, Guests, Audience, Jumbotron, Program View, Sponsor Treatment) each get the right tools behind the *same* single ⚙ control — never a new permanent rail per experience.

**Venue lifecycle gates tool availability**: `NOT_ENTERED → ENTERING → ACTIVE → PAUSED → ENDING → ENDED`. No venue context, no venue tools — `canMountVenueTools` requires an active `venueId`+`liveSessionId` and `venueCapabilities.canOperateVenue === true`; the gear doesn't render disabled, it doesn't exist.

**Dependency law (certifiable)**: `profile/**`, `account/**`, `settings/**` must never import venue-mutating modules (`CurtainDirector`, `VenueCommandBus`, `VenueLightingDirector`, `VenueStageController`, `VenueAudienceController`) — they may import read-only `VenuePreview`/`VenuePresentationSnapshot` only. Venue runtime must never depend on private profile UI components. This should become an automated import-boundary check, not a one-time manual scan, so the architecture can't slowly recollapse.

**Certification (VENUE-01 through VENUE-13):**
```
VENUE-01  Profile shows venue preview but exposes zero venue mutation controls.
VENUE-02  Without active venue/session, Curtain/Stage/Lighting/Jumbotron controls are absent.
VENUE-03  Enter authorized venue → Venue Gear appears.
VENUE-04  Open Venue Gear → correct experience-specific tool manifest appears.
VENUE-05  Unauthorized audience member cannot mutate curtains/stage.
VENUE-06  Authorized operator closes curtain → all viewers see synchronized close.
VENUE-07  Profile preview reflects venue state without owning it.
VENUE-08  Refresh operator browser → venue presentation state persists.
VENUE-09  Late viewer joins → receives current state without restarting animation incorrectly.
VENUE-10  Venue state change does not restart camera, mic, WebRTC, recording, Program Mixer, or external egress.
VENUE-11  Different experience loads different VenueToolManifest without adding global buttons.
VENUE-12  Leaving/ending venue removes Venue Gear and all venue-only controls.
VENUE-13  AUTHORITY SEPARATION — ProfileShell cannot directly mutate VenueRuntime; all writes traverse
          Authorized Venue HUD → capability resolver → command bus → venue runtime/service → authoritative state.
```

**Required end state:**
```
VENUE CONTROLS IN PERSONAL UI          = 0
CURTAIN CONTROLS OUTSIDE ACTIVE VENUE  = 0
PROFILE → VENUE MUTATION PATHS         = 0
UNAUTHORIZED VENUE MUTATION PATHS      = 0
DUPLICATE VENUE CONTROL RAILS          = 0
READ-ONLY PROFILE VENUE PREVIEWS       = PASS
VENUE STATE RECONNECT                  = PASS
LATE-JOIN VENUE STATE                  = PASS
AUDIENCE CURTAIN SYNCHRONIZATION       = PASS
EXPERIENCE-AWARE VENUE TOOL MANIFEST   = PASS
```

**Scope honesty (2026-09-06)**: none of `VenueCapabilityResolver`, `VenueCommandBus`, `VenueToolManifest`, `VenuePresentationDirector`, `CurtainDirector`, or authoritative `VenuePresentationState`/`venuePresentationVersion` exist as code yet — this is a locked architectural law for how the venue-tools convergence (already underway per the same-day UI audit) must be built, not a claim any of it is implemented. The audit's confirmed-dead `CurtainCanister.tsx` and 4 other retired curtain implementations were already correctly pointed at `VenueToolsDirector`/`VenueToolsQuickPanel` by an earlier session — this rule formalizes why that direction was right and extends it to every venue-presentation control, not curtains alone. Do not build a stub version of any Director named above that doesn't actually enforce server-authoritative, synchronized state (a `CurtainDirector` that just flips local React state per viewer would itself violate this rule and Rule 20).

*Established 2026-09-06 by Marcel Dickens.*

---

### Rule 30 — Live Pause / Intermission Monetization State (locked 2026-09-06)

**PAUSE LIVE is a session state transition, not a stream stop.** When a performer pauses, the canonical `liveSessionId`, WebRTC contribution session, Program Mixer, recording continuity, external egress, and destination provider sessions all stay alive — only the program *content* changes, from live performance to a real venue intermission presentation (curtains closed, approved ad/sponsor program running). `PAUSE LIVE != END LIVE`, full stop.

**One contextual live-state control, not four permanent buttons:**
```
[ GO LIVE ] → [ PAUSE LIVE ] → [ RESUME LIVE ] → [ END LIVE ]
```

**State machine**: `OFF → STARTING → LIVE → PAUSING → INTERMISSION → RESUMING → LIVE`, with `WARNING`/`ERROR`/`STOPPING` as needed. Venue presentation maps onto it directly: `LIVE`=curtains open, `PAUSING`=curtain closing, `INTERMISSION`=curtain closed + approved ad/program content, `RESUMING`=curtain opening.

**Ownership chain on pause:**
```
LiveSessionDirector → ENTER_INTERMISSION → VenuePresentationDirector → CurtainDirector.CLOSE
→ IntermissionProgramDirector → AdDecisionService (canonical ad/sponsor inventory — never fabricated)
→ Program Mixer → canonical Program Output → TMI audience + cast surfaces + external destinations
```

**What gets cast/distributed is the Program Output, never the raw performer feed** — `Venue/Program Mixer → Program Output → CAST target`, not `performer camera → cast`. A viewer on YouTube, Twitch, a casted TMI screen, or a Jumbotron all see the same intermission presentation the in-venue audience sees; the connection never appears to just disappear.

**`IntermissionAdPod`** (fallback ladder, same anti-fabrication law as Rule 12): paid-eligible ad → sponsor creative → venue sponsor slate → TMI house promo → neutral intermission curtain (never a fabricated advertiser to fill empty inventory). A non-skippable ad in progress when RESUME is pressed either finishes before resume takes effect or is limited to skippable inventory only — never cut mid-spot, to protect advertiser reporting.

**Pause reasons change runtime behavior**: `MANUAL_INTERMISSION` (ideal for monetized ad inventory), `TECHNICAL_PAUSE` (prioritize a neutral holding slate over ads if the system is unstable), `PRIVACY_PAUSE` (suppress performer audio/video first, then close curtains), `BREAK`, `SAFETY_HOLD`.

**Telemetry required per pause/resume cycle** (no fabricated impressions): `pauseStartedAt`, `pauseReason`, `venueId`, `liveSessionId`, `adPodId`, `campaignId`, `creativeId`, `impressionStarted`, `impressionCompleted`, `externalDestinationCount`, `castSurfaceCount`, `resumeRequestedAt`, `resumeEffectiveAt`.

**Certification (LIVE-PAUSE-01 through 12):**
```
LIVE-PAUSE-01  Go live → external destination confirmed LIVE.
LIVE-PAUSE-02  Press PAUSE LIVE → session ID unchanged.
LIVE-PAUSE-03  Curtains close for all viewers.
LIVE-PAUSE-04  Performer camera/audio no longer exposed to audience program during pause.
LIVE-PAUSE-05  Approved ad/intermission program appears on TMI audience view.
LIVE-PAUSE-06  Same intermission appears on casted surface.
LIVE-PAUSE-07  Same intermission appears on external provider viewer.
LIVE-PAUSE-08  External provider session remains connected.
LIVE-PAUSE-09  Press RESUME → current non-skippable ad resolves correctly.
LIVE-PAUSE-10  Curtains reopen and performer returns without creating a new liveSessionId.
LIVE-PAUSE-11  Recording continuity follows configured policy.
LIVE-PAUSE-12  No fake ad impression/revenue event if no real creative was served.
```

**Scope honesty (2026-09-06)**: none of `LiveSessionDirector`'s pause/intermission states, `IntermissionProgramDirector`, `IntermissionAdPod`, or the pause/resume telemetry schema exist as code yet. This rule depends on Rule 29's `VenuePresentationDirector`/`CurtainDirector` existing first — sequence accordingly. Do not build a stub "pause" that actually ends the session (violates the core law above) or a fake ad-impression counter (violates Rule 20).

*Established 2026-09-06 by Marcel Dickens.*

---

### Rule 31 — Dual-Profile Account Architecture + Universal Account Center (locked 2026-09-06, not yet implemented)

**One TMI account. Fan + Performer profiles. Different names if you want. Switch anytime. Upgrade separately.** Use "profile," not "account," when talking about the Fan/Performer sides in UI copy — the account is singular; the profiles are the two identities it can hold ("ADD PERFORMER PROFILE FREE," not "ADD PERFORMER ACCOUNT FREE").

**The account splits into one private core plus two independent public role identities:**

```
ONE AUTHENTICATED USER ACCOUNT
│
├── AccountIdentity [PRIVATE / SHARED — one copy]
│   legal/account name · primary email · password/passkeys · phone/recovery
│   · security · billing owner · timezone/language · authenticated session
│
├── FanProfile [PUBLIC ROLE IDENTITY]
│   fanDisplayName · fanHandle · fanPhoto · fanBanner · fanBio · interests
│   · social/public links · fanPrivacy · fanTier
│
└── PerformerProfile [PUBLIC ROLE IDENTITY]
    stageName · stageHandle · performerPhoto · performerBanner · EPK bio
    · performerType · genres · booking/public links · performerPrivacy
    · performerTier
```

**Never mirror public identity fields between profiles.** All of these are legal and expected to differ: Fan display name ≠ Performer stage name, Fan handle ≠ Performer handle, Fan photo ≠ Performer photo, Fan bio ≠ Performer EPK bio, Fan links ≠ Performer links, Fan privacy ≠ Performer privacy, Fan tier ≠ Performer tier. Changing one must never silently overwrite or touch the other — cache invalidation on a name/photo change must be profile-scoped (invalidate only that profile's chat identity, venue/audience identity, public profile, and discovery record), never a blanket "rewrite everything" pass that touches the other profile's data.

**Performers still don't get an avatar identity** — this extends Rule 26's Identity Policy and Rule 18, doesn't loosen it. A Performer profile gets a profile picture, EPK imagery, cover art, and branding, but that is profile branding, not a second avatar-ownership system. Fan venue presence stays the canonical Fan avatar system; Performer live presence stays real video/WebRTC, exactly as already locked.

**Companion profile completeness is a real state machine, not just a `UserRole` row**: `NOT_CREATED → PROVISIONED → ONBOARDING → INCOMPLETE → COMPLETE → SUSPENDED → DEACTIVATED`. Provisioning a companion profile (`POST /api/account/companion-profile`, built 2026-09-06) must launch the same onboarding a first-time signup gets for that role type — display/stage name, handle, photo, bio, interests/genre, links, privacy — not silently mark it complete because a database row exists. Profile completeness percentages shown in the UI must be calculated from real required/recommended fields, independently per profile (a real "Fan Profile 82% complete / Performer Profile 64% complete," never a fabricated number — Rule 20 applies here as everywhere).

**Delegate/manager access is capability-scoped, never all-or-nothing:**
```
DelegateGrant { delegateUserId, ownerUserId, profileScope, permissions[], createdAt, expiresAt, revokedAt, auditTrail }
```
Allowed permissions: `EDIT_PERFORMER_PROFILE`, `MANAGE_BOOKINGS`, `MANAGE_SCHEDULE`, `VIEW_ANALYTICS`, `MANAGE_CONTENT`, `OPERATE_LIVE_SESSION`, `MANAGE_SPONSORS`. Never grantable, under any circumstance: `READ_PASSWORD`, `READ_2FA_SECRET`, `READ_PAYMENT_CREDENTIALS`, `BECOME_ACCOUNT_OWNER`. A manager never inherits the whole private account.

**Public and private APIs are physically separate routes, not the same endpoint with a permission check:**
```
PUBLIC:   /api/public/profile/[slug]
PRIVATE:  /api/account/me · /api/account/settings · /api/account/profiles/fan
          · /api/account/profiles/performer · /api/account/security
          · /api/account/notifications · /api/account/privacy
```
Provider OAuth tokens/secrets never reach the browser — the settings UI shows connection metadata only (connected-as, permissions granted, last verified, reconnect/disconnect); the actual access/refresh tokens live in an encrypted server-side vault.

**The Universal Account Center — one canonical settings surface, not per-role duplicates.** Reached from one avatar/initials identity control mounted in the shared header (photo if uploaded, else canonical initials from the authenticated display name — never derived from a viewed profile). Nineteen canonical sections: Account & Identity · Profiles & Role Management · Privacy & Visibility · Security & Access · Notifications & Alerts · Family & Household · Connected Accounts & Apps · Trusted Delegates/Management · Blocking/Muting/Moderation · Subscription & Billing · Purchases/Wallet/Earnings · Content & Media · Live/Broadcast Defaults · Accessibility · Appearance & Playback · Data & Permissions · Account Status & Appeals · Help/Safety/Support · Deactivation & Deletion. Route family: `/settings/account`, `/settings/profile?profile=fan|performer`, `/settings/privacy`, `/settings/security`, `/settings/notifications`, `/settings/subscriptions`, `/settings/billing`, `/settings/family`, `/settings/accessibility`, `/settings/connections`, `/settings/blocked`, `/settings/content`, `/settings/live`, `/settings/data`, `/settings/account-status`, `/settings/help` — navigable from one drawer/workspace, not `/fan/settings` + `/performer/settings` as separate systems (the 7 orphaned per-role settings pages found in the 2026-09-06 UI convergence audit are exactly the pattern this forbids going forward).

**One canonical Account Settings Registry, not settings hardcoded per component:**
```
AccountSettingDefinition { settingId, section, label, description, scope, roles,
  capability, dataSource, readCommand, writeCommand, visibilityRule,
  securityLevel, requiresReauth, auditEvent, mobilePriority, accessibilityLabel }
```
Every setting declares exactly one scope: `ACCOUNT · FAN_PROFILE · PERFORMER_PROFILE · DEVICE · SECURITY · PRIVACY · FAMILY · NOTIFICATIONS · COMMERCE · CONNECTION · BROADCAST_DEFAULT · ACCESSIBILITY`. Scope answers who owns the setting — password is `ACCOUNT`, Fan display name is `FAN_PROFILE`, preferred camera is `DEVICE`, curtain state is **not a setting here at all**, it's Rule 29's Venue Runtime. One setting → one owner → one read path → one write path → one audit path; no duplicate settings pages drifting apart. Every write traces: `UI → registry → authenticated server-derived userId → scope resolver → authorization → validation → canonical service → DB mutation → audit event → profile-scoped cache invalidation → verified UI state`. No fake save toasts, no `localStorage` for sensitive account/privacy/security values (device-only preferences may use device storage, clearly classified as device-local), no client-supplied authoritative userId.

**Account-level live/broadcast defaults are preferences, not venue controls** — preferred mic/camera, default resolution, noise suppression, caption preference, default destination selection preference belong here. Curtain open/close, house lights, stage mechanics, Jumbotron, audience mode, venue camera director belong to Rule 29's Venue Runtime, never to account settings, regardless of how convenient it'd be to put them in one place.

**Family & Household is a real system, not a decorative toggle**, and platform safety rules always win over a parent's setting: `parent allows dating lounge + user is under required age = STILL DENIED`, never the reverse.

**Account deletion is retention-aware, never a blanket destruction promise.** The correct chain: authenticate/reauthenticate → cooling-off period (if policy uses one) → revoke sessions → disable public profiles → disconnect providers → delete/anonymize deletable personal data → preserve only legally/policy-required records (financial, fraud-prevention, tax, abuse, legal, chargeback, moderation, security) → retention ledger → final deletion/anonymization once retention expires. Never promise "cryptographic purge of all private records" in user-facing copy — say what's actually deleted and what must be temporarily retained. Deleting a Fan profile must never delete the Performer profile or the root account; deleting the root account is a separate, stronger operation.

**Certification required before this is considered done** (all currently unbuilt, 2026-09-06):
```
PRIV-01  User A opens User B's public Fan profile → cannot read B's settings
PRIV-02  User A opens B's Performer profile → cannot read B's notifications
PRIV-03  Public profile API → no billing/security/private email fields
PRIV-04  Changing Fan display name → Performer stage name unchanged
PRIV-05  Changing Performer stage name → Fan display name unchanged
PRIV-06  Fan photo change → Performer photo unchanged
PRIV-07  Fan privacy update → Performer privacy unchanged unless setting is explicitly ACCOUNT-scoped
PRIV-08  Account security setting → applies to root authenticated account
PRIV-09  Logout → private caches/session destroyed
PRIV-10  Profile switch → stale prior-profile private UI state removed

PROFILE-01  New Fan companion doesn't count COMPLETE until required Fan onboarding is done
PROFILE-02  New Performer companion doesn't count COMPLETE until required Performer onboarding is done
PROFILE-03  Fan public name may differ from Performer stage name
PROFILE-04  Fan username may differ from Performer username
PROFILE-05  Each profile has independent photo/bio/social/public settings
PROFILE-06  Root login/email/password remain shared
PROFILE-07  Fan tier and Performer tier remain independent
PROFILE-08  Switching profiles preserves each profile's independent data

ACCOUNT-SHELL-01  One identity circle globally
ACCOUNT-SHELL-02  Photo if available
ACCOUNT-SHELL-03  Canonical initials if no photo
ACCOUNT-SHELL-04  Click opens one universal menu
ACCOUNT-SHELL-05  Same shell for Fan/Performer/Writer/Sponsor/Venue
ACCOUNT-SHELL-06  Fan↔Performer switch shown only for genuinely owned profiles
ACCOUNT-SHELL-07  Missing companion gets the provisioning CTA
ACCOUNT-SHELL-08  Notifications accessible
ACCOUNT-SHELL-09  Settings/privacy accessible
ACCOUNT-SHELL-10  Logout works
ACCOUNT-SHELL-11  390×844 works without clipping
ACCOUNT-SHELL-12  Desktop works
ACCOUNT-SHELL-13  No second legacy profile/account menu remains reachable
```

**Scope honesty (2026-09-06)**: none of `FanProfile`/`PerformerProfile` as separate entities, the Account Settings Registry, `DelegateGrant`, the public/private API split, or the 19-section Account Center exist as code yet — today's real schema is a single `User` row with `role`/`userRoles[]`/`activeRole` and one shared name/photo/bio (see `resolveRoleSwitchAuthorization.ts`/`resolveCompanionProvisioningDecision.ts`/`POST /api/account/companion-profile`, built same day, which work within that real schema). This rule is the target architecture a dedicated schema/migration effort must build toward — it is explicitly **not** a request to bolt a `FanProfile`/`PerformerProfile` split onto the existing single-name model as a stub. The near-term, buildable-today slice is the header shell (`ACCOUNT-SHELL-*` gates) reusing the already-certified role-switch/companion-provisioning backend against the current single-identity schema; the dual-name/dual-photo split and the full 19-section Account Center are separate, larger, later work.

*Established 2026-09-06 by Marcel Dickens.*

---

### Rule 32 — Subscription Payment-Failure Fallback: Downgrade, Never Delete (locked 2026-09-06, not yet implemented)

**If a paid profile's payment fails, TMI keeps the person in the ecosystem.** The paid profile falls back to FREE until the bill is resolved — the platform never punishes a failed payment by destroying the account, a profile, or the user's content.

```
PAYMENT FAILS
→ do NOT delete the account
→ do NOT delete Fan/Performer profiles
→ do NOT erase user content
→ do NOT break the login
→ downgrade only the affected paid profile/subscription to FREE
→ preserve account identity and profile data
→ remove only paid entitlements
→ restore paid entitlements automatically once payment succeeds
```

Because Fan and Performer plans are independent (Rule 31), the downgrade is profile-specific: a failed Fan plan downgrades only `FanProfile` to FREE and leaves `PerformerProfile` untouched, and vice versa. If both fail, both independently fall back to their own free tiers.

**Canonical billing state machine** — no instant downgrade on the first declined card unless that's the explicit policy; use a grace period:
```
ACTIVE_PAID → PAST_DUE → GRACE_PERIOD → DOWNGRADED_TO_FREE → PAYMENT_RETRY → RESTORED_PAID
                                                                            → CANCELED
```
Flow: payment fails → mark `PAST_DUE` → notify user → retry payment → grace period → if unresolved by the grace deadline → downgrade the affected profile to `FREE`. A later successful payment re-evaluates entitlement and restores the paid tier automatically — no need to recreate the profile or account, and never a duplicate profile/account created on restore.

**Downgrade ≠ delete.** Paid-only capabilities (extra storage, premium media-player skins, advanced broadcast tools, premium venue features) are suspended, not stripped from the account — those assets stay associated with the account and become unavailable until entitlement returns, subject to any clearly documented retention policy, not silently discarded.

**User-facing notification flow:**
```
1st failure   → "We couldn't process your payment."
during grace  → "Update your payment method to keep your current plan."
downgrade     → "Your Performer plan has moved to Free. Your profile and content are still here."
restored      → "Your Performer plan is active again."
```

**Certification required:**
```
BILL-01  Failed Fan payment does not alter the Performer plan
BILL-02  Failed Performer payment does not alter the Fan plan
BILL-03  Downgrade preserves the root account
BILL-04  Downgrade preserves the public profile
BILL-05  Downgrade preserves user content
BILL-06  Only paid entitlements are removed
BILL-07  Successful repayment restores entitlements
BILL-08  No duplicate account/profile created on restore
BILL-09  Billing status is server-authoritative
BILL-10  UI never shows paid access after entitlement has expired
```

**Scope honesty (2026-09-06)**: none of the billing state machine, grace-period logic, or automatic entitlement restoration exists as code yet — this is a permanent financial/product guardrail for whenever subscription billing is built for Fan/Performer tiers, the same treatment as Rule 23's Revenue-First Rewards Governor. Do not build a stub "downgrade" that doesn't actually track grace periods or restore entitlement on repayment (would violate Rule 20).

*Established 2026-09-06 by Marcel Dickens.*

---

### Rule 33 — Profile Visibility & Privacy Law (locked 2026-09-06, not yet implemented)

**Every new Fan and Performer profile defaults to PUBLIC.** From Settings & Privacy, a user can change visibility — but PUBLIC / PRIVATE / HIDDEN-FROM-DISCOVERY are three distinct states, never collapsed into one toggle:

```
PUBLIC     → public profile page visible; can appear in discovery/search;
             public identity shows where the product normally allows it;
             public-facing video/profile surfaces render per live/privacy rules
PRIVATE    → profile still exists, user can still use TMI; public identity is
             restricted; profile content visible only to allowed/approved
             people per privacy rules; public-facing video identity is not
             automatically exposed
HIDDEN     → "Hide Public Profile Page": not listed/browsable in normal public
             profile discovery, does not appear when people scroll through
             public profiles; direct public-profile route resolves to the
             correct hidden/private state, never a bypass
```

**Per-profile visibility contract** (independent per Rule 31 profile, with account-level defaults a profile can override):
```
AccountPrivacyDefaults → FanProfilePrivacy / PerformerProfilePrivacy

ProfileVisibility {
  visibility: "PUBLIC" | "PRIVATE"
  publicPageEnabled: boolean
  discoveryEnabled: boolean
  searchEnabled: boolean
  searchEngineIndexingEnabled: boolean
  showOnlineStatus: boolean
  showVenuePresence: boolean
  allowPublicMediaExposure: boolean
}
```
A user may have Fan PUBLIC + Performer PRIVATE, Fan PRIVATE + Performer HIDDEN, or any other combination — Fan and Performer privacy never cascade into each other, same independence law as their names/photos/bios (Rule 31).

**PRIVATE never means camera-off, mic-off, or ending a live session** — this is the critical distinction:
```
PRIVATE PROFILE  ≠  CAMERA OFF  ≠  MIC OFF  ≠  END LIVE
PRIVATE PROFILE  →  suppress public identity/video exposure on surfaces not authorized to show it
```
If someone is in a room they explicitly entered and that room requires video to function, the authorized-participant view still works normally. What PRIVATE blocks is that same video/identity being *reused* elsewhere — public profile page, public discovery wall, public recommendation rail, random browse surfaces, public previews — without explicit authorization. This distinguishes two identity concepts that must never be conflated: **PUBLIC DISCOVERY IDENTITY** (what strangers browsing see) vs. **AUTHORIZED INTERACTION IDENTITY** (what someone inside an interaction they joined sees) — privacy settings govern the former; they must never create an anonymous-abuse surface by stripping the latter inside an interaction the person chose to join.

**Server-authoritative enforcement, never CSS-hidden:**
```
PUBLIC PROFILE REQUEST → resolve target profile → resolve visibility →
resolve publicPageEnabled → resolve viewer relationship/permissions →
return only allowed public fields
```
`publicPageEnabled=false` must prevent the profile from appearing in public-profile browsing and must be enforced on the server for direct-URL requests too — a hidden profile is never "fetch everything then hide it with CSS." The same discipline applies to discovery, search, and recommendations: `DISCOVERY QUERY`/`SEARCH`/`RECOMMENDATIONS` must each exclude profiles with `discoveryEnabled=false` or hidden/private status at the query level, never filtered client-side after a full fetch.

**Individual identity-exposure toggles** (within Privacy & Visibility): show display name publicly, show profile photo publicly, show location publicly, show follower/following counts, show activity, show current venue, show listening/activity history, show social links.

**Certification required:**
```
PRIVACY-11  New profile defaults PUBLIC
PRIVACY-12  User can switch Fan profile PRIVATE
PRIVACY-13  User can switch Performer profile PRIVATE
PRIVACY-14  Fan privacy does not alter Performer privacy
PRIVACY-15  Performer privacy does not alter Fan privacy
PRIVACY-16  Hide Public Profile removes profile from public profile browsing
PRIVACY-17  Hide Public Profile removes profile from normal discovery
PRIVACY-18  Private/hidden profile does not leak through search
PRIVACY-19  Private/hidden profile does not leak through recommendations
PRIVACY-20  Private setting is server-authoritative
PRIVACY-21  Private does not silently disable camera/mic/live session
PRIVACY-22  Public video exposure is suppressed where privacy disallows it
PRIVACY-23  Direct URL cannot bypass hidden-profile policy
PRIVACY-24  Search-engine indexing disabled when the user turns indexing off
```

**Scope honesty (2026-09-06)**: none of `ProfileVisibility`, the discovery/search/recommendation privacy filters, or the PUBLIC/PRIVATE/HIDDEN state machine exist as code yet. This rule depends on Rule 31's `FanProfile`/`PerformerProfile` split for true per-profile independence — until that schema exists, any interim implementation must be explicit that it's applying visibility at the account level only (`ACCOUNT_FALLBACK`, per Rule 31's `ActiveProfileIdentity.profileKind`), never pretend independent Fan/Performer privacy exists before it does. Do not build a client-side-only "private" toggle that doesn't actually filter server-side queries (would violate Rule 20 and this rule both).

*Established 2026-09-06 by Marcel Dickens.*
