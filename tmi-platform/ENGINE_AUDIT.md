# ENGINE_AUDIT.md

## Scope
Canonicalization inventory for platform engines:
- Identity
- Experience
- Configuration
- Media
- Relationship
- Discovery
- Live
- Commerce
- Event Platform

## Initial Findings (Phase 1 Snapshot)

### 1) Identity Engine
**Candidates found**
- `apps/web/src/lib/identity/MultiPersonaEngine.ts`
- `apps/web/src/lib/engines/runtime/FaceScanIdentityEngine.ts`
- `apps/web/src/lib/identity/ContributorCreditEngine.ts`
- `apps/web/src/lib/identity/GroupMembershipEngine.ts`
- `apps/web/src/lib/identity/RoyaltySplitEngine.ts`
- `apps/web/src/lib/identity/getGuestId.ts`

**Assessment**
- `MultiPersonaEngine.ts`: broad role/capability/session switching surface; strong candidate for canonical identity policy/runtime.
- `FaceScanIdentityEngine.ts`: avatar/render identity specialization (3D/visual identity), not full auth/permission identity core.
- Others: identity-adjacent subsystems (credits/group/royalty/guest id).

**Status**
- Canonical candidate: `MultiPersonaEngine.ts` (identity policy/session persona layer)
- Partial/specialized: `FaceScanIdentityEngine.ts` (render identity)
- Auxiliary: contributor/group/royalty/guest helpers

---

### 2) Experience Engine
**Candidates found**
- No single `ExperienceEngine.ts` found yet.
- Experience-related surfaces appear distributed across UI/runtime layers (home/lobby/profile/stage components and viewport systems).

**Assessment**
- Likely currently fragmented; requires mapping and consolidation target definition.

**Status**
- Missing single canonical entrypoint.
- Needs consolidation plan in Phase 2.

---

### 3) Configuration Engine
**Candidates found**
- No dedicated canonical `ConfigurationEngine` file identified yet.
- Configuration logic appears distributed (route maps, registries, runtime config-style files).

**Status**
- Missing explicit canonical engine entry.
- Requires consolidation decision.

---

### 4) Media Engine
**Candidates found**
- `apps/web/src/lib/media/MediaOrchestrator.ts`
- `apps/web/src/lib/media/MediaCaptureEngine.ts`
- `apps/web/src/lib/media/MediaLockerEngine.ts`
- Root-level duplicates also present in project tree (`MediaEngine.ts`, `GlobalMediaController.tsx`, etc.)

**Assessment**
- `MediaOrchestrator.ts` is explicit runtime orchestrator (capture/transmission attach/cut).
- `MediaCaptureEngine` / `MediaLockerEngine` are subsystem engines.
- Likely duplicate/parallel entrypoints exist across root + app paths.

**Status**
- Canonical candidate for runtime orchestration: `MediaOrchestrator.ts`
- Additional consolidation needed across duplicates.

---

### 5) Relationship Engine
**Candidates found**
- `apps/web/src/lib/engines/runtime/RelationshipMomentumEngine.ts`
- Presence-related runtime files under `runtime/specification/presence` and media presence components.

**Assessment**
- Relationship domain appears split between momentum runtime and presence/social surfaces.

**Status**
- No obvious single relationship canonical engine yet.
- Candidate base: `RelationshipMomentumEngine.ts` + presence runtime consolidation.

---

### 6) Discovery Engine
**Candidates found**
- `apps/web/src/lib/discovery/UnifiedDiscoveryEngine.ts` ✅
- `apps/web/src/components/discovery/DiscoveryRail.tsx` (consumer UI)

**Assessment**
- Clear canonical query wrapper already exists; explicit comment indicates single source for discovery queries using live session registry.

**Status**
- Canonical engine: `UnifiedDiscoveryEngine.ts` (production-ready structure)

---

### 7) Live Engine
**Candidates found**
- `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts` ✅
- `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` (barrel re-export to canonical)
- Live component surfaces in `apps/web/src/components/live/*`

**Assessment**
- Clear canonical runtime already present in broadcast registry.
- `lib/live/...` is intentionally alias/re-export guard.

**Status**
- Canonical engine: `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`
- Alias acceptable as compatibility layer, not duplicate runtime.

---

### 8) Commerce Engine
**Candidates found**
- `apps/web/src/lib/commerce/TicketingEngine.ts`
- `apps/web/src/lib/commerce/SponsorRegistry.ts`
- `apps/web/src/lib/commerce/BookingRegistry.ts`
- `apps/web/src/lib/commerce/LogisticsAutomationService.ts`
- Stripe checkout/payment engine under `apps/web/src/lib/stripe/CheckoutPaymentEngine.ts`

**Assessment**
- Domain is split into multiple sub-engines/services.
- `TicketingEngine.ts` includes placeholder-like behaviors (mock token IDs/base64 hash, synthetic output), not fully production-hard.

**Status**
- No single canonical commerce root engine yet.
- Requires unification and replacement of mock-ish paths.

---

### 9) Event Platform
**Candidates found**
- `apps/web/src/lib/events/EventBusEngine.ts` ✅
- `apps/web/src/lib/events/EventDispatchEngine.ts`
- `apps/web/src/lib/events/EventDiscoveryEngine.ts`
- `apps/web/src/lib/systemEventBus.ts`
- `apps/web/src/lib/events/systemEventBus.ts` (re-export barrel)

**Assessment**
- Strong event platform stack already exists.
- Potential parallelism: `systemEventBus.ts` (root lib) and events bus engine family; may need standardization of which is canonical for platform-wide telemetry/action events.

**Status**
- Canonical candidate: `EventBusEngine.ts` + `EventDispatchEngine.ts` pair
- Legacy/parallel channel candidate: `systemEventBus.ts` path(s)

---

## Duplicates / Parallel Runtime Risk (Observed Early)
- Media-related engines/components exist both in app/lib paths and root-level files.
- Live has clean canonical + alias pattern (good).
- Event has multiple buses/interfaces (needs governance).
- Identity is split between persona/access and 3D identity rendering (domain boundary required).

## Obsolete / Placeholder Risk (Observed Early)
- `TicketingEngine.ts` contains mock-style NFT mint/pdf outputs and non-cryptographic placeholder hash behavior.
- Additional placeholder/mock directories exist broadly (`mock/`, `placeholders/`) and need targeted replacement during wiring phase.

## Next Actions (Phase 1 remaining)
1. Produce dependency map of import relationships for engine candidates.
2. Classify each candidate file: production-ready / partial / duplicate / obsolete.
3. Use dependency map to pick exact canonical per domain before any destructive changes.
