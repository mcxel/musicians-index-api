# TMI Dead Click Report
# Updated: 2026-06-14 | P4.2A Pass 2

## Definition: A "dead click" is any interactive element that either:
## (a) has no destination, (b) routes to a generic/wrong page, or
## (c) bypasses the expected Preview → Lobby → Room flow for live content.

---

## FIXED THIS SESSION (P4.2A Pass 1)

| # | Location | Element | Was | Now |
|---|---|---|---|---|
| 1 | `Home3LobbyWallGrid` | Join Room button | `router.push(...)` | LobbyEntryFlow |
| 2 | `GameNightHub` | JOIN LOBBY buttons (all) | `<Link href>` direct | LobbyEntryFlow |
| 3 | `Home3GameShowAudienceWall` | JOIN AUDIENCE cards | `<Link href="/live/rooms/...">` | LobbyEntryFlow |
| 4 | `LiveDiscoveryWall` | Billboard `onEnterLobby` | `router.push(...)` | LobbyEntryFlow |

## FIXED THIS SESSION (P4.2A Pass 2)

| # | Location | Element | Was | Now |
|---|---|---|---|---|
| 5 | `Home2LiveLobbyStrip` | Live lobby tile cards | `<Link>` direct to `/live/rooms/{id}` | LobbyEntryFlow |
| 6 | `Home3LiveWorldSurface` | Room entrance cards (roomStack + burstRooms + center panel) | `<a href>` direct | LobbyEntryFlow |
| 7 | `HomeLobbyVideoWall` | IndependentLobbyTile click (`handleJoin`) | `router.push(roomHref(slot))` | LobbyEntryFlow |
| 8 | `home/1-2/page.tsx` | LIVE performer cards | `<Link href="/performers/{id}">` for ALL cards | Conditional: isLive → LobbyEntryFlow, offline → profile |
| 9 | `LiveDiscoverySurface` | `handleEnter` → all tiles | `router.push(...)` after 300ms | LobbyEntryFlow after 300ms animation |
| 10 | `CypherBelt` | JOIN → button in MiniRoomCard | `<Link href="/live/rooms/{id}">` | LobbyEntryFlow via `onJoin` prop |
| 11 | `LiveShows` | JOIN → button per show card | `<Link href="/live/rooms/{id}">` | LobbyEntryFlow |

---

## REMAINING DEAD CLICKS

| # | File | Element | Problem | Priority |
|---|---|---|---|---|
| 12 | `Home3MainPreviewLobby.tsx` | "VIEW ALL ROOMS" | `<Link href="/live/rooms">` generic lobby, no ID | LOW — browse page, not specific room |
| 13 | `HomeLobbyVideoWall.tsx` | "JOIN LOBBY →" header + "SEE EVERYONE LIVE" CTA | `<Link href="/live/rooms">` — rooms listing page | LOW — intentional browse links |
| 14 | `BillboardLiveWall.tsx` (legacy) | JOIN LOBBY | `<Link href="/live/rooms">` — no room ID | LOW (legacy) |
| 15 | `articles/performer/[slug]` | WATCH LIVE btn | Direct href to room | MEDIUM — needs audit |

---

## STRUCTURAL GAPS (architecture level)

| Gap | Description |
|---|---|
| `Home 1` no live tiles | `Home1CoverPage` has CTAs to other pages but no live performer preview cards |
| `Home 4` no lobby entry | `Home4AdMagazine` is ad/magazine layout with no live room entry points |
| Performer profile page | WATCH LIVE button goes direct — needs LobbyEntryFlow |
| Venue profile page | Active venue events don't use LobbyEntryFlow |
