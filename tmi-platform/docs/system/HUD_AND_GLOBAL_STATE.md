# HUD_AND_GLOBAL_STATE.md
# HUD and Global State System — Architecture Reference
# Repo paths: packages/hud-core/, packages/hud-runtime/, packages/hud-theme/, packages/hud-tmi/
#             apps/web/src/app/hud/

## What Is The HUD

The HUD (Heads-Up Display) is the persistent global UI layer that sits above all page content.
It displays the user's points balance, live notifications, Stream & Win mini-player status,
current room/session info, and quick-access shortcuts.

This is a first-class platform system — not a navigation bar.

---

## HUD Zones

| Zone | Content | Always Visible |
|------|---------|---------------|
| Top-left | TMI logo + current section label | Yes |
| Top-right | User avatar + points balance + notification bell | Yes (logged in) |
| Bottom-center | Stream & Win mini-player (AudioSingleton) | Yes (when playing) |
| Bottom-right | Live room / cypher session indicator | When active |
| Full-screen overlay | Notification drawer, point event flash | On trigger |

---

## Global State Shape

The HUD reads from a global React context (or Zustand store) shared with the rest of the app.

```typescript
interface GlobalState {
  // User
  user: AuthUser | null;
  role: Role | null;
  pointsBalance: number;

  // Stream & Win (audio)
  audio: AudioState; // see STREAM_WIN_ENGINE.md

  // Live presence
  activeRoom: { id: string; type: 'live' | 'cypher' | 'game'; name: string } | null;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Feature flags
  flags: FeatureFlagMap;
}
```

---

## HUD Package Structure

```
packages/
├── hud-core/         — core data contracts, types, store interface
├── hud-runtime/      — React context provider, state manager
├── hud-theme/        — HUD visual tokens (colors, sizes, z-index)
└── hud-tmi/          — TMI-specific HUD skin (Berntout aesthetic)
```

---

## HUD Render Order (z-index hierarchy)

| Layer | z-index | Description |
|-------|---------|-------------|
| Page content | 0–10 | Normal page |
| Belt/module overlays | 20–50 | In-page floating elements |
| HUD persistent bar | 100 | Always-on top/bottom HUD bars |
| Notification overlay | 200 | Slides in from top/right |
| Point flash | 300 | Full-screen brief flash on big point event |
| Modal | 400 | Auth/confirmation modals |
| Critical alert | 500 | System error, session expiry |

---

## HUD Mount Point

The HUD is mounted ONCE in `apps/web/src/app/layout.tsx`:

```tsx
<HUDRuntimeProvider>
  <AudioSingleton />
  <HUDTopBar />
  <HUDBottomBar />
  <NotificationDrawer />
  {children}
</HUDRuntimeProvider>
```

---

## API Integration

| Data | Source | Refresh |
|------|--------|---------|
| Points balance | `/api/stream-win/my-stats` | On event + 60s poll |
| Notifications | `/api/notifications` | WebSocket push |
| Active room | Global socket state | Real-time |
| Feature flags | `/api/flags` | On mount + 5min stale |

---

## States

- Logged out: HUD shows minimal (logo + login button)
- Logged in: Full HUD bars visible
- Loading user data: skeleton avatar + "---" points display
- Points flash: "+15 pts" fades in/out over 1.5s when points are awarded
- New notification: bell badge count increments, bell animates
- Audio playing: mini-player slides up from bottom bar
- Active room: bottom-right badge shows room type + name

---

## Files To Create / Edit

| File | Action |
|------|--------|
| `packages/hud-core/src/types.ts` | CREATE/EXPAND — GlobalState interface |
| `packages/hud-runtime/src/HUDRuntimeProvider.tsx` | CREATE/EXPAND |
| `packages/hud-runtime/src/useGlobalState.ts` | CREATE |
| `packages/hud-theme/src/tokens.ts` | CREATE/EXPAND |
| `packages/hud-tmi/src/HUDTopBar.tsx` | CREATE |
| `packages/hud-tmi/src/HUDBottomBar.tsx` | CREATE |
| `packages/hud-tmi/src/NotificationDrawer.tsx` | CREATE |
| `packages/hud-tmi/src/PointsFlash.tsx` | CREATE |
| `apps/web/src/app/layout.tsx` | EDIT — mount HUD + AudioSingleton |
