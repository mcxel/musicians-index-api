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

**Avatar standard:** Not anime, not cartoon, not Fortnite/Roblox/MetaHuman style. Target is **Ultra-Realistic Bobblehead** — real face proportions, recognizable likeness, slightly oversized head, expressive eyes, stylized realism, high-quality materials/hair/clothing. A face scan of a real person must produce a recognizable bobblehead of that person, never a generic numbered avatar. Pipeline: Phone Face Scan → Face Identity Engine → Bobblehead Avatar Builder → Wardrobe/Props/Emotes → Venue Seat Binding → Video Presence Overlay → Memory Wall/Profile Display. Every avatar — human, bot, audience, performer, fan — uses this same runtime; bots are never flat icons.

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
| Gold DJ | World/Mini Dance Parties, Dance Halls, Genre Rooms, Listening/Release Parties | — |
| Gold Dancer | Dance-Offs, World/Mini Dance Parties | — |
| Gold Comedian | Comedy Rooms, Comedy Battles, Comedy Challenges, Talent Showcases | — |
| Official TMI Bots only | Monday Night Stage, Monthly Idol, Battle of the Bands, World Championships, Seasonal/Annual Events, Official Game Shows | n/a — these are bot-created by design |

Official Game Shows (Deal or Feud, Name That Tune, Circle and Squares, Championship Shows) remain platform/bot-host-only — users participate but never create the official format.

**Event Runtime is the sole authority for event creation.** A performer (or DJ/Dancer/Comedian per the matrix above) only *requests* an event — Go Live, Mini Concert, Mini Release, Mini Cypher, Mini Battle, etc. The Event Runtime is what actually creates the event record, issues its ID, and registers it with every dependent system (ticketing, seat assignment, rankings, automation). A performer never creates an event record directly. This is the same principle as ticket issuance below, generalized: **tickets are platform-issued, seats are platform-assigned, revenue is platform-settled, event records are platform-created — never performer-issued/assigned/calculated/created.** A pasted "Automatic Ticket Engine" proposal received 2026-06-20 described performers directly creating events and setting ticket price/capacity — that contradicts this rule and Rule 17 both; flagged, not implemented. The correct model is Performer *requests* → Venue Runtime/Ticket Engine/Seat Engine/Revenue Engine (Venue/Promoter/Admin-authoritative per Rule 17) *creates and owns* the record.

**No Empty Platform rule (extends Rule 14, never weakens it)**: if participation is low, the platform's job is to generate more real opportunities — rotate genres/regions/challenge types, open the next scheduled matchup, surface a fresh bot-hosted event — never to fabricate users, viewers, or applause. A room that fails to fill in its time window rotates to the next opportunity rather than sitting empty or faking a crowd. This is the same rule as Rules 14/20, applied to event *supply* rather than just surface *content*.

*Established 2026-06-20 by Marcel Dickens.*

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
| 21 | Venue Runtime Convergence — one runtime, many modes; one audience/seat/presence system (4 found, 2 converged); inherit-best-of-breed on duplicate routes, mark LEGACY don't delete; Official Automated Events run by bots on real outcomes; No Empty Platform = rotate opportunities, never fake crowds | audienceRuntimeEngine.ts, ArenaEventShell.tsx |
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

*Established 2026-06-22 by Marcel Dickens.*
