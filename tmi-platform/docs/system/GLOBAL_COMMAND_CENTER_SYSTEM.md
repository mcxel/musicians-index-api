# GLOBAL COMMAND CENTER SYSTEM
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED OPS AUTHORITY

---

## PURPOSE

Provide one operator surface for live control, health visibility, escalation handling, and emergency recovery across all engines.

---

## PRIMARY CAPABILITIES

1. Global health map
2. Room and game control
3. Preview/audio state control
4. Queue and turn intervention
5. Sponsor/prize slot monitoring
6. Bot health and supervisor controls
7. Incident timeline and rollback actions
8. Emergency broadcast announcements

---

## REQUIRED PANELS

- System Health Grid
- Active Rooms Panel
- Queue/Turn Integrity Panel
- A/V Health Panel
- Bot Supervisor Panel
- Incident Timeline Panel
- Recovery Actions Panel
- Feature Flag Emergency Panel

---

## OPERATOR ACTIONS

- force release turn lock
- freeze/unfreeze room
- reset preview stage
- switch to degraded mode
- reassign host/mod
- force stop sponsor slot
- trigger emergency announcement
- open rollback playbook

---

## ACCESS CONTROL

Roles:
- SUPER_ADMIN: full authority
- OPERATOR: operational controls
- MODERATOR: room-scoped controls
- ANALYST: read-only telemetry views

All command actions must be logged with actor identity and correlation id.

---

## API CONTRACTS (MINIMUM)

- GET /api/ops/health
- GET /api/ops/incidents
- POST /api/ops/room/:id/freeze
- POST /api/ops/room/:id/unfreeze
- POST /api/ops/room/:id/reassign-host
- POST /api/ops/preview/:roomId/reset
- POST /api/ops/queue/:roomId/release-lock
- POST /api/ops/announcement/broadcast

---

## UI LAW

Command Center must follow PDF control-panel language:
- high-contrast dark surface
- panel grouping
- clear severity signaling
- no generic dashboard visuals

---

## SUCCESS CRITERIA

Command Center is complete when operators can detect, contain, and recover a live incident without direct code changes.
