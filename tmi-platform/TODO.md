# Recovery + Canonicalization TODO (current session)

## Phase A — Recovery & Canonicalization
- [ ] Audit and stabilize `apps/web/src/components/home/Home1CoverPage.tsx`
- [ ] Audit and stabilize `apps/web/src/components/home/TmiMagazineOrbitalUnderlay.tsx`
- [ ] Audit and stabilize `apps/web/src/components/sponsors/SponsorRail.tsx`
- [ ] Audit and stabilize `apps/web/src/app/home/1/page.tsx`
- [ ] Audit `tests/e2e/runtime_proof_audit.spec.ts` for unintended corruption

## Phase B — Root File Cleanup
- [ ] Inspect root `UploadPipelineEngine.ts` vs canonical app location
- [ ] Inspect root `VenueRuntimeShell.tsx` vs canonical app location
- [ ] Inspect root `uploadActions.ts` vs canonical app location
- [ ] Remove/ignore non-canonical duplicates and zip artifact from working set

## Phase C — Home 1 Stabilization (no redesign)
- [ ] Improve underlay visibility/layering (textures/lighting only)
- [ ] Improve sponsor readability/contrast and motion smoothness
- [ ] Preserve Claude hierarchy/spacing/information architecture

## Phase D — Verify Build
- [ ] `pnpm -C apps/web typecheck`
- [ ] `pnpm -C apps/web build`

## Phase E — Runtime Matrix (next)
- [ ] Messaging
- [ ] Playlist + Stream & Win
- [ ] Go Live + Invite + RTC
- [ ] Upload closure
- [ ] Stripe entitlements
- [ ] Security/RBAC
