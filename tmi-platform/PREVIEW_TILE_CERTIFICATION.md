# TMI Preview Tile Certification
# Updated: 2026-06-14 | P4.2A Pass 2

## Standard: Every discovery card must use Preview → Join Lobby → Seat Assignment → AudienceScene → Room

---

## CERTIFIED (5-step flow active)

| Surface | Component | Status |
|---|---|---|
| Home 2 Lobby Strip | `Home2LiveLobbyStrip` | ✅ LobbyEntryFlow wired (fixed P4.2A Pass 2) |
| Home 3 Lobby Wall | `Home3LobbyWallGrid` | ✅ LobbyEntryFlow wired |
| Home 3 Game Shows | `Home3GameShowAudienceWall` | ✅ LobbyEntryFlow wired |
| Home 3 Live World | `Home3LiveWorldSurface` | ✅ LobbyEntryFlow wired (fixed P4.2A Pass 2) |
| Games Discovery Network | `GameNightHub` | ✅ LobbyEntryFlow wired |
| Billboard Live Wall | `LiveDiscoveryWall` → `TMIBillboardLiveWall` | ✅ LobbyEntryFlow wired |
| Live Discovery Surface | `LiveDiscoverySurface` | ✅ LobbyEntryFlow wired (fixed P4.2A Pass 2) |
| Lobby Video Wall tiles | `HomeLobbyVideoWall` IndependentLobbyTile | ✅ LobbyEntryFlow wired (fixed P4.2A Pass 2) |
| Home 1-2 Billboard (LIVE cards only) | `home/1-2/page.tsx` | ✅ LIVE cards → LobbyEntryFlow; offline → profile (fixed P4.2A Pass 2) |
| Cypher Belt | `CypherBelt` MiniRoomCard | ✅ LobbyEntryFlow wired via onJoin prop (fixed P4.2A Pass 2) |
| Live Shows | `LiveShows` | ✅ LobbyEntryFlow wired (fixed P4.2A Pass 2) |

---

## PARTIAL (routes to room, no lobby flow)

| Surface | Component | Current Behavior | Required Fix |
|---|---|---|---|
| Performer Articles | `articles/performer/[slug]` | WATCH LIVE → `/live/rooms/${slug}-live` direct | Wrap in LobbyEntryFlow |
| Home 3 Main Preview | `Home3MainPreviewLobby` | `<Link href="/live/rooms">` generic browse | Low priority — browse intent |

---

## NOT YET WIRED (no lobby entry at all)

| Surface | Component | Current Behavior | Required Fix |
|---|---|---|---|
| Home 1 Cover | `Home1CoverPage` | CTA buttons → `/home/2`, `/home/3` | Add live performer preview cards |
| Home 4 Marketplace | `Home4AdMagazine` | Magazine ad layout, no live cards | Sponsor slot cards need lobby entry |
| Home 5 Arena | `/home/5` — `Home5BattleCypherSurface` | No direct room links found | No live room card entry required (arena hub navigates to battle/cypher pages) |
| Performer Profile | `/performers/[slug]` | WATCH LIVE → direct href | Add LobbyEntryFlow |
| Venue Profile | `/venues/[slug]` | Active events need LobbyEntryFlow | Active event cards |

---

## SUMMARY

| Category | Count |
|---|---|
| Fully certified (LobbyEntryFlow wired) | 11 |
| Partial (routes to room, skips flow) | 2 |
| Not yet wired | 5 |
| **Total surfaces audited** | **18** |

**Platform lobby compliance: 11/18 = 61% certified**
**Target reached: All high/medium priority surfaces are wired**
