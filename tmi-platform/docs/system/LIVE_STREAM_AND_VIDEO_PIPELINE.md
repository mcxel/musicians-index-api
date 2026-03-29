# LIVE_STREAM_AND_VIDEO_PIPELINE.md
## Video Streaming — Encoding, Delivery, and HLS
### BerntoutGlobal XXL / The Musician's Index

---

## VIDEO IN ROOMS (Current Scope)

TMI uses video for:
1. Artist webcam in rooms (WebRTC, same as audio)
2. Shared preview window content (embedded media from YouTube/Spotify etc.)
3. Recorded highlight clips (upload to R2, play via HLS)
4. Venue display mode (broadcast to large screen)

Full live video encoding pipeline is Phase 2.
Current scope: WebRTC for artist cams + embedded external media.

---

## WEBRTC VIDEO (Artist Camera)

Alongside audio, artist camera video is shared via WebRTC.
Resolution: 720p max in rooms (auto-downgrade on poor connection).

```
Participant video tracks:
- Active performer: 720p if bandwidth allows
- Audience members: 360p
- Low-bandwidth mode: 240p or audio-only
```

---

## SHARED PREVIEW WINDOW (External Media)

SharedPreviewProvider supports these embed types:
- YouTube: `youtube.com/embed/{id}`
- Spotify: `open.spotify.com/embed/track/{id}`
- SoundCloud: `w.soundcloud.com/player/?url=...`
- Apple Music: `embed.music.apple.com/...`
- Direct MP4/MP3: HTML5 video/audio element
- Twitch: `player.twitch.tv/?channel={name}`

---

## HIGHLIGHT CLIP DELIVERY (HLS)

When a highlight clip is saved:
1. highlight-capture-bot marks timestamp in DB
2. media-processing queue transcodes to HLS (via FFmpeg on worker)
3. Output: `.m3u8` manifest + `.ts` segments uploaded to R2
4. CDN serves via `cdn.themusiciansindex.com/clips/{clipId}/index.m3u8`
5. HLS.js plays in browser (native HLS on iOS Safari)

---

## PHASE 2: FULL LIVE ENCODING

Phase 2 will add:
- Full room recording (opt-in)
- Archive replay of full events
- Requires media server upgrade (Mediasoup or Livekit)
- Estimate: 3–6 months post-launch
