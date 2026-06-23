# Headquarters Convergence Audit (Phase 0)

Date: 2026-06-20
Scope: Canonical hub routes and immediate dependencies for Fan + Performer headquarters convergence.

## KEEP
- apps/web/src/app/hub/fan/page.tsx
- apps/web/src/app/hub/performer/page.tsx
- apps/web/src/components/fan/FanHubShell.tsx
- apps/web/src/components/performer/PerformerHubDashboard.tsx
- apps/web/src/components/canisters/MonitorSatelliteSystem.tsx
- apps/web/src/components/media/MemoryWall.tsx
- apps/web/src/components/artifacts/PlaylistArtifact.tsx
- apps/web/src/components/canisters/CollapsibleCanister.tsx
- apps/web/src/components/ads/UnifiedAdSlot.tsx

## MERGE
- apps/web/src/app/fan/dashboard/page.tsx
- apps/web/src/app/dashboard/fan/page.tsx
- apps/web/src/app/performer/dashboard/page.tsx
- apps/web/src/app/dashboard/performer/page.tsx

Action: keep hub routes as canonical, keep dashboard variants as redirects or shared wrappers only.

## REMOVE
- Public-facing usage of demo/fake data sources in production headquarters surfaces:
  - apps/web/src/app/xp/page.tsx
  - apps/web/src/app/avatar/shop/page.tsx
  - apps/web/src/app/world/dance-party/page.tsx
  - apps/web/src/app/battles/live/page.tsx
  - apps/web/src/components/artist/ArtistVideos.tsx
  - apps/web/src/components/artist/ArtistShows.tsx
  - apps/web/src/components/artist/ArtistSponsors.tsx

Action: replace with real data loaders or honest empty states.

## REWIRE
- Communication must be one-click overlay-driven from headquarters:
  - apps/web/src/app/hub/fan/page.tsx
  - apps/web/src/app/hub/performer/page.tsx
  - apps/web/src/components/messaging/InboxPanel.tsx

Action: add persistent communication dock and overlays (chat/voice/video/invite) to both canonical hubs.

## UPGRADE
- Persistent headquarters environment standards:
  - apps/web/src/app/hub/fan/page.tsx
  - apps/web/src/app/hub/performer/page.tsx
  - apps/web/src/components/room/RoomContainer.tsx
  - apps/web/src/components/room/ActionCanister.tsx
  - apps/web/src/components/room/WidgetDrawer.tsx

Action: ensure always-visible identity/media/memory/communication/quick-action/activity zones and remove hidden-primary-action patterns.

## Immediate Blockers
1. Queue-backed API startup depends on Redis availability in apps/api/src/app.module.ts.
2. Environment flags REDIS_ENABLED, BOTS_ENABLED, NOTIFICATIONS_ENABLED are not currently wired as module gates.
3. Placeholder/demo usage remains in multiple user-visible pages and components.

## Phase 1 Execution Start (Implemented in this pass)
1. Added persistent Communication Hub overlay dock component:
   - apps/web/src/components/headquarters/HeadquartersCommunicationDock.tsx
2. Wired Communication Hub into canonical Fan and Performer headquarters:
   - apps/web/src/app/hub/fan/page.tsx
   - apps/web/src/app/hub/performer/page.tsx
