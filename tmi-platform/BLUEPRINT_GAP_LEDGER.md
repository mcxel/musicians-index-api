# BLUEPRINT_GAP_LEDGER.md

Evidence-driven ledger of behavior/runtime gaps against blueprint certification targets.

## Legend
- **Severity**: P0 (launch blocker), P1 (high), P2 (medium)
- **Status**: Open / In Progress / Verified
- **Confidence**: High (direct file evidence), Medium (path evidence), Low (needs inspection)

---

## G-001 — Live Chat is simulation-based, not runtime-backed
- **Severity**: P0
- **Status**: Open
- **Confidence**: High
- **Blueprint Area**: Communication / Runtime Humanity
- **Evidence**:
  - `apps/web/src/components/live/LiveChatPanel.tsx`
  - Uses `setInterval` and random content generation (`Math.random`) to create messages.
- **Impact**:
  - Fails realism (typing/presence/moderation/events persistence).
  - Cannot certify true live communication behavior.
- **Required Replacement**:
  - Bind panel to real message transport/store (API/WebSocket/event bus).
  - Add moderation/system event channels and persistence contract.

---

## G-002 — GO LIVE endpoint contract appears inconsistent
- **Severity**: P0
- **Status**: Open
- **Confidence**: High
- **Blueprint Area**: Live Session Chain
- **Evidence**:
  - `apps/web/src/components/performer/GoLiveControlPanel.tsx` calls `POST /api/live/go`
  - Repo path listing includes `apps/web/src/app/api/live/start/route.ts`
- **Impact**:
  - Potential break in live session creation chain.
- **Required Replacement**:
  - Unify on one canonical endpoint and update all clients/routes accordingly.

---

## G-003 — Stage status can degrade to static fallback
- **Severity**: P1
- **Status**: Open
- **Confidence**: High
- **Blueprint Area**: Venue Audit / Broadcast Audit
- **Evidence**:
  - `apps/web/src/app/api/stage/status/route.ts`
  - Fallback response is static (`CURTAIN_CLOSED`, null metadata) when backend proxy fails.
- **Impact**:
  - Venue can appear dead/static under backend outage rather than explicit degraded live-state handling.
- **Required Replacement**:
  - Return explicit degraded state contract and telemetry flags for UI handling.

---

## G-004 — Live propagation to core surfaces not yet certified
- **Severity**: P0
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: Live Session Chain (Homepage/Discovery/Search/Followers/Notifications/Admin/Venue/Analytics)
- **Evidence**:
  - `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts` provides runtime APIs.
  - No inspected consumers in this pass proving full propagation.
- **Impact**:
  - “GO LIVE updates everything” requirement is unproven.
- **Required Replacement**:
  - Audit and prove consumer subscriptions with file-level evidence and test traces.

---

## G-005 — CRM role-by-role bindings not certified
- **Severity**: P0
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: CRM Audit
- **Evidence**:
  - Current pass has no inspected role-specific CRM wiring proof across Performer/Fan/Venue/Promoter/Writer/Sponsor/Executive.
- **Impact**:
  - Panel ownership and data source truth cannot be guaranteed.
- **Required Replacement**:
  - Build role matrix with per-panel source-of-truth and API/runtime contracts.

---

## G-006 — Memory lifecycle not yet proven end-to-end
- **Severity**: P1
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: Memory System
- **Evidence**:
  - Engine files exist in repo (`MemoryWallEngineV3.ts`, etc.), but no lifecycle runtime inspection yet.
- **Impact**:
  - Capture→tag→group→share→favorite→download→timeline chain is uncertified.
- **Required Replacement**:
  - Verify each lifecycle action, persistence, cross-profile visibility, and search indexing.

---

## G-007 — Performance certification missing for 20/100/500/1000
- **Severity**: P0
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: Performance Audit
- **Evidence**:
  - No verified benchmark output inspected proving FPS/CPU/memory/network targets at scale.
- **Impact**:
  - No launch-grade confidence under audience growth.
- **Required Replacement**:
  - Add reproducible performance test matrix and artifact reports.

---

## G-008 — Communication parity (typing/read receipts/presence/moderation) not proven
- **Severity**: P1
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: Communication
- **Evidence**:
  - Only inspected chat panel is simulation-driven; messenger subsystem not yet audited.
- **Impact**:
  - Missing certifiable social realism and trust/safety controls.
- **Required Replacement**:
  - Audit messenger stack and certify feature-by-feature with evidence.

---

## G-009 — Runtime humanity behaviors not certified
- **Severity**: P1
- **Status**: Open
- **Confidence**: Medium
- **Blueprint Area**: Human Interaction / Venue Audit / Broadcast Audit
- **Evidence**:
  - Live registry has audience telemetry (`audienceCountries`, `recentAudienceEntries`) but no verified behavior systems in audited files.
- **Impact**:
  - Venue may remain visually rich but behaviorally static.
- **Required Replacement**:
  - Certify differentiated audience/performer/stage crew behaviors and cadence systems.

---

## Immediate Next Audit Targets (Evidence Expansion)
1. `apps/web/src/app/api/live/start/route.ts`
2. `apps/web/src/app/api/messages/route.ts`
3. `apps/web/src/components/messenger/*`
4. `apps/web/src/components/live/VenueImmersiveRoom.tsx`
5. `apps/web/src/components/live/AudienceScene.tsx`
6. `apps/web/src/lib/memory/MemoryWallEngineV3.ts`
7. Discovery/home/admin/analytics consumers of live registry

---

## Exit Criteria for Closing P0
- G-001 closed with runtime-backed chat evidence.
- G-002 closed with canonical go-live endpoint contract proof.
- G-004 closed with end-to-end propagation evidence across required surfaces.
- G-005 at least reaches auditable PARTIAL with role matrix and source-of-truth mapping.
- G-007 closed with benchmark artifacts for required loads.
