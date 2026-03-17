# Phase 11 Runtime Stabilization TODO

- [x] Step 1: Confirm Phase 10 closure and lock scope to Phase 11 runtime stabilization
- [x] Step 2: Inspect web auth proxy flow and stabilize /api/auth/session behavior
- [x] Step 3: Add defensive proxy error handling for missing/unreachable upstream
- [x] Step 4: Verify current runtime endpoints (/api/auth/session, /api/healthz, /api/readyz)
- [ ] Step 5: Create authoritative backend bootstrap in `tmi-platform/apps/api/src` (`main.ts`, `app.module.ts`)
- [ ] Step 6: Implement source-owned backend routes:
  - [ ] `GET /api/healthz`
  - [ ] `GET /api/readyz`
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
  - [ ] `GET /api/auth/session`
- [ ] Step 7: Wire existing health/tickets modules into root app module
- [ ] Step 8: Add auth/prisma wiring required for runtime-owned auth contract
- [ ] Step 9: Run thorough edge-case matrix (methods, malformed payloads, missing env, upstream-down scenarios)
- [ ] Step 10: Run auth security review and produce Gemini Step 2 handoff package
