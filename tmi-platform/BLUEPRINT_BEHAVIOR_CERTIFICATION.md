# BLUEPRINT_BEHAVIOR_CERTIFICATION.md

## Launch Readiness Scorecard (Evidence-Driven Snapshot)

| Area | Score | Launch Ready | Evidence Basis |
|---|---:|:---:|---|
| Live Session Chain | 58% | ⚠️ | Strong registry runtime exists; go-live API path mismatch and partial propagation evidence. |
| CRM Profiles | 35% | ❌ | Multiple profile surfaces exist in tree, but no audited end-to-end evidence yet for per-role business/runtime wiring. |
| Runtime Humanity | 42% | ❌ | Audience/session telemetry exists, but no proven behavior system coverage for varied human actions. |
| Communication | 54% | ⚠️ | Chat UI exists; currently simulated messages in key panel, not runtime-backed. |
| Memory System | 48% | ⚠️ | Engines/components exist by filename, not yet verified as full lifecycle behavior chain. |
| Commerce | 62% | ⚠️ | Strong route/component presence (Stripe/tickets/beats), needs lifecycle verification pass. |
| Discovery | 57% | ⚠️ | Discovery components and live registry exist; full propagation path not yet certified. |
| Media | 64% | ⚠️ | Streaming/media components present, full upload→encode→playback chain not yet certified. |
| Performance | 30% | ❌ | No evidence yet of benchmark harness covering 20/100/500/1000 users with FPS/CPU/memory/network metrics. |
| Rule 20 Compliance | 40% | ❌ | Confirmed hardcoded/simulated behaviors in audited files; broader scan pending. |
| **Overall Soft Launch** | **49%** | **❌** | Current state is promising but not yet behavior-certified for launch. |

---

## Method & Rules Applied

- **Evidence only**: PASS/PARTIAL/FAIL entries include file-level evidence from inspected runtime files.
- **Reality first**: UI presence alone is not a PASS.
- **Behavior scoring**: Scored on runtime wiring, propagation, persistence, and business realism.

### Files inspected for this initial certification pass

1. `apps/web/src/components/live/LiveChatPanel.tsx`
2. `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` (re-export)
3. `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`
4. `apps/web/src/app/api/live/event/state/route.ts`
5. `apps/web/src/app/api/live/stage/status/route.ts`
6. `apps/web/src/app/api/stage/status/route.ts`
7. `apps/web/src/components/performer/GoLiveControlPanel.tsx`

---

## 1) Live Session Chain Certification

Target chain:

GO LIVE → Registry → Homepage → Discovery → Search → Followers → Notifications → Admin → Venue → Analytics

### 1.1 GO LIVE trigger
- **Status**: **PARTIAL**
- **Evidence**:
  - `apps/web/src/components/performer/GoLiveControlPanel.tsx`
    - Uses `fetch('/api/live/go', { method: 'POST', body: { title } })`
- **Why partial/fail risk**:
  - In current evidence set, canonical route observed in tree is `apps/web/src/app/api/live/start/route.ts` (path listed in environment), while UI calls `/api/live/go`.
  - No verified `/api/live/go` route file was inspected in this pass.
- **Certification note**: Go-live initiation is present in UI behavior, but route contract appears inconsistent.

### 1.2 Registry write/read
- **Status**: **PASS**
- **Evidence**:
  - `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`
    - `registerLiveSession(payload)` writes session metadata.
    - `endLiveSession`, `pingSessionWithTelemetry`, `updateViewerCount`, `updateStageState`, `addTip`.
    - `onSessionsChanged(handler)` broadcast subscription mechanism.
    - `getActiveSessions`, `getAllSessions`.
- **Why pass**:
  - Concrete runtime registry with metadata/telemetry and observer hooks is implemented.

### 1.3 Live stage/event state API chain
- **Status**: **PARTIAL**
- **Evidence**:
  - `apps/web/src/app/api/live/event/state/route.ts` re-exports from live stage status route.
  - `apps/web/src/app/api/live/stage/status/route.ts` re-exports from `/api/stage/status`.
  - `apps/web/src/app/api/stage/status/route.ts` proxies to backend; fallback stub if proxy fails.
- **Why partial**:
  - Chain is wired, but fallback returns static `"CURTAIN_CLOSED"` payload and null show metadata, indicating potential non-runtime behavior under proxy failure.

### 1.4 Homepage / Discovery / Search / Followers / Notifications / Admin / Venue / Analytics propagation
- **Status**: **FAIL (not yet certified)**
- **Evidence**:
  - No file-level verification in this pass proving subscriptions from `GlobalLiveSessionRegistry` into these surfaces.
- **Why fail**:
  - Missing evidence in inspected files for end-to-end propagation updates post GO LIVE.

---

## 2) CRM Certification (Role-by-role)

Required roles: Performer, Fan, Venue, Promoter, Writer, Sponsor, Executive.

- **Status**: **FAIL (not yet certified)**
- **Evidence currently available**:
  - Session model in `GlobalLiveSessionRegistry.ts` carries performer/session metadata (title, category, privacy, tipTotal, telemetry, audience slices).
- **Why fail**:
  - No audited evidence yet that inventory, memory, chat, rewards, media, and analytics panels are bound to canonical CRM profile sources per role.
  - No inspected proof of profile-scoped data contracts and persistence across roles.

---

## 3) Runtime Humanity Certification

Domains: Audience, Stage, Environment, Broadcast performer, NPC/crew, Lighting, Audio, Crowd behaviors.

- **Status**: **PARTIAL**
- **Evidence**:
  - `GlobalLiveSessionRegistry.ts` includes:
    - `audienceCountries`, `recentAudienceEntries`, `lastAudienceEntryAt`
    - `registerAudienceEntry(payload)` with dedupe window and country aggregation.
- **Why partial**:
  - Audience telemetry exists, but no evidence yet for differentiated avatar behaviors (blinking, gestures, varied actions), stage crew movement, or humanized performer micro-motions in audited files.

---

## 4) Communication Certification

Scopes: Chat, voice, video, DM/group messaging, typing, presence, read receipts, moderation.

### 4.1 Live chat behavior
- **Status**: **FAIL**
- **Evidence**:
  - `apps/web/src/components/live/LiveChatPanel.tsx`
    - Chat feed generated via `setInterval` + `Math.random()`.
    - Messages created as simulated fan names/content.
- **Why fail**:
  - Core chat panel is simulation-driven (placeholder runtime), not evidence-backed real transport/persistence/moderation system in this file.

### 4.2 Additional comm surfaces
- **Status**: **PARTIAL/UNKNOWN**
- **Evidence**:
  - Project contains messenger-related files in tree, but not inspected in this pass.
- **Why partial**:
  - Cannot certify without file-level runtime verification.

---

## 5) Memory System Certification

Lifecycle: capture → storage → sharing → timeline → search → collections → anniversaries → cross-profile visibility

- **Status**: **FAIL (not yet certified)**
- **Evidence**:
  - Memory engines/components exist by path names (e.g., `MemoryWallEngineV3.ts`, `MemoryWallEngine.ts`), not yet audited.
- **Why fail**:
  - No evidence yet for end-to-end memory lifecycle runtime.

---

## 6) Commerce Certification

Stripe, tips, tickets, merch, ads, sponsors, bookings, subscriptions, royalties, revenue tracking.

- **Status**: **PARTIAL**
- **Evidence**:
  - Tips runtime field exists in live registry (`tipTotal`, `addTip`).
  - Stripe/tickets routes and components exist in repository tree.
- **Why partial**:
  - This pass did not verify business flow integrity (auth, ledger, reconciliation, profile association, analytics reflection).

---

## 7) Discovery Certification

Search, trending, live, recommendations, followers, charts, magazine, homepage, billboards.

- **Status**: **FAIL (not yet certified)**
- **Evidence**:
  - Live registry available (`getAllSessions`, category filters), but no inspected consumer wiring into discovery/home/billboards in this pass.
- **Why fail**:
  - Missing propagation evidence.

---

## 8) Media Certification

Uploads, streaming, recording, playback, playlists, media locker, encoding/transcoding.

- **Status**: **PARTIAL**
- **Evidence**:
  - Multiple media components/routes exist in tree.
  - Go live UI includes camera preview component import.
- **Why partial**:
  - No inspected evidence yet of complete media pipeline runtime guarantees.

---

## 9) Performance Certification

Targets: 20 / 100 / 500 / 1000 concurrent users with FPS/CPU/memory/network metrics.

- **Status**: **FAIL**
- **Evidence**:
  - No verified benchmark/reporting harness inspected in current pass demonstrating these loads and metrics.
- **Why fail**:
  - Not certified without measured telemetry artifacts.

---

## 10) Rule 20 Certification (Mocks / Placeholders / Hardcoded runtime)

### Confirmed findings from inspected files

1. **Simulated chat feed**
   - **File**: `apps/web/src/components/live/LiveChatPanel.tsx`
   - **Evidence**: `setInterval` + random message generation (`Math.random`, synthetic `Fan_####` names).
   - **Impact**: Non-real chat realism, no persistence/moderation guarantees.

2. **Potential route mismatch for GO LIVE**
   - **File**: `apps/web/src/components/performer/GoLiveControlPanel.tsx`
   - **Evidence**: calls `POST /api/live/go`.
   - **Related path listing**: `apps/web/src/app/api/live/start/route.ts` exists in repo tree.
   - **Impact**: Risk of failed go-live chain or split logic.

3. **Stage status fallback stub**
   - **File**: `apps/web/src/app/api/stage/status/route.ts`
   - **Evidence**: Returns static fallback (`state: 'CURTAIN_CLOSED'`, null show/artist) when proxy fails.
   - **Impact**: Live experience may silently degrade to non-runtime placeholder behavior.

---

## 11) Visual Blueprint Comparison (Behavior-focused)

Blueprint expectation: cinematic venue that is alive socially, operationally, and business-wise in real-time.

### Missing behavior features confirmed in inspected evidence

1. **Chat realism stack incomplete**
   - Missing verified runtime for typing indicators, moderation actions, pinned/system announcements, translation, slow mode, and persistent message state in audited chat panel.
   - Priority: **P0**
   - Owner: Live Communication Runtime

2. **GO LIVE chain contract inconsistency risk**
   - Initiation endpoint used by UI not yet proven to match canonical backend route path.
   - Priority: **P0**
   - Owner: Live Session Platform

3. **Fallback-to-static stage state**
   - Stage API can degrade to static placeholder state.
   - Priority: **P1**
   - Owner: Stage Runtime/API

4. **Propagation certification gap**
   - No evidence yet that registry updates fan out to homepage/discovery/admin/analytics/mobile surfaces.
   - Priority: **P0**
   - Owner: Runtime Integration

---

## Initial Priority Queue (from this certification pass)

### P0 (Launch blockers)
1. Certify and correct GO LIVE endpoint contract (`/api/live/go` vs canonical route).
2. Replace/bridge simulated chat feed with runtime-backed transport + moderation/events.
3. Prove registry propagation path into discovery/home/admin/analytics surfaces with file-level evidence.

### P1 (Refinement before broad rollout)
1. Harden stage status fallback behavior and observability (explicit degraded mode state).
2. Certify memory wall lifecycle with storage/share/timeline/search behavior evidence.
3. Certify CRM profile wiring by role.

---

## Evidence Footnotes (directly inspected)

- `apps/web/src/components/live/LiveChatPanel.tsx`
- `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts`
- `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`
- `apps/web/src/app/api/live/event/state/route.ts`
- `apps/web/src/app/api/live/stage/status/route.ts`
- `apps/web/src/app/api/stage/status/route.ts`
- `apps/web/src/components/performer/GoLiveControlPanel.tsx`

---

## Certification Status

**Current outcome:** **NOT LAUNCH-CERTIFIED** (behavior-first standard).  
**Reason:** Core runtime foundation exists, but critical communication realism and cross-surface propagation are not yet evidenced as fully wired in this pass.
