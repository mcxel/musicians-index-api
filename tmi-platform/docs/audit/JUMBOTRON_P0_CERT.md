# JUMBOTRON P0 CERT — Automated Jumbotron Director + Physical Arena Geometry

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Status:** DONE (unit + wiring + Player Freedom + Dual-View + Presence + Comm) · OPEN (full physical 3D venue GLB proof)

## Laws enforced

1. Jumbotron = real world-space venue geometry (not HUD overlay)
2. Universal Media Player Experience Law — session owns truth; targets place views
3. SOURCE ≠ DECODER ≠ TARGET
4. No second player / camera / LiveSession / experience runtime
5. FOV/sphere from venue runtime config — never hardcoded 160° / 360×180
6. **UNIVERSAL PLAYER FREEDOM LAW** — [`UNIVERSAL_PLAYER_FREEDOM_LAW.md`](./UNIVERSAL_PLAYER_FREEDOM_LAW.md)
7. **DUAL-VIEW EXPERIENCE LAW** — recommendedAssignment only; no dedicated P1/P2
8. **PRESENCE CONTINUITY LAW** — secondary view never kills primary session
9. **DYNAMIC COMMUNICATION PLAYER LAW** — [`DYNAMIC_COMMUNICATION_PLAYER_LAW.md`](./DYNAMIC_COMMUNICATION_PLAYER_LAW.md)

## Geometry / sightline

| Environment | Architecture |
|-------------|--------------|
| INDOOR_ARENA | CENTER_HUNG_ARENA_JUMBOTRON |
| OUTDOOR_STADIUM | END_ZONE_DISPLAY |
| CLUB / PROSCENIUM | WALL_HANGING_LED |
| WORLD_DANCE_PARTY | CENTER_HUNG_DISCO_ORB |

Tiers certified: LOWER / MID / UPPER / FLOOR / VIP / SIDE / REAR.

## Player-law evidence (Gates 27–32)

| Gate | Law | Proof |
|------|-----|-------|
| 27 | Freedom | any source ↔ any player; RETURN at live cursor |
| 28 | Dual-View | `recommendedAssignment` PROGRAM+USER_CONTEXT; user can swap slots |
| 29 | Presence Continuity | lounge + chat; bokeh duck; session preserved |
| 30 | Dynamic Comm | battle on P1 protected → call on P2 |
| 31 | Comm compose | 1→2→3→4 layouts + reverse collapse; show continuous |
| 32 | Comm idle | idle primary takes call on P1 |

## Unit tests

```
pnpm exec jest --config jest.config.ts --testPathPatterns=runAutomatedJumbotronDirectorCertification --runInBand
→ 32 gates
```

## Artifacts / rollback

`.cursor/artifacts/jumbotron-p0/`  
Physical 3D production GLB remains OPEN.

```
git checkout eos/vocal-improv-clean -- \
  apps/web/src/lib/jumbotron \
  apps/web/src/lib/media/CanonicalUniversalPlayerFabric.ts \
  apps/web/src/lib/media/PresentationTargetResolver.ts \
  apps/web/src/components/jumbotron \
  apps/web/src/components/live/ArenaEventShell.tsx \
  apps/web/src/tests/runAutomatedJumbotronDirectorCertification.test.ts \
  docs/audit/JUMBOTRON_P0_CERT.md \
  docs/audit/UNIVERSAL_PLAYER_FREEDOM_LAW.md \
  docs/audit/DYNAMIC_COMMUNICATION_PLAYER_LAW.md
```
