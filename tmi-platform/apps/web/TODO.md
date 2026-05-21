# PRODUCTION HARDENING PASS — SECURITY + VISUAL AUTHORITY (COMPLETE 2026-05-11)

## SOFT-LAUNCH OPERATIONS PACKET (CRITICAL-PATH LINKAGE)
- `./SOFT_LAUNCH_ACTIVATION_PLAN.md`
- `./KPI_OPERATIONS_SCORECARD.md`
- `./GO_LIVE_CHECKLIST_RUNTIME.md`
- `../../../TMI_MASTER_LAUNCH_BOARD.md`

### LOCKED DIRECTIVE ALIGNMENT
- no major new architecture tonight
- no full games before soft launch
- operation over expansion
- founder onboarding first
- beat uploads, livestream tips, Diamond accounts, local sponsors first

## APPROVED EXECUTION ORDER
1. Stripe/webhook hardening
2. Runtime authority enforcement on public visual surfaces
3. Telemetry + ownership conflict instrumentation
4. Deterministic proof gates only
5. Gemini handoff artifact prep

## STEP TRACKER
- [ ] Harden `src/lib/launch/route.ts`
  - [ ] signature verification
  - [ ] fail-closed behavior
  - [ ] malformed signature rejection before JSON parse
  - [ ] replay rejection hook
  - [ ] no payload logging
- [ ] Harden `src/app/api/stripe/webhook/route.ts`
  - [ ] method enforcement
  - [ ] content-type enforcement
  - [ ] body size limits
  - [ ] timeout enforcement
  - [ ] strict API-base allowlist
  - [ ] safe forwarding + secret isolation
  - [ ] abuse/rate-limit guard
- [ ] Runtime authority enforcement (public surfaces)
  - [ ] Home 1–5
  - [ ] Home1DiscoverySurface
  - [ ] Home3LiveWorldSurface
  - [ ] Home4SponsorSurface
  - [ ] Home5OpenRoomsGrid
  - [ ] magazine hero/spread slots
  - [ ] sponsor billboards
  - [ ] performer cards
  - [ ] ticket/NFT previews
  - [ ] live room panels
- [ ] Telemetry instrumentation
  - [ ] authority_conflict
  - [ ] static_bypass_detected
  - [ ] overlay_desync
  - [ ] stale_generator
  - [ ] failed_heartbeat
  - [ ] quarantine_entered
  - [ ] quarantine_recovered
  - [ ] recovery_escalation
- [ ] Governance tracking updates
  - [ ] migrated surfaces
  - [ ] unresolved bypasses
  - [ ] quarantine candidates
  - [ ] remaining static dependencies
  - [ ] proof-gate status
- [ ] Deterministic validation
  - [ ] `pnpm exec tsc --noEmit`
  - [ ] `pnpm exec tsx scripts/*.ts` proof scripts
- [ ] Gemini handoff package
  - [ ] compile proof
  - [ ] route proof
  - [ ] webhook/auth proof
  - [ ] middleware proof
  - [ ] no-static-fallback delta report
  - [ ] authority migration report
  - [ ] overlay sync proof
  - [ ] runtime lineage proof
  - [ ] quarantine proof
  - [ ] telemetry integrity proof

## FORBIDDEN EXECUTION MODES
- `node -e`
- multiline inline eval
- giant inline powershell payloads
