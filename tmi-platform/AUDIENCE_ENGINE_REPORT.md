# AUDIENCE_ENGINE_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only  
Date: 2026-06-02  
Lens: Participation + Big Screen + Venue scalability

## Canonical audience engine targets (proposed)
- AudiencePresenceEngine
- VenueEngine
- LiveStageRuntime
- VideoSessionEngine

---

## Audience / Venue / Seating Inventory

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/components/live/AudienceField.tsx` | Audience visualization region for live contexts | live state hooks, tile renderers | live/arena pages | Audience surface | AudiencePresenceEngine | KEEP |
| `apps/web/src/components/lobbies/AvatarLobbyCanvas.tsx` | Social avatar lobby rendering | avatar/profile hooks, canvas layer | lobby/profile/hub surfaces | Avatar social canvas | AudiencePresenceEngine + AvatarLobby | KEEP |
| `apps/web/src/components/lobbies/LobbyTheaterShell.tsx` | Theater-style lobby scene shell | audience + lobby components | lobby/room routes | Theater lobby shell | AudiencePresenceEngine | MERGE |
| `apps/web/src/components/live/LiveLobbyWallGrid.tsx` | Audience/event discovery wall of live tiles | video tiles/live feed state | `/live/lobby-wall`, lobby routes | Lobby wall | AudiencePresenceEngine | KEEP |
| `apps/web/src/components/live/MaskedVideoTile.tsx` | Audience tile media card | media sources + overlays | lobby/live/wall routes | Tile component | VideoSessionEngine + AudiencePresenceEngine | KEEP |
| `apps/web/src/components/live/StreamWinRoom.tsx` | Interactive room audience competition | stream room logic + tiles | `/live/rooms/stream-win` | Stream competition room | LiveStageRuntime + AudiencePresenceEngine | MERGE |
| `apps/web/src/components/live/VenueKioskShell.tsx` | Venue-specific live shell | venue data hooks | venue/live route surfaces | Venue kiosk shell | VenueEngine | KEEP |
| `apps/web/src/components/booking/VenueBookingCanvas.tsx` | Venue booking/space presentation canvas | booking/ticketing deps | venue/booking routes | Venue planning surface | VenueEngine + BookingEngine | KEEP |
| `apps/web/src/app/fan/theater/page.tsx` | Fan theater audience mode | fan dashboard + audience components | `/fan/theater` | Fan audience page | AudiencePresenceEngine | KEEP |
| `apps/web/src/app/live/rooms/[id]/page.tsx` | Full live room audience + performance | rtc/live hooks, room modules | `/live/rooms/[id]` | Live room runtime | LiveStageRuntime + AudiencePresenceEngine | KEEP |
| `apps/web/src/app/rooms/watch-party/page.tsx` | Watch-party audience room | room/watch-party components | `/rooms/watch-party` | Watch-party room | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/rooms/world-dance-party/page.tsx` | Dance audience room | room party logic | `/rooms/world-dance-party` | Party room | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/rooms/world-concert/page.tsx` | Concert audience room | live room + venue components | `/rooms/world-concert` | Concert room | LiveStageRuntime + AudiencePresenceEngine | MERGE |
| `apps/web/src/components/tickets/VenueTicketPrintShell.tsx` | Venue ticket print flow | ticketing APIs/templates | `/tickets/print*` | Ticket print UI | VenueEngine + BookingEngine | KEEP |
| `apps/web/src/lib/commerce/TicketingEngine.ts` | Ticketing logic (seat/validation flows) | payments, ticket APIs | ticket/venue endpoints | Ticketing core | VenueEngine + BookingEngine | KEEP |
| `apps/web/src/hooks/useVenueMediaStream.ts` | Venue media stream controls | MediaDevices/getUserMedia | venue/live stage contexts | Venue media hook | VideoSessionEngine + AudiencePresenceEngine | KEEP |
| `Homapge and battle challange and cyphers/AudienceScene.jsx` | 3D audience scene reference | canvas drawing logic | reference asset | 3D audience concept | AudiencePresenceEngine (design source) | REIMAGINE |
| `Homapge and battle challange and cyphers/TMI_TheaterAudience_3D.html` | 3D theater audience reference | HTML/canvas scene | reference asset | Theater 3D prototype | AudiencePresenceEngine (TV-mode blueprint) | REIMAGINE |
| `Homapge and battle challange and cyphers/VENUE_SYSTEM_README.md` | Venue skin/system reference | doc/spec | reference | Venue architecture spec | VenueEngine (policy/spec source) | KEEP |

---

## VIP / Diamond / Seating observations
- VIP/diamond and seating are distributed across venue/ticket routes rather than centralized.
- Recommendation: consolidate into VenueEngine capability map:
  - seating zones
  - VIP overlays
  - audience access tiers
  - room-capacity aware lobby overflow

## Entertainment First notes
- Strong participation alignment exists in audience/lobby/watch-party/live room surfaces.
- 3D audience assets currently in reference folders should be REIMAGINED into reusable engine modules, not copied raw.
- Audience systems should prioritize “what’s live now” discoverability and quick room entry.

## Risk level if touched
- High: live room + venue media hooks
- Medium: lobby wall + fan theater compositions
- Medium: ticketing/booking interaction layers

## Constraint confirmation
- Inventory/classification only.
- No file movement/deletion.
- No implementation started.
