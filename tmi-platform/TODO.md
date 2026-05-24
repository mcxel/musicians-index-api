# Documentation + WebRTC TODO (Reality-first pass)

## Docs
- [x] Create `README.md` (soft-launch accurate, reality-first)
- [x] Create `docs/ONBOARDING.md` (current operator flows + testing)
- [x] Create `docs/VISION.md` (future-state blueprint)
- [x] Update `README_DEPLOYMENT.md` (practical deploy + env + smoke checks)
- [x] Run docs consistency review against current known flows/routes

## WebRTC Critical Path
- [x] Wire live room route to actual multi-participant video component
- [x] Ensure participant joined/updated/left visibility in grid
- [x] Add explicit empty-state messaging when alone in room
- [x] Keep chat minimal/local proof-of-life only (no backend expansion)
- [ ] Run route load check + multi-tab participant visibility test

## P0 Email System Hardening
- [x] Convert `EmailRetryEngine` to async provider-backed sends (`sendAsync`) to prevent dev-stub false positives
- [x] Update `EmailQueueEngine` processing methods to async and await real delivery outcomes
- [x] Remove spoofable body-based `adminEmail` auth path from `api/invites/send`
- [x] Add invite send failure handling when provider send returns unsuccessful status
- [x] Align invite route admin gate with trusted cookie/session resolver (replace transitional header role/email gate)

## P0 Security Lockdown (Identity Scope)
- [x] Patch `apps/web/src/app/api/auth/session/route.ts` for role-scoped identity + admin/internal email redaction for non-admin responses
- [x] Add `apps/web/src/app/api/auth/me/route.ts` as self-only endpoint with same redaction policy
- [x] Patch `apps/web/src/hooks/SessionContext.tsx` to hydrate from `/api/auth/me` and remove hardcoded identity
- [x] Patch `apps/web/middleware.ts` to enforce admin gate sanitation and clear leaked role/email cookies on denied admin access
- [x] Audit `AdminAuthStore` / `AdminUserStore` usage outside `/admin` (none found in `apps/web/src`)
- [x] Run focused typecheck for touched files

## Chaotic Arena Mode
- [x] Plan approved for arena-mode implementation-only pass
- [x] Extend `VideoRoom` to expose participant list + media metadata to parent layer
- [x] Replace boring grid-only feeling with arena shell + floating participant presentation layer
- [x] Add spotlight scaffold with click-to-focus behavior
- [x] Add floating live chat overlay (last 3 messages)
- [x] Add lightweight room-energy activity signal
- [x] Integrate without backend expansion or architecture rebuild
