# Milestone: Universal Window Runtime

## Status

IMPLEMENTED (Certification blocked)

## Certification Gate

Build — ❌ FAIL

---

## 1. Observed Evidence

* Production build fails during prerender stage.
* Exit code: 1
* Error: TypeError: Cannot read properties of undefined (reading 'S')
* Location: .next/server/chunks/48291.js (compiled server chunk)
* Routes affected: ~15 total
  - /battles
  - /challenge  
  - /cypher
  - /live/audience
  - /live/rooms/* (dirty-dozens, cypher, award-ceremony, etc.)
  - /concerts/*
* Pattern: Identical error message across all affected routes
* TypeScript verification: PASS (not a compilation issue — all routes check out during `pnpm typecheck`)
* Compilation stage: PASS (error occurs during SSR prerender, not compile)
* Non-failing routes: Home pages, profile pages, and other routes unaffected
* Error timing: Occurs during `next build` in the prerender/SSR phase

---

## 2. Root Cause Hypothesis

**Confidence Level:** High

**Primary Hypothesis:**

A shared source module imported by all failing room/game/event routes is initialized in a browser-only context (or depends on browser-only APIs), creating an undefined value during server-side rendering. The shared module is most likely in the `/lib/live/`, `/lib/engines/`, or `/lib/avatars/` directories, given the event/venue pattern of failures.

**Likely Source Categories (in order of likelihood):**

1. **Module-level singleton instantiation during SSR** — Several engines export module-level singletons (e.g., `roomEnergyEngine`, `audienceVisibilityEngine`, `avatarAttentionRuntime`, `platformLearningCore`) that may be instantiating or accessing undefined objects during SSR.
2. **Shared dependency with browser-only code** — One of the imported libraries may attempt to access `window`, `document`, or other browser APIs without an SSR guard at module initialization time.
3. **Browser-only hook imported without 'use client' context** — A React hook that depends on client-side code may be imported by an SSR page without proper directive boundaries.
4. **Uninitialized module state** — A module may export a singleton that's undefined because a required initialization function hasn't been called.

**Reasoning:**

- All 15 failing routes import from a common set of components (`ArenaEventShell`, `UniversalVenueRenderer`)
- These components import hooks and engines from `/lib/live/`, `/lib/engines/`, and `/lib/avatars/`
- Multiple singletons are instantiated at module level during the import phase
- The error pattern (identical `.S` property access across different routes) suggests a single shared dependency rather than route-specific defects
- Error occurs during SSR/prerender but not during TypeScript compilation, indicating a runtime initialization problem specific to server-side rendering

---

## Investigation Status

**Current Phase:** Root Cause Discovery (Verification Step 1-3)

**Speculative fix (adding 'use client') was reverted** because:
- It changes module bundling behavior rather than fixing the undefined dereference
- Per the Certification Framework, adding 'use client' is a hypothesis, not a verified root cause
- The framework requires us to identify the exact source line, not mask the problem

---

## 3. Verification Plan

1. **Identify the module import chain**
   - Document the complete import chain from failing page → component → hook → lib modules
   - Confirm shared dependencies across all 15 failing routes

2. **Analyze module-level singletons**
   - List all module-level exports that instantiate objects (e.g., `new ClassName()`)
   - Identify which singletons are imported by the shared dependency chain:
     - `roomEnergyEngine` (RoomEnergyEngine.ts)
     - `audienceVisibilityEngine` (AudienceVisibilityEngine.ts)
     - `botCrowdFillEngine` (BotCrowdFillEngine.ts)
     - `sharedReactionEngine` (SharedReactionEngine.ts)
     - `avatarAttentionRuntime` (AvatarAttentionRuntime.ts)
     - `lobbyBehaviorEngine` (LobbyBehaviorEngine.ts)
     - `platformLearningCore` (PlatformLearningCore.ts)
   - Check each for browser API dependencies or uninitialized state

3. **Search for browser API usage without guards**
   - Run: `grep -r "window\|document" apps/web/src/lib/live apps/web/src/lib/engines apps/web/src/lib/avatars --include="*.ts"`
   - Filter out guarded code (`typeof window !== 'undefined'`)
   - Identify unguarded browser API accesses in imported modules

4. **Use Next.js source mapping to pinpoint exact location**
   - Extract source map for chunk 48291.js
   - Map minified property access `.S` back to actual property name and source file
   - Determine which module/function attempts to access this property

5. **Test hypothesis with targeted fix**
   - Once module is identified, add SSR guard or lazy-load with `dynamic(..., { ssr: false })`
   - Verify: `pnpm -C apps/web build`
   - Confirm all 15 failing routes prerender without errors

---

## 4. Verified Root Cause

**Status:** Investigation In Progress — Debug Instrumentation Blocked

**Findings:**

1. **Error is NOT in singleton instantiation** — try-catch blocks around singleton construction did not trigger
2. **Error IS in module evaluation** — occurs before exports are evaluated
3. **Debug logging did not output** — console.error at module top-level did not appear in SSR build output
4. **SSR environment constraint** — standard console logging appears to be suppressed or unavailable during Next.js SSR prerender

**Import chain confirmed:**
- All failing routes → ArenaEventShell / UniversalVenueRenderer → useAudienceWorld hook
- useAudienceWorld imports: RoomEnergyEngine, AudienceVisibilityEngine, BotCrowdFillEngine, SharedReactionEngine, AvatarAttentionRuntime
- These modules import: LobbyBehaviorEngine, RewardResponseEngine, CrowdReactionEngine, CrowdAttentionEngine, etc.

**Hypothesis update:**

The error is in **module-level code during import evaluation**, likely:
- Code that runs when a dependency is imported
- Not in the classes themselves (constructors are safe)
- Accessing a property on an undefined object during module parsing/initialization

**Root Cause Category:** SSR Initialization (likely in a dependency or import-time side effect)

---

## 5. Resolution

**Status:** Pending Investigation

[Will be completed after root cause is verified and fix is implemented]

---

## Root Cause Categorization

**Likely Category:** SSR Initialization

(Will be confirmed during investigation)

---

## Tracking & Metrics

**Blocking:** This failure blocks all downstream certifications:
* Runtime Certification
* UX Certification
* Regression Certification
* Ship Certification

Milestone cannot reach ACCEPTED status until Build Certification PASSES.

**P0 Soft Launch Blocker:** YES — Production build failure prevents any deployment

---

## Next Actions

1. Execute Verification Plan steps 1-4
2. Locate and inspect the problematic module
3. Apply appropriate fix (SSR guard, lazy-load, or initialization reorder)
4. Re-run production build verification
5. Complete sections 4 and 5 of this record

