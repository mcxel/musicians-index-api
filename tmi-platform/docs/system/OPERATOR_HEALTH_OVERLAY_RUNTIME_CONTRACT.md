# OPERATOR HEALTH OVERLAY RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the minimum observability contract for the Operator Health Overlay scaffold.

---

## REQUIRED RUNTIME INPUTS

The overlay must read from:
- useAudio
- useSharedPreview
- useTurnQueue
- useRoomWatchdog
- useSessionRecovery

The overlay is read-first and not a runtime owner.

---

## REQUIRED DISPLAY FIELDS

- audio state (idle/playing/paused)
- preview open/closed and preview status
- queue length
- current turn id
- room watchdog health
- room status
- recovery mode
- resumable yes/no

---

## SEVERITY LABELS

Minimum labels:
- healthy
- warning
- degraded
- stuck

Color/tone mapping follows platform HUD/control language.

---

## FUTURE SLOTS (DECLARED)

- escalation slot
- command center handoff slot
- incident timeline slot
- venue/operator context slot
- sponsor/commercial health slot

---

## CONFORMANCE RULE

The overlay must not introduce orchestration logic in scaffold phase and must not duplicate state ownership. It may only consume runtime owners and render health views.
