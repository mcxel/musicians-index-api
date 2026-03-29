# COPILOT EXECUTION PACK — RELIABILITY PHASE
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23

Use this after Phase 1 runtime slices.

---

## AUTHORITIES TO FOLLOW

- UNIVERSAL_WIRING_LAW.md
- MASTER_WIRING_MAP.md
- ENGINE_DEPENDENCY_ORDER.md
- PLATFORM_WATCHDOG_MESH.md
- GLOBAL_COMMAND_CENTER_SYSTEM.md
- ENGINE_RUNTIME_CONTRACTS.md
- SESSION_RECOVERY_AND_REJOIN_SYSTEM.md

---

## SCOPE

Build reliability infrastructure without broad UI redesign.

Target systems:
1. watchdog mesh foundation
2. command center MVP
3. runtime contract enforcement
4. session recovery/rejoin MVP

---

## MINIMUM SAFE IMPLEMENTATION PATH

### Step 1 — Watchdog event contract
Create shared watchdog event schema in backend + frontend types.

### Step 2 — Room + A/V watchdog MVP
Implement watchdog checks for:
- stuck preview lock
- queue lock timeout
- media playback failure fallback

### Step 3 — Command Center read-only health panel
Create operator route with:
- system health grid
- active room list
- incident list

### Step 4 — Controlled actions (small)
Add only these operator actions first:
- reset preview in room
- release stuck queue lock
- freeze/unfreeze room

### Step 5 — Session rejoin MVP
Implement:
- rejoin endpoint
- snapshot restore
- safe observer fallback when validation fails

### Step 6 — Proof and rollback
- proof scenarios for each step
- rollback toggle via feature flags

---

## BETTER IMPLEMENTATION PATH

- Add bot supervisor watchdog views
- Add incident timeline correlation
- Add queue/turn reconciliation dashboard
- Add role-aware escalation controls

---

## BEST LONG-TERM IMPLEMENTATION PATH

- full watchdog mesh automation per engine family
- command center with runbooks and one-click guided recovery
- contract health gates in CI
- predictive reliability scoring and proactive operator alerts

---

## DELIVERABLE FORMAT (FOR EACH SLICE)

Return:
1. first broken reliability wire
2. smallest patch applied
3. exact files changed
4. proof run result
5. remaining risk
6. rollback path

Do not mark slice complete if watchdog + degraded mode are missing.
