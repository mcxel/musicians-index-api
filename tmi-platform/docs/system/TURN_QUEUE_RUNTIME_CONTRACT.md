# TURN QUEUE RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the baseline runtime fields and controls for global turn/queue ownership so future Arena/Cypher systems do not fork queue logic.

---

## REQUIRED RUNTIME FIELDS

- `isOpen: boolean`
- `queue: QueueParticipant[]`
- `currentTurnId: string | null`
- `isTurnLocked: boolean`

`QueueParticipant` minimum:
- `id: string`
- `name: string`
- `role?: artist | producer | host | audience`

---

## REQUIRED CONTROLS

- `openQueue()`
- `closeQueue()`
- `enqueue(participant)`
- `dequeue(participantId)`
- `nextTurn()`
- `releaseTurnLock()`

---

## PHASE BOUNDARY

Current phase is scaffold-only:
- no battle rules
- no venue constraints
- no sponsor override
- no moderation policy binding

Those connect in later slices via adapters; this contract remains the state owner.

---

## CONFORMANCE RULE

Any room/battle/cypher module must consume this runtime owner (or a strict extension of it) and must not introduce parallel queue ownership.
