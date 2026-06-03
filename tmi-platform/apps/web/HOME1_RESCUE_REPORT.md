# HOME1_RESCUE_REPORT

Date: 2026-06-02  
Phase: Sprint 1A Home1 Rescue (Option A)  
Status: Engineering Gate PASS / Manual Browser Gate PENDING

## Scope Executed

Target files updated:

1. `apps/web/src/app/home/1/page.tsx`
2. `apps/web/src/components/home/TmiMagazineOrbitalUnderlay.tsx`
3. `apps/web/src/components/home/WorldLobbySection.tsx`

No unrelated features were implemented.
No Sprint 1B implementation was started.
No deletion-based cleanup was performed in this rescue pass.

---

## Changes Applied

### 1) `app/home/1/page.tsx`
- Replaced loose stacking with strict section containment using explicit grid areas.
- Added controlled section wrappers with bounded `position/z-index/overflow`.
- Enforced hierarchy:
  - masthead
  - orbital
  - billboard slot
  - sponsor rail
  - live world
  - mid ad
  - editorial/feed
- Added Home1 sponsor discovery rail between upper discovery sections and lower content, non-obstructive by design.

### 2) `components/home/TmiMagazineOrbitalUnderlay.tsx`
- Reduced overlay density/noise to limit bleed pressure.
- Added decorative underlay pointer safety (`pointer-events: none`) on non-interactive overlay layers.
- Reduced vertical footprint pressure (`minHeight/padding`) while preserving visual identity.
- Preserved orbital controls and overall spectacle intent.

### 3) `components/home/WorldLobbySection.tsx`
- Added section containment (`position: relative`, `overflow: hidden`).
- Converted Arena Triangle to responsive grid behavior (`auto-fit + minmax`).
- Stabilized venue card grid sizing for better responsive containment.
- Preserved canonical route targets and no legacy route regressions introduced in code.

---

## Engineering Validation

## Type / Build
- Type gate: PASS (no blocking type errors surfaced in final pipeline validation stage).
- Build gate: PASS (`pnpm -C apps/web build` completed successfully with full route output).

### Non-blocking warnings observed
- Node engine warning (expects 24.x, current 20.20.2).
- PostgreSQL SSL mode future semantics warning.
- Edge runtime warning (affects static generation for specific edge-runtime pages only).

These warnings are informational/non-blocking for this rescue scope.

---

## Route Integrity (Code-Level Verification)

Verified route intents remain canonical:

- Challenge: `/challenge`
- Battle: `/battles/live`
- Cypher: `/rooms/cypher?autoSeat=1`
- Venue entry: `/rooms/[slug]?autoSeat=1` patterns preserved in lobby cards

---

## Manual Browser QA (Required Before Golden Tag)

Still required on real device/browser:

1. `/home/1` no visual overlap/bleed across major sections.
2. CTA route snaps:
   - Challenge
   - Battle
   - Cypher
   - Venue autoSeat
3. Orbital/decorative layers do not intercept actionable clicks.
4. NavigationRail mobile usability.
5. No horizontal overflow on mobile.
6. Sponsor rail and ad slots remain contained (no collision/overlap).

---

## Gate Verdict

- Engineering Gate: **PASS**
- Manual Browser Interaction Gate: **PENDING**

Home1 rescue is technically stabilized and build-valid.  
Golden Build tag should be applied only after manual browser PENDING items are confirmed PASS.
