# P0_LAUNCH_BLOCKERS.md

Behavior-first launch blockers that must be resolved before soft-launch certification.

## P0-1 — Canonical GO LIVE contract mismatch risk

- **Severity**: P0
- **Status**: Open
- **Evidence**:
  - `apps/web/src/components/performer/GoLiveControlPanel.tsx` posts to `/api/live/go`.
  - Repository path inventory includes `apps/web/src/app/api/live/start/route.ts`.
- **Why blocker**:
  - Live session chain can fail at entry point if clients/routes diverge.
- **Exit criteria**:
  1. One canonical go-live endpoint documented and implemented.
  2. All callers updated to canonical path.
  3. Integration trace proving session registration path.

---

## P0-2 — Live Chat realism is simulated (not runtime-backed)

- **Severity**: P0
- **Status**: Open
- **Evidence**:
  - `apps/web/src/components/live/LiveChatPanel.tsx` generates random chat events with `setInterval` and `Math.random`.
- **Why blocker**:
  - Fails blueprint requirement for true social runtime behavior.
- **Exit criteria**:
  1. Runtime-backed transport/store bound to chat panel.
  2. Basic moderation and system event lanes present.
  3. Evidence of persisted/real-time message flow in live room.

---

## P0-3 — Live Session Chain propagation not certified end-to-end

- **Severity**: P0
- **Status**: Open
- **Evidence**:
  - Runtime registry exists in `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`.
  - No verified evidence yet of fan-out updates to homepage/discovery/search/followers/notifications/admin/venue/analytics in this pass.
- **Why blocker**:
  - Blueprint requires instant ecosystem-wide updates on GO LIVE.
- **Exit criteria**:
  1. File-level consumer map for each surface.
  2. Verified propagation test for each required surface.
  3. Failure alerts for broken propagation links.

---

## P0-4 — Rule 20 unresolved placeholders in critical live flow

- **Severity**: P0
- **Status**: Open
- **Evidence**:
  - Simulated chat feed is confirmed placeholder runtime.
  - Stage status API can fall back to static placeholder state (`CURTAIN_CLOSED`) in `apps/web/src/app/api/stage/status/route.ts`.
- **Why blocker**:
  - Placeholder logic in critical runtime paths undermines launch realism.
- **Exit criteria**:
  1. Placeholder inventory completed for live-critical paths.
  2. Each placeholder has replacement owner + ETA.
  3. P0 placeholder count reduced to zero for go-live critical paths.

---

## P0-5 — Performance certification missing for required concurrency tiers

- **Severity**: P0
- **Status**: Open
- **Evidence**:
  - No inspected benchmark artifact proving 20/100/500/1000 user targets with FPS/CPU/memory/network telemetry.
- **Why blocker**:
  - Cannot assert launch readiness under realistic audience load.
- **Exit criteria**:
  1. Benchmark harness and test scripts defined.
  2. Result artifacts for all four tiers.
  3. Threshold pass/fail criteria documented and met (or waived with explicit risk acceptance).

---

## P0 Summary Table

| ID | Blocker | Owner (Suggested) | Current State |
|---|---|---|---|
| P0-1 | GO LIVE endpoint contract | Live Session Platform | Open |
| P0-2 | Runtime-backed chat | Communication Runtime | Open |
| P0-3 | End-to-end propagation chain | Runtime Integration | Open |
| P0-4 | Rule 20 placeholders in live path | Build Director + Runtime Owners | Open |
| P0-5 | Performance certification | Perf/Infra | Open |

---

## Gate Condition

**Soft-launch cannot be marked behavior-certified until all P0 items are closed or explicitly risk-accepted with executive sign-off and rollback strategy.**
