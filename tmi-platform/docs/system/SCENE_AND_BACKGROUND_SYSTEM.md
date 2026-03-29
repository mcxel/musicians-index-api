# SCENE_AND_BACKGROUND_SYSTEM.md
## Room Scenes, Backgrounds, and Visual Environments
### BerntoutGlobal XXL / The Musician's Index

---

## SCENE TYPES

Each room type has a set of allowed background scenes:

| Room Type | Available Scenes |
|---|---|
| Arena | Stadium night, Concert hall, Open air festival, Dark neon stage |
| Battle | Split stage city, Underground club, Warehouse, Boxing ring aesthetic |
| Cypher | Street corner, Rooftop, Studio booth, Park cipher |
| Producer Room | Studio console, Beat lab, Dark room neon, Vintage vinyl room |
| Watch Room | Cinema, Living room, VIP booth |
| Listening Party | Penthouse, Midnight studio, Garden |
| Backstage | Greenroom classic, Backstage corridor |
| Radio Room | Broadcast studio, Vintage radio booth |
| Podcast Room | Studio table, Podcast cave |

---

## SCENE ARCHITECTURE

```
Room is created → scene-director-bot assigns default scene for room type
Host can change scene (from allowed list) at any time
Scene change fires room.scene.changed event
All participants receive scene update via WebSocket
Background renders as CSS class + optional animated overlay
```

## SCENE LAYERS (Z-INDEX CONTEXT)

```
Layer 0: Scene background (static or animated)
Layer 1: Scene ambient overlay (fog, light rays, particles)
Layer 2: Performer stage area (always visible, never covered)
Layer 3+: All other HUD layers per OVERLAY_STACKING_SYSTEM.md
```

## SCENE CHANGE RULES

- Host/operator can change scene
- Scene changes cannot happen during active turn (respects NON_INTERFERENCE_PERFORMANCE_LAW)
- Scene change takes effect after current turn ends
- Transitions: crossfade 1000ms

## SCENE ASSET PATHS (R2)

```
tmi-media/scenes/arena/stadium-night/bg.jpg
tmi-media/scenes/arena/stadium-night/overlay.webm  (optional animated overlay)
tmi-media/scenes/battle/split-stage-city/bg.jpg
... etc
```

## AMBIENT SCENE ENGINE

For premium rooms, scenes can have subtle animation:
- Crowd movement (CSS keyframes, low-CPU)
- Light flicker (opacity pulse, 0.3s ease)
- Smoke/fog layer (looping WebM overlay, low bitrate)
- Neon glow pulse (CSS variable animation)

Rule: Ambient animations never exceed 5% CPU on mid-tier phone.
