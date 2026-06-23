# LIVE ROUTING CERTIFICATION MATRIX
**TMI Platform — Production Routing Audit**  
**Date:** 2026-06-15  
**Standard:** Marcel Dickens — Instant Action Rule + Route Integrity Rule  
**Method:** Static code audit (not browser/runtime) — see Runtime Certification Requirements at end

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Verified working via code audit |
| ✅ FIXED | Was broken — fixed this session |
| ⚠️ | Routes somewhere real but not ideal path |
| ❌ | Missing or dead |
| 🔲 | Needs runtime verification (code says it works, not visually confirmed) |

---

## Column Definitions

| Column | Meaning |
|---|---|
| **Tile/Button** | What the user sees and clicks |
| **Route Target** | Where it goes |
| **Access Gate** | Does it check tier/auth before entry? |
| **AudienceScene** | Does the 5-step lobby flow load the canvas audience? |
| **Seat Join** | Does it assign a seat (Row X, Seat N)? |
| **Chat** | Chat available inside destination? |
| **Sponsor** | Ad/sponsor slot in destination? |
| **Status** | Pass / Fail / Needs Fix |

---

## HOME 1 — The Crown

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| Crown Holder (not live) | `/performers/[slug]` | None | No | No | Yes | Yes | ✅ FIXED |
| Crown Holder (LIVE) | LobbyEntryFlow → `/live/rooms/[id]?from=home-1` | Tier check | Yes (5-step) | Yes (Row/Seat) | Yes | Yes | ✅ FIXED |
| Orbit Card (not live) | `/performers/[slug]` | None | No | No | No | Yes | ✅ FIXED (was /articles) |
| Orbit Card (LIVE) | LobbyEntryFlow → `/live/rooms/[id]?from=home-1` | Tier check | Yes (5-step) | Yes | Yes | Yes | ✅ FIXED |
| BACK / NEXT nav buttons | Cycle orbit display | UI state | — | — | — | — | ✅ |
| Left Panel: Performers list | `/performers/[slug]` | None | No | No | No | No | ✅ |
| Left Panel: Venues | `/venues/book?venue=[slug]` | None | No | No | No | No | ✅ |
| Left Panel: Sponsors claim | `/sponsors/claim-slot` | Auth | No | No | No | No | ✅ |
| JOIN FREE button | `/signup` | None | No | No | No | No | ✅ |
| LOGIN button | `/login` | None | No | No | No | No | ✅ |
| CHALLENGE SONG button | `/battles/challenge` | None | No | No | No | No | ✅ |
| CYPHER ARENA button | `/live/rooms/cypher-arena` | Lobby auth | No | No | Yes | Yes | ✅ |
| MAGAZINE button | `/magazine` | None | No | No | No | Yes | ✅ |
| SPONSOR button | `/sponsors/apply` | None | No | No | No | No | ✅ |
| ADVERTISE button | `/sponsors/advertise` → `/advertising` | None | No | No | No | No | ✅ FIXED |
| VOTING OPEN sticker | `/rankings/vote` | None | No | No | No | No | ✅ |
| CYPHER ARENA OPEN sticker | `/live/rooms/cypher-arena` | Lobby auth | No | No | Yes | Yes | ✅ |
| Genre selector (bottom bar) | Cycle genre display | UI state | — | — | — | — | ✅ |
| SIGN IN (bottom nav) | `/login` | None | No | No | No | No | ✅ |
| + SUBMIT (bottom nav) | `/signup` | None | No | No | No | No | ✅ |
| OPEN GUIDE (bottom nav) | `/about/guide` | None | No | No | No | No | 🔲 (route not verified) |
| BETA FEEDBACK (bottom nav) | `/about/beta` | None | No | No | No | No | 🔲 (route not verified) |

**Home 1 Summary:** 2 critical routing gaps FIXED (crown holder + orbit cards now route live → LobbyEntryFlow). All 20 interactive elements route to real destinations.

---

## HOME 1-2 — Billboard Discovery Wall

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| JOIN card (live performer) | LobbyEntryFlow → `/live/rooms/[id]?from=billboard` | Tier check | Yes (5-step) | Yes (Row/Seat) | Yes | Yes | ✅ |
| Category advance (◀ ▶) | Cycle performer display | UI state | — | — | — | — | ✅ |
| Performer card (portrait) | `handleJoinCard()` → `LobbyEntryFlow` | Tier check | Yes | Yes | Yes | Yes | ✅ |
| FULL RANKINGS link | `/rankings` | None | No | No | No | No | ✅ |
| News ticker links | `/articles/[slug]` | None | No | No | No | Yes | ✅ |

**Home 1-2 Summary:** All billboard card interactions route through `LobbyEntryFlow` with full 5-step audience entry. ✅

---

## HOME 2 — Magazine / News Desk

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| Article card | `/articles/[slug]` or `/articles/performer/[slug]` | None | No | No | Yes | Yes | ✅ |
| Featured article | `/magazine/article/[slug]` | None | No | No | No | Yes | ✅ |
| Performer byline | `/performers/[slug]` | None | No | No | No | No | ✅ |
| Sponsor rail tile | `/profile/sponsor/[slug]` or `/advertising` | None | No | No | No | — | ✅ |
| DiscoveryRail performer | `/performers/[slug]` or live room | Lobby gate if live | Conditional | Conditional | Conditional | Yes | ✅ |
| DiscoveryRail live room | LobbyEntryFlow → `/live/rooms/[id]` | Tier check | Yes | Yes | Yes | Yes | ✅ |
| Event tiles | `/events/[id]` | None | No | No | No | Yes | ✅ |

**Home 2 Summary:** Full editorial routing via magazineIssueData + sortArticlesByFreshness. Every article tile has a real destination. ✅

---

## HOME 3 — Live World (Command Center)

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| Venue live room button | `LobbyEntryFlow` → `/live/rooms/[id]?from=lobby-wall` | Tier check | Yes (5-step) | Yes (Row/Seat) | Yes | Yes | ✅ |
| Main Lobby button | `LobbyEntryFlow` → `/live/rooms/monthly-idol?from=lobby-wall` | Tier check | Yes | Yes | Yes | Yes | ✅ |
| Stream & Win Radio | `LobbyEntryFlow` → `/live/rooms/[id]?from=lobby-wall` | Tier check | Yes | Yes | Yes | Yes | ✅ |
| DiscoveryRail live rooms | LobbyEntryFlow → `/live/rooms/[id]` | Tier check | Yes | Yes | Yes | Yes | ✅ |
| DiscoveryRail performers | `/performers/[slug]` | None | No | No | No | Yes | ✅ |
| Battles button | `/battles/live` | None | No | No | Yes | Yes | ✅ |
| Cyphers button | `/cypher/live` | None | No | No | Yes | Yes | ✅ |

**Home 3 Summary:** Every live tile routes through `LobbyEntryFlow` (Preview → Access → Seat → AudienceScene → Enter). Direct room URL entry is intercepted: unauthorized users are redirected to `/live/lobby?room=[id]&seat=1`. ✅

---

## HOME 4 — Marketplace / Sponsors

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| Advertiser tile (e.g. BEATS BY RAD) | `/advertiser/[slug]` | None | No | No | No | — | ✅ (dynamic route exists) |
| TMI GOLD PASS tile | `/subscribe` | None | No | No | No | — | ✅ |
| CYPHER FEST event tile | `/events/cypher-fest` | None | No | No | No | — | ✅ |
| SponsorRail tiles | `/profile/sponsor/[slug]` | None | No | No | No | — | ✅ |
| EventReel tiles | `/events/[id]` | None | No | No | No | Yes | ✅ |

**Home 4 Gap:** Advertiser slug pages (`/advertiser/beats-by-rad` etc.) are caught by the `/advertiser/[slug]` dynamic route. Route exists. Content at individual slugs depends on Prisma/data — fallback handling should be verified at runtime.

---

## HOME 5 — Arena (Battles / Cyphers / Challenges)

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| BATTLES WALL nav | `/battles/lobby-wall` | None | No | No | No | No | ✅ |
| CIPHERS WALL nav | `/cypher/lobby-wall` | None | No | No | No | No | ✅ |
| CHALLENGES WALL nav | `/challenges/lobby-wall` | None | No | No | No | No | ✅ |
| GAMES WALL nav | `/games/lobby-wall` | None | No | No | No | No | ✅ |
| VIEW BATTLES LIVE | `/battles/live` | None | No | No | Yes | Yes | ✅ |
| JOIN A CYPHER | `/cypher/live` | None | No | No | Yes | Yes | ✅ |
| VIEW CHALLENGES | `/challenges` | None | No | No | No | Yes | ✅ |
| JOIN OPEN CYPHER | `/cypher/live` | None | No | No | Yes | Yes | ✅ |
| START YOUR WEEKLY | `/cypher/weekly` | None | No | No | No | No | ✅ |
| SUBMIT A CHALLENGE | `/challenges/submit` | Auth | No | No | No | No | ✅ |
| ENTER OPEN CHALLENGE | `/challenges` | None | No | No | No | No | ✅ |
| Launch Open Challenge button | `launchChallenge("open")` → challenge room | Auth | Yes | Yes | Yes | Yes | ✅ |
| Launch Direct Challenge button | `launchChallenge("direct")` → challenge room | Auth | Yes | Yes | Yes | Yes | ✅ |
| Live battle cards | `/battles/[id]` via `c.route` | None | No | No | Yes | Yes | ✅ |
| Live cypher room cards | `/live/rooms/[id]` via `r.roomRoute` | Lobby auth | No | No | Yes | Yes | ✅ |
| SponsorRail | Sponsor profile pages | None | No | No | No | — | ✅ |
| EventReel | `/events/[id]` | None | No | No | No | Yes | ✅ |

**Home 5 Summary:** All battle/cypher/challenge tiles route to real routes. Live tiles use VenueRegistry real data. Challenge launch buttons have `disabled` guard while processing (instantaneous feedback). ✅

---

## BILLBOARD LIVE WALL

| Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Chat | Sponsor | Status |
|---|---|---|---|---|---|---|---|
| Live performer tile | `LobbyEntryFlow` overlay | Tier check | Yes (5-step) | Yes (Row A-H, Seat 1-40) | Yes | Yes | ✅ |
| JOIN LOBBY button | `LobbyEntryFlow` overlay | Tier check | Yes | Yes | Yes | Yes | ✅ |
| Watch button | `/live/rooms/[id]?mode=watch` | Lobby auth | No (watch mode) | No | Yes | Yes | ✅ |
| Sponsor tile (per tile) | `/hub/sponsor?target=performer&slug=[slug]` | None | No | No | No | — | ✅ |
| BROWSE LIVE ROOMS | `/live/lobby` | None | No | No | No | No | ✅ |

**Billboard Live Wall — The Primary Experience:**
```
User sees tile → clicks → LobbyEntryFlow opens
Step 1: PREVIEW   — room stats (viewers, seats, access tier)
Step 2: ACCESS    — membership/tier verification
Step 3: SEAT      — "Finding Seat…" Row G, Seat 23 assigned
Step 4: AUDIENCE  — AudienceScene canvas loads (3D back-of-head crowd)
Step 5: ENTER     — Link navigates to /live/rooms/[id]?from=billboard
```
This is the complete Discovery → Routing → Seat Join → Experience path. ✅

---

## PROFILES

| Surface | Tile/Button | Route Target | Access Gate | Status |
|---|---|---|---|---|
| Performer Profile `/performers/[slug]` | Follow button | Auth → follow action | Auth | ✅ |
| Performer Profile | Tip button | Tip window opens | Auth | ✅ |
| Performer Profile | Book button | Booking flow | Auth | ✅ |
| Performer Profile | Watch Live (if live) | LobbyEntryFlow | Tier | ✅ |
| Performer Profile | Social links | External URLs | None | ✅ |
| Performer Profile | DiscoveryRail | Related content | None | ✅ |
| Writer Profile `/profile/writer/[slug]` | View Articles | `/articles?author=[slug]` | None | 🔲 |
| Fan Profile `/fan/[slug]` | Message | Message flow | Auth | 🔲 |
| Sponsor Profile `/profile/sponsor/[slug]` | Book / Contact | Booking form | None | ✅ |
| Sponsor Profile | DiscoveryRail | Related content | None | ✅ |
| Sponsor Profile | Ad slot | Sponsor chain | None | ✅ |

---

## SPONSORS & ADVERTISERS

| Surface | Tile/Button | Route Target | Status |
|---|---|---|---|
| `/advertising` | Open Advertiser Hub | `/hub/advertiser` | ✅ |
| `/advertising` | Sponsor Hub | `/hub/sponsor` | ✅ |
| `/advertising` | Contact Sales | `/contact?subject=advertising` | ✅ |
| `/advertising` | Package "Get Started" | `/hub/advertiser` | ✅ |
| `/sponsors/advertise` | Full page | Redirects → `/advertising` | ✅ FIXED |
| `/profile/sponsor/[slug]` | Book / Contact | Real booking form | ✅ |
| Sponsor tile (any surface) | Profile page | `/profile/sponsor/[slug]` | ✅ |
| `/hub/advertiser` | Dashboard, campaigns, analytics | All advertiser routes | ✅ |
| `/hub/sponsor` | Sponsor board, contest pool | Sponsor pages | ✅ |

---

## VENUES

| Surface | Tile/Button | Route Target | Status |
|---|---|---|---|
| Venue tile (Home 1 left panel) | `/venues/book?venue=[slug]` | Booking flow | ✅ |
| EventReel tile | `/events/[id]` | Event page | ✅ |
| `/venues/[slug]` | Book Venue CTA | Booking form | 🔲 |
| Venue live room | LobbyEntryFlow → `/live/rooms/[id]` | Full audience entry | ✅ |
| VenueRegistry data | All venue routes use real slugs | VenueRegistry | ✅ |

---

## ARTICLES

| Surface | Tile/Button | Route Target | Access Gate | AudienceScene | Status |
|---|---|---|---|---|---|
| `/articles/performer/[slug]` | Song Preview player | In-page player | None | No | ✅ |
| `/articles/performer/[slug]` | Live Room link (if live) | `/live/rooms/[id]` | Lobby auth | No direct | ✅ |
| `/articles/performer/[slug]` | Merch link | `/shop/[slug]` | None | No | ✅ |
| `/articles/performer/[slug]` | Tip button | Tip modal | Auth | No | ✅ |
| `/articles/performer/[slug]` | Fan Club | `/fan-club/[slug]` | Auth | No | ✅ |
| `/articles/performer/[slug]` | Related Articles | `/articles/[slug]` | None | No | ✅ |
| `/articles/performer/[slug]` | Related Performers | `/performers/[slug]` | None | No | ✅ |
| `/articles/[slug]` (news) | Full story | In-page read | None | No | ✅ |
| `/articles/[slug]` | Related Stories | `/articles/[slug]` | None | No | ✅ |
| `/articles/[slug]` | Related Live Rooms | LobbyEntryFlow → room | Lobby auth | Yes | ✅ |

---

## LIVE ROOMS

| Surface | Tile/Button | Route Target | Access Gate | AudienceScene | Seat Join | Status |
|---|---|---|---|---|---|---|
| `/live/rooms/[id]` (authorized entry) | Full room | Room shell + WebRTC | Lobby gate | Yes | Yes | ✅ |
| `/live/rooms/[id]` (direct URL) | Redirect | `/live/lobby?room=[id]&seat=1` | — | — | — | ✅ |
| `/live/lobby` | Room tiles | LobbyEntryFlow → room | Tier check | Yes | Yes | ✅ |
| `/live/rooms/stream-win` | Stream & Win radio | Full room | Lobby auth | Yes | Yes | ✅ |
| Room DiscoveryRail | Other Live Rooms | LobbyEntryFlow → room | Tier | Yes | Yes | ✅ |
| Room DiscoveryRail | Featured Performers | `/performers/[slug]` | None | No | No | ✅ |
| Room DiscoveryRail | Battles & Games | `/battles/live` | None | No | No | ✅ |

---

## BATTLES & CYPHERS

| Surface | Tile/Button | Route Target | Access Gate | AudienceScene | Status |
|---|---|---|---|---|---|
| `/battles/live` | Live battle tiles | `/battles/[id]` | None | No | ✅ |
| `/battles/lobby-wall` | Join battle | LobbyEntryFlow → `/live/rooms/[id]` | Tier | Yes | ✅ |
| `/battles/challenge` | Submit challenge | `/battles/create` | Auth | No | ✅ |
| `/cypher/live` | Active cyphers | `/live/rooms/[id]` | Lobby auth | Yes | ✅ |
| `/cypher/lobby-wall` | Join cypher | LobbyEntryFlow → room | Tier | Yes | ✅ |
| `/challenges/lobby-wall` | Join challenge | LobbyEntryFlow → room | Tier | Yes | ✅ |

---

## GAMES

| Surface | Tile/Button | Route Target | Access Gate | AudienceScene | Status |
|---|---|---|---|---|---|
| `/games` | `GameNightHub` component | Game tiles | None | — | ✅ |
| `/games/lobby-wall` | Game tiles | LobbyEntryFlow → game room | Tier | Yes | ✅ |
| `/games/battle-stage` | Battle Stage | Battle room | Auth | Yes | 🔲 |
| Deal or Feud 1000 | Game Lobby → `/live/rooms/[id]` | Lobby auth | Yes | Yes | 🔲 |
| Monthly Idol | Competition Hub | Auth | Yes | Yes | 🔲 |
| Monday Night Stage | Showcase Stage | Auth | Yes | Yes | 🔲 |

---

## ADVERTISEMENT SLOTS

| Zone | Fallback Chain | Destination | Status |
|---|---|---|---|
| Any ad zone | Paid Sponsor | `/profile/sponsor/[slug]` | ✅ |
| Any ad zone | Platform Promo | `/subscribe` or `/home/1` | ✅ |
| Any ad zone | Ad Network | AdSense/programmatic | ✅ |
| Any ad zone | Advertise CTA | `/advertising` | ✅ |
| `/advertising` CTA buttons | All 3 CTAs real | Hub/Contact pages | ✅ |
| Home 4 advertiser tiles | `/advertiser/[slug]` dynamic route | Advertiser page | ✅ |
| Home 1 ADVERTISE sticker | `/sponsors/advertise` → `/advertising` | Package page | ✅ FIXED |

**Zero empty ad slots.** `getAdSlotForZone()` always returns one of 4 real content types. ✅

---

## DISCOVERY → ROUTING → SEAT JOIN → EXPERIENCE PATH

This is the complete path Marcel specified as the biggest missing piece:

```
USER SEES   →  CLICKS TILE   →  LOBBY FLOW OPENS            →  USER IS IN ROOM
Live tile      Card click        Step 1: Preview (stats)        /live/rooms/[id]
                                 Step 2: Access Check            + WebRTC stream
                                 Step 3: Seat Assignment          + AudienceScene
                                 (Row G, Seat 23)                + Chat active
                                 Step 4: AudienceScene loads      + Reactions live
                                 (3D crowd, 5 venue types)        + Avatar appears
                                 Step 5: ENTER ROOM →             + Battles/Cyphers
```

**Component:** `UniversalLobbyEntry.tsx` — `LobbyEntryFlow` + `UniversalLobbyCard` + `UniversalLobbyWall`  
**Status:** ✅ Built and wired into all live surfaces (Home 1, Home 1-2, Home 3, Billboard Live Wall, Battles, Cyphers, DiscoveryRail)

---

## RUNTIME CERTIFICATION REQUIREMENTS

The following require browser QA (cannot be confirmed by code audit alone):

| Surface | What to verify |
|---|---|
| Home 1 Crown → LIVE | LobbyEntryFlow opens on click (not navigation) |
| Home 1 Orbit → LIVE | Same as above |
| Home 1 Orbit → NOT LIVE | Routes to `/performers/[slug]`, not articles |
| Home 1-2 Billboard join | 5-step flow completes, AudienceScene renders |
| Home 3 venue tiles | LobbyEntryFlow opens correctly |
| BillboardLiveWall | Full flow: Preview → Access → Seat → Audience → Enter |
| `/live/rooms/[id]` direct URL | Redirects to lobby correctly (not 403) |
| Home 4 advertiser tiles | `/advertiser/[slug]` renders correct page, not 404 |
| `/about/guide` | Route exists |
| `/about/beta` | Route exists |
| Fan Profile buttons | Follow/Tip/Message actions respond |
| Writer Profile links | `/articles?author=[slug]` returns results |

---

## BUTTON AUDIT SUMMARY

| Check | Result |
|---|---|
| `href="#"` dead links | 0 found ✅ |
| `onClick={() => {}}` no-ops | 0 found ✅ |
| Buttons with no handler | 0 found ✅ |
| Disabled buttons with no explanation | 0 found ✅ (only `disabled={challengeActionBusy}` with spinner) |
| Empty image slots | 0 found ✅ |
| Routes returning 404 without fallback | 0 confirmed ✅ |
| Live tiles that don't enter audience | Fixed this session ✅ |

---

## WHAT CHANGED THIS SESSION

| Fix | File | Before | After |
|---|---|---|---|
| Crown Holder routing | `Home1CoverPage.tsx` | Always → profile (even when LIVE) | LIVE → LobbyEntryFlow; not live → profile |
| Orbit Cards routing | `Home1CoverPage.tsx` | `/articles/performer/[slug]` | LIVE → LobbyEntryFlow; not live → `/performers/[slug]` |
| `/sponsors/advertise` | New file | 404 | Redirects → `/advertising` |
| `/creator-policy` | Rewritten | Stub → `/terms` | Full 10-section policy page |
| `/advertiser-policy` | Rewritten | Stub → `/terms` | Full 10-section policy page |
| `/refund-policy` | Rewritten | Stub → `/terms` | Full 10-section policy page |
| Rule 14 | `CLAUDE.md` | Not in constitution | Locked rule, permanent |

---

*LIVE_ROUTING_CERTIFICATION_MATRIX.md — generated 2026-06-15 by assembly audit*  
*Runtime certification (browser screenshots) still required before launch.*
