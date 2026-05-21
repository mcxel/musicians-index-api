# CACHING_STRATEGY.md
## What Gets Cached, Where, For How Long
### BerntoutGlobal XXL / The Musician's Index

---

## CACHE LAYERS

```
Browser Cache → Cloudflare Edge Cache → Redis App Cache → PostgreSQL
```

---

## CACHE BY DATA TYPE

| Data | Cache Layer | TTL | Invalidation |
|---|---|---|---|
| Artist profiles | Redis + CDN | 5 min | On profile edit |
| Venue pages | Redis + CDN | 10 min | On venue edit |
| Published articles | CDN | 1 hour | On article publish |
| Active room list | Redis | 5 sec | On room join/leave |
| Viewer counts | Redis | 1 sec | Real-time (no cache) |
| Beat marketplace | Redis + CDN | 30 min | On beat update |
| Leaderboards | Redis | 1 min | On ranking update |
| Search results | Redis | 30 sec | On entity change |
| Session tokens | Redis | 7 days | On logout/refresh |
| Feature flags | Redis | 60 sec | On flag update |
| World activity | Redis | 5 min | On world simulation tick |

---

## REDIS KEY PATTERNS

```
session:{userId}            → user session
room:{roomId}:state         → room state
room:{roomId}:roster        → active roster
rooms:active                → active room list (sorted set)
artist:{slug}:profile       → artist profile cache
flags:all                   → feature flags registry
search:{query}:{type}       → search results
leaderboard:weekly          → weekly rankings
world:activity              → world simulation state
```

---

## CACHE INVALIDATION RULES

On artist profile update:
```
DEL artist:{slug}:profile
Purge Cloudflare cache for /artists/{slug}
```

On room join/leave:
```
UPDATE rooms:active (sorted set, score = viewerCount)
PUBLISH room:{roomId} viewer_update
```

On feature flag change:
```
SET flags:all {new flags}
PUBLISH flags:changed {flagName}
```
