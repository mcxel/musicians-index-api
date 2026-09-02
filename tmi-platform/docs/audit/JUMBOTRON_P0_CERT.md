# JUMBOTRON P0 CERT — Automated Jumbotron Director + Physical Arena Geometry

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Status:** DONE (unit + wiring + Player Freedom + Dual-View + Presence + Comm) · **PHYSICAL PARTIAL** (LOOK UP PASS on 4 venue mounts; production GLB mesh still open)

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

## PHYSICAL LOOK UP (2026-09-02)

**Runner:** `node scripts/cert-physical-jumbotron-director.mjs`  
**Surface:** public `/cert/jumbotron-venue` (same `VenueAutomatedJumbotronMount` as `ArenaEventShell`)  
**Note:** `/venue/preview` is middleware-protected (performer/admin); cert uses the public AES mount path.

| Check | Verdict |
|-------|---------|
| PHYSICAL LOOK UP | **PASS** — Battle, Cypher, WDP, Auditorium (monday-stage) |
| Tier sightlines | **PARTIAL** — Battle/Cypher/WDP `sightlines=true` with LOWER/MID/UPPER/FLOOR/VIP/SIDE/REAR; Auditorium wall-LED reports `sightlines=false` (aux path) |
| Experience packs | **PASS** on venue mounts (battle timer/scoreboard, cypher no-winner, WDP disco orb, auditorium surface); harness cypher assert flaky → treat packs as **PARTIAL** if harness-only |
| Player freedom (JUMBOTRON_FEED) | **PASS** — harness assign → `slot-7` (mutable, not dedicated) |
| FOCUS/RETURN | **PASS** — `lookUp=1` ↔ `lookUp=0`; `data-presence-session` preserved |
| Mobile / touch | **PASS** — `60-mobile-battle-lookup-390x844.png` |
| Overall physical | **PARTIAL** |

### Physical evidence matrix

| Venue | Architecture | Experience | LOOK UP | RETURN | Pack |
|-------|--------------|------------|---------|--------|------|
| Battle | CENTER_HUNG_ARENA_JUMBOTRON | BATTLE_ARENA | PASS | PASS | scoreboard/timer |
| Cypher | CENTER_HUNG_ARENA_JUMBOTRON | CYPHER | PASS | PASS | collaborative / no winner |
| World Dance Party | CENTER_HUNG_DISCO_ORB | WORLD_DANCE_PARTY | PASS | PASS | disco orb |
| Auditorium (monday-stage) | WALL_HANGING_LED | AUDITORIUM | PASS | PASS | surface on-air |

Artifacts: `.cursor/artifacts/jumbotron-p0/` (`cert-physical-report.json` + screenshots `10`–`60`).

### Open blockers (honest)

1. **Production GLB / R3F multi-face mesh** — `ArenaCenterHungJumbotron3D` exists but is **not** mounted inside `AudienceScene` / live AES path. Physical proof uses world-space `VenueAutomatedJumbotronMount` (architecture + sightline metadata real).
2. **`/venue/preview` auth gate** — performer/admin only; physical cert uses `/cert/jumbotron-venue`.
3. **Auditorium sightline certify flag** — wall-LED path reports `data-sightlines-certified=false` while tiers still sample; needs aux-display follow-up, not LOOK UP wiring.

## Artifacts / rollback

`.cursor/artifacts/jumbotron-p0/`

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
