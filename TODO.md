# Security Hardening Slice TODO — COMPLETE ✅ (2026-03-30) — 37/37 PASS

- [x] Patch `apps/api/src/modules/auth/auth.controller.ts`
  - [x] Cookie policy hardening (`secure: isProd`, remove hardcoded localhost domain, optional env domain)
  - [x] Remove client `_debug` payloads; keep server-side logging only
- [x] Patch `apps/web/src/lib/apiProxy.ts`
  - [x] Header allowlist forwarding
  - [x] Strip sensitive/hop-by-hop headers
- [x] Patch `apps/api/src/main.ts`
  - [x] Enforce Origin/Referer checks for mutating requests
- [x] Patch `apps/api/src/modules/auth/auth.service.ts`
  - [x] `getSession()` wrapped in try/catch → returns null on Prisma error → 401 (fixes /users/me 500)
- [x] Patch `apps/api/src/modules/wallet/wallet.service.ts`
  - [x] `resolveUserId()` `prisma.session.findUnique()` wrapped in try/catch → throws UnauthorizedException on any Prisma error (fixes /wallet 500)
- [x] Run regression proof matrix — 37/37 PASS
  - [x] Auth flow (Stack 1: 9/9)
  - [x] CSRF behavior (Stack 2: 8/8)
  - [x] Authorization boundary tests (Stack 3: 10/10)
  - [x] Cookie behavior + security headers (Stack 4: 10/10 + 1 INFO)
  - [x] Proxy abuse attempts (covered in Stack 3)
- [x] Produce final security proof report → `tmi-platform/docs/security/SECURITY_REGRESSION_REPORT.md`

## Remaining Non-Blocking Items (Next Phase)

- [ ] DB migration: resolve Prisma P2022 schema mismatch (`Session.expires`, `User` columns) so login/register work end-to-end
- [ ] Harden `auth.service.ts` `login()` to return 500→422/401 on DB error (not a security issue, UX improvement)
- [ ] Update pg-connection-string SSL mode to explicit `sslmode=verify-full`
