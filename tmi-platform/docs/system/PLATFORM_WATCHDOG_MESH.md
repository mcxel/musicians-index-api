# PLATFORM WATCHDOG MESH
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED RELIABILITY AUTHORITY

---

## WATCHDOG LAW

Every major engine, page family, room type, venue system, and automation surface must have:
- health checks
- stuck-state detection
- auto-recovery action
- degraded mode fallback
- escalation path
- telemetry trail
- operator visibility

If a surface can fail and has no watchdog path, it is PARTIAL by definition.

---

## WATCHDOG TIERS

### Tier 1 — Surface Watchdogs
Coverage:
- homepage belts
- magazine spreads
- article pages
- artist profile surfaces
- sponsor and leaderboard boards

Detect:
- failed loads
- stale cards
- dead actions
- missing fallback visuals

### Tier 2 — Room Watchdogs
Coverage:
- arena rooms
- cypher rooms
- mini cypher rooms
- producer rooms
- watch/listen rooms

Detect:
- stuck queue/turn lock
- media lock not releasing
- host disconnect
- timer freeze
- scene restore failure

### Tier 3 — A/V Watchdogs
Coverage:
- shared preview
- audio singleton
- dual mixer
- live media transitions

Detect:
- silent playback
- clipping
- media ownership mismatch
- transition glitches

### Tier 4 — Game Watchdogs
Coverage:
- game night and battle game flows

Detect:
- round/timer desync
- score corruption
- vote fraud
- payout mismatch

### Tier 5 — Economy Watchdogs
Coverage:
- points, rewards, leaderboard, payouts, sponsor delivery

Detect:
- duplicate posting
- negative balance bugs
- mismatch between events and ledger

### Tier 6 — Bot Supervisory Watchdogs
Coverage:
- all automation bots

Detect:
- missed trigger
- duplicate fire
- runaway loops
- cross-bot conflicts

---

## MESH CONTRACT

Every watchdog must define:
1. what it watches
2. threshold/trigger
3. auto-fix scope
4. cannot-fix conditions
5. escalation destination
6. rollback-safe action
7. telemetry emitted

---

## ESCALATION LEVELS

- L1: auto-retry in place
- L2: local reset + degraded mode
- L3: operator warning + temporary feature freeze
- L4: admin override required
- L5: incident state + rollback workflow

---

## REQUIRED TELEMETRY FIELDS

- watchdogName
- engineName
- surfaceName
- roomOrRouteId
- eventType
- severity
- autoActionTaken
- escalationLevel
- recovered
- correlationId
- timestamp

---

## COMPLETION RULE

A system can be COMPLETE only if:
- primary function is wired
- watchdog path is wired
- degraded fallback is visible and usable
- operator can observe and intervene
