# TMI Room Entry Audit
# Updated: 2026-06-14 | P4.2A Pass 2 Complete

## The Blueprint Standard
Preview → Join Lobby → Access Check → Seat Assignment → AudienceScene → Active Participation

## Universal component: `components/room/UniversalLobbyEntry.tsx`
- `LobbyEntryFlow` — the 5-step overlay modal
- `UniversalLobbyCard` — discovery card with shape variants
- `UniversalLobbyWall` — grid renderer

---

## Room Entry Audit by Surface

### HOME 1 `/home/1`
- **Component**: `Home1CoverPage`
- **Live cards**: None — calls to action link to other home pages
- **Lobby flow**: N/A — no live room entry points on this surface

### HOME 1-2 `/home/1-2`
- **Component**: `Home12Page` with `BillboardPortraitCard` grid
- **Live cards**: Yes — cards where `item.isLive === true` (~67%)
- **Current behavior**: ✅ LIVE cards → `LobbyEntryFlow`, offline cards → performer profile
- **Lobby flow**: ✅ WIRED

### HOME 2 `/home/2`
- **Component**: `Home2LiveLobbyStrip`
- **Live cards**: Yes — 6 rotating lobby tiles
- **Current behavior**: ✅ Click tile → `LobbyEntryFlow`
- **Lobby flow**: ✅ WIRED

### HOME 3 `/home/3`
- **Components**: `Home3LobbyWallGrid` ✅, `Home3GameShowAudienceWall` ✅, `Home3LiveWorldSurface` ✅
- **Live cards**: Yes across all three
- **Lobby flow**: ✅ ALL THREE CERTIFIED

### HOME 4 `/home/4`
- **Component**: `Home4AdMagazine`
- **Live cards**: None — magazine/sponsor ad layout
- **Lobby flow**: N/A

### HOME 5 `/home/5`
- **Component**: `Home5BattleCypherSurface` (delegates to `CypherBelt`)
- **Live cards**: CypherBelt has live lobby wall with MiniRoomCard tiles
- **Lobby flow**: ✅ WIRED via `onJoin` prop in CypherBelt

### GAMES DISCOVERY `/games`
- **Component**: `GameNightHub`
- **Live cards**: Yes — 8 live games
- **Lobby flow**: ✅ Fully certified (JOIN LOBBY + Watch Mode)

### LIVE DISCOVERY SURFACE (standalone route)
- **Component**: `LiveDiscoverySurface`
- **Live cards**: Yes — hero + grid via `useLiveSync`
- **Lobby flow**: ✅ WIRED — 300ms animation then LobbyEntryFlow

### BILLBOARD LIVE WALL (embedded)
- **Component**: `LiveDiscoveryWall` → `TMIBillboardLiveWall`
- **Live cards**: Yes — real-time feed via `useLiveSync`
- **Lobby flow**: ✅ WIRED

### LOBBY VIDEO WALL (embedded in Home 3)
- **Component**: `HomeLobbyVideoWall` with `IndependentLobbyTile`
- **Live cards**: Yes — 12 rotating tiles
- **Lobby flow**: ✅ WIRED — click opens LobbyEntryFlow

### LIVE SHOWS (embedded)
- **Component**: `LiveShows`
- **Live cards**: Yes — 4 show cards
- **Lobby flow**: ✅ WIRED

### CYPHER BELT (embedded in Home 5)
- **Component**: `CypherBelt` with `MiniRoomCard`
- **Live cards**: Yes — 3 live lobby cards
- **Lobby flow**: ✅ WIRED

### PERFORMER PROFILE `/performers/[slug]`
- **Live entry point**: WATCH LIVE button → `/live/rooms/{slug}-live` direct
- **Lobby flow**: ❌ Not wired — MEDIUM priority

### VENUE PROFILE `/venues/[slug]`
- **Live cards**: Active events
- **Lobby flow**: ❌ Not wired

### PERFORMER ARTICLES `/articles/performer/[slug]`
- **Live entry**: WATCH LIVE button → direct room href
- **Lobby flow**: ❌ Not wired — MEDIUM priority

---

## Registry Status (P4.1)

| Registry | File | Backing Store | API Route |
|---|---|---|---|
| `SponsorSlotRegistry` | `lib/registries/SponsorSlotRegistry.ts` | ✅ prisma.feedItem | via `api/sponsor/attach` |
| `PerformerSponsorRegistry` | `lib/registries/PerformerSponsorRegistry.ts` | ✅ prisma.feedItem | — (wire when needed) |
| `VenueBookingRegistry` | `lib/registries/VenueBookingRegistry.ts` | ✅ prisma.feedItem | ✅ `api/booking/create` |
| `BookingOpportunityRegistry` | `lib/registries/BookingOpportunityRegistry.ts` | ✅ prisma.feedItem | — (wire when needed) |

---

## Memory Wall Persistence Status

| Entity | Data Source | Status |
|---|---|---|
| Fan | `prisma.feedItem` WHERE `type=MEMORY_WALL_ITEM` | ✅ Prisma-backed |
| Performer | `prisma.feedItem` WHERE `type=MEMORY_WALL_ITEM` | ✅ Fixed this session |
| Artist | `prisma.feedItem` WHERE `type=MEMORY_WALL_ITEM` | ✅ Fixed this session |
| Venue | `GET /api/memory/wall` via useEffect + `key` remount | ✅ Fixed this session |

---

## Remaining Actions (Post P4.2A)

1. Wire `PerformerSponsorRegistry` to `/api/sponsor/performer` route
2. Wire `BookingOpportunityRegistry` to `/api/booking/opportunities` route
3. Wire WATCH LIVE button on `/performers/[slug]` to LobbyEntryFlow
4. Wire WATCH LIVE button on `/articles/performer/[slug]` to LobbyEntryFlow
5. Wire active venue events on `/venues/[slug]` to LobbyEntryFlow
6. Revenue Path Audit — verify all monetization paths end-to-end
