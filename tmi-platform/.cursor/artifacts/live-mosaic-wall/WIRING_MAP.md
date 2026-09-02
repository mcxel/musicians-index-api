# Live Mosaic Wall — Wiring Map

## Canonical engines (no duplicates)

| Engine | Path | Role |
|--------|------|------|
| GlobalLiveSessionRegistry | `lib/broadcast/globalLiveSessionStore.ts` | Session truth |
| DiscoveryBus | `lib/discovery/DiscoveryBus.ts` | Lobby wall + homepage feed |
| DiscoveryPublisher | `lib/discovery/DiscoveryPublisher.ts` | POST /api/live/go → bus |
| MediaPlayerGoLiveControl | `components/commandCenter/MediaPlayerGoLiveControl.tsx` | Publish authority |
| presentInstantGoLiveInPlace | `lib/dock/presentInstantGoLiveInPlace.ts` | Hub in-place GO LIVE |
| LiveLobbyMosaicScrollRail | `components/live/LiveLobbyMosaicScrollRail.tsx` | Hub mosaic scroll |
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
 → LiveLobbyMosaicScrollRail + Home orbit (13s)
```

## Performer GO LIVE path

Same pipeline with `role=PERFORMER`, category `live`, joinRoute `/hub/performer?watch=`.

## Watch (remote control)

```
Mosaic tile tap
 → /hub/{fan|performer}?watch={roomId}&from=live-mosaic-rail
 → CommandCenterShell watch effect
 → useCanonicalMediaPlayerRuntime.setRoomId + SPLIT_2 layout
 → Universal Media Player (no /live/rooms hop)
```

## Self-discovery

`LiveLobbyMosaicScrollRail` marks `data-live-mosaic-self="1"` when `publishedRoomId` or `hostUserId` matches viewer; auto `scrollIntoView` on publish.

## Role gates

- `LiveCapabilityPolicy`: FAN `canGoLiveFanSocial: true`, `canGoLivePerformer: false`
- `goLiveAdmitGate`: FAN → `fan_lobby` mode (listed on fan walls, not performer battles)
- `LiveDestinationRouter`: Fan explicit GO LIVE → `fan-lobby`, not performer stage
