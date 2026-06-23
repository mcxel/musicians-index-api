# TMI Platform — Full Zip Blueprint Cross-Reference Audit
Generated: 2026-06-14

This document verifies that every Claude-designed system provided in the `Homapge and battle challange and cyphers` zip is represented in the runtime, correctly wired, and connected into the unified 3D ecosystem.

## System Certification Matrix

| Blueprint Asset / System | Runtime File / Engine | Route / Hub | Wired? | Missing / Fix Needed |
|---|---|---|---|---|
| **Messaging + Group Video** | `OmniPresenceEngine.tsx`, `messageThreadEngine` | `/dashboard`, `/messages` | ⚠️ PARTIAL | Audio ducking UI exists; stable/cinematic modes & 3-way audience infrastructure (WebRTC group chats) need live backend hookup. |
| **Playlist System** | `playlist/page.tsx`, `PlaylistEngine` | `/playlist` | ⚠️ PARTIAL | Playback works. Needs: create, save, profile attachment, room attachment, and synchronized lobby playback over sockets. |
| **Memory Wall** | `MemoryWallCanvas.tsx`, `MemoryWallEngine` | `/fan/[slug]/memory` | ✅ WIRED | Capture & persist to Prisma working. Memory sharing via avatar to room needs implementation. |
| **Sponsor Stamp Wall** | `MemoryWallCanvas.tsx` (Tab 2) | `/performers/[slug]` | ✅ WIRED | Renders correctly. Needs to be populated by dynamic `AdCampaign` data instead of seed array. |
| **Sponsor Orbit** | `MemoryWallCanvas.tsx` (Tab 3) | `/performers/[slug]` | ✅ WIRED | Renders correctly with animations. Needs dynamic data wiring. |
| **Booking Map** | `MemoryWallCanvas.tsx` (Tab 4) | `/performers/[slug]` | ✅ WIRED | Renders correctly. Logistics estimation fields need connection to `/api/bookings/request`. |
| **Theme Persistence** | `MemoryWallCanvas.tsx` | All Memories | ✅ WIRED | Classic/Ruby/Diamond/Gold/Neon themes implemented with `localStorage` persistence. |
| **3D Rooms & Venues** | `AudienceScene.tsx` | `/live/rooms/[id]` | ✅ WIRED | Renders correctly for Theater/Arena/Club/Outdoor/Boardroom. |
| **Avatars** | `TMIAvatarSystem.tsx`, `HeroRigController.tsx` | `/avatar/*` | ⚠️ PARTIAL | UI and APIs exist. Missing P12 milestone: loading `.glb` 3D rigs instead of 2D/emoji fallbacks. |
| **Arena / Battle / Cypher** | `arena/page.tsx`, `MaskedVideoTile` | `/arena`, `/battles`, `/cypher` | ⚠️ PARTIAL | Unified triangle header active. Needs dynamic propagation of live streams into the specific battle/cypher components. |
| **Live Audience Wiring** | `GoLiveStudio`, `GlobalLiveSessionRegistry` | `/live/go` | ⚠️ PARTIAL | Camera starts, room creates, `AudienceScene` loads. Missing: automatic maintenance bot seating transitioning to real audience fill. |

## Missing Ecosystem Bridges

The platform components physically exist and compile without error, but the "glue" connecting them into a single living city is incomplete:

1. **The Live Broadcast Bridge:**
   When a performer clicks "Go Live", it does not currently force `BillboardLiveWall`, `Home 3`, and `Profile` to instantly re-render with their `MaskedVideoTile`. The socket/SSE event bus is required.

2. **The Magazine Bridge:**
   Magazine pages (Category D templates) are statically defined in `NewsArticleModel.ts`. They need dynamic hydration from the database and active injection of live components.

3. **The Playlist/Venue Bridge:**
   Playlists currently live on `/playlist`. They must be portable—able to be injected into a `RoomSession` so that `OmniPresenceEngine` syncs playback across all clients in the room.

4. **The Avatar/Audience Bridge:**
   `AudienceScene` renders generated crowds. It must be updated to place the specific user's personalized Avatar (from `HeroRigController`) into a dedicated seat coordinate via `RoomSeatState`.

## Next Execution Phase: "The Connective Tissue"

Do not build new features. Do not build new pages.

**The immediate focus is strictly:**
* Replace `seedPerformers()` with live DB lookups in the Billboard.
* Connect Magazine slugs to Profile hubs.
* Map `Playlist` IDs to `Room` records.
* Connect `OmniPresenceEngine` to the Daily.co audio streams for true audio ducking.