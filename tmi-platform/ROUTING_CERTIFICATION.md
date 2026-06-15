# TMI Platform — Routing Certification
# Sprint B Complete — 2026-06-15

Audit of all clickable surfaces across the 6 homepage channels.
Standard: Every card, image, avatar, headline, sponsor tile, and button must resolve to a real destination.
No `#`, empty href, dead button, or placeholder route permitted.

---

## Home 1 — The Cover (Home1CoverPage.tsx)

| Element | Target | Status |
|---------|--------|--------|
| Crown holder center | `profileRoute` from `PerformerRegistry.getCrownHolder()` | ✅ WIRED |
| 10 orbital performer cards | `/articles/performer/[slug]` | ✅ |
| Free Promotion performer rows | `/performers/[slug]` | ✅ FIXED |
| Claim Free Slot | `/sponsors/claim-slot` | ✅ FIXED |
| Sponsor Spotlight "Beats By TMX" | `<div>` (display only — campaign % bar) | ✅ display |
| BECOME A SPONSOR button | `/sponsors/apply` | ✅ FIXED |
| Venue Book buttons (SAT/SUN/FRI) | `/venues/book?venue=[slug]` | ✅ FIXED |
| Live Rankings SEE ALL RANKS | `/rankings` | ✅ FIXED |
| Live Now — Cypher Arena | `/live/rooms/cypher-arena` | ✅ FIXED |
| Live Now — Battle Stage | `/live/rooms/battle-stage` | ✅ FIXED |
| Live Now — Stream & Win | `/live/lobby?filter=stream-win` | ✅ FIXED |
| Advertise Here + GET STARTED | `/sponsors/advertise` | ✅ FIXED |
| CYPHER ARENA OPEN sticker | `/live/rooms/cypher-arena` | ✅ FIXED |
| VOTING OPEN sticker | `/rankings/vote` | ✅ FIXED |
| Genre navigation dots | `setGenreIdx(i)` — in-page state, correct | ✅ |
| CTA — JOIN AS ARTIST | `/signup?role=artist` | ✅ |
| CTA — BATTLE TONIGHT | `/battles` | ✅ |
| CTA — READ THE INDEX | `/magazine` | ✅ |
| CTA — FAN MODE | `/signup?role=fan` | ✅ |
| Top 10 grid cards | `/articles/performer/[slug]` | ✅ |
| Weekly Cyphers bottom bar | `/articles?category=cypher` | ✅ |
| VOTING LIVE! banner | display only (vote count ticker) | ✅ display |

**Dead clicks found and fixed this session: 11**
**Remaining dead clicks: 0**

---

## Home 1-2 — Billboard World (app/home/1-2/page.tsx)

| Element | Target | Status |
|---------|--------|--------|
| Nav channel links (1/1-2/2/3/4/5) | `/home/[n]` | ✅ |
| Wall filter tabs (6 tabs) | `setWallFilter()` — in-page state | ✅ |
| Billboard wall tiles (LIVE) | `handleJoinCard()` → `LobbyEntryFlow` → `/live/rooms/[id]` | ✅ |
| Portrait cards (isLive=true) | `handleJoinCard()` → `LobbyEntryFlow` | ✅ |
| Portrait cards (isLive=false) | `/performers/[id]` via `Link` | ✅ |
| PREV/NEXT genre arrows | `advanceCat()` — in-page state | ✅ |
| Category pills | `setCatIndex(i)` — in-page state | ✅ |

**Data source: `PERFORMER_REGISTRY` from `lib/performers/PerformerRegistry.ts`**
**Dead clicks: 0**

---

## Home 2 — Magazine (Home2NewsDeskSurface.tsx)

| Element | Target | Status |
|---------|--------|--------|
| Section tab — ARTICLES | `/articles` | ✅ |
| Section tab — EDITORIAL | `#editorial` (in-page anchor) | ✅ |
| Section tab — DISCOVERY | `#discovery` (in-page anchor) | ✅ |
| Section tab — LIVE ROOMS | `/live/lobby` | ✅ |
| Section tab — GAMES | `/games` | ✅ |
| Section tab — MARKETPLACE | `/sponsors` | ✅ |
| Feature story card | `/articles/news` | ✅ |
| Interview card | `/articles/interview/weekly-feature` | ✅ |
| Studio Recaps card | `/articles/recap/studio-week` | ✅ |
| Genre Cluster card | `/genres/hip-hop` | ✅ |
| Sponsor Spotlight card | `/sponsors` | ✅ |

**Dead clicks: 0**

---

## Home 3 — Live World (Home3LiveWorldSurface.tsx)

| Element | Target | Status |
|---------|--------|--------|
| Global live tab | `/live/lobby` | ✅ |
| Hip-Hop takeover tab | `/live/lobby?genre=hip-hop` | ✅ |
| Games network tab | `/games` | ✅ |
| Concert mode tab | `/live/concert` | ✅ |
| Monthly Idol tab | `/events/monthly-idol` | ✅ |
| Active room cards (3) | `openRoom()` → `LobbyEntryFlow` | ✅ |
| Main center "Enter Live Venue World" | `openRoom()` → `LobbyEntryFlow` | ✅ |
| VIP Lounge burst room | `/live/rooms/vip-lounge` | ✅ FIXED |
| Battle Floor burst room | `/live/rooms/battle-floor` | ✅ FIXED |
| Event Timeline burst room | `/live/lobby` | ✅ |

**Dead clicks found and fixed this session: 2**
**Remaining dead clicks: 0**

---

## Home 4 — Marketplace (Home4AdMagazine.tsx)

| Element | Target | Status |
|---------|--------|--------|
| ADVERTISE WITH US → | `/advertiser` | ✅ |
| 18 sponsor sticker ads | `/advertiser/[slug]` or `/events/[slug]` or `/subscribe` | ✅ |
| GET FEATURED | `/sponsors` | ✅ |

**Dead clicks: 0**

---

## Home 5 — Arena (Home5BattleCypherSurface.tsx)

| Element | Target | Status |
|---------|--------|--------|
| Championship category cards | `BroadcastDeckWall` + engine routing | ✅ |
| Challenge targets | `battleChallengeRequestEngine` | ✅ |
| Open rooms grid | `Home5OpenRoomsGrid` with live routing | ✅ |

**Dead clicks: 0**

---

## Crown Holder Unification

| System | Before | After |
|--------|--------|-------|
| Home 1 crown center | `performers[0]` from local `GENRE_DATA` | `getCrownHolder()` from `PerformerRegistry` |
| Crown image | `pravatar.cc/150?u=${slug}` (random) | `profileImageUrl` from registry (real photo) |
| Crown link | `/articles/performer/${slug}` | `profileRoute` from registry |

The #1 performer (by XP) now automatically populates the Home 1 crown position.
When real performer accounts exist, `getCrownHolder()` returns whoever has the highest XP.

---

## Certification Summary

| Page | Dead Clicks Before | Dead Clicks After | Status |
|------|-------------------|-------------------|--------|
| Home 1 | 11 | 0 | ✅ CERTIFIED |
| Home 1-2 | 0 | 0 | ✅ CERTIFIED |
| Home 2 | 0 | 0 | ✅ CERTIFIED |
| Home 3 | 2 | 0 | ✅ CERTIFIED |
| Home 4 | 0 | 0 | ✅ CERTIFIED |
| Home 5 | 0 | 0 | ✅ CERTIFIED |

**Total dead clicks eliminated: 13**
**Platform routing status: CERTIFIED — all homepage surfaces resolve to real destinations**

---

## Next: Revenue Certification

Flows to test end-to-end before launch:
- Memberships → `/subscribe` → Stripe → webhook → DB → admin dashboard
- Tips → `/live/rooms/[id]` tip flow → Stripe → webhook → performer dashboard
- Tickets → `/tickets/[venue]` → Stripe checkout → receipt → admin
- Bookings → `/venues/book` → booking engine → confirmation → DB
- Sponsor packages → `/sponsors/apply` → checkout → fulfillment → analytics
- Beat sales → `/beats/[slug]` → Stripe → download access granted
- Ads → `/advertiser` → checkout → ad slot activated → impression tracking
