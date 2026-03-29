# ROOM WATCHDOG RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define detection-only watchdog runtime inputs and health outputs for room systems before recovery orchestration is introduced.

---

## INPUTS WATCHED (MINIMUM)

- queue validity
- current turn validity
- preview open duration
- preview stuck duration
- basic room status (`idle | active | paused`)

---

## HEALTH STATES

- `healthy`
- `warning`
- `degraded`
- `stuck`

### Minimum evaluation semantics
- `warning`: preview open beyond warning threshold
- `degraded`: invalid queue or invalid current turn state
- `stuck`: preview exceeds stuck threshold (or future critical stuck conditions)

---

## THRESHOLDS (SCAFFOLD DEFAULTS)

- warning threshold: 45s
- stuck threshold: 120s

Thresholds are runtime constants in current scaffold and may move to config/feature flags in later phases.

---

## FUTURE HOOKS (DECLARED, NOT IMPLEMENTED YET)

- recovery orchestration hooks
- operator escalation hooks
- structured telemetry/logging hooks
- moderation integration hooks
- venue/event escalation hooks

---

## CONFORMANCE RULE

Room environments must consume this watchdog owner (or a strict extension) and must not create parallel, conflicting health-state owners.
