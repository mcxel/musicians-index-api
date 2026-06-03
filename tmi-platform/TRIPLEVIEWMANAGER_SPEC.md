# TRIPLEVIEWMANAGER_SPEC (Draft — Sprint 1B Audit Phase)

Status: Draft specification only (no implementation)  
Date: 2026-06-02

## Purpose
Define a canonical panel-state manager for performer/audience/avatar contexts without parallel overlay systems.

## Core entities

### 1) SelfPanel (Performer Monitor)
Capabilities:
- draggable
- minimize
- expand
- fullscreen
- opacity (10–100%)
- persistent position/state per user

### 2) AudiencePanel
Capabilities:
- draggable
- minimize
- expand
- fullscreen
- opacity (10–100%)
- persistent position/state per user

### 3) AvatarLobbyPanel
States:
- minimized
- standard
- expanded
- fullscreen

Rules:
- avatar-anchored behavior (no free drag requirement)
- preserve active social context when resized
- preserve user state continuity

---

## State model (proposed)

```ts
type PanelMode = "minimized" | "standard" | "expanded" | "fullscreen";

interface FloatingPanelState {
  visible: boolean;
  mode: PanelMode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number; // 0.1 - 1.0
  zIndex?: number;
}

interface TripleViewState {
  selfPanel: FloatingPanelState;
  audiencePanel: FloatingPanelState;
  avatarLobbyPanel: {
    visible: boolean;
    mode: PanelMode;
  };
}
```

Persistence:
- user-scoped preference storage
- restore on profile/runtime mount
- role-aware defaults

---

## Magnetic Avoidance rule (mandatory)
Panels must not block critical controls:
- Go Live
- End Stream
- Challenge
- Battle
- Cypher
- Sponsor controls
- Broadcast controls

Behavior:
- soft “nudge” reposition (magnetic avoidance)
- no hard lockout
- maintain performer control priority

---

## Integration points (planned, not implemented)

### Runtime host
- `ProfileLobbyRuntime` (canonical shell)

### Live/media dependencies
- `LiveStageRuntime`
- `VideoSessionEngine`
- `AudiencePresenceEngine`
- `PlaylistEngine` (music continuity in lobby-state transitions)

### Sponsor dependency (future phase)
- `SponsorOverlayEngine` with queue slots in right utilities rail

---

## UX principles
- Never obstruct primary performance actions.
- Keep interaction latency low during drag/resize.
- Preserve media continuity during panel transitions.
- Support “TV mode” visibility and readability.

---

## Role defaults (proposed)

| Role | SelfPanel | AudiencePanel | AvatarLobbyPanel |
|---|---|---|---|
| Performer | visible (standard) | visible (standard) | minimized |
| Fan | hidden | visible (standard) | standard |
| Artist | visible (standard) | visible (minimized) | standard |
| Venue | hidden | visible (expanded) | standard |

Defaults are policy-level and configurable in canonical runtime.

---

## Non-goals in this phase
- No implementation
- No wiring into runtime yet
- No panel component refactors
- No sponsor engine implementation

This is a spec artifact for review and approval before Sprint 1B implementation phase.
