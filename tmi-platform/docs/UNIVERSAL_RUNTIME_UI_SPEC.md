# Universal Runtime UI Specification (Canonical)

Status: Draft v1 (approved direction)  
Scope: Performer, Audience, Avatar module, Memory Wall canister, left/right rails, floating canisters, cinematic behavior, motion, responsive rules.

## 1) Canonical Principles

1. One runtime system governs all windows/canisters.
2. No independent popup frameworks.
3. WidgetDrawer is a compatibility adapter over Window Runtime during migration.
4. All surfaces support open/dock/float/collapse/hide/restore.
5. Geometry and motion come from presets, not per-page ad-hoc logic.

## 2) Core Surfaces

## 2.1 Performer Video Panel
- Placement: main stage center-left.
- Desktop size: 48–55vw x 58–66vh.
- Behavior:
  - primary live feed
  - fullscreen, expand, cinematic priority highest
  - live badge, optional camera controls
- Runtime role: `performer-panel`
- Default state: `docked` (center-left preset region)

## 2.2 Audience Video Panel
- Placement: right of performer panel.
- Desktop size: 28–34vw x 42–52vh.
- Behavior:
  - audience/judge/guest rotation
  - pin to stage, swap with performer, detach/float
- Runtime role: `audience-panel`
- Default state: `docked` (right-stage preset region)

## 2.3 Center Avatar Module
- Placement: center lower-third overlay.
- Sizes:
  - compact orb: 72–96px
  - expanded card: 220–280px x 120–160px
- Behavior:
  - idle/hover/expanded/profile/customize/return
  - can collapse to compact orb
- Runtime role: `avatar-center-module`

## 2.4 Memory Wall Canister
- Placement:
  - docked-right overlay (default), or centered modal/fullscreen
- Sizes:
  - docked: 320–420px width, full usable height
  - expanded: 62–78vw x 68–82vh
- States:
  - hidden → docked → expanded → fullscreen → minimized-chip → restore
- Runtime role: `memory-wall`
- Pipeline:
  Capture → Upload → Media Engine → Media Registry → Memory Wall refresh → Broadcast update

## 2.5 Left Context Rail
- Width: 260–320px
- Contains:
  - rooms, lobby, messages, friends, inventory, memory wall, playlist, camera, rewards, store, settings
- Behavior:
  - expanded/collapsed/hidden
  - opens runtime windows, never owns window state itself
- Runtime role: `left-context-rail`

## 2.6 Right Social/Commerce Rail
- Width: 280–360px
- Contains:
  - chat, nearby rooms, friends online, gifts, sponsors, event queue, bookings, moderator feed
- Behavior:
  - sections can collapse/expand/detach/float/hide/restore
- Runtime role: `right-social-rail`

## 3) Canonical Window Lifecycle

Every runtime surface supports:
- open
- focus
- dock(side)
- undock(float)
- minimize
- hide
- restore(previous geometry/state)
- fullscreen
- expand

## 4) Motion Language

- Open: 160–220ms ease/spring
- Close: 160ms
- Dock/Undock: ~200ms spring
- Float transitions: 220ms spring
- Restore: 220ms
- Fullscreen: 250ms
- Rule: no hard snaps for normal transitions.

## 5) Cinematic Mode

- Trigger: single cinematic toggle
- Behavior:
  - hide/collapse non-critical rails and canisters
  - keep stage-critical panels visible (performer + audience as configured)
  - mouse/interaction can reveal rails
- Runtime uses `cinematicPriority` metadata to decide visibility.

## 6) Responsive Rules

## 6.1 Desktop
- Full dual-panel stage with rails available.

## 6.2 Tablet
- Reduce rail widths; audience panel can convert to tabbed/drawer behavior.

## 6.3 Mobile
- Single primary panel focus.
- Secondary surfaces become bottom sheet/canister stack.
- Memory wall defaults to full-screen sheet.

## 7) Safe-area Rules

- Respect top/bottom insets for mobile notches and browser chrome.
- Docked rails/canisters apply inset-aware bounds.
- Floating windows clamp inside viewport-safe bounds.

## 8) Runtime Metadata (to be encoded in WindowTypes)

- `panelRole`
- `layoutPreset`
- `preferredDock`
- `preferredSize`
- `restoreGeometry`
- `cinematicPriority`
- `responsiveBehavior`
- `zPriority`

## 9) Preset Families (initial)

- Performer Studio
- Audience View
- Battle
- Cypher
- Challenge
- World Concert
- Focus Mode
- Mobile
- Tablet

All page-level layouts should consume these presets instead of defining bespoke coordinates.

## 10) Migration Rule (WidgetDrawer)

During migration:
WidgetDrawer -> Runtime adapter -> Universal Window Runtime

End state:
Consumers -> Universal Window Runtime (WidgetDrawer removed)
