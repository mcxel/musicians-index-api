# SYSTEM_FAILURE_FALLBACK.md
## What Happens When Anything Breaks

---

## CORE RULE
The user NEVER sees a broken experience.
If anything fails, the system silently falls back to the next best state.
No blank screens. No frozen rooms. No dead silence.

---

## FAILURE CATEGORIES AND RESPONSES

### Animation Failure
| What Fails | Fallback |
|---|---|
| Room transformation animation | Skip to final room state instantly |
| Curtain animation | Snap curtain to open/closed position |
| Light animation | Default to static base lighting |
| Julius animation | Julius goes static sprite |
| VEX animation | VEX skips to end position |
| Crowd animation | Crowd goes to static wave silhouettes |

### Audio Failure
| What Fails | Fallback |
|---|---|
| Transformation celebration audio | Silent but visual completes |
| Background music | Silence (not jarring) |
| Crowd audio | Remove crowd layer |
| Artist performance audio | Show buffering indicator |
| Julius sounds | Silent Julius |
| VEX proximity audio | Visual warning only |

### Lighting Failure
| What Fails | Fallback |
|---|---|
| Moving light rigs | Default static warm white |
| Tier color effects | Base room ambient |
| Reactive lighting | Static ambient |
| Curtain reveals | Lights stay at base |

### Camera Failure
| What Fails | Fallback |
|---|---|
| Auto camera director | Wide shot locked |
| Dynamic cuts | Static wide |
| Performer camera | Stage front default |
| VIP box camera | Wide shot |

### Sync Failure
| What Fails | Fallback |
|---|---|
| Viewer desyncs | Soft resync (invisible to user) |
| Hard desync (>500ms) | Hard resync + brief overlay |
| Multiple venue desync | Each venue independent |
| Total sync loss | Session recovery protocol |

### Stream Failure
| What Fails | Fallback |
|---|---|
| Artist stream drops | Buffering overlay + Julius helper message |
| Stream quality degrades | Auto-quality reduction |
| Total stream loss | Recovery engine activates |

---

## FALLBACK PRIORITY CASCADE

```
Full Experience (target)
    ↓ if resources constrained
Reduced FX (keep audio + crowd)
    ↓ if still constrained
Lite Mode (sprites, minimal FX)
    ↓ if still constrained
Static Mode (no animation, audio only)
    ↓ if audio fails
Text Mode (Julius text, no audio/visual)
```

---

## JULIUS FAILURE HANDLING

Julius is the user-facing indicator that something is happening:

| Situation | Julius Does |
|---|---|
| Room loading | Julius shows "setting the stage" message |
| Stream buffering | Julius shows patience animation + tip |
| Reconnecting | Julius shows "be right back" pose |
| Error occurred | Julius shows helpful error card |
| Anti-dead-air active | Julius steps in with content |

---

## ANTI-DEAD-AIR SYSTEM

When silence or inactivity exceeds 8 seconds during a live event:

1. Julius activates
2. Plays short ambient hype action
3. Deploys poll or tip board
4. Crowd ambient audio softens (not killed)
5. Host may be prompted to fill
6. Auto-end only after 120s of total inactivity

---

# PERFORMANCE_SCALING_ENGINE.md
## Scaling Performance for Any Device and Any Crowd Size

---

## TARGET PERFORMANCE

| Device | Target FPS | Target Load |
|---|---|---|
| Desktop High-End | 60fps | Full quality |
| Desktop Mid | 60fps | Reduced FX |
| Desktop Low | 30fps | Lite mode |
| Mobile High | 45fps | Optimized |
| Mobile Mid | 30fps | Lite mode |
| Mobile Low | 24fps | Minimal |

---

## CROWD SCALING BY VIEWER COUNT

| Viewers | Crowd Rendering |
|---|---|
| 1–30 | Full 3D avatars all rows |
| 31–100 | Full 3D front 3 rows, simplified back |
| 101–500 | Full 3D front 2 rows, crowd wave behind |
| 501–2,000 | Full 3D front row only, animated waves |
| 2,000–10,000 | Animated wave silhouettes only |
| 10,000+ | Particle crowd system |

---

## ASSET LOADING STRATEGY

```
PRIORITY 1: Artist stream / stage (loads first)
PRIORITY 2: Front row seats + crowd
PRIORITY 3: Room shell / walls
PRIORITY 4: Lighting rigs
PRIORITY 5: Background crowd
PRIORITY 6: Ambient effects (optional, last)
```

---

## LEVEL OF DETAIL (LOD) RULES

| Distance | Detail Level |
|---|---|
| Front row (close) | Full avatar, full animation |
| Mid rows | Simplified avatar, key animations |
| Back rows | Simplified silhouette |
| Distant/overflow | Particle crowd |

---

## AUTO-DOWNGRADE TRIGGERS

| Condition | Auto Action |
|---|---|
| CPU > 80% | Reduce crowd to waves |
| Memory > 70% | Disable background FX |
| FPS drops below target | Reduce simultaneous animations |
| Network > 500ms | Reduce stream quality |
| Mobile detected | Auto lite mode |
| Battery < 20% | Power-saver mode |

---

# STREAM_DISTRIBUTION_ENGINE.md
## Delivering Live Events to Every Viewer Reliably

---

## PURPOSE
The engine that gets the performance to every viewer's screen cleanly, with minimal latency, globally.

---

## DISTRIBUTION ARCHITECTURE

```
ARTIST STREAM SOURCE
    ↓
INGEST SERVER (closest to artist)
    ↓
TRANSCODING LAYER (multiple quality levels)
    ↓
CDN EDGE NETWORK (Cloudflare or equivalent)
    ↓ distributed to edge locations
VIEWER CLIENTS (everywhere)
```

---

## STREAM QUALITY TIERS

| Quality | Resolution | Bitrate | Use Case |
|---|---|---|---|
| Ultra | 1080p/60fps | 8 Mbps | Desktop premium |
| High | 1080p/30fps | 4 Mbps | Desktop standard |
| Medium | 720p/30fps | 2 Mbps | Mobile standard |
| Low | 480p/30fps | 1 Mbps | Weak connection |
| Audio-only | N/A | 128kbps | Emergency fallback |

---

## AUTO QUALITY SELECTION

Client tests connection on join:
- Measures bandwidth
- Selects appropriate quality tier
- Auto-adjusts if connection changes
- User can override manually

---

## CLOUDFLARE INTEGRATION

- Cloudflare Pages: web app delivery
- Cloudflare Stream: live video delivery
- Cloudflare Workers: edge state sync
- Cloudflare R2: asset storage
- All services must be green before any live event ships

---

## WORLD CONCERT DISTRIBUTION

For World Concert mode (unlimited viewers, multiple venues):
1. One master stream per artist
2. CDN distributes to venue-specific endpoints
3. Each venue gets independent client connection
4. Global state master tracks all venue counts
5. City pins and global counter update via lightweight API (not stream)

---

*Failure Fallback + Performance Scaling + Stream Distribution v1.0 — BerntoutGlobal XXL*
