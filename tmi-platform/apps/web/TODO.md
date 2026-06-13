# Homepage Rebuild Continuation TODO (Archive-Locked)

## Build Law
- **Design reference law**: `Homapge and battle challange and cyphers/*` (plus Claude directive/manifest files)
- **Code law**: `apps/web/src/*`
- Do not redesign from scratch.
- Modify first, replace second, rebuild last.

## PASS 1 — Audit + Map
- [x] Build homepage feature matrix (Home 1, 1-2, 2, 3, 4, 5)
- [x] Map archive prototype -> live repo component ownership
- [x] Confirm gaps for:
  - [ ] orbital wheel
  - [ ] billboard cards
  - [ ] live lobby walls
  - [ ] underlay stack
  - [ ] sponsor/event rails
  - [ ] Stream & Win placement
  - [ ] challenge/battle/cypher surfacing

## PASS 2 — Home 1 Fix (No Redesign)
- [ ] Keep existing orbital wheel
- [ ] Fix independent tile timer stale-state behavior
- [ ] Ensure challenge CTA uses safe existing route
- [ ] Preserve/restore:
  - [ ] animated tabloid underlay
  - [ ] sponsor rails
  - [ ] event/news/contest rails
  - [ ] collapsible side panels
  - [ ] magazine masthead
- [ ] Ensure no dead black space

## PASS 3 — Home 1-2 Billboard Upgrade
- [ ] Preserve existing routing and category engine
- [ ] Add billboard behavioral layer from archive:
  - [ ] rank movement indicators
  - [ ] live status emphasis
  - [ ] tier badge continuity
  - [ ] sponsor placements
  - [ ] trophy/belt/challenge winner strip
  - [ ] integrated live wall section (non-invasive)

## PASS 4 — Shared Image Source Wiring
- [ ] Add shared image resolver utility
- [ ] Feed same performer image pipeline to:
  - [ ] Home 1 orbital nodes
  - [ ] Home 1-2 billboard cards
  - [ ] live lobby wall tiles
  - [ ] profile cards
  - [ ] future avatar face hooks (forward-compatible)

## PASS 5 — Verification
- [ ] Run: `pnpm -C apps/web build`
- [ ] Verify pages:
  - [ ] /home/1
  - [ ] /home/1-2
  - [ ] /home/2
  - [ ] /home/3
  - [ ] /home/4
  - [ ] /home/5
- [ ] Verify mobile rendering
- [ ] Report:
  - [ ] exact files changed
  - [ ] build status
  - [ ] remaining gaps

## PASS 6 — Playlist Video Panel + Admin Monitor Switching (Launch-Critical)
- [ ] Playlist media routing by type
  - [ ] audio stays in playlist player/lobby audio sync
  - [ ] video routes to shared room top video panel
  - [ ] supported video sources: upload/youtube/music/comedy/dance/replay/external
- [ ] Shared room watch mode events
  - [ ] PLAYLIST_VIDEO_START
  - [ ] PLAYLIST_VIDEO_PAUSE
  - [ ] PLAYLIST_VIDEO_SEEK
  - [ ] PLAYLIST_VIDEO_STOP
  - [ ] PLAYLIST_VIDEO_NEXT
- [ ] Top video panel rule
  - [ ] no forced fullscreen by default
  - [ ] preserve avatars/chat/lobby wall visibility
  - [ ] fallback thumbnail+source if embed fails
- [ ] Admin monitor router
  - [ ] expand monitor to main
  - [ ] swap small↔main
  - [ ] lock/pin feed
  - [ ] popout/fullscreen
  - [ ] independent feed per panel
- [ ] Components/wiring
  - [ ] PlaylistMediaRouter
  - [ ] SharedRoomVideoPanel
  - [ ] RoomVideoPanelController
  - [ ] PlaylistLobbySync
  - [ ] AdminMonitorRouter
  - [ ] MonitorSwapButton
  - [ ] MonitorExpandButton

## PASS 7 — Session Memory + Last Active Hub System (Launch-Critical)
- [ ] Last Active Experience Router
  - [ ] if `next` exists, respect it
  - [ ] else route to lastActiveRoute
  - [ ] else role default
  - [ ] else /dashboard fallback
- [ ] Multi-role context switcher
  - [ ] fan / performer / venue / sponsor / writer / admin roles
  - [ ] preserve session + notifications + open state
  - [ ] avoid full logout/full refresh when possible
- [ ] Dashboard state persistence
  - [ ] lastActiveRole
  - [ ] lastActiveRoute
  - [ ] lastDashboardLayout
  - [ ] lastMonitorLayout
  - [ ] persistence priority: DB → session metadata → localStorage fallback
- [ ] Admin monitor layout persistence
  - [ ] restore feed assignments
  - [ ] restore expanded panel state
  - [ ] restore selected monitor arrangement
- [ ] Admin routing behavior
  - [ ] admins are not forced to admin landing
  - [ ] return to their last working context (fan/performer/admin hub etc.)

## PASS 8 — Build Discipline
- [ ] After each pass run: `pnpm -C apps/web build`
- [ ] Report per pass:
  - [ ] files changed
  - [ ] build status
  - [ ] blockers
  - [ ] next pass

## Constraints (approved)
- Do not push to production in this pass.
- Do not replace Claude visual system.
- Home 1 stays discovery-cover, not full live-world wall.
- Distribute “happening now / tonight / this week / this month / future” across correct homepage roles.
- Use archive prototypes + current repo architecture as source of truth.
