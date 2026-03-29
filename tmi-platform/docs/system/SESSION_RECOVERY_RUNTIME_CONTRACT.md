# SESSION RECOVERY RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the minimum session recovery scaffold contract before full reconnect orchestration is implemented.

---

## REQUIRED SNAPSHOT FIELDS

A recovery snapshot must include:

- `capturedAt`
- audio presence/state:
  - has track
  - is playing
- preview presence/state:
  - is open
  - has content
  - source type
  - status
- queue/turn state:
  - queue size
  - current turn id
  - is turn locked
- room/watchdog state:
  - room status
  - watchdog health

---

## REQUIRED RUNTIME OUTPUTS

- `snapshot`
- `recoveryMode` (`resumable | non_resumable | observer_only`)
- `isResumable`
- `markRecoverable()`
- `clearRecovery()`
- `restorePlaceholder()`

---

## RESUMABLE RULES (SCAFFOLD)

- `resumable`: snapshot exists and watchdog state is not degraded/stuck
- `non_resumable`: snapshot exists but health indicates unsafe full restore
- `observer_only`: stuck state requires safe observer fallback

---

## OBSERVER FALLBACK RULE

When `observer_only`, runtime may rejoin the session without reclaiming control ownership (turn lock, active preview ownership, or host-critical actions).

---

## FUTURE HOOKS (DECLARED)

- reconnect orchestration hooks
- host/operator recovery hooks
- room-type-specific recovery policies
- logging and incident timeline hooks
- venue/event restore policy hooks

---

## CONFORMANCE RULE

Session recovery logic must consume shared runtime owners and must not duplicate ownership of audio, preview, queue/turn, or room health state.
