# AUTH & ONBOARDING CERTIFICATION
**Date:** 2026-06-16 | **Priority:** P0 (Launch Blocker)

**Goal:** Verify every step of the Auth/Onboarding pipeline from Google/Email Signup to Role Assignment and Hub Routing. All checks must differentiate between **CODE PASS** and **RUNTIME PASS**.

## 1. Onboarding Audit Matrix

| Check | Code Status | Runtime Status |
| :--- | :--- | :--- |
| **Google Signup** | 🟡 PENDING | 🔴 FAIL |
| **Email Signup** | 🟡 PENDING | 🔲 PENDING |
| **Role Assignment** | 🟡 PENDING | 🔲 PENDING |
| **User Provisioning** | 🟡 PENDING | 🔲 PENDING |
| **Dashboard Routing** | 🟡 PENDING | 🔴 FAIL |
| **Hub Selection** | 🟡 PENDING | 🔲 PENDING |

## 2. Google Signup Bug Report

### Root Cause Hypothesis
When a new user signs up with Google OAuth, the identity provider does not capture a `Role` selection (unlike a custom email signup form). 
1. NextAuth's `signIn` callback or `User` model defaults the role to `USER` or `FAN`.
2. The user skips the onboarding flow (`OnboardingState = NO_ROLE_SELECTED` or `INCOMPLETE`).
3. The Next.js `middleware.ts` or post-login redirect logic routes authenticated users with a default role to the legacy BlackBox `/dashboard` route, instead of intercepting them to complete onboarding or routing them to the new Claude-designed `/hub/fan`.

### Files to Fix
- `apps/web/src/middleware.ts` — Update redirect logic to point to `/hub/[role]`, and force `/onboarding` if role is missing.
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` — Check Google OAuth callback to ensure `onboardingState` is correctly initialized.
- `apps/web/src/lib/auth/roles.ts` (if present) — Update mapping for default roles to their respective new Claude hubs.

### Fix Plan
1. **Purge Legacy Routes:** Remove or redirect legacy `/dashboard` routes to force users into the Claude `/hub/*` ecosystem.
2. **Force Onboarding Gate:** If `onboardingState !== 'COMPLETE'`, redirect to `/onboarding/role-selection`.
3. **Hub Routing Logic:** Map roles explicitly: `FAN` → `/hub/fan`, `PERFORMER` → `/hub/performer`, `PRODUCER` → `/hub/producer`, etc.

### Certification Status
🔴 **BLOCKED** until `middleware.ts` and NextAuth callbacks are audited and updated.