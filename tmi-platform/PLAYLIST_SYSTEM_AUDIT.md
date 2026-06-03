# PLAYLIST_SYSTEM_AUDIT (Sprint 1B Audit — Inventory Only)

Status: Audit-only (protected system)  
Date: 2026-06-02  
Rule: No playlist deletion/replacement in this phase

## Protected canonical target
- PlaylistEngine (platform-level, persistent across profile/lobby/stage transitions)

---

## Playlist / Music Inventory (initial mapping)

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/components/radio/StreamAndWinRadioPlayer.tsx` | Music playback/radio surface | React media controls | stream-win/home/live contexts | Radio widget | PlaylistEngine | KEEP |
| `apps/web/src/components/economy/PremiumBeatSlider.tsx` | Beat/music showcase carousel | economy + music feed data | store/economy/home contexts | Beat promo UI | PlaylistEngine | MERGE |
| `apps/web/src/types/playWidget.contracts.ts` | Playlist/play widget contracts | TS type contracts | used by play/media widgets | Playlist type layer | PlaylistEngine API contract | KEEP |
| `apps/web/src/app/home/live/page.tsx` | Live/media home entry where music content appears | live components | `/home/live` | Live home media page | PlaylistEngine + LiveStageRuntime integration | MERGE |
| `apps/web/src/components/live/StreamWinRoom.tsx` | Stream room with song/media interactions | stream room data + media | `/live/rooms/stream-win` | Stream-win room | PlaylistEngine + LiveStageRuntime | MERGE |
| `apps/web/src/components/live/VibeControlPanel.tsx` | Vibe/audio participation controls | vibe state systems | live/room contexts | Vibe controls | PlaylistEngine + AudiencePresenceEngine | MERGE |
| `apps/web/src/components/home/Home1PlatformBelt.tsx` | Home belt with promo/music context | home feed data | `/home/1` and adjacent home routes | Home content belt | PlaylistEngine discovery feed | MERGE |
| `apps/web/src/components/home/HomeVisualTruth.tsx` | Home narrative section (music/editorial blend potential) | home modules | home routes | Visual narrative panel | PlaylistEngine-aware editorial panel | REIMAGINE |
| `apps/web/src/lib/media/MediaOrchestrator.ts` | Media lifecycle orchestration | media/upload/capture | media/live/profile flows | Media orchestration | MediaEngine + PlaylistEngine adapter | MERGE |
| `apps/web/src/lib/media/MediaCaptureEngine.ts` | Capture pipeline support for uploaded tracks/media | browser media APIs | stage/upload flows | Capture engine | MediaEngine + PlaylistEngine ingest | MERGE |
| `apps/web/src/app/api/upload/route.ts` | Upload endpoint (tracks/media assets) | upload backend pipeline | `/api/upload` | Upload API | MediaEngine + Playlist ingest path | KEEP |

---

## Integration inventory (declared requirement set)
This repository must explicitly support inventory mapping for:
- Spotify
- Apple Music
- YouTube
- USA Stream Team
- Performer uploaded tracks

### Current explicit state (audit observation)
- Direct integration modules are not yet clearly centralized under one playlist namespace in scanned set.
- Existing components suggest distributed music playback surfaces rather than one engine entrypoint.
- Classification outcome: REIMAGINE toward one PlaylistEngine with provider adapters.

---

## Required playlist contexts to preserve (policy mapping)
The following contexts are protected and must map to PlaylistEngine:
- Personal playlists
- Fan playlists
- Artist playlists
- Venue playlists
- Sponsor playlists
- Promoter playlists
- Lobby music
- Profile music
- Stage walk-on music
- Memory wall music attachments

Current status: partially represented through distributed UI components; canonical mapping pending consolidation phase.

---

## Entertainment First notes
- Passive song lists/widgets should be REIMAGINE if they do not create social or participatory loops.
- Preferred direction:
  - listening party affordances
  - shared queue visibility
  - stage/lobby persistence
  - audience influence hooks

## Risk level if touched
- High: any music state that should persist across route/state transitions.
- Medium: widget-level players (radio/slider) that may currently hold local state.
- Medium: media upload/capture ingestion pathways tied to music assets.

## Constraint confirmation
- No code deleted/moved/refactored.
- Audit-only report generated.
- Playlist system treated as protected.
