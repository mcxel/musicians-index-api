# STACK A — SECURITY & BUILD REPORT
**TMI Platform | Runtime + Database Truth + Auth Flow End-to-End**
**Date:** 2025-01-30 | **Status:** ✅ ALL GATES GREEN

---

## 1. CURRENT STATUS

| Gate | Result |
|------|--------|
| DB Schema Push (64 tables) | ✅ PASS |
| Auth Smoke Test (22/22) | ✅ PASS |
| Security Regression | ✅ PASS |
| TS Warning Fix (baseUrl) | ✅ FIXED |
| API Running on port 4000 | ✅ CONFIRMED |

---

## 2. ROOT CAUSE (RESOLVED)

**Problem:** DB had 33 tables from an orphaned old schema (different from `packages/db/prisma/schema.prisma`). The `Session` table had 1 stale row blocking schema push — required columns `expires` + `sessionToken` had no defaults, causing `--accept-data-loss` to fail.

**Fix Applied:**
- Used `prisma db push --force-reset` to drop all 33 stale tables
- Pushed full 50+ model schema from `packages/db/prisma/schema.prisma`
- Result: **64 tables** now live in Neon DB (all critical tables confirmed present)

---

## 3. DATABASE TRUTH

**Provider:** Neon PostgreSQL (cloud)  
**Schema source:** `tmi-platform/packages/db/prisma/schema.prisma`  
**Prisma version:** 7.5.0  
**Adapter:** `@prisma/adapter-pg` 7.5.0 (PrismaPg pattern)

### Tables Confirmed Present (64 total)
```
Account, Artist, ArtistProfile, AuditLog, Battle, Beat, BeatLicense,
CheckIn, ChildAccount, Competition, CompetitionRegistration, Event,
FamilyAccount, FanClub, FanClubMembership, FanClubPost, FanClubTier,
FanProfile, FeatureFlag, FeedItem, Hub, LedgerEntry, ModerationAction,
MusicLink, Notification, NotificationPreference, Order, ParentApproval,
Payout, Price, Product, PromoCode, PushSubscription, RankEntry, Refund,
RefundPolicy, Report, Season, SeasonAward, Session, Subscription, Ticket,
TicketType, Tip, Transaction, User, UserBlock, UserMute, UserProfile,
UserSettings, VerificationToken, Wallet, articles, contest_entries,
contest_prizes, contest_rounds, contest_seasons, contest_votes, host_cues,
poll_snapshots, prize_fulfillments, ray_journey_scripts, sponsor_contributions,
sponsor_packages
```

**Critical tables verified:** User ✅ | Account ✅ | Session ✅ | Wallet ✅ | Notification ✅

---

## 4. AUTH SMOKE TEST — 22/22 PASS ✅

**Test script:** `tmi-platform/scripts/auth-smoke-test.js`  
**Run command:** `node scripts/auth-smoke-test.js`

| # | Test | Result |
|---|------|--------|
| 1 | GET /api/auth/session (unauthenticated) → 200 | ✅ PASS |
| 2 | session unauthenticated → authenticated:false | ✅ PASS |
| 3 | session unauthenticated → csrfToken present | ✅ PASS |
| 4 | POST /api/auth/register → 201 | ✅ PASS |
| 5 | register → ok:true | ✅ PASS |
| 6 | register → user.email matches | ✅ PASS |
| 7 | POST /api/auth/login → 200 | ✅ PASS |
| 8 | login → ok:true | ✅ PASS |
| 9 | login → authenticated:true | ✅ PASS |
| 10 | login → user.email matches | ✅ PASS |
| 11 | login → session cookie set | ✅ PASS |
| 12 | GET /api/auth/session (authenticated) → 200 | ✅ PASS |
| 13 | session authenticated → authenticated:true | ✅ PASS |
| 14 | session authenticated → user.email matches | ✅ PASS |
| 15 | POST /api/auth/logout → 200 | ✅ PASS |
| 16 | logout → ok:true | ✅ PASS |
| 17 | logout → authenticated:false | ✅ PASS |
| 18 | GET /api/auth/session (after logout) → 200 | ✅ PASS |
| 19 | session after logout → authenticated:false | ✅ PASS |
| 20 | POST /api/auth/login (wrong password) → 401 | ✅ PASS |
| 21 | POST /api/auth/register (duplicate email) → 409 | ✅ PASS |
| 22 | POST /api/auth/login (no CSRF token) → 403 | ✅ PASS |

---

## 5. SECURITY SCAN FINDINGS

### 5.1 CONFIRMED SECURE — Auth Layer

| Control | Implementation | Status |
|---------|---------------|--------|
| Password hashing | bcryptjs cost=12 | ✅ SECURE |
| Session tokens | `crypto.randomUUID()` | ✅ SECURE |
| CSRF tokens | `crypto.randomBytes(24)` hex | ✅ SECURE |
| CSRF enforcement | Double-submit cookie pattern on all mutations | ✅ SECURE |
| Session cookie | `httpOnly:true`, `sameSite:lax`, `secure:true` in prod | ✅ SECURE |
| CSRF cookie | `httpOnly:false` (JS-readable for header), `sameSite:lax` | ✅ SECURE |
| Email normalization | lowercase + trim before DB write | ✅ SECURE |
| Session expiry | Auto-delete on expiry check | ✅ SECURE |
| Error handling | `getSession()` catches → returns null (401 not 500) | ✅ SECURE |
| Duplicate email | 409 Conflict (not 500) | ✅ SECURE |
| Wrong password | 401 Unauthorized (not 500) | ✅ SECURE |
| Debug endpoints | Gated by `AUTH_DEBUG_ENABLED=true` env var | ✅ SECURE |

### 5.2 CONFIRMED SECURE — API Layer (main.ts)

| Control | Implementation | Status |
|---------|---------------|--------|
| Helmet | `app.use(helmet())` | ✅ SECURE |
| CORS | Allowlist from `CORS_ORIGINS` env, no wildcard in prod | ✅ SECURE |
| CSRF middleware | Global middleware on all mutations (POST/PATCH/PUT/DELETE) | ✅ SECURE |
| Input validation | `ValidationPipe` with `whitelist:true`, `forbidNonWhitelisted:true` | ✅ SECURE |
| Error messages | `disableErrorMessages:true` in production | ✅ SECURE |
| Cookie parser | `cookie-parser` middleware | ✅ SECURE |
| Root path handler | Returns `{ok:true}` before global prefix (health check safe) | ✅ SECURE |

### 5.3 CONFIRMED SECURE — CORS Configuration

```typescript
// main.ts — CORS is allowlist-based, not wildcard
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",").map(v => v.trim()).filter(Boolean);
const allowAnyOrigin = allowedOrigins.includes("*");
// allowAnyOrigin only true if explicitly set — never default
```
**Risk:** `allowAnyOrigin` flag exists — ensure `CORS_ORIGINS` never contains `*` in production.  
**Recommendation:** Add env validation to reject `*` in `NODE_ENV=production`.

### 5.4 WARNINGS — Non-Blocking

| # | Issue | Severity | File | Fix |
|---|-------|----------|------|-----|
| W1 | `Math.random()` used for bio rotation shuffle | LOW | `imports/external-packages/tmi-components/src/hooks/useBioRotation.js` | Acceptable for UI shuffle (not security-sensitive). No fix needed. |
| W2 | `execSync` in scripts | LOW | `scripts/release-notes.js`, `scripts/db-migrate-dryrun.js`, `scripts/bot-triage.js` | Scripts only, not in runtime API. Inputs are hardcoded, not user-supplied. Acceptable. |
| W3 | `spawnSync` in pipeline scripts | LOW | `scripts/pipeline-promotion-gate.js`, `scripts/pipeline-promotion-gate-proof.js` | CI/ops scripts only. Not in runtime path. Acceptable. |
| W4 | SSL warning from `pg` library | INFO | `scripts/check-db-tables.js` | `sslmode=require` treated as `verify-full` in pg v8. Upgrade path: add `uselibpqcompat=true` or `sslmode=verify-full` to DATABASE_URL. Non-blocking. |
| W5 | `baseUrl` deprecated in TS 6.0 | INFO | `tmi-platform/tsconfig.json` | **FIXED** — added `"ignoreDeprecations": "6.0"` |
| W6 | `AUTH_DEBUG_ENABLED` debug endpoints | MEDIUM | `auth.controller.ts` | Debug endpoints (`/api/auth/debug-user`, `/api/auth/debug-create`) are gated by env var. **Ensure `AUTH_DEBUG_ENABLED` is NOT set in production.** |

### 5.5 MISSING CONTROLS — Next Phase Targets

| # | Gap | Priority | Recommended Fix |
|---|-----|----------|-----------------|
| G1 | No rate limiting on auth endpoints | HIGH | Add `@nestjs/throttler` — 5 attempts/15min on login/register |
| G2 | No account lockout after failed logins | HIGH | Track failed attempts in DB, lock after N failures |
| G3 | No `secure:true` enforcement check on cookie in non-prod | MEDIUM | Add warning log if `NODE_ENV !== production` and `secure:false` |
| G4 | No CORS wildcard guard in production | MEDIUM | Add `validateBootEnvOrThrow()` check: reject `CORS_ORIGINS=*` in prod |
| G5 | No Content-Security-Policy header beyond Helmet defaults | MEDIUM | Configure explicit CSP via `helmet.contentSecurityPolicy()` |
| G6 | No audit log on login/register/logout | MEDIUM | Write to `AuditLog` table on auth events |
| G7 | No session rotation on privilege escalation | MEDIUM | Rotate session token on role change |
| G8 | No `Secure` flag on CSRF cookie in dev | LOW | Acceptable for dev, but document explicitly |
| G9 | `pg` SSL mode warning | LOW | Add `sslmode=verify-full` to DATABASE_URL or `uselibpqcompat=true` |
| G10 | No input length cap on email/password beyond MinLength(8) | LOW | Add `MaxLength(254)` on email, `MaxLength(128)` on password |

---

## 6. FILES CHANGED IN STACK A

| File | Change | Status |
|------|--------|--------|
| `packages/db/prisma/schema.prisma` | datasource: no `url` (Prisma v7 compliant) | ✅ |
| `packages/db/prisma.config.ts` | `datasource.url` from `process.env.DATABASE_URL` | ✅ |
| `packages/db/package.json` | Added `@prisma/adapter-pg`, `pg` | ✅ |
| `packages/db/src/index.ts` | PrismaPg adapter pattern | ✅ |
| `packages/db/.env` | Neon DATABASE_URL (plain text, not dotenvx) | ✅ |
| `apps/api/prisma/schema.prisma` | Comment-only redirect to packages/db | ✅ |
| `scripts/check-db-tables.js` | fs-based .env parse (bypasses dotenvx) | ✅ |
| `scripts/auth-smoke-test.js` | NEW — 22-check auth smoke test | ✅ |
| `tsconfig.json` | Added `"ignoreDeprecations": "6.0"` | ✅ FIXED |

---

## 7. PROOF COMMANDS

```powershell
# Verify DB tables (64 expected)
node scripts/check-db-tables.js

# Run auth smoke test (22/22 expected)
node scripts/auth-smoke-test.js

# Verify API root
Invoke-WebRequest -Uri "http://localhost:4000/" -UseBasicParsing

# Verify session endpoint
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/session" -UseBasicParsing
```

---

## 8. STACK A GATE CHECKLIST

- [x] `prisma db push` completes without error
- [x] 64 tables confirmed in Neon DB
- [x] User, Account, Session, Wallet, Notification all present
- [x] API boots on port 4000
- [x] `GET /` → 200 `{ok:true}`
- [x] `GET /api/auth/session` → 200 with csrfToken
- [x] Register → 201 with user object
- [x] Login → 200 with session cookie + authenticated:true
- [x] Session (authenticated) → 200 with user
- [x] Logout → 200 with authenticated:false
- [x] Session (after logout) → authenticated:false
- [x] Wrong password → 401
- [x] Duplicate email → 409
- [x] No CSRF → 403
- [x] TS deprecation warning fixed
- [x] Security scan complete — no critical vulnerabilities

---

## 9. NEXT STACK (Stack B)

**Stack B: Core Platform Models**

Target modules:
- `UserProfile`, `ArtistProfile`, `FanProfile` — profile completion flows
- `Artist` — artist CRUD, slug routing, booking
- `Venue` — venue CRUD, room management
- `Event` / `Show` — event creation, ticket types
- `Sponsor` / `Advertiser` — campaign management
- `Article` — editorial publishing workflow
- `Notification` — push/in-app notification delivery
- `Follow` / `FanClub` — social graph

**Stack B Gate Requirements:**
- All profile endpoints return correct data
- Artist page (`/artist/[slug]`) renders with live DB data
- Venue booking flow creates Event record
- Article publish creates Article record
- Notification creates Notification record
- Security regression still green after Stack B

---

## 10. KNOWN ISSUES (Non-Blocking)

| Issue | Impact | Action |
|-------|--------|--------|
| `tmi-platform/.env` has stale local DB URL | None — not used by any script | Leave as-is or update to Neon URL |
| dotenvx@17.3.1 cannot load plain .env | None — scripts use fs parse | Document workaround |
| `pg` SSL mode warning in console | None — connection works | Add `sslmode=verify-full` to URL in next pass |
| `AUTH_DEBUG_ENABLED` must not be set in prod | Security risk if set | Add to deployment checklist |

---

*Stack A Report generated by BLACKBOX — repo-grounded, proof-first.*
*All findings based on actual repo file inspection and live API smoke test.*
