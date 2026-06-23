# BILLBOARD WALL CERTIFICATION
**TMI Platform — Billboard Live Wall Full Path Audit**  
**Date:** 2026-06-15 | **Priority:** P0

---

## Architecture Statement

The Billboard Wall is NOT a grid of images. It is a live discovery → lobby entry system.  
Every tile must trigger: `Live Preview → Join Lobby → Access Check → Seat Assignment → AudienceScene → Room`

Blueprint ref: `tmi_billboard_live_lobby_wall_system.html`

---

## COMPONENT INVENTORY

| Component | File | Status |
|---|---|---|
| `BillboardLiveWall` | `components/media/BillboardLiveWall.tsx` | ✅ |
| `BroadcastLobbyWall` | `components/media/BroadcastLobbyWall.tsx` | ✅ |
| `LiveMediaWall` | `components/media/LiveMediaWall.tsx` | ✅ |
| `LobbyWall` | `components/lobby/LobbyWall.tsx` | ✅ |
| `LobbyWallGrid` | `components/lobby/LobbyWallGrid.tsx` | ✅ |
| `LobbyWallPanel` | `components/lobby/LobbyWallPanel.tsx` | ✅ |
| `TMILobbyWall` | `components/lobby/TMILobbyWall.tsx` | ✅ |
| `FanLobbyWall` | `components/lobby/FanLobbyWall.tsx` | ✅ |
| `PerformerLobbyWall` | `components/lobby/PerformerLobbyWall.tsx` | ✅ |
| `MixedLobbyWall` | `components/lobby/MixedLobbyWall.tsx` | ✅ |
| `UniversalLobbyEntry` | `components/room/UniversalLobbyEntry.tsx` | ✅ |
| `AudienceScene` | `components/live/AudienceScene.jsx` | ✅ |
| `TMILobbyAccessGate` | `components/lobby/TMILobbyAccessGate.tsx` | ✅ |

---

## HOME 1-2 BILLBOARD WALL ROUTE

### Page
`/home/1-2` → `apps/web/src/app/home/1-2/page.tsx`

### Components in Use
| Component | Status |
|---|---|
| `BillboardLiveWall` | ✅ Installed (rebuilt in session 2026-06-14) |
| Category buttons → advance display | ✅ |
| Tile click → `handleJoinCard()` | ✅ |
| `UniversalRoomGate` opens | ✅ |
| Gate → `/live/rooms/[id]` | ✅ |

---

## FULL TILE CLICK PATH — CERTIFICATION

Every billboard tile MUST complete this path:

| Step | Component | Route / Action | Status |
|---|---|---|---|
| 1. Tile visible | `BillboardLiveWall` card | Shows: image, name, viewer count, LIVE badge | ✅ |
| 2. Tile click | `onClick` handler | Opens `LobbyEntryFlow` modal | ✅ |
| 3. Preview step | `LobbyEntryFlow` idle→preview | Room preview card with JOIN button | ✅ |
| 4. Access gate | `TMILobbyAccessGate` | Checks user tier vs room access level | ✅ |
| 5. Seat assignment | `LobbyEntryFlow` seat step | Random Row A-H, Seat 1-40 | ✅ |
| 6. AudienceScene load | `next/dynamic` import | Canvas renders, crowd fills | ✅ |
| 7. Enter room | Navigate | `/live/rooms/[id]?from=billboard-wall` | ✅ |
| 8. Bot fill | `BotAudienceFill` | Remaining seats fill with unique avatars | ❌ Missing |

---

## BILLBOARD TILE BUTTONS

| Button | Location | Action | Status |
|---|---|---|---|
| JOIN LOBBY / JOIN ROOM | Tile CTA | Opens `LobbyEntryFlow` | ✅ |
| WATCH ROOM (view-only) | Secondary CTA | Enter AudienceScene as observer | 🔲 |
| VIEW PROFILE | Performer name | → `/performers/[slug]` | ✅ |
| FOLLOW | Quick action | Auth → follow | 🔲 |
| TIP | Quick action | → tip modal | 🔲 |
| SPONSOR | Quick action | → `/profile/sponsor/new?performer=[slug]` | 🔲 |
| BOOK PERFORMER | Quick action | → `/bookings/new?performer=[slug]` | 🔲 |

---

## LOBBY WALL VARIANTS CERTIFICATION

| Wall Type | Route | Used On | Status |
|---|---|---|---|
| `TMILobbyWall` | `/live/lobby` | Public live lobby | ✅ |
| `FanLobbyWall` | `/hub/fan` | Fan hub | ✅ |
| `PerformerLobbyWall` | `/hub/performer` | Performer hub | ✅ |
| `MixedLobbyWall` | Home 3, mixed feeds | Home 3 Live World | ✅ |
| `BillboardLiveWall` | `/home/1-2` | Home 1-2 | ✅ |

All walls must route through `LobbyEntryFlow` — NOT directly to `/live/rooms/[id]`.

---

## LIVE LOBBY WALL CANISTER (Rule 15)

The `LiveLobbyWallCanister` must be embeddable in:
- Fan profiles (see what's happening now)
- Performer profiles (see who else is live)
- Admin Overseer Deck (network-wide view)
- Magazine articles (related live rooms)
- Home 1 Crown area (bottom section)

Implementation plan:
```
components/canisters/LiveLobbyWallCanister.tsx
  Props: { maxTiles?: number; filter?: 'genre' | 'tier' | 'all'; onJoin?: (roomId) => void }
  Source: BillboardLiveWall (already built) — wrap as canister
  Embedding: import LiveLobbyWallCanister → place in profile/dashboard/article
```

---

## CONTENT FRESHNESS ON BILLBOARD (Rule 11)

Billboard tiles MUST sort by: `LIVE → STARTING SOON → RECENT (ended < 2h ago) → POPULAR`

| Priority | Label | Filter | Status |
|---|---|---|---|
| 1 | 🔴 LIVE NOW | `isLive === true` | ✅ |
| 2 | ⏱ STARTING SOON | `scheduledAt < now + 30min` | 🔲 |
| 3 | 📼 RECENT STREAM | `endedAt > now - 2h` | 🔲 |
| 4 | 🔥 POPULAR | `peakViewerCount` desc | 🔲 |

`sortByFreshness()` from `lib/content/ContentFreshness.ts` must be applied to BillboardLiveWall feed.

---

## AD SLOTS IN BILLBOARD (Rule 12)

Every Nth tile in the billboard must follow the fallback chain:
```
Tile slot N (every 6th) → getAdSlotForZone('billboard') → Paid | Platform | AdNetwork | Advertise CTA
```
Current status: `getAdSlotForZone` EXISTS in SponsorRegistry. Wire into BillboardLiveWall tile grid.

---

## CERTIFICATION CHECKLIST

| Test | Expected | Status |
|---|---|---|
| Click tile → LobbyEntryFlow opens | Modal appears instantly | ✅ Code confirmed |
| Access gate checks user tier | Free/Pro/Ruby etc | ✅ |
| Seat assigned Row + Seat number | Random valid seat | ✅ |
| AudienceScene renders | Canvas with crowd | 🔲 Runtime verify |
| Bot seats fill empty positions | Stadium effect | ❌ BotAudienceFill missing |
| Navigates to `/live/rooms/[id]` | Room loads | 🔲 Runtime verify |
| Category filter buttons work | Different rooms shown | 🔲 Runtime verify |
| Ad slot appears every 6th tile | Real ad from SponsorRegistry | 🔲 Wire |
| Content freshness order (LIVE first) | sortByFreshness applied | 🔲 Wire |

---

## P0 ACTIONS

1. Build `BotAudienceFill.ts` — needed for stadium fill effect
2. Wire `sortByFreshness()` into `BillboardLiveWall` feed
3. Wire `getAdSlotForZone('billboard')` into tile grid
4. Build `LiveLobbyWallCanister.tsx` wrapping `BillboardLiveWall` for embedding
5. Runtime verify: full path from tile click → room entry
