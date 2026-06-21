# Playback Certification — 2026-06-21

| System | Component | Verdict | Evidence |
|---|---|---|---|
| Audio player | `components/media/MediaPlayer.tsx` | WORKING | Real `<audio ref={audioRef}>`; `.play()`/`.pause()` at lines 108-110; `currentTime` seek at line 139; `volume` binding at line 116; real `src` binding at line 99 |
| Video player | `components/media/TMIVideoPlayer.tsx` | WORKING | Real `<video>` at lines 332-347; play/pause at 239-243; seek at 265; volume at 256; real `onTimeUpdate`/`onPlay`/`onPause`/`onEnded` handlers |
| Playlist player | `components/artifacts/PlaylistArtifact.tsx` + `MediaPlayer.tsx` bridge via `media/PlaylistEngine.tsx` | WORKING | Sequential `goNext()` with shuffle/repeat at line 124; real queue management confirmed via `StreamAndWinRadioPlayer` integration |
| Memory Wall playback | `components/media/MemoryWall.tsx` | WORKING (for user-uploaded media) | Real `<video src={item.url}>` at line 200, real `<audio src={item.url}>` at line 291, both with native browser controls |
| Broadcast replay / VOD | — | **MISSING** | No archived-stream model, no replay API route. `WebRTCBroadcast.tsx` is outgoing-only; `BroadcastLobbyWall.tsx` is an empty 1-line file; `BroadcasterStudioDesk.tsx` is controls UI with no playback logic; `MotionPosterPlayer.tsx` plays intro/freeze-frame clips, not archived broadcasts |

## Fix priority
Broadcast replay is a real, complete gap — not a bug in an existing system, a system that was never built. If "rewatch a past concert/battle" is part of the retention plan, this needs: an archive model (could reuse the `Video` model added this session with a `sourceType: 'BROADCAST_ARCHIVE'` flag, or a dedicated model), a save-on-stream-end hook, and a VOD mode in `TMIVideoPlayer.tsx` (which already supports `mode="vod"` per its own prop signature — just needs a real archived URL to point at).

## What's confirmed solid
All four standard playback surfaces (audio, video, playlist, Memory Wall) use real media elements with real, working controls — not decorative progress bars. This is genuinely production-grade.
