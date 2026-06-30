# RULE20_REMAINING.md

Rule 20 ledger: remaining mocks/placeholders/fake runtime behavior.
Scope in this pass is evidence-driven from inspected files only.

## Legend
- **Priority**: P0 / P1 / P2
- **Type**: Mock / Placeholder / Hardcoded / Simulated
- **Status**: Open / Replaced / Verified

---

## R20-001 — Simulated live chat messages

- **Priority**: P0
- **Type**: Simulated runtime
- **Status**: Open
- **File**: `apps/web/src/components/live/LiveChatPanel.tsx`
- **Evidence (line-level behavior)**:
  - Interval-based random feed generation.
  - Random usernames/content/colors/tips.
- **Why this violates Rule 20**:
  - Represents live social behavior with synthetic data instead of runtime truth.
- **Recommended replacement**:
  - Replace interval generator with runtime event subscription (socket/SSE/store) and persisted message APIs.
  - Add moderation/system message channels.

---

## R20-002 — Stage status static fallback payload

- **Priority**: P1
- **Type**: Placeholder fallback
- **Status**: Open
- **File**: `apps/web/src/app/api/stage/status/route.ts`
- **Evidence (line-level behavior)**:
  - Returns hardcoded fallback:
    - `state: 'CURTAIN_CLOSED'`
    - `showTitle: null`
    - `artistName: null`
- **Why this violates Rule 20**:
  - Non-runtime static state may mask real degraded/live conditions.
- **Recommended replacement**:
  - Return explicit degraded state with reason code and telemetry metadata.
  - Include backend reachability signal and stale-data policy.

---

## R20-003 — GO LIVE route contract ambiguity

- **Priority**: P0
- **Type**: Contract inconsistency (runtime risk)
- **Status**: Open
- **Files**:
  - Caller: `apps/web/src/components/performer/GoLiveControlPanel.tsx`
  - Route path present in tree: `apps/web/src/app/api/live/start/route.ts`
- **Evidence**:
  - Caller posts to `/api/live/go` while repository includes `/api/live/start/route.ts`.
- **Why this violates Rule 20 intent**:
  - Split/ambiguous contracts in critical path create pseudo-live behavior risk.
- **Recommended replacement**:
  - Canonicalize endpoint path and update all clients + docs + tests.

---

## R20-004 — Event-state routing chain relies on re-export aliases (needs hard verification)

- **Priority**: P2
- **Type**: Indirection risk
- **Status**: Open
- **Files**:
  - `apps/web/src/app/api/live/event/state/route.ts`
  - `apps/web/src/app/api/live/stage/status/route.ts`
  - `apps/web/src/app/api/stage/status/route.ts`
- **Evidence**:
  - Route chain is composed via re-exports.
- **Why this is tracked**:
  - Not a direct placeholder, but indirection can hide behavior drift if canonical route changes.
- **Recommended replacement**:
  - Add route-contract tests and ownership notes to ensure no silent drift.

---

## Not Yet Audited (Must Expand Rule 20 Scan)

The following areas likely contain additional Rule 20 candidates but were not line-level audited in this pass:

1. `apps/web/src/app/api/messages/route.ts`
2. `apps/web/src/components/messenger/*`
3. `apps/web/src/lib/memory/MemoryWallEngineV3.ts`
4. `apps/web/src/components/live/VenueImmersiveRoom.tsx`
5. `apps/web/src/components/live/AudienceScene.tsx`
6. Discovery/home/admin/analytics live consumer surfaces

---

## Closure Criteria

A Rule 20 item is only closed when:
1. Placeholder/simulated logic is removed or isolated outside production path.
2. Runtime-backed replacement is implemented and evidenced.
3. Regression tests or runtime probes verify behavior under real flow.
4. Certification docs are updated with PASS/PARTIAL/FAIL evidence.
