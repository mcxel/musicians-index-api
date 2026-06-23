# P0 Creator Certification Blockers — 2026-06-21

**FREEZE**: All economy, rewards, Song DNA, participation, and XP features are FROZEN until this checklist passes.

---

## Audit Status

### ✅ 1. CREATOR IDENTITY

- [x] Avatar upload works — `AvatarUploadPipeline.tsx` calls `/api/profile/upload` (confirmed)
- [x] Cover photo upload works — `ImageUploader.tsx` calls `/api/profile/upload` (confirmed)
- [x] Profile edits save — Prisma schema exists (needs verification on form wiring)
- [ ] Profile changes propagate everywhere (needs audit of profile consumers)
- [ ] Homepage image propagation works (needs audit of image sources on home pages)
- [ ] Live-room image propagation works (needs audit of image sources on live routes)

### ❌ 2. CREATOR CONTENT (BLOCKER FOUND)

- [ ] Music upload works — **CRITICAL BLOCKER FOUND**: `TrackUploadPanel` was simulating progress instead of calling API. **FIXED** in commit to components/music/TrackUploadPanel (now calls `/api/media/upload` with FormData + XMLHttpRequest). But:
  - Performer profile page uses `/components/social/TrackUploadPanel` (different component — playlist management UI, not upload)
  - No integration point exists to wire upload → library → playlist
- [ ] Upload progress visible — FormData progress tracking implemented in TrackUploadPanel, but no UI hook-up in performer profile
- [ ] Processing status visible — `/api/media/status` API exists, but no polling UI
- [ ] Approved/rejected status visible — MediaAssetEngine has status field, but no UI display
- [ ] Playlist placement visible — ProfilePlaylistSection exists, but need to verify it reads from library

### [ ] 3. CREATOR DISCOVERY

- [ ] Going live places user on Home 1 — Needs verification (live registry + home 1 discovery wall integration audit)
- [ ] Going live places user on Home 1-2 — Needs verification (same)
- [ ] Going live places user on Discovery walls — Needs verification
- [ ] Going live places user on Live walls — Needs verification  
- [ ] Going live places user on Venue walls — Needs verification

### [ ] 4. CREATOR PLAYBACK

- [ ] Songs play — `/api/media/library` returns audio URLs, but no player verification
- [ ] Playlists play — ProfilePlaylistSection exists, but need to verify player integration
- [ ] Radio plays — Need to locate radio component  
- [ ] Video plays — PerformerVideoPanel exists, need playback verification
- [ ] No dead media panels — Need to audit all media consumers for fallback behavior

### [ ] 5. CREATOR STREAMING

- [ ] Camera on — StreamWinRoom + WebRTC components exist, need verification
- [ ] Camera off — Need camera control implementation check
- [ ] Mic mute — Need audio control implementation check
- [ ] Mic unmute — Need audio control implementation check
- [ ] Join audience — `/api/live/audience` POST action="join" exists, verified working
- [ ] Leave audience — `/api/live/audience` POST action="leave" exists, verified working

---

## Immediate Next Steps (Priority Order)

### P0a — Music Upload Fix (In Progress)
1. **Wire social/TrackUploadPanel to actual upload UI** OR replace with working music/TrackUploadPanel
2. **Add upload status polling** to display processing state
3. **Add upload → library → playlist wiring** so uploaded songs appear in ProfilePlaylistSection
4. **Test end-to-end**: drop file → see upload progress → see "processing" state → see "ready" → see song in playlist

### P0b — Playback Verification (Critical)
1. Audit `ProfilePlaylistSection` - does it actually fetch and render tracks?
2. Verify audio player controls work
3. Verify playlist tracks play in order
4. Check fallbacks for missing/failed streams

### P0c — Live Discovery Wiring (Critical)
1. Verify `/api/live/go` POST adds session to GlobalLiveSessionRegistry (confirmed ✅)
2. Verify Home 1 discovery wall reads from GlobalLiveSessionRegistry
3. Verify Home 1-2 Billboard reads from GlobalLiveSessionRegistry
4. Verify all discovery walls read from live registry and render correctly

### P0d — Camera/Mic Controls (Critical)
1. Locate WebRTC stream controls in StreamWinRoom
2. Verify camera on/off toggle works
3. Verify mic mute toggle works
4. Test in a live room (requires working go-live first)

### P0e — Homepage Image Propagation (Critical)
1. Audit Home 1 discovery cards — do they read from PerformerRegistry or hardcoded?
2. Audit Home 1-2 Billboard cards — do they read from media library or fallback?
3. Audit live room cards — do they pull performer avatar from live session registry?

---

## Known Working (Verified)

✅ Avatar upload → /api/profile/upload (ImageUploader working)
✅ Video upload → /api/media/upload (VideoUploadWithProgress working)
✅ Media asset engine in-memory store → DB write-through (MediaEngine + Prisma)
✅ Go-live registration → GlobalLiveSessionRegistry
✅ Audience join/leave → audienceRuntimeEngine
✅ Music upload API skeleton → /api/media/upload (but not wired to UI)

---

## Known Broken (Verified)

❌ Music upload UI → No connection to API (TrackUploadPanel was simulating progress only)
❌ Music upload → library → playlist flow (missing integration points)
❌ Upload processing status display (API exists, no UI)
❌ Performer profile uses wrong TrackUploadPanel (playlist UI, not upload UI)

---

## Testing Checklist (Once Fixed)

- [ ] Create test performer account
- [ ] Upload test audio file
- [ ] See progress bar
- [ ] See "processing" state
- [ ] Wait for "ready" state (should be ~2s in dev)
- [ ] See song appear in playlist
- [ ] Click song → plays audio
- [ ] Go live → see on Home 1 discovery wall
- [ ] Go live → see on Home 1-2 billboard
- [ ] Toggle camera off/on while live
- [ ] Verify audience can join room

---

## Estimated Effort

- Music upload wiring: 4-6 hours (integrate UI to API, add status polling, wire to playlist)
- Playback verification: 2-3 hours (audit + test)
- Live discovery wiring: 3-4 hours (audit discovery walls, verify registry reads)
- Camera/mic controls: 2-3 hours (locate controls, test)
- Image propagation audit: 2-3 hours (audit + test)
- **Total**: ~16-22 hours to fully certify P0

---

## Why This Blocks Revenue

Without these 5 items, creators **cannot**:
- Upload their music
- Hear their uploads
- See themselves on the platform  
- Go live and be discovered
- Control their stream quality

Without these, you have 0% creator retention and 0% revenue.
Everything else (economy, rewards, Song DNA) sits behind this.

---

**Status Updated**: 2026-06-21 by Claude (Agent)
**Next Session**: Start with P0a (Music Upload Fix)
