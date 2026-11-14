# Live Mosaic Wall — Wiring Map

## Canonical engines (no duplicates)

| Engine | Path | Role |
|--------|------|------|
| GlobalLiveSessionRegistry | `lib/broadcast/globalLiveSessionStore.ts` | Session truth |
| DiscoveryBus | `lib/discovery/DiscoveryBus.ts` | Lobby wall + homepage feed |
| DiscoveryPublisher | `lib/discovery/DiscoveryPublisher.ts` | POST /api/live/go → bus (**FENCED**) |
| MediaPlayerGoLiveControl | `components/commandCenter/MediaPlayerGoLiveControl.tsx` | Publish authority (**FENCED**) |
| presentInstantGoLiveInPlace | `lib/dock/presentInstantGoLiveInPlace.ts` | Hub in-place GO LIVE (**FENCED**) |
| LiveLobbyMosaicScrollRail | `components/live/LiveLobbyMosaicScrollRail.tsx` | Legacy horizontal rail (kept; **not** mounted inline on hub) |
| MiniLiveLobbyWallRuntime | `components/lobby/MiniLiveLobbyWallRuntime.tsx` | **Canonical** hub discovery mosaic (LOBBY WALL) |
| LiveLobbyWallHost | `components/live/LiveLobbyWallHost.tsx` | Full wall surface |
| useHomeDiscoveryRotation | `lib/discovery/useHomeDiscoveryRotation.ts` | Home 1 13s orbit |

## Fan GO LIVE path

```
MediaPlayerGoLiveControl (role=fan)
 → presentInstantGoLiveInPlace({ role: FAN, publishSession: true })
 → executeInstantGoLive
 → resolveLiveDestination → fan-social-live / category fan-lobby
 → POST /api/live/go (admitGoLive mode=fan_lobby)
 → registerLiveSession + DiscoveryBus.upsert
 → LOBBY WALL → MiniLiveLobbyWallRuntime (YOU ARE LIVE / self tile)
 → Home orbit (13s)
```

## Performer GO LIVE path

Same pipeline with `role=PERFORMER`, category `live`, joinRoute `/hub/performer?watch=`.
Performer hub must **not** expose Fan avatar ownership (`tmi-quick-avatar-btn` absent — Rule 26).

## Watch (remote control)

```
Lobby Wall tile / WATCH
 → /hub/{fan|performer}?watch={roomId}&from=live-mosaic-rail
 → CommandCenterShell watch effect
 → useCanonicalMediaPlayerRuntime.setRoomId + SPLIT_2 layout
 → Universal Media Player (no /live/rooms hop)
```

## Self-discovery (2026-09-12 resume)

`MiniLiveLobbyWallRuntime` marks `data-live-mosaic-self="1"` when `publishedRoomId` or `hostUserId` matches viewer; shows `YOU ARE LIVE`; auto-selects Fan Lobbies / Live tab for the publisher’s category.

Inline `LiveLobbyMosaicScrollRail` stays **unmounted** on `CommandCenterMediaStack` so dual monitors are not displaced (hub-role-separation law).

## Role gates

- `LiveCapabilityPolicy`: FAN `canGoLiveFanSocial: true`, `canGoLivePerformer: false`
- `goLiveAdmitGate`: FAN → `fan_lobby` mode (listed on fan walls, not performer battles)
- `LiveDestinationRouter`: Fan explicit GO LIVE → `fan-lobby`, not performer stage
- MediaStack: AVATAR quick button only when `role === "fan"`
