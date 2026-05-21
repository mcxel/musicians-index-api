# PACK 45 — MEDIA / STREAMING / CLIPS / REPLAY

## Files: 1
- `media/media-complete.engine.ts` — Livestream system (Mux/Cloudflare/Agora), HLS quality variants, clip generation, highlight detection (5 auto-trigger rules), replay system, motion artist card spec

## Key Systems
- HLS variants: 1080p/720p/480p/360p + adaptive ABR
- `HIGHLIGHT_RULES` — Auto-detects: viewer surge, $50+ tip, crown events, game winners, hype > 90%, reaction bursts
- Motion card spec: 3-second, 400×500px portrait, webm+mp4, transparent, loop, muted
