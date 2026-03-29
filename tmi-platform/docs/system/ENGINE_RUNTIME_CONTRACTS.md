# ENGINE RUNTIME CONTRACTS
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED COMPLETENESS AUTHORITY

---

## PURPOSE

Define measurable runtime requirements for each engine so completion is objective and auditable.

---

## BASE CONTRACT (APPLIES TO EVERY ENGINE)

Each engine must declare:
1. route/surface entry
2. provider/state owner
3. API contract
4. DB/config contract
5. HUD integration (if applicable)
6. A/V integration (if applicable)
7. points/economy hook (if applicable)
8. admin/operator control path
9. watchdog coverage
10. degraded mode
11. proof test
12. rollback path

If any declared required field is missing, engine status = PARTIAL.

---

## CONTRACT TEMPLATE

Engine Name:
- Surface(s):
- Provider Owner:
- API Endpoints:
- DB Models / Config Keys:
- HUD Hooks:
- A/V Hooks:
- Points Hooks:
- Admin Controls:
- Watchdogs:
- Degraded Mode:
- Proof Gate:
- Rollback Procedure:

---

## INITIAL CONTRACT SET (PHASE 1 PRIORITY)

### Audio Engine
- Provider Owner: AudioProvider
- API: stream win playback and source validation
- DB: StreamEvent, SavedTrack
- HUD Hooks: nowPlaying, playback state
- Watchdog: A/V watchdog

### HUD Engine
- Provider Owner: HudRuntimeProvider
- API: ops health + notification summary
- DB: Hub, FeatureFlag
- Watchdog: surface watchdog + ops watchdog

### Artist/Profile Engine
- Surface: /artists/[slug]
- Provider Owner: profile runtime provider (or route-level state)
- API: profile read contracts
- DB: Artist, MusicLink, Article relation
- Watchdog: profile data integrity watchdog

### Homepage Belt Engine
- Surface: /
- Provider Owner: belt runtime state
- API: live belts/discovery payload
- DB/Config: feature flags + content config
- Watchdog: belt load/rotation watchdog

---

## CONTRACT ENFORCEMENT

- CI should fail when required contract section is absent for an engine in active development.
- Operator panel should expose contract health state per engine.
