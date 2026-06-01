# TMI WORLD ARCHITECTURE
## The Musician's Index — Locked Platform Specification
### BerntoutGlobal LLC · Marcel Dickens, Founder

---

> **This document is the single source of truth.**
> Every route, component, shell, lobby, arena, profile, and homepage
> must be checked against this before being built, changed, or deleted.
> If something is not in this document and nobody can explain why it exists,
> it gets pruned.

---

## WHAT TMI IS

TMI is not a streaming site. Not a social network. Not a battle app.

TMI is:

```
MAGAZINE
    +
LIVE WORLD
    +
VENUES
    +
PROFILES
    +
BILLBOARDS
    +
MONETIZATION
```

All operating together as one platform.

The closest real-world analogies combined:
- Rolling Stone (magazine)
- MTV / BET (live entertainment)
- Live Nation (ticketing + venues)
- American Idol (competition format)
- Twitch Arena (live performance)
- Venue Marketplace (custom skins)

---

## THE 4 LAYERS

---

### LAYER 1 — MAGAZINE

**This is the brand. Always visible. Never buried.**

The Musician's Index is named after a magazine. The magazine identity must appear
before any live world content. Users must read TMI as a music publication first,
entertainment platform second.

**Magazine surfaces:**
- TMI Masthead (typewriter color cycle: white → gold → green → red)
- News alerts (VOTING LIVE badge, CROWN UPDATING badge)
- Editorial belt: THIS WEEK IN TMI (feature + 2 supporting articles)
- Live Index Stories (headlines, interviews, artist features)
- Magazine articles at `/magazine` and `/magazine/article/[slug]`
- Issue system: Issue 01, Issue 02, etc.
- Crown rankings (who's #1 this week)
- Weekly recap content

**Routes:**
```
/magazine
/magazine/article/[slug]
/magazine/issue/[id]
/articles
/articles/[slug]
/rankings
/crown
/vote
```

---

### LAYER 2 — WORLD LOBBY

**This is the portal. Users enter the live ecosystem through here.**

After seeing the magazine identity, users see all live venues. The World Lobby
is the front gate — its job is to make users want to enter a venue.

**The 10 worlds:**
```
World Concert          → stadium arena, all genres, live concerts
Battle Arena           → 1v1 head-to-head, winner stays
Challenge Arena        → song vs song, winner stays, nonstop queue
Cypher Arena           → open mic rotation, all genres, community voting
Monday Night Stage     → weekly flagship show, theater format
Dirty Dozens           → game show format, host + contestants
Dance Off              → dance competition, judges + audience
World Dance Party      → NO SEATS — dance floor only (the only exception)
Fan Lives              → fan-hosted small rooms, anyone can go live
World Releases         → new music drops, listening sessions
```

**World Lobby rendering:**
- Scrolling tabloid underlay (full viewport width): WHO TOOK THE CROWN / BATTLE NIGHT / WHO'S GOT THE BARS / CHALLENGE THE CROWN
- Orbital wheel (10 artists, floating on top of underlay)
- World Concert as featured venue (full 3D arena preview)
- All 10 venue cards with mini arena previews
- Revenue hooks on every card: Tip · Ticket · Book · Subscribe · Sponsor
- Click any venue → ENTER + SIT → autoSeat=1

**Routes:**
```
/rooms/world-concert
/rooms/battle-arena      → /battles/live
/rooms/challenge-arena   → /challenge
/rooms/cypher-arena      → /rooms/cypher
/rooms/monday-stage
/rooms/dirty-dozens
/rooms/dance-off
/rooms/world-dance-party  ← ONLY room with DanceArena3D (no seats)
/live/rooms              → full billboard wall (all rooms)
/live/go                 → performer goes live
```

---

### LAYER 3 — ARENA SYSTEM

**Every live event happens in an arena. Same engine, different rules.**

**The rule:**
- ALL events use `AudienceScene` (3D canvas crowd)
- ALL events use `LobbyTheaterShell` or `ArenaEventShell`
- ALL events have: audience · stage · video walls · lobby wall · tips · chat
- ALL events have `seating` EXCEPT World Dance Party

**The exception (singular and permanent):**
```
World Dance Party
  → Uses DanceArena3D
  → No chairs, no rows, no seating mesh
  → Standing crowd + dance pods + DJ booth
  → usesDanceFloor: true in WorldRuntime
```

**Arena type mapping (venueIndex in AudienceScene):**
```
venueIndex 0 = Theater    (2,730 cap)  — Cypher, Monday Stage, Releases, Meetup
venueIndex 1 = Arena      (18,500 cap) — Concert, Battle, Challenge, Dirty Dozens, Dance Off
venueIndex 2 = Club       (420 cap)    — Fan Lives, VIP, small rooms
venueIndex 3 = Outdoor    (8,200 cap)  — Challenges, festivals
venueIndex 4 = Boardroom  (120 cap)    — Private sessions
```

**The 3 competition formats (Arena Triangle):**

```
BATTLE ARENA
  Format:     1v1 head-to-head
  Rule:       winner stays, next challenger enters
  Rounds:     best of 5
  Voting:     crowd + panel judges
  Venue:      Arena (18,500)

CYPHER ARENA
  Format:     open mic rotation
  Rule:       all artists rotate through the mic in sequence
  Voting:     community votes you up or out after each turn
  Venue:      Theater (2,730)

CHALLENGE ARENA
  Format:     song vs song
  Rule:       winner stays, endless queue, never stops
  Voting:     live audience votes in real time
  Venue:      Arena (18,500)
```

**Arena system components:**
```
AudienceScene.tsx         — 3D canvas crowd renderer (fan + performer views)
ArenaEventShell.tsx       — Universal wrapper: maps eventType → venueIndex
LobbyTheaterShell.tsx     — Room entry: seating mesh + audience + chat
DanceArena3D.tsx          — World Dance Party only (dance floor, no seats)
ArenaImmersivePanel.tsx   — Full arena: seats, chat, moderation, performer controls
TMIVideoRoom.tsx          — Video room component (Daily.co / WebRTC)
TMIDirectorHUD.tsx        — Stage operator overlay (curtain, channels, VU meter)
TMICurtainSystem.tsx      — CSS-animated curtain with countdown
```

**Every room route must:**
1. Import and render `AudienceScene` OR `DanceArena3D` (World Dance Party only)
2. Connect to seating via `LobbyTheaterShell` or `SeatingMeshEngine`
3. Show `ArenaImmersivePanel` for full room controls
4. Have revenue hooks: Tip · Ticket · Subscribe · Sponsor

---

### LAYER 4 — VENUE MARKETPLACE

**Performers buy venue skins. Same audience engine, different look.**

Skins are purely cosmetic — they change walls, lighting, seating color, and
stage design. The AudienceScene crowd engine runs in every venue unchanged.

**31 venue skins (from reference files):**

```
INDOOR THEATERS (4)
  Classic Theater     — red velvet, tiered rows
  Concert Hall        — wood paneling, curved balcony
  Lecture Hall        — blue/gray, academic
  Church Hall         — stained glass, choir loft

ARENAS (3)
  Stadium             — 360° wrap, giant screens
  Versus Split        — split-stage, 2-team format
  Amphitheater        — mountain backdrop, open sky

CLUBS (2)
  Luxury Nightclub    — VIP booths, low lighting
  Basement Club       — raw brick, intimate

GAME SHOW ROOMS (10)
  Box Show            — Deal-or-No-Deal style
  Trivia Arena        — Jeopardy-style podiums
  Quiz Podiums        — debate format
  Neon Studio         — colorful game show set
  Talk Show Lounge    — couch + host desk
  Judging Panel       — American Idol style
  Pixel Screen Studio — retro video game aesthetic
  LED Debate Room     — corporate-futuristic
  Prize Stage         — wheel + prizes
  Purple Studio       — purple concert studio

OUTDOOR (5)
  Festival Grounds    — main stage, crowd pit
  City Rooftop        — skyline backdrop
  Mountain Amphitheater — natural bowl
  Hilltop Stage       — elevated, open air
  Street Stage        — urban, guerrilla style

SPECIAL (7)
  Monday Night Stage  — flagship weekly show
  World Dance Party   — dance floor, no seats
  World Release Room  — listening room
  Dirty Dozens Room   — game show host format
  Dance Off Stage     — judges + scoring
  Battle Octagon      — ring-side seating
  Cypher Circle       — circular open mic
```

**10 color variants per skin** (purchase with PunPoints or cash)

**Purchase system:**
- Base price: PunPoints earned through participation
- Premium price: Stripe checkout → `/api/stripe/checkout`
- Unlock: stored in user account, persists permanently
- Free tier: Classic Theater always available

**Venue Store route:** `/store` (or `/venue-store`)

---

## HOME 1 STRUCTURE (LOCKED)

```
[SECTION 1] — Magazine Identity
  TMI Masthead + typewriter color titles
  VOTING LIVE badge + live vote counter + CROWN UPDATING
  Live activity ribbon
  Top 3 crown leader tiles (hexagon video tiles)
  MagazineEditorialBelt: THIS WEEK IN TMI
  Live Index Stories: headline + interview + latest article
  ChallengeYourSongCTA strip
  ENTER LIVE ARENA button + action CTA row

[SECTION 2] — Orbital + Tabloid Underlay
  FULL VIEWPORT WIDTH scrolling tabloid panels:
    WHO TOOK THE CROWN (yellow) / BATTLE NIGHT (pink)
    WHO'S GOT THE BARS (cyan) / CHALLENGE THE CROWN (black/gold)
  Orbital wheel floating on top (10 artists, 38s spin, counter-rotate labels)
  ◀ SCROLL / SCROLL ▶ direction control
  Click any node → expandable lobby modal (3D arena + revenue hooks + ENTER)

[SECTION 3] — World Lobby
  THE WORLD IS LIVE header + live stats (venues / watchers / worlds)
  Featured venue (World Concert, full AudienceScene preview, all revenue hooks)
  All 10 venue cards (mini previews, Tip/Ticket/Subscribe/Sponsor on each)
  World Dance Party card: dance floor preview (NO SEATING badge)
  Filter: ALL / LIVE NOW / BATTLES / CYPHERS / CONCERTS
  Artist discovery rail (top 5 ranked + Tip/View CTAs)
  Bottom nav: Battles / Cyphers / Dance Party / Magazine / Auction / Subscribe / Go Live
```

---

## LOBBY WALL SYSTEM

**Each major experience gets its own lobby wall.**

A lobby wall is the visual preview a fan sees before entering a venue.
It shows live video tiles, room capacity, current performers, and enter CTAs.

```
/live/rooms              — Full billboard wall (all rooms, scrollable)
/live/rooms?venue=battle — Battle lobby wall
/live/rooms?venue=cypher — Cypher lobby wall  
/live/rooms?venue=concert— Concert lobby wall
/live/rooms?venue=fan    — Fan Lives lobby wall
/live/rooms?venue=dance  — Dance Party lobby wall
```

**Every lobby wall includes:**
- 2×4 video panel grid (live tiles, simulated or real streams)
- Featured room panel (largest tile)
- Room filter tabs
- Viewer counts (updating every 3s)
- ENTER + SIT button (→ route?autoSeat=1)
- Revenue hooks per tile

---

## PROFILE SYSTEM

**Profiles are operational hubs, not static pages.**

```
Artist/Performer Profile
  Revenue dashboard (earnings, tips, subscribers)
  Bookings calendar
  Followers + following
  Track/beat catalog with play counts
  Live event history
  NFT collection
  CTAs: Go Live · New Release · Challenge

Fan Profile
  XP + PunPoints balance
  Tickets + RSVPs
  Purchase history
  Digital vault (owned NFTs, beats)
  Watch history
  Achievements + badges

Writer Profile
  Published articles
  Draft queue
  Follower count
  Revenue from article views
  Editorial assignments

Sponsor Profile
  Active campaigns
  Venue sponsorships
  Battle sponsorships
  Analytics (impressions, clicks, tips triggered)
  CTAs: New Campaign · View Analytics

Venue Profile
  Booking calendar
  Event history
  Ticket sales
  Venue skin (purchasable)
  Capacity + ratings
  CTAs: Host Event · Book Performer

Promoter Profile
  Managed artists (up to 20)
  Event calendar
  Revenue share dashboard
  CTAs: Book Show · Promote Event
```

---

## REVENUE SYSTEM

**Revenue hooks appear on every surface. Nothing is free to experience deeply.**

```
TIPS
  Fan → Performer via Stripe checkout (any room)
  Fan → Writer via article tip button
  Route: /api/stripe/checkout?product=TIP&artistSlug=...

TICKETS
  Per-event purchase
  Physical ticket printing (thermal 58mm/80mm)
  QR code + HMAC signing
  Route: /tickets + /api/tickets/purchase

SUBSCRIPTIONS
  Fan: $2.99/mo
  Artist/Performer: $9.99/mo
  VIP Diamond: $14.99/mo
  Venue: $29.99/mo
  Promoter: $19.99/mo
  Sponsor/Advertiser: $49.99/mo
  Route: /subscribe + /api/stripe/checkout

VENUE SKINS
  PunPoints or Stripe cash purchase
  31 skins × 10 color variants
  Route: /store

NFTs
  Mint: beats, artwork, collectibles
  Auction: live bidding on /auction/[id]
  Fixed price: /nft marketplace
  Route: /nft + /api/nft/*

AD REVENUE
  Multi-network rotation: AdSense / Media.net / Amazon / Carbon / Propeller
  House promos fill empty slots
  Per-venue placement configs in UnifiedAdSlot
  Free tier always shows ads

BATTLE SPONSORSHIPS
  Sponsors pay to brand a battle room
  Route: /sponsor/battles?venue=...

BEAT/INSTRUMENTAL SALES
  Beat Vault upload + sell
  BPM, key, genre, price per track
  Route: /beat-vault

AUCTION HOUSE
  Beats, NFTs, VIP seats, backstage passes, merch
  Real-time bid countdown
  Stripe on win
  Route: /auction + /auction/[id]
```

---

## PLATFORM LAWS (NEVER VIOLATE)

| # | Law |
|---|-----|
| 1 | Discovery-first room sorting always active |
| 2 | Marcel (berntmusic33@gmail.com) = Diamond tier forever |
| 2 | B.J. M Beat (bjmbeat@berntoutglobal.com) = Diamond tier forever |
| 3 | Big Ace approval required for ALL cash payouts |
| 4 | World Dance Party = DanceArena3D ONLY. No seats. No exceptions. |
| 5 | Performers ALWAYS use webcam — never avatar on stage |
| 6 | August 8 = Marcel's birthday — hardcoded in contest system |
| 7 | Prisma schema = append only. Never modify existing models. |
| 8 | 100% functional — no stubs, no href="#", no TODO comments in production |
| 9 | Do not redesign the TMI visual canon (cyan/fuchsia/gold/purple/dark-space) |
| 10 | Home 1 is always Magazine + World Lobby. Not one or the other. Both. |

---

## AUDIT CHECKLIST

When reviewing any route/component, check:

- [ ] Does it use the arena system (AudienceScene or DanceArena3D)?
- [ ] Does it connect to the seating engine?
- [ ] Does it show revenue hooks (Tip/Ticket/Subscribe at minimum)?
- [ ] Does it link to a real route (no href="#")?
- [ ] Does it match the TMI color palette?
- [ ] Does it fit one of the 4 layers?
- [ ] Does it appear in this document?
- [ ] Does `pnpm typecheck` pass after changes?

If any answer is NO — fix it before shipping.

---

## WHAT TO BUILD NEXT (PRIORITY ORDER)

```
P0 — Revenue active
  1. Stripe env vars set in Vercel (6 price IDs)
  2. Webhook registered at /api/stripe/webhook
  3. Test purchase (beat $2, ticket $5) end-to-end

P1 — Arena completeness
  1. /rooms/challenge-arena — full page (song queue, winner stays, live voting)
  2. /rooms/dance-off — DanceArena3D + judge panel
  3. /rooms/dirty-dozens — game show skin + host console

P2 — Lobby walls
  1. /live/rooms?venue=battle — battle lobby wall
  2. /live/rooms?venue=cypher — cypher lobby wall
  3. Fan Lives lobby (avatar grid + go-live button)

P3 — Profiles operational
  1. Artist profile: earnings + bookings + track catalog wired
  2. Fan profile: XP + vault + tickets wired
  3. Sponsor profile: campaign analytics wired

P4 — Venue marketplace
  1. /store — skin browser (31 skins, 10 colors each)
  2. Purchase flow (PunPoints or Stripe)
  3. Apply skin to room

P5 — Bot fleet
  1. 450 bots activated (Hyper + Regular + Sentinel)
  2. Bot room activity populating billboard
  3. Payout queue gated by Big Ace approval

P6 — Magazine content
  1. Issue 01 articles (5+ published)
  2. Bot auto-publishes Issue 02 on 1st of month
  3. Writer profiles wired to article revenue
```

---

*BerntoutGlobal LLC · The Musician's Index*
*WORLD_ARCHITECTURE.md — locked source of truth*
*Last updated: 2026-05-31*
