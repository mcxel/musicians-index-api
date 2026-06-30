# P1_REFINEMENT_QUEUE.md

High-priority refinements after P0 launch blockers are resolved.

## RQ-001 — Stage degraded-mode semantics and observability
- **Priority**: P1
- **Status**: Open
- **Evidence**:
  - `apps/web/src/app/api/stage/status/route.ts` static fallback response.
- **Goal**:
  - Replace generic fallback with explicit degraded-state schema and surfaced diagnostics.
- **Done when**:
  - UI can distinguish live/offline/degraded states.
  - Telemetry emits backend availability transitions.

---

## RQ-002 — CRM role-level certification matrix
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify each profile type (Performer/Fan/Venue/Promoter/Writer/Sponsor/Executive):
    - Identity, business, media, analytics, revenue, memory, inventory, messaging, status.
- **Done when**:
  - Each panel has source-of-truth, API/runtime contract, and pass/partial/fail evidence.

---

## RQ-003 — Memory wall end-to-end lifecycle certification
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify capture → tag → group → share → favorite → download → timeline → discovery.
- **Done when**:
  - Each lifecycle step is runtime-backed and evidenced by file/API/tests.

---

## RQ-004 — Communication parity beyond base chat
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify typing indicators, read receipts, presence, moderation actions, room/system announcements, private/group flows.
- **Done when**:
  - Feature matrix is evidenced and live-room behavior is consistent across comm surfaces.

---

## RQ-005 — Runtime humanity behavior pack
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify differentiated audience and performer behaviors (attention, reaction variance, micro-movement cadence).
- **Done when**:
  - Behavior systems are data-driven and measurable, not static loops.

---

## RQ-006 — Discovery and feed ranking integrity
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify that live session updates and rankings are reflected in discovery/home/search/billboards with deterministic rules.
- **Done when**:
  - Ranking + freshness logic documented and observed under live updates.

---

## RQ-007 — Audio/lighting consistency audit hooks
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Add auditable checks for runtime audio cues and lighting state transitions tied to events.
- **Done when**:
  - Event-driven cue map exists and is testable in live venue flows.

---

## RQ-008 — Motion language consistency
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Certify panel open/close transitions follow consistent animation standards (timing/easing/physics feel).
- **Done when**:
  - Motion tokens and transition references are centralized and adopted by core panels.

---

## RQ-009 — Rule 20 medium-priority cleanup wave
- **Priority**: P1
- **Status**: Open
- **Goal**:
  - Remove remaining non-critical placeholders after P0 critical path is clean.
- **Done when**:
  - Rule20 ledger shows no P1 placeholders in core journey paths.

---

## Execution Order (Recommended)
1. RQ-001
2. RQ-002
3. RQ-003
4. RQ-004
5. RQ-006
6. RQ-005
7. RQ-007
8. RQ-008
9. RQ-009
