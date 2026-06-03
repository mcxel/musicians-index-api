# RUNTIME_CANONICALIZATION_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only (no code deletion/refactor/move)  
Date: 2026-06-02  
Baseline: Home1 Golden Build (Engineering PASS; Manual browser QA pending)

## Engine-first framing
Pages are views. Engines are platform systems.  
This report inventories runtime systems and maps them toward canonical engines.

## Canonical engine targets (proposed)
- ProfileLobbyRuntime
- TripleViewManager
- AudiencePresenceEngine
- LiveStageRuntime
- VideoSessionEngine
- MessagingEngine
- MemoryWallEngine
- VenueEngine
- AnalyticsEngine
- SubscriptionEngine

---

## Runtime System Inventory (initial pass)

| File Path | Purpose | Dependencies (observed) | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/components/profile/ProfileLobbyRuntime.tsx` | Profile runtime shell for role surfaces | React, profile child components | `/profile/*`, hub/profile-adjacent usage | Profile runtime | ProfileLobbyRuntime | KEEP |
| `apps/web/src/components/profile/page.tsx` | Profile surface entry component | Profile runtime + profile widgets | `/profile` | Profile view layer | ProfileLobbyRuntime | MERGE |
| `apps/web/src/components/lobbies/AvatarLobbyCanvas.tsx` | Avatar lobby visual/social canvas | avatar hooks, canvas layer | lobby routes/hub surfaces | Avatar lobby view | AudiencePresenceEngine / AvatarLobby | KEEP |
| `apps/web/src/components/lobbies/LobbyTheaterShell.tsx` | Theater-style lobby shell | lobby widgets, audience components | lobby/room surfaces | Lobby shell | AudiencePresenceEngine | MERGE |
| `apps/web/src/components/stage/StickyStage.tsx` | Stage persistence shell and controls | stage hooks, media runtime | live/stage pages | Stage shell | LiveStageRuntime | KEEP |
| `apps/web/src/components/stage/LiveStageVideoOverlay.tsx` | Stage overlay video controls | media/orchestrator, rtc hooks | `/live-stage`, live rooms | Video overlay | VideoSessionEngine / TripleViewManager-ready | MERGE |
| `apps/web/src/components/stage/VideoChatWidget.tsx` | Inline stage chat/video utility | RTC/chat hooks | stage/live pages | Video/chat widget | VideoSessionEngine | MERGE |
| `apps/web/src/components/live/LiveRoomWebRTCLayer.tsx` | WebRTC layer for live rooms | WebRTC hooks/context | `/live/rooms/[id]` | Live RTC layer | VideoSessionEngine | KEEP |
| `apps/web/src/hooks/useStageWebRTC.ts` | WebRTC session hook for stage | browser media APIs | stage/live components | RTC hook | VideoSessionEngine | KEEP |
| `apps/web/src/hooks/useVenueMediaStream.ts` | Venue media stream orchestration hook | MediaDevices/getUserMedia | venue/live flows | Media stream hook | VideoSessionEngine / VenueEngine | KEEP |
| `apps/web/src/components/live/LiveLobbyWallGrid.tsx` | Live lobby wall tile orchestration | live tile components | `/live/lobby*`, `/rooms/lobby*` | Lobby wall grid | AudiencePresenceEngine / VenueEngine | KEEP |
| `apps/web/src/components/live/MaskedVideoTile.tsx` | Interactive video tile shell | media source + UI overlays | live/lobby/wall contexts | Tile renderer | VideoSessionEngine | KEEP |
| `apps/web/src/components/live/ArenaImmersivePanel.tsx` | Arena interaction surface | vibe/state hooks, overlays | battle/challenge/cypher contexts | Arena panel | AudiencePresenceEngine / LiveStageRuntime | MERGE |
| `apps/web/src/components/live/StreamWinRoom.tsx` | Stream competition room shell | stream-win state | `/live/rooms/stream-win` | Competitive room shell | LiveStageRuntime / AudiencePresenceEngine | MERGE |
| `apps/web/src/hooks/SessionContext.tsx` | Auth/session context | auth APIs, role session | global runtime | Session/auth runtime | ProfileLobbyRuntime (support) | KEEP |
| `apps/web/src/lib/media/MediaOrchestrator.ts` | Media coordination utilities | upload/capture/video libs | media/live/profile pipelines | Media orchestration | MediaEngine / VideoSessionEngine | KEEP |
| `apps/web/src/lib/media/MediaCaptureEngine.ts` | Capture pipeline logic | browser capture APIs | stage/upload/video flows | Capture engine | MediaEngine | KEEP |
| `apps/web/src/lib/commerce/TicketingEngine.ts` | Ticket flow logic for venue/runtime | payments/tickets APIs | ticket/venue routes | Ticketing flow | VenueEngine / BookingEngine | MERGE |
| `apps/web/src/components/tickets/VenueTicketPrintShell.tsx` | Ticket print view runtime | ticket templates/api | `/tickets/print*` | Print runtime | VenueEngine / BookingEngine | KEEP |
| `apps/web/src/components/admin/RealTimeEventFeed.tsx` | Overseer/admin live event telemetry | admin feed APIs | admin observability pages | Telemetry UI | AnalyticsEngine | KEEP |
| `apps/web/src/lib/admin/AdminStatsEngine.ts` | Admin stats aggregation | admin endpoints | admin dashboards | Admin stats engine | AnalyticsEngine | KEEP |
| `apps/web/src/app/admin/overseer/OverseerClientPage.tsx` | Overseer runtime page shell | admin stats/events | `/admin/overseer` | Overseer dashboard runtime | AnalyticsEngine / LiveStageRuntime support | REIMAGINE |

---

## TripleView readiness observations (audit-only)
- Existing stage/video/lobby surfaces indicate feasible integration points:
  - Self panel candidate: `LiveStageVideoOverlay` + stage shell
  - Audience panel candidate: `LiveLobbyWallGrid` + arena/lobby feeds
  - Avatar lobby panel candidate: `AvatarLobbyCanvas`
- Current state: no canonical `TripleViewManager` service yet.
- Classification: create via consolidation phase, not in audit phase.

## Entertainment First notes
- Several admin surfaces are data-heavy and passive; classify as REIMAGINE if they do not drive participatory outcomes.
- Runtime systems tied to audience/live/rooms already align better with entertainment-first and should be prioritized as KEEP/MERGE.

## Risk tags (if touched)
- High: WebRTC/session/capture layers (`LiveRoomWebRTCLayer`, `useStageWebRTC`, `useVenueMediaStream`, session context)
- High: live room route components and stage overlays
- Medium: lobby wall compositions and arena panels
- Medium: admin telemetry shells (functional but may require reimagining)

## Constraint confirmation
- No code was deleted.
- No refactor performed.
- No runtime merge implemented.
- Audit-only output produced.
