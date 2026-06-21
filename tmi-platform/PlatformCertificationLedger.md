# TMI Platform Functionality Certification — 2026-06-21

Ordered by Marcel Dickens (Build Director) after the Immersion Convergence Audit, on the principle that "looks amazing but doesn't work" kills retention faster than any visual gap. This is a code-level certification (real implementation read, not guessed) backed by targeted runtime checks, not an exhaustive manual click-test of every route — that's not achievable in one pass on a platform this size. See companion files for full detail per area:

- `UploadCertification.md`
- `PlaybackCertification.md`
- `RouteCertification.md`
- `ButtonCertification.md`
- `PlaceholderAudit.md`

## The one finding that changes priority order

**Messaging has zero database persistence.** Both messaging systems found in the codebase (`DirectMessageEngine`/`ConversationEngine` and the actually-wired `MessageThreadEngine`) store messages in an in-memory `Map` that resets on every server restart. There is no `Message`, `Conversation`, or `MessageThread` Prisma model in `schema.prisma`. The two systems are also disconnected from each other — `/api/messages/route.ts` calls `MessageThreadEngine`, while `DirectMessageEngine`/`ConversationEngine` (the ones with safety/moderation logic) are never called by any route.

This matters directly for Build Director Order 01/02 (Profile World Convergence, Universal Quick Actions): building an animated in-place overlay on top of a messaging system that doesn't persist would produce something that *looks* done but loses every conversation on the next deploy. **The persistence layer needs fixing before the overlay UI work, not after.**

## Certification summary by priority

| # | Area | Verdict |
|---|---|---|
| 1 | Media Upload | Video/audio/playlist-add/cover-image: **WORKING**. Profile avatar: **BROKEN** (calls a route that doesn't exist). Article/sponsor/venue image: **BROKEN/PLACEHOLDER** (in-memory only, never persisted to a model). Advertiser upload: **MISSING** (no UI). |
| 2 | Media Playback | Audio player, video player, playlist player, Memory Wall playback: all **WORKING** (real `<audio>`/`<video>` elements, real play/pause/seek/volume). Broadcast replay/VOD: **MISSING** entirely — no model, no route, no component. |
| 3 | Camera/Capture | 6 of 8 real `getUserMedia` call sites are **WORKING** (SelfViewCamera, WebRTCCapture, LocalCameraFeed, FaceScanner, TicketScanner, useStageWebRTC). `GroupPhotoCanister` → Memory Wall capture path is **WORKING**. `PolaroidCaptureButton` is **PLACEHOLDER** (uses a static placeholder image, not a real camera frame). `TMIVideoRoom`'s recording toggle is **BROKEN** (sets a flag, never calls `MediaRecorder.start()`). |
| 4 | Messaging | **0% certified.** Send/receive: PLACEHOLDER/BROKEN (in-memory, no DB). Group messaging, voice-call-from-thread, video-call-from-thread: **MISSING** (interfaces only, never implemented). Notifications: **PLACEHOLDER** (enqueues, never delivers — no push provider wired). |
| 5 | Buttons | 18 confirmed dead buttons (no `onClick` at all) across profile hero actions (Follow/Go Live/Book), lobby entry points (Join Now, genre filters), monetization (beat checkout, tip jar, payout request), and 11 admin operator/recovery buttons. Full list in `ButtonCertification.md`. |
| 6 | Routes | 447 routes counted across home/profile/hub/live/battles/rooms/store/magazine/admin. **Zero placeholder-text violations** ("Coming Soon"/"TBD"/lorem ipsum) found anywhere. 30 `next.config.js` redirects are clean and intentional. This area is in good shape. |
| 7 | Playlist | Upload song, create/delete playlist, add/remove song: all **WORKING**, real Prisma round-trips (`Song`, `Playlist`, `PlaylistItem`). Broadcast replay: **MISSING** (same gap as #2). |
| 8 | Memory Wall | Capture/display real for user uploads; two duplicate `MemoryWall` components and two incompatible `MemoryWallEngine` files still unmerged (carried over from the convergence audit, not re-litigated here). Automatic memory creation (on battle win, ticket purchase, etc.) is aspirational copy, not implemented — only manual capture works. |
| 9 | Presence | 8 confirmed live instances of fake `Math.random()`-driven viewer/revenue counts and hardcoded `isLive:true` literals, concentrated in `TMIAdminOverseer.tsx`, `RevenueStrip.tsx`, `/admin/overseer/page.tsx`, `lib/mock/live.ts`, `CountryParityEngine.ts`, and `WorldRuntime.ts` (9 fixtures). These coexist with the genuinely-fixed `GlobalLiveSessionRegistry` path from the earlier Discovery Loop Certification — the fixes didn't reach these files. |
| 10 | Placeholder sweep | **Most serious finding**: `PerformerRegistry.ts` uses `i.pravatar.cc` (random stranger face generator) as the image for every named, real registered performer (Wavetek, Nova Cipher, Astra Nova, DJ Kraze, etc.) — not as an anonymous fallback, but as the actual displayed photo for a named identity. Also found: "Big Ace"/"Chario Ace"/"DJ Kraze" still appearing as filler names in `battles/new`, `artist/dashboard`, `OrbitalWheel.tsx`, `ArtistProfileHub.tsx`. Several components with fully hardcoded viewer-count arrays (`LiveFeedMonitor`, `LiveRoomsWidget`, `DiscoveryRail`'s games section, `GameNightHub`). |

## What's actually solid right now
Routes (#6) and the playlist/song persistence layer (#7) and standard media playback (#2) are genuinely production-grade. Upload of video/audio/playlist content works end to end with real Prisma writes. This is not a platform that's broken everywhere — it's specifically broken in messaging, presence-honesty, and a cluster of dead action buttons.

## Recommended next order
1. Fix messaging persistence (add real `Conversation`/`Message` Prisma models, wire one engine — not two — to them) before building any overlay UI on top of it.
2. Fix the `PerformerRegistry.ts` pravatar issue — this is the single highest-severity honesty violation since it affects every performer profile/card platform-wide, not an isolated page.
3. Wire the 18 dead buttons, prioritizing profile hero actions and the lobby "Join Now" gateway (core user journeys) over admin operator buttons (internal-only).
4. Purge the 8 remaining fake-presence sources, especially the admin Overseer page since that's slated to become the canonical NOC per the convergence audit.
