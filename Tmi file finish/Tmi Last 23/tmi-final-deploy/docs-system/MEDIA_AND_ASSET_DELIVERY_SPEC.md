# MEDIA_AND_ASSET_DELIVERY_SPEC.md
## How Every Media Asset Is Stored, Delivered, and Served
### BerntoutGlobal XXL / The Musician's Index

---

## STORAGE ARCHITECTURE

```
Artist uploads file
       ↓
TMI API (asset.service.ts)
       ↓
Transcode/Process
       ↓
Cloudflare R2 bucket (tmi-media)
       ↓
CDN: cdn.themusiciansindex.com (Cloudflare CNAME to R2)
       ↓
Browser/App loads via CDN URL
```

---

## CLOUDFLARE R2 SETUP

Bucket: `tmi-media`
Public URL: `https://cdn.themusiciansindex.com`
Access: R2 API token in `MEDIA_ACCESS_KEY_ID` + `MEDIA_SECRET_ACCESS_KEY`

Folder structure in R2:
```
tmi-media/
  originals/         ← raw uploads (private)
  transcoded/audio/  ← MP3 at 128kbps
  transcoded/video/  ← HLS segments (360/720/1080p)
  thumbnails/lg/     ← 800×600
  thumbnails/md/     ← 400×300
  thumbnails/sm/     ← 200×150
  thumbnails/xs/     ← 60×60
  posters/           ← fallback poster images
  artist-banners/    ← artist hero backgrounds
  venue-images/      ← venue hero images
  sponsor-assets/    ← sponsor campaign media
```

---

## CDN CACHE RULES

| Asset Type | Cache TTL | Stale While Revalidate |
|---|---|---|
| Transcoded audio/video | 1 year | — |
| Thumbnails | 30 days | 24 hours |
| Artist banners | 7 days | 24 hours |
| Sponsor assets | 1 hour | 15 min (campaigns change) |

---

## FALLBACK ASSET RULES

Every media type must have a fallback:
```
Audio fail → show poster card with track name + artist accent color
Video fail → show static thumbnail or poster
Image fail → show platform default avatar/banner (platform-brand color)
Sponsor fail → show house ad (static image from R2)
Beat preview fail → show "Beat Unavailable" card
```

---

## LOW-BANDWIDTH BEHAVIOR

When network quality is poor (detected via Network Information API):
- Switch to audio-only mode for video content
- Load thumbnail instead of video preview
- Reduce preview window quality
- Use xs thumbnail (60×60) for lobby wall tiles
- Use md thumbnail (400×300) for room tiles
