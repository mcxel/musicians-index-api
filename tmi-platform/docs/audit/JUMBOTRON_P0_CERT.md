# JUMBOTRON P0 CERT — Automated Jumbotron Director + Physical Arena Geometry

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Status:** **PASS** (unit + wiring + Player Freedom + Dual-View + Presence + Comm + PHYSICAL LOOK UP + production AES mount + auditorium sightlines)

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

## Production mount path (closed)

```
ArenaEventShell
  → VenueAutomatedJumbotronMount (R3F VenueJumbotronGeometry3D / ArenaCenterHungJumbotron3D)
  → UniversalVenueRenderer
       → AudienceScene + AudienceSceneJumbotronLayer (same resolver architectures)
FanLobbyVenue → VenueAutomatedJumbotronMount (CLUB / WALL_HANGING_LED)
```

| Check | Verdict |
|-------|---------|
| AudienceScene R3F layer | **PASS** — `data-audience-scene-jumbotron-mounted=true` |
| Production LOOK UP | **PASS** — `/cypher` ArenaEventShell (FOCUS ↔ RETURN, presence preserved) |
| Auditorium sightlines | **PASS** — VIP house-side seating fix; `sightlines=true` on WALL_HANGING_LED |
| `/venue/preview` | Not required — production AES shells used instead |

## PHYSICAL LOOK UP (2026-09-02)

**Runner:** `node scripts/cert-physical-jumbotron-director.mjs` (+ production `/cypher` proof)  
**Surfaces:** `/cert/jumbotron-venue` (4 venues) + production `/cypher` AES mount

| Check | Verdict |
|-------|---------|
| PHYSICAL LOOK UP | **PASS** — Battle, Cypher, WDP, Auditorium |
| Tier sightlines | **PASS** — all four mounts `sightlines=true` incl. Auditorium wall-LED |
| Experience packs | **PASS** on venue mounts (harness cypher assert may stay flaky → PARTIAL if harness-only) |
| Player freedom (JUMBOTRON_FEED) | **PASS** — harness assign → `slot-7` |
| FOCUS/RETURN | **PASS** — cert `lookUp` + production `/cypher` toggle |
| Mobile / touch | **PASS** — `60-mobile-battle-lookup-390x844.png` |
| Overall physical | **PASS** |

### Physical evidence matrix

| Venue | Architecture | Experience | LOOK UP | RETURN | Pack |
|-------|--------------|------------|---------|--------|------|
| Battle | CENTER_HUNG_ARENA_JUMBOTRON | BATTLE_ARENA | PASS | PASS | scoreboard/timer |
| Cypher | CENTER_HUNG_ARENA_JUMBOTRON | CYPHER | PASS | PASS | collaborative / no winner |
| World Dance Party | CENTER_HUNG_DISCO_ORB | WORLD_DANCE_PARTY | PASS | PASS | disco orb |
| Auditorium (monday-stage) | WALL_HANGING_LED | AUDITORIUM | PASS | PASS | surface on-air |
| Production `/cypher` AES | CENTER_HUNG_ARENA_JUMBOTRON | CYPHER | PASS | PASS | AES + AudienceScene layer |

Artifacts: `.cursor/artifacts/jumbotron-p0/` (`cert-physical-report.json` + screenshots `10`–`72`).

### Open blockers

**None for P0.** `/venue/preview` remains performer/admin gated by design (unused for this cert). Hub YoPho left untouched (`7bd3fc6e`).

## Unit tests

```
pnpm exec jest --config jest.config.ts --testPathPatterns=runAutomatedJumbotronDirectorCertification --runInBand
→ 32 gates PASS
```

## Player-law evidence (Gates 27–32)

| Gate | Law | Proof |
|------|-----|-------|
| 27 | Freedom | any source ↔ any player; RETURN at live cursor |
| 28 | Dual-View | `recommendedAssignment` PROGRAM+USER_CONTEXT; user can swap slots |
| 29 | Presence Continuity | lounge + chat; bokeh duck; session preserved |
| 30 | Dynamic Comm | battle on P1 protected → call on P2 |
| 31 | Comm compose | 1→2→3→4 layouts + reverse collapse; show continuous |
| 32 | Comm idle | idle primary takes call on P1 |

## Artifacts / rollback

`.cursor/artifacts/jumbotron-p0/`

```
git checkout eos/vocal-improv-clean -- \
  apps/web/src/lib/jumbotron \
  apps/web/src/lib/media/CanonicalUniversalPlayerFabric.ts \
  apps/web/src/lib/media/PresentationTargetResolver.ts \
  apps/web/src/components/jumbotron \
  apps/web/src/components/live/ArenaEventShell.tsx \
  apps/web/src/components/live/AudienceScene.tsx \
  apps/web/src/components/live/UniversalVenueRenderer.tsx \
  apps/web/src/components/live/FanLobbyVenue.tsx \
  apps/web/src/tests/runAutomatedJumbotronDirectorCertification.test.ts \
  docs/audit/JUMBOTRON_P0_CERT.md \
  docs/audit/UNIVERSAL_PLAYER_FREEDOM_LAW.md \
  docs/audit/DYNAMIC_COMMUNICATION_PLAYER_LAW.md
```
