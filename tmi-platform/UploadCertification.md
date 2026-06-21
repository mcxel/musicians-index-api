# Upload Certification — 2026-06-21

Component → API route → Prisma persistence, verified by reading actual implementation.

| Upload Type | Component | API Route | Persistence | Verdict |
|---|---|---|---|---|
| Image (general) | `components/media/ImageUploader.tsx` | `/api/upload` | Returns a Blob/data URL, no Prisma write | PLACEHOLDER |
| Video | `components/media/VideoUploadWithProgress.tsx` | `/api/media/upload` | `prisma.video.create({uploaderId, title, videoUrl, status})` | WORKING |
| Audio/song | `MediaUploadWidget.tsx` (mediaType="song") | `/api/media/upload` | `prisma.song.create({uploaderId, title, audioUrl, genre, bpm, status})` | WORKING |
| Song upload (alt path) | `components/music/TrackUploadPanel.tsx` | `/api/upload/media` | `prisma.song.create(...)` at line 59 | WORKING |
| Playlist creation | (user content page) | `/api/user/content` (POST) | `prisma.playlist.create({creatorId, name, description, isPublic})` | WORKING |
| Add song to playlist | TrackUploadPanel / playlist editor | `/api/user/playlists/[id]/songs` (POST) | `prisma.playlistItem.create({playlistId, songId, position})` | WORKING |
| Profile image | `components/.../AvatarUploadPipeline.tsx` | `/api/profile/avatar` | **Route does not exist** — component calls a 404 | BROKEN |
| Cover image | Playlist cover via PATCH | `/api/playlists/[id]` (PATCH) | `prisma.playlist.update({coverUrl})` | WORKING |
| Article image | `MediaUploadWidget.tsx` (mediaType="article_media") | `/api/media/upload` | `MediaAssetEngine` in-memory only, no Article model write | PLACEHOLDER |
| Sponsor image | `MediaUploadWidget.tsx` (mediaType="sponsor_asset") | `/api/media/upload` | Sponsor data lives in `SponsorSlotRegistry` (not Prisma); image not persisted to any model | BROKEN |
| Advertiser image | — | — | No UI component found at all | MISSING |
| Venue image | `MediaUploadWidget.tsx` (mediaType="venue_promo") | `/api/media/upload` | `MediaAssetEngine` in-memory only; no link to a Venue model | BROKEN |

## Fix priority
1. **Profile avatar upload is BROKEN, not just incomplete** — the component calls a route that was never built. This is the single most commonly-expected upload action on the platform (every user has a profile photo) and it 404s today.
2. Sponsor/venue/article uploads route through `MediaAssetEngine`, an in-memory store that was never connected to Prisma — three upload types that look identical to the working video/song path but silently lose data on restart.
3. Advertiser image upload has no UI at all — `MediaUploadWidget` already supports an `"advertiser_asset"` type, it just has no entry point.

## What's confirmed solid
Video, audio/song, playlist creation, add-song-to-playlist, and cover-image-via-playlist-update are all real, complete round trips with correct Prisma models. This is the same real Content Lifecycle Phase A/B/C schema (`Playlist`/`Song`/`Video`/`AvatarConfig`) that was committed and pushed earlier this session.
