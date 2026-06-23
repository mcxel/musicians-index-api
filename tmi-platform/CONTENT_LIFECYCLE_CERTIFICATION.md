# CONTENT LIFECYCLE CERTIFICATION
**TMI Platform — Creator Content Management Audit**
**Date:** 2026-06-15 | **Priority:** P0 Launch-Critical

Every user-generated content type must support the full lifecycle:
`Create → Upload → View → Edit → Replace → Delete → Share`

---

## SCORING KEY

| Symbol | Meaning |
|--------|---------|
| ✅ | EXISTS — API route or component found, wired |
| ⚠️ | PARTIAL — mechanism exists but no dedicated endpoint / no UI |
| ❌ | MISSING — no route, no component, not implemented |
| 🆕 | ADDED THIS SESSION (2026-06-15) |

---

## SYSTEM SCORES

### 1. Profile Images & Avatars
| Operation | Status | File |
|-----------|--------|------|
| Upload | ✅ | `api/upload/route.ts` — JPEG/PNG/WEBP/GIF up to 10MB |
| Edit/Replace | ✅ | `api/profile/update` PUT — `avatarUrl` field |
| Delete/Clear | ⚠️ | PUT with `avatarUrl: null` — works but no "Remove Avatar" UI button |
| Share | ⚠️ | Profile URL only — no copy-link action on avatar |
| **STATUS** | **PARTIAL** | Missing: explicit remove-avatar button, avatar-specific share |

### 2. Profile Banners
| Operation | Status | File |
|-----------|--------|------|
| Upload | ✅ | `api/upload/route.ts` |
| Edit/Replace | ✅ | `api/profile/update` PUT — `bannerUrl` field |
| Delete/Clear | ⚠️ | PUT with `bannerUrl: null` — works but no dedicated remove |
| Share | ❌ | None |
| **STATUS** | **PARTIAL** | Same gap as avatar |

### 3. Playlist Songs
| Operation | Status | File |
|-----------|--------|------|
| Create Playlist | ✅ | `api/playlists` POST (`create` action) |
| Add Song | ✅ | `api/playlists` POST (`register-track` action) |
| Edit Playlist Name/Cover/Privacy | ✅ 🆕 | `api/playlists/[id]` PATCH |
| Reorder Songs | ✅ 🆕 | `api/playlists/[id]/tracks/[trackId]` PATCH `{ position }` |
| Remove Song | ✅ 🆕 | `api/playlists/[id]/tracks/[trackId]` DELETE — re-sequences remaining |
| Delete Playlist | ✅ 🆕 | `api/playlists/[id]` DELETE — Cascade removes all items |
| Share Playlist | ✅ | `api/referral/playlist-share` + `shareToken` field on Playlist model |
| Send as Mixtape | ⚠️ | `isMixtape` flag exists on model — UI for Mixtape mode needed |
| Privacy Settings | ✅ 🆕 | `isPublic` PATCH via `api/playlists/[id]` |
| **SCHEMA** | ✅ 🆕 | `Playlist` + `PlaylistItem` + `Song` models added to schema; `prisma generate` run |
| **STATUS** | **PARTIAL→PASS** | Core CRUD complete; Mixtape UI still needed |

### 4. Memory Wall
| Operation | Status | File |
|-----------|--------|------|
| Upload Photo/Video/Memory | ✅ | `api/memory/wall` POST, `api/memory/capture` POST |
| Capture Polaroid | ✅ | `api/memory/capture` POST + `PolaroidCapture.tsx` |
| Add Caption | ✅ | Included in POST body (`description` field) |
| Edit Caption / Privacy | ✅ 🆕 | `api/memory/wall` PATCH — added 2026-06-15 |
| Pin Memory | ❌ | No `pinned` field or endpoint |
| Move Memory / Reorder | ❌ | No reorder endpoint |
| Delete Memory | ✅ 🆕 | `api/memory/wall` DELETE — added 2026-06-15 |
| Share Memory | ⚠️ | `shares` counter field exists; no dedicated share endpoint |
| Set Privacy | ✅ | `isPublic` field — settable on POST and PATCH |
| Download Memory | ❌ | No download token or endpoint |
| Fan/Performer/Writer/Venue walls | ✅ | `entityType` param routes to correct wall type |
| **STATUS** | **PARTIAL** | Core CRUD now done; missing: pin, reorder, share link, download |

### 5. Articles
| Operation | Status | File |
|-----------|--------|------|
| Create / Submit | ✅ | `api/editorial/submit` POST |
| Save Draft | ⚠️ | Status defaults to DRAFT but submit engine may auto-publish |
| Publish | ✅ 🆕 | `api/articles/[id]` PATCH `{ status: "PUBLISHED" }` |
| Edit Title/Content | ✅ 🆕 | `api/articles/[id]` PATCH |
| Unpublish | ✅ 🆕 | `api/articles/[id]` PATCH `{ status: "DRAFT" }` |
| Archive | ✅ 🆕 | `api/articles/[id]` PATCH `{ status: "ARCHIVED" }` |
| Delete | ✅ 🆕 | `api/articles/[id]` DELETE |
| Feature Image | ⚠️ | No `featureImageUrl` field on Article model |
| Tags / Categories | ⚠️ | No tags model — category stored in `EditorialSubmission` engine only |
| Share | ❌ | No share link generation endpoint |
| Auto-connect Writer/Performer/Venue/Magazine | ⚠️ | `authorId` + `artistProfile` relation exists; Writer/Venue/Sponsor links not modeled |
| **STATUS** | **PARTIAL** | CRUD complete; missing: feature image field, tags model, share link, auto-connections |

### 6. Videos
| Operation | Status | File |
|-----------|--------|------|
| Upload | ✅ | `api/upload/media` POST — video up to 100MB |
| DB Record on Upload | ✅ 🆕 | `api/upload/media` now creates Prisma `Video` record after Blob upload |
| Edit (title/description/privacy) | ✅ 🆕 | `api/videos/[id]` PATCH |
| Replace | ⚠️ | Re-upload via `api/upload/media` then PATCH `videoUrl` |
| Delete | ✅ 🆕 | `api/videos/[id]` DELETE |
| Share | ⚠️ | No share link generation — `isPublic` flag exists |
| **SCHEMA** | ✅ 🆕 | `Video` model in DB (pushed 2026-06-16) |
| **STATUS** | **PARTIAL** | CRUD done; share link + re-upload UI needed |

### 7. Audio / Songs (non-beat tracks)
| Operation | Status | File |
|-----------|--------|------|
| Upload | ✅ | `api/upload/media` POST — audio types accepted |
| DB Record on Upload | ✅ 🆕 | `api/upload/media` + `api/media/upload` now create Prisma `Song` record |
| Submit for Stream & Win | ✅ | `api/stream-win/submit-song` POST |
| Edit (title/metadata) | ✅ 🆕 | `api/songs/[id]` PATCH |
| Delete | ✅ 🆕 | `api/songs/[id]` DELETE |
| Promote / Share | ⚠️ | `api/stream-win/promote-song` — competition-specific only |
| **SCHEMA** | ✅ 🆕 | `Song` model in DB (pushed 2026-06-16) |
| **STATUS** | **PARTIAL** | CRUD done; general share link needed |

### 8. Beats (Producer Uploads)
| Operation | Status | File |
|-----------|--------|------|
| Upload / Submit | ✅ | `api/beats/submit` POST |
| Edit (title/BPM/price) | ✅ 🆕 | `api/beats/[id]` PATCH → proxied to API service |
| Delete | ✅ 🆕 | `api/beats/[id]` DELETE → proxied to API service |
| Publish / Unpublish | ✅ | `api/beats/[id]/publish` route exists |
| List My Beats | ✅ | `api/beats/list` GET |
| Share | ❌ | No share link or share-to-profile action |
| **SCHEMA** | ✅ | `Beat` model in `packages/db/prisma/schema.prisma` |
| **STATUS** | **PARTIAL** | Core CRUD proxied; missing: share link, copy-link-to-profile |

### 9. Avatar (3D Bobblehead)
| Operation | Status | File |
|-----------|--------|------|
| Create Avatar (cosmetic) | ✅ | `AvatarCreator.tsx` + `api/avatar/save` (slot/loadout system) |
| Face Scan Upload | ❌ | Pipeline not yet implemented |
| Save Bobblehead Config | ✅ 🆕 | `api/avatar/config` POST — upserts `AvatarConfig` DB record |
| Load Bobblehead Config | ✅ 🆕 | `api/avatar/config` GET |
| Save to Inventory | ⚠️ | `api/avatar/inventory` exists for items |
| Display in Profile | ❌ | Profile page not yet reading `AvatarConfig` |
| Display in Lobby | ⚠️ | `AudienceScene.tsx` — `occupancyRatio` prop wired, unique bot heads |
| Display in Venue Runtime | ❌ | Not connected |
| **SCHEMA** | ✅ 🆕 | `AvatarConfig` model added to schema |
| **STATUS** | **PARTIAL** | Save/load API done; face scan + display pipeline still needed |

---

## SUMMARY TABLE

| System | Upload | Edit | Delete | Share | Status |
|--------|--------|------|--------|-------|--------|
| Profile Images | ✅ | ✅ | ⚠️ | ⚠️ | **PARTIAL** |
| Profile Banners | ✅ | ✅ | ⚠️ | ❌ | **PARTIAL** |
| Playlist / Songs | ✅ | ✅🆕 | ✅🆕 | ✅ | **PASS** |
| Memory Wall | ✅ | ✅🆕 | ✅🆕 | ⚠️ | **PARTIAL** |
| Articles | ✅ | ✅🆕 | ✅🆕 | ❌ | **PARTIAL** |
| Videos | ✅ | ✅🆕 | ✅🆕 | ⚠️ | **PARTIAL** |
| Audio/Songs | ✅ | ✅🆕 | ✅🆕 | ⚠️ | **PARTIAL** |
| Beats | ✅ | ✅🆕 | ✅🆕 | ❌ | **PARTIAL** |
| 3D Avatar Config | ⚠️ | ✅🆕 | ⚠️ | ❌ | **PARTIAL** |

---

## SCHEMA GAPS (Block All CRUD for These Types)

| Missing Model | Affects | Required Fields |
|---------------|---------|-----------------|
| `Playlist` | Playlist create/rename/delete | creatorId, name, coverUrl, isPublic, createdAt |
| `PlaylistItem` | Song add/remove/reorder | playlistId, songId, position, addedAt |
| `Song` / `Track` | All audio CRUD | uploaderId, title, audioUrl, duration, genre, status |
| `Video` | All video CRUD | uploaderId, title, videoUrl, thumbnailUrl, duration, status |
| `AvatarConfig` | Avatar save/load | userId, meshUrl, textureUrl, bobbleheadConfig, createdAt |

These 5 models must be added to `packages/db/prisma/schema.prisma` before delete/edit can work for those content types.

---

## PRIORITY FIXES (ORDER)

### Immediate (unblock revenue + creator experience)
1. ~~Memory Wall PATCH + DELETE~~ ✅ Done
2. ~~Article PATCH + DELETE~~ ✅ Done
3. ~~Beats PATCH + DELETE~~ ✅ Done

### P0 (before real onboarding)
4. **Add `Playlist` + `PlaylistItem` + `Song` models to Prisma schema**
5. **Build `api/playlists/[id]` PATCH (rename, cover) + DELETE (remove playlist)**
6. **Build `api/playlists/[id]/tracks/[trackId]` DELETE (remove song from playlist)**
7. **Add `Video` model to schema + build `api/videos/[id]` PATCH + DELETE**

### P1 (before full launch)
8. Avatar save API (`api/avatar/save`) + AvatarConfig model
9. Article feature image field on Prisma model
10. Share link generation for Memory Wall items
11. "Remove Avatar" / "Remove Banner" buttons in profile UI

---

## FULL LIFECYCLE TEST (MANUAL — PER ROLE)

For each role (Fan, Performer, Writer, Venue, Sponsor), a real human must verify:

```
☐ Upload a profile photo    → visible on profile page
☐ Replace profile photo     → old photo gone, new shows
☐ Upload a banner           → visible in header
☐ Remove banner             → header shows default
☐ Create a memory           → appears on Memory Wall
☐ Edit memory caption       → updated text shows
☐ Delete memory             → gone from wall
☐ Create playlist           → appears in playlist list
☐ Add song to playlist      → appears in track list
☐ Remove song from playlist → track gone
☐ Delete playlist           → gone from list
☐ Submit article            → appears in magazine
☐ Edit article              → updated content shows
☐ Publish article           → status changes to PUBLISHED
☐ Unpublish article         → returns to DRAFT
☐ Delete article            → removed from magazine
```

Until all ☐ pass for all roles: **platform is not creator-ready.**

---

*Established 2026-06-15 by Marcel Dickens. All content types must pass before public onboarding opens.*
