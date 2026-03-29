# SLICE_PROOF_GATE_CHECKLIST.md
# Slice Proof Gate Checklist
# A slice is NOT complete unless ALL applicable items pass.
# Copy this checklist for each slice and fill it in.

## Slice: ____________  Date: ____________  Completed by: ____________

---

## Gate 1 — Build

- [ ] `pnpm build` exits 0 (no TypeScript errors, no build failures)
- [ ] `pnpm lint` exits 0 (no ESLint errors)
- [ ] No new `@ts-ignore` or `any` types introduced without approval

**Command:**
```bash
cd tmi-platform && pnpm build && pnpm lint
```

**Expected result:** Exit 0 on both commands.

---

## Gate 2 — Target Route Renders

- [ ] Target route(s) for this slice load without console errors
- [ ] No React hydration mismatches
- [ ] No uncaught runtime exceptions at page load

**Routes tested:**
```
[ ] /___________
[ ] /___________
```

**Command:**
```bash
pnpm dev
# Open browser → navigate to routes above → check console
```

---

## Gate 3 — API Endpoints

- [ ] New API endpoint(s) respond with correct HTTP status
- [ ] Auth-protected endpoints return 401 for unauthenticated requests
- [ ] Admin-only endpoints return 403 for non-admin requests
- [ ] No 500 errors for valid inputs

**Endpoints tested:**
```
[ ] GET/POST /api/_____________ → ___ expected status
[ ] GET/POST /api/_____________ → ___ expected status
```

---

## Gate 4 — Database

- [ ] New models migrated (`pnpm prisma migrate dev` exits 0)
- [ ] Seed data applied if required (e.g., Diamond status for Marcel, B.J.M.)
- [ ] No orphaned data, no FK violations

**Command:**
```bash
cd packages/db && pnpm prisma migrate dev
```

---

## Gate 5 — LOCKED Systems Unaffected

- [ ] `apps/web/src/middleware.ts` is unchanged (or change is intentional + proven safe)
- [ ] Auth flow (`/auth/**`) still works end-to-end (sign in, sign out, session persist)
- [ ] Onboarding flow (`/onboarding/**`) still works for new user
- [ ] RBAC: admin route still redirects non-admin users

**Quick smoke test:**
```bash
# Open incognito → visit /admin → confirm redirect to /auth/signin
# Sign in as admin → visit /admin → confirm access
# Sign in as USER → visit /admin → confirm 403/redirect
```

---

## Gate 6 — States

- [ ] Loading state exists and displays correctly (skeleton/shimmer, max 3s → empty state)
- [ ] Empty state exists, matches wording in `EMPTY_STATE_LIBRARY.md`
- [ ] Error state exists, does NOT display raw error to user
- [ ] Fallback behavior defined and tested (API unavailable → graceful degrade)

---

## Gate 7 — Visual Drift

- [ ] Ran `PDF_VISUAL_DRIFT_CHECKLIST.md` against all new UI in this slice
- [ ] All drift checklist items are ✅
- [ ] Near-black backgrounds ✅
- [ ] Sharp corners (no rounded-2xl on content cards) ✅
- [ ] TMI display font for headers ✅
- [ ] Brand spellings preserved ✅

---

## Gate 8 — Asset Policy

- [ ] No Downloads/ or Desktop/ path references in new/edited files
- [ ] All new assets placed in `assets/` repo-relative paths

**Command:**
```bash
grep -r "Downloads/" apps/ packages/ --include="*.ts" --include="*.tsx" -l
grep -r "Desktop/" apps/ packages/ --include="*.ts" --include="*.tsx" -l
```

**Expected result:** Zero matches.

---

## Gate 9 — Brand Protection

- [ ] "Berntout" spelled correctly (not "Burnout", "Berntot", "Berntout\'s")
- [ ] "BerntoutGlobal" spelled correctly (no spaces, correct capitalization)
- [ ] "Berntout Perductions" spelled correctly (not "Productions")
- [ ] "The Musician\'s Index" spelled correctly (not "Musicians Index" without apostrophe)
- [ ] No AI-autocorrected brand name substitutions

**Command:**
```bash
grep -ri "burnout\|berntot\|productions\b" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.md" -l
```

---

## Gate 10 — Proof Output

- [ ] Direct proof command run and output captured
- [ ] Regression proof run on affected systems
- [ ] No new test failures introduced

**Proof output (paste actual output here):**
```
[paste command output]
```

---

## Slice Sign-Off

| Gate | Status | Notes |
|------|--------|-------|
| Build | ✅ / ❌ | |
| Route renders | ✅ / ❌ | |
| API endpoints | ✅ / ❌ | |
| Database | ✅ / ❌ | |
| Locked systems | ✅ / ❌ | |
| States | ✅ / ❌ | |
| Visual drift | ✅ / ❌ | |
| Asset policy | ✅ / ❌ | |
| Brand protection | ✅ / ❌ | |
| Proof output | ✅ / ❌ | |

**Overall: ALL GATES PASS → SLICE COMPLETE → OK TO COMMIT**

If any gate fails → DO NOT COMMIT → return to slice and fix.
