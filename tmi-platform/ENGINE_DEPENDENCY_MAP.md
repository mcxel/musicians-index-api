# ENGINE_DEPENDENCY_MAP.md

## Purpose
Maps discovered engine dependencies and canonical paths to support safe merge/refactor and avoid breaking runtime wiring.

## Canonical-Oriented Dependency Map (Current Observed)

---

## Identity Domain

### Candidate: `apps/web/src/lib/identity/MultiPersonaEngine.ts`
- Internal dependencies: none (self-contained browser/session utilities).
- Dependents: unknown from current read pass (requires import graph sweep in Phase 1b).
- Role: persona/capability/session identity orchestration.

### Candidate: `apps/web/src/lib/engines/runtime/FaceScanIdentityEngine.ts`
- Dependencies: none explicit.
- Role: render/visual identity upgrade pipeline.
- Notes: should not replace auth/persona identity core; likely adjunct to avatar/runtime experience.

### Identity-adjacent utility engines
- `ContributorCreditEngine.ts`
- `GroupMembershipEngine.ts`
- `RoyaltySplitEngine.ts`
- `getGuestId.ts`
These should be treated as dependent identity services, not primary identity core.

---

## Discovery Domain

### Canonical candidate: `apps/web/src/lib/discovery/UnifiedDiscoveryEngine.ts`
**Imports**
- `@/lib/broadcast/GlobalLiveSessionRegistry`:
  - `getAllSessions`
  - `getActiveSessions`
  - `getSessionsByCategory`
  - `onSessionsChanged`
  - `LiveSession`, `StreamCategory` types

**Dependents**
- UI consumers like `apps/web/src/components/discovery/DiscoveryRail.tsx` (expected)
- Any route/page querying live discovery rails.

**Dependency conclusion**
- Discovery is already wired to live canonical registry; keep this dependency.

---

## Live Domain

### Canonical candidate: `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts`
**Imports**
- `./LiveRegistry`:
  - `LiveRegistry`
  - `LiveEntry` type

**Exports consumed by discovery**
- `getAllSessions`, `getActiveSessions`, `getSessionsByCategory`, `onSessionsChanged`
- `LiveSession`, `StreamCategory`

**Alias path**
- `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` re-exports canonical broadcast path.

**Dependency conclusion**
- Maintain broadcast registry as source of truth.
- Keep alias only for compatibility while imports are migrated/verified.

---

## Commerce Domain

### Candidate: `apps/web/src/lib/commerce/TicketingEngine.ts`
**Imports**
- none explicit.

**Runtime concern**
- Uses `Buffer.from(...)` in a web app path (environment compatibility risk depending on bundler/polyfills).
- Uses placeholder/mock return values for mint/print workflows.

**Dependency conclusion**
- Should be integrated with real payment/ticket routes before canonical lock.
- Candidate for partial classification (not production-final).

---

## Event Platform Domain

### Candidate set
- `apps/web/src/lib/events/EventBusEngine.ts`
- `apps/web/src/lib/events/EventDispatchEngine.ts`
- `apps/web/src/lib/events/systemEventBus.ts` (re-export)
- `apps/web/src/lib/systemEventBus.ts` (separate event stream)

### EventBusEngine dependencies
- Imports: `dispatchPlatformEvent` from `./EventDispatchEngine`
- Exposes queue/dedupe/replay/dispatch stats primitives.

### EventDispatchEngine dependencies
- Imports:
  - `PlatformEvent` from `./EventBusEngine`
  - `resolveNotificationRoutes` from `./NotificationRoutingEngine`
  - `createPlatformNotification` from `./PlatformNotificationEngine`

### systemEventBus layering
- `apps/web/src/lib/events/systemEventBus.ts` re-exports from `@/lib/systemEventBus`.
- `apps/web/src/lib/systemEventBus.ts` is a separate typed event log emitter for system/home/admin interactions.

**Dependency conclusion**
- Two event channels currently coexist:
  1) Platform event bus + dispatch pipeline (queueable events)
  2) System event bus (lightweight app telemetry/actions)
- Canonicalization decision needed:
  - either unify under EventBusEngine-backed bridge
  - or preserve both with explicit domain boundaries and adapter.

---

## Media Domain

### Candidate set observed
- `apps/web/src/lib/media/MediaOrchestrator.ts`
- `apps/web/src/lib/media/MediaCaptureEngine.ts`
- `apps/web/src/lib/media/MediaLockerEngine.ts`
- root-level media files also present in repository tree.

### Known dependency from reads
- No explicit imports inspected yet in this pass, but media components/hooks likely consume these engines:
  - `apps/web/src/hooks/useMediaStream.ts`
  - `apps/web/src/components/media/*`
  - live room/camera components.

**Dependency conclusion**
- Must run targeted import graph mapping before merge to avoid breaking many consumers.

---

## Relationship Domain

### Candidate
- `apps/web/src/lib/engines/runtime/RelationshipMomentumEngine.ts`
- presence runtime/specification and presence-related components likely dependent.

**Dependency conclusion**
- Relationship and presence are currently cross-cutting; needs formal canonical boundary.

---

## Experience / Configuration Domains

### Status
- No single canonical engine file identified yet from current reads.
- Likely spread across:
  - routing/registry/config maps
  - UI layout/theme/runtime modules
  - app-level middleware and route ownership files.

**Dependency conclusion**
- Requires explicit file-level import scan for engine-like modules to establish canonical roots.

---

## Immediate Next Mapping Tasks (to complete Phase 1)
1. Build import graph for all candidate engine files in this doc:
   - who imports them
   - what they import
2. Mark each candidate as:
   - production-ready
   - partial
   - duplicate
   - obsolete
3. Confirm no hidden parallel runtime paths before Phase 2 rewiring.
