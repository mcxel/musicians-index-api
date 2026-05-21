# ASSET_PIPELINE_SYSTEM.md
## How Media Moves: Upload → Validate → Transcode → CDN → Room
9-step pipeline: upload → format/size/type validate → virus scan → transcode → thumbnail (4 sizes) → CDN store → DB record → preview URL returned → QC bot validates
Audio: MP3/WAV/FLAC/AAC max 50MB → 128kbps MP3 + waveform data
Video: MP4/MOV/WebM max 500MB → HLS (360/720/1080p adaptive)
Image: JPG/PNG/WebP max 10MB → WebP + JPEG fallback
Thumbnails: 800×600 (card), 400×300 (card-sm), 200×150 (lobby tile), 60×60 (HUD mini)
Approved external sources: YouTube, Spotify, Apple Music, SoundCloud, Instagram
  — artist must verify ownership by matching TMI profile to external account
Fallback: every media type has a platform-default poster that inherits artist accent color
Copilot wires: apps/api/src/services/asset.service.ts + storage provider config
