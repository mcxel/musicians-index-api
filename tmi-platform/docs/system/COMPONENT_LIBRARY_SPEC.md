# COMPONENT LIBRARY SPEC
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define reusable UI primitives so Copilot builds in a consistent visual and wiring style.

A component is not "complete" unless it has:
- Typed props/contracts
- Loading/empty/error variants
- Provider/API wiring expectation
- Test/proof hook

---

## CORE COMPONENT FAMILIES

### Panel Primitives
- `NeonPanel`
- `StagePanel`
- `ControlPanel`
- `MetricPanel`
- `OverlayPanel`

### Identity + Cards
- `ArtistIdentityCard`
- `ProducerIdentityCard`
- `FanIdentityCard`
- `VenueCard`
- `SponsorTile`

### Room Components
- `PreviewStagePanel`
- `RoomRosterPanel`
- `TurnQueuePanel`
- `ReactionRail`
- `RoomChatPanel`
- `AudioMixerPanel`
- `ProducerBeatPanel`

### Surface Components
- `BeltCard`
- `MagazineSpreadCard`
- `LeaderboardCard`
- `BookingCard`
- `GameCard`
- `NotificationPanel`

### HUD Components
- `HUDBar`
- `NowPlayingWidget`
- `LiveStatusWidget`
- `PointsWidget`
- `QueueAlertWidget`

---

## COMPONENT CONTRACT TEMPLATE

Each component spec must define:
- `Inputs`: typed props
- `State source`: provider/global state reference
- `Data source`: API endpoint or config
- `Fallbacks`: loading/empty/error UI
- `Events`: telemetry names
- `Admin hooks`: feature flag or operator control

---

## REQUIRED FILE CHAIN (PER NEW COMPONENT)

1. Component file in `apps/web/src/components/...`
2. Type definition (co-located or shared types)
3. Story/preview or route-level proof surface
4. Wiring in parent route/surface
5. Test/proof check (minimum render + fallback)

---

## GOVERNANCE

- No one-off visual styles for major systems.
- Prefer extending library components over creating new one-off components.
- New components must be tagged by surface family: `belt`, `magazine`, `room`, `dashboard`, `hud`.
