# Sprint 1A — Home1 Masthead Rebuild TODO (Flow-Lock Preserved)

## Phase 0 — Discovery / Audit
- [x] Audit `apps/web/src/app/home/1/page.tsx` composition and identify duplicate/legacy fragments.
- [x] Audit `apps/web/src/components/home/Home1CoverPage.tsx` for non-compliant gradients/blur/shadow usage.
- [x] Audit `apps/web/src/components/home/TmiMagazineOrbitalUnderlay.tsx` for layer order and click-through risk.
- [x] Audit `apps/web/src/components/home/WorldLobbySection.tsx` for text density and legacy visual artifacts.
- [x] Audit `apps/web/src/components/home/HomeVisualTruth.tsx` and `apps/web/src/components/home/Home1PlatformBelt.tsx` for overlap/redundancy.
- [x] Confirm whether `apps/web/src/components/magazine/MagazineEditorialSpread.tsx` is injected on Home1 and whether to purge from masthead path.

## Phase 1 — Home1 Visual Truth Enforcement (TMI-OS)
- [ ] Refactor Home1 masthead to flat CMYK blocks only:
  - base `#050510`
  - accents `#FFD700`, `#FF2DAA`, `#00FFFF`, `#00FF88`
- [ ] Remove non-compliant styling where feasible:
  - gradients
  - heavy transparency masks
  - blur filters
  - fuzzy/glow-heavy shadows
- [ ] Reduce text density and remove placeholder/duplicate explainer copy.
- [ ] Ensure all animated/media surfaces include GPU hinting (`will-change: transform`) where appropriate.

## Phase 2 — Layer Hierarchy + Interaction Safety
- [ ] Enforce Home1 layer hierarchy:
  - background base
  - tabloid underlay
  - orbital
  - interactive feed/CTA surfaces
- [ ] Verify `TmiMagazineOrbitalUnderlay` z-index is below interactive controls but above background.
- [ ] Eliminate click-through conflicts in overlapped layers.

## Phase 3 — Preserve Flow-Lock + Canonical Routing
- [ ] Preserve Arena Triangle destinations.
- [ ] Preserve Billboard/feed behavior.
- [ ] Preserve NavigationRail behavior.
- [ ] Preserve `autoSeat=1` room routing behavior.
- [ ] Keep canonical challenge routing (`/challenge`) intact; do not introduce legacy challenge routes.

## Phase 4 — Purge / Cleanup Tracking
- [ ] Mark every removed legacy fragment as `[x] Purged` in this file during edits.
- [ ] Keep `ROUTE_TRUTH_TABLE.md` unchanged except if explicitly approved for route governance updates.

## Phase 5 — Validation
- [ ] Run `pnpm -C apps/web typecheck`.
- [ ] Run `pnpm -C apps/web build`.
- [ ] Perform critical-path browser checks on Home1 (desktop + mobile):
  - [ ] Challenge CTA
  - [ ] Battle CTA
  - [ ] Cypher CTA
  - [ ] Arena Triangle cards
  - [ ] World lobby cards
  - [ ] Orbital panel links
- [ ] Capture desktop/mobile screenshots for validation summary.

## Notes
- Do not modify Stripe/API/XP engines in Sprint 1A.
- Do not modify ArenaEventShell behavior in Sprint 1A.
- Home1 must read as: **Live Discovery Network first**, editorial second.
