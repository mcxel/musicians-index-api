# MEDIA_CANONICALIZATION_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only (no refactor/delete/move)  
Date: 2026-06-02  
Lens: Entertainment First + Golden Question

## Canonical media engine targets (proposed)
- PlaylistEngine
- MediaEngine
- VideoSessionEngine
- LiveStageRuntime
- AudiencePresenceEngine

---

## Media + Playlist Inventory

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/components/radio/StreamAndWinRadioPlayer.tsx` | Radio/music playback surface | React media controls | stream-win/home/live adjacencies | Radio widget | PlaylistEngine | KEEP |
| `apps/web/src/components/economy/PremiumBeatSlider.tsx` | Beat/music promo slider | economy/music data feeds | store/economy/home surfaces | Beat promo UI | PlaylistEngine + MediaEngine | MERGE |
| `apps/web/src/components/media/ImageUploader.tsx` | Media upload UI | upload APIs, media libs | media/upload/profile contexts | Uploader UI | MediaEngine | KEEP |
| `apps/web/src/app/api/upload/route.ts` | Upload API route | server upload pipeline | `/api/upload` | Upload endpoint | MediaEngine | KEEP |
| `apps/web/src/lib/media/MediaCaptureEngine.ts` | Capture orchestration | browser capture APIs | live/stage/media flows | Capture runtime | MediaEngine + VideoSessionEngine | KEEP |
| `apps/web/src/lib/media/MediaOrchestrator.ts` | Media coordination | capture/upload/playback modules | media and live pipelines | Orchestration layer | MediaEngine | KEEP |
| `apps/web/src/components/live/MaskedVideoTile.tsx` | Video tile renderer | video sources + overlays | lobby/live/wall routes | Tile presentation | VideoSessionEngine | KEEP |
| `apps/web/src/components/live/LiveRoomWebRTCLayer.tsx` | WebRTC room media layer | RTC/session hooks | `/live/rooms/[id]` | Live room media | VideoSessionEngine | KEEP |
| `apps/web/src/hooks/useStageWebRTC.ts` | Stage RTC hook | getUserMedia/WebRTC | stage/live components | Stage RTC hook | VideoSessionEngine | KEEP |
| `apps/web/src/hooks/useVenueMediaStream.ts` | Venue media stream hook | media devices APIs | venue/live components | Venue stream hook | VideoSessionEngine + AudiencePresenceEngine | KEEP |
| `apps/web/src/components/video/MediaMonitor.tsx` | Media monitor diagnostics UI | media/runtime telemetry | diagnostics/admin/media views | Monitoring UI | MediaEngine + AnalyticsEngine | MERGE |
| `apps/web/src/app/home/live/page.tsx` | Home live media landing | live/lobby components | `/home/live` | Live media page | LiveStageRuntime | MERGE |
| `apps/web/src/components/live/StreamWinRoom.tsx` | Stream room with media interactions | stream logic + media tiles | `/live/rooms/stream-win` | Competitive live room | LiveStageRuntime + VideoSessionEngine | MERGE |

---

## Playlist-specific audit notes (protected system)

### Observed playlist-adjacent surfaces
- Radio player + beat slider are current visible playlist-adjacent assets.
- Additional playlist-related contracts/types likely present through:
  - `apps/web/src/types/playWidget.contracts.ts`
  - profile/lobby/stage components with music controls.

### Protected rule applied
- Playlist functionality classified as KEEP/MERGE only in this audit stage.
- No deletion or replacement action authorized before review.

### Gaps flagged for deeper mapping (next report tie-in: `PLAYLIST_SYSTEM_AUDIT.md`)
- Spotify integration endpoints/hooks not yet explicitly mapped in this report.
- Apple Music integration endpoints/hooks not yet explicitly mapped.
- YouTube/USA Stream Team bridges not yet explicitly mapped.
- Profile music / lobby music / stage walk-on state pathways need dedicated mapping.

---

## Entertainment First review
- Media systems tied to participation (live rooms, rtc, stream rooms) score high and are KEEP.
- Passive/diagnostic-only media screens are MERGE or REIMAGINE candidates if not actionable for audience/performer participation.

## Risk level if touched
- High: RTC and capture hooks/layers (`useStageWebRTC`, `LiveRoomWebRTCLayer`, `MediaCaptureEngine`).
- Medium: presentation components (`MaskedVideoTile`, radio/beat widgets).
- Medium: upload routes and orchestration (`api/upload`, `MediaOrchestrator`).

## Constraint confirmation
- Inventory/classification only.
- No code moved.
- No code deleted.
- No implementation started for ProfileLobbyRuntime/TripleView/Sponsor engine.
