# UPLOAD TODAY — COMPLETE SEQUENCE
# TMI Platform — BerntoutGlobal XXL
# Every step needed to go from local to live today.
# Work through this top to bottom. Check each box as it passes.

---

## ESTIMATED TIME: 3–5 hours for first deploy + first member

---

## PHASE A — LOCAL PROOF (1–2 hours)

### A1. Place all contest files in wave order
- [ ] Wave 1 docs placed (0 risk — just copy markdown files)
- [ ] Wave 2 components placed → `pnpm -C apps/web build` passes
- [ ] Wave 3 config files placed → `pnpm -C apps/web build` passes
- [ ] Wave 4 pages placed (admin/layout.tsx FIRST) → routes confirmed
- [ ] Wave 4.5 repo inventory run (PowerShell Get-ChildItem commands)
- [ ] Wave 5 API files placed (CHECK existing files first) → `pnpm -C apps/api build` passes
- [ ] Wave 5 env vars added to apps/api/.env (5 contest vars)
- [ ] Wave 6 Prisma reviewed manually → appended → `npx prisma generate` → `npx prisma migrate dev`
- [ ] Wave 7 smoke test placed → playwright passes

### A2. Run proof gate
```powershell
.\PHASE18_PROOF_GATE.ps1
```
- [ ] Proof gate exits 0 (ALL checks pass)

If proof gate fails → fix failures → re-run → do not proceed until it passes.

---

## PHASE B — CAPTURE UPLOAD SMOKE PACK (30 min)

Take screenshots/recordings of these as evidence:

- [ ] Screenshot: `GET /api/healthz` response in browser (shows build hash)
- [ ] Screenshot: `GET /api/readyz` response in browser
- [ ] Screenshot: `/auth` page rendering correctly
- [ ] Screenshot: `/contest` page rendering correctly
- [ ] Screenshot: `/contest/rules` page rendering
- [ ] Screenshot: `/contest/leaderboard` page rendering (even if empty)
- [ ] Screenshot: `/contest/admin` → redirects to /auth (unauthenticated)
- [ ] Screenshot: Terminal showing all E2E tests passing
- [ ] Screenshot: `pnpm -C apps/web build` output showing "✓ Compiled successfully"
- [ ] Screenshot: `pnpm -C apps/api build` output showing success
- [ ] Screenshot: Contest banner visible on an artist profile (if artist exists)

Save all screenshots to: `docs/upload-evidence/YYYY-MM-DD/`

- [ ] Smoke pack folder created and screenshots saved

---

## PHASE C — DATABASE PROVISION (30 min)

- [ ] Render Postgres database provisioned
- [ ] External connection URL copied
- [ ] `DATABASE_URL` value saved securely (password manager)
- [ ] Local apps/api/.env updated with production DATABASE_URL temporarily
- [ ] `npx prisma migrate deploy` run against production DB
- [ ] `npx prisma generate` run
- [ ] `apps/api/.env` DATABASE_URL reverted to local dev URL

---

## PHASE D — API DEPLOY TO RENDER (30 min)

- [ ] Render Web Service created for API
- [ ] GitHub repo connected
- [ ] Root directory set: `apps/api`
- [ ] Build command: `pnpm install && pnpm build`
- [ ] Start command: `node dist/main`
- [ ] All env vars added in Render dashboard (see DEPLOYMENT_RUNBOOK.md)
- [ ] Deploy triggered and completed (green in Render dashboard)
- [ ] `GET https://your-api.onrender.com/api/healthz` returns 200 with JSON
- [ ] `GET https://your-api.onrender.com/api/readyz` returns 200

---

## PHASE E — FRONTEND DEPLOY (30 min)

- [ ] Vercel or Hostinger project created
- [ ] GitHub repo connected
- [ ] Root directory: `apps/web`
- [ ] Framework: Next.js
- [ ] Env vars added (NEXT_PUBLIC_API_URL pointing to Render API)
- [ ] Deploy triggered and completed
- [ ] `https://yourdomain.com/auth` returns 200
- [ ] `https://yourdomain.com/contest` returns 200

---

## PHASE F — CLOUDFLARE + DOMAIN (30 min)

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at IONOS
- [ ] A/CNAME records pointing to deployed frontend
- [ ] CNAME for API subdomain pointing to Render
- [ ] SSL/TLS: Full (Strict) enabled
- [ ] "Always use HTTPS" enabled
- [ ] DNS propagated (use https://dnschecker.org)

---

## PHASE G — LIVE SMOKE TEST (20 min)

Run this against production URLs:
```powershell
$API = "https://your-api.onrender.com"
$WEB = "https://yourdomain.com"

try{(Invoke-WebRequest -UseBasicParsing "$API/api/healthz").Content}catch{"FAIL: $_"}
try{(Invoke-WebRequest -UseBasicParsing "$API/api/readyz").Content}catch{"FAIL: $_"}
try{(Invoke-WebRequest -UseBasicParsing "$WEB/auth").StatusCode}catch{"FAIL: $_"}
try{(Invoke-WebRequest -UseBasicParsing "$WEB/contest").StatusCode}catch{"FAIL: $_"}
try{(Invoke-WebRequest -UseBasicParsing "$WEB/contest/rules").StatusCode}catch{"FAIL: $_"}
```

- [ ] All live smoke tests return 200
- [ ] Platform is live and accessible

---

## PHASE H — FIRST ADMIN SETUP (20 min)

- [ ] Admin user created in DB (see FIRST_MEMBER_ONBOARDING.md → Admin Setup)
- [ ] Admin can log in at `https://yourdomain.com/auth`
- [ ] Admin can access `/contest/admin` without redirect
- [ ] Admin can see contestant queue (even if empty)
- [ ] Admin can create a contest season (August 8 date enforced)

---

## PHASE I — FIRST ARTIST MEMBER (30 min)

- [ ] First artist registers at `/auth/register`
- [ ] Onboarding flow completes to dashboard
- [ ] Artist profile visible
- [ ] Contest banner visible on artist profile
- [ ] Artist can visit `/contest/qualify` and see sponsor progress (0/20)
- [ ] Artist can browse sponsor packages

---

## PHASE J — FIRST FAN MEMBER (20 min)

- [ ] First fan registers
- [ ] Fan can browse contest
- [ ] Fan can see leaderboard (even if empty/placeholder)
- [ ] Fan receives welcome notification (if notifications wired)

---

## DONE CRITERIA

Platform is live and onboarding-ready when:
- [ ] Phase A–G complete
- [ ] Live smoke tests all pass
- [ ] Admin user can log in and manage
- [ ] At least 1 artist has completed onboarding
- [ ] Contest page, rules, and qualify routes all render
- [ ] No 500 errors on any logged page visit

---

*BerntoutGlobal XXL | TMI Platform | Upload Today Checklist | Phase 18*
