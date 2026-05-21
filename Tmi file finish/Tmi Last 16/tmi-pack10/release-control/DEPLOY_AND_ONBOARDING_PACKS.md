# FIRST_CONTROLLED_DEPLOY_PACK.md
## The Authoritative Checklist Before Any Real Deployment

---

## CURRENT BUILD STATUS

| System | Status | Evidence Required |
|---|---|---|
| GitHub Actions CI | ✅ GREEN | commit 3a81795, run 23248805537 |
| musicians-index-api (Cloudflare) | ❌ BLOCKED | Paste first 30–50 lines of error |
| musicians-index-web (Cloudflare) | ❌ BLOCKED | Paste first 30–50 lines of error |
| Local web build | ❓ UNVERIFIED | Run: `pnpm -C tmi-platform/apps/web run build` |
| Local API build | ❓ UNVERIFIED | Run: `pnpm -C tmi-platform/apps/api run build` |

**DO NOT PROCEED WITH DEPLOY UNTIL ALL ABOVE ARE GREEN.**

---

## VERCEL SETTINGS TRUTH

These must be set exactly:

| Setting | Correct Value |
|---|---|
| Framework | Next.js |
| Root Directory | `tmi-platform/apps/web` |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm run build` |
| Output Directory | (blank) |
| Node Version | 20.x |

---

## ENV VARS REQUIRED (VERIFY ALL PRESENT)

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=[strong random string]
NEXTAUTH_URL=https://[your-domain]
GITHUB_CLIENT_ID=[from GitHub OAuth app]
GITHUB_CLIENT_SECRET=[from GitHub OAuth app]

# App
NEXT_PUBLIC_APP_URL=https://[your-domain]
NEXT_PUBLIC_API_URL=https://[api-domain]
API_BASE_URL=https://[api-domain]

# Analytics (optional pre-launch)
NEXT_PUBLIC_GA_ID=[from Google Analytics]

# Stripe (when billing is ready)
STRIPE_SECRET_KEY=[from Stripe dashboard]
STRIPE_WEBHOOK_SECRET=[from Stripe webhook]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[from Stripe]
```

---

## CLOUDFLARE BUILD FIX — WORKSPACE PACKAGE ISSUE

The current blocker is `@tmi/hud-runtime` not resolving during build.

**Fix A (Preferred):** Add to `tmi-platform/apps/web/package.json`:
```json
{
  "scripts": {
    "prebuild": "pnpm --filter @tmi/hud-core run build && pnpm --filter @tmi/hud-runtime run build && pnpm --filter @tmi/hud-theme run build && pnpm --filter @tmi/hud-tmi run build",
    "build": "next build"
  }
}
```

**Fix B (Safety net):** Add to `tmi-platform/apps/web/next.config.js`:
```js
const nextConfig = {
  transpilePackages: [
    '@tmi/hud-core',
    '@tmi/hud-runtime',
    '@tmi/hud-theme',
    '@tmi/hud-tmi',
    '@tmi/contracts',
    '@tmi/core-domain'
  ]
};
module.exports = nextConfig;
```

**Fix C (Emergency):** Temporarily stub `/hud` page to bypass blocking import.

Apply all three for maximum safety.

---

## PRE-DEPLOY SMOKE CHECKLIST

Run each and confirm:

```
ROUTE SMOKE TEST
[ ] GET / → 200 (not 404)
[ ] GET /register → 200
[ ] GET /login → 200
[ ] GET /articles/[any-valid-slug] → 200
[ ] GET /artists/[any-valid-slug] → 200
[ ] GET /admin → 302 redirect (not 200 unprotected)
[ ] GET /dashboard → 302 redirect to login (not 200 unprotected)

AUTH SMOKE TEST
[ ] POST /api/auth/register → creates user, returns session
[ ] POST /api/auth/login → returns session
[ ] GET /api/auth/session → returns user object
[ ] Session persists after page refresh

API SMOKE TEST
[ ] GET /api/health → 200
[ ] GET /api/artists → 200 (list)
[ ] GET /api/articles → 200 (list)

DATABASE SMOKE TEST
[ ] Prisma migrations ran without errors
[ ] Can write a user record
[ ] Can read the user record back
```

---

## RELEASE COMMAND

```bash
# Step 1: Verify local build
cd tmi-platform
pnpm -C apps/web run build

# Step 2: Commit and push
git add .
git commit -m "release: [description of what changed]"
git push origin main

# Step 3: Confirm CI green
# Wait for GitHub Actions to complete

# Step 4: Verify Cloudflare deploy
# Check Cloudflare Pages dashboard
# Both musicians-index-api and musicians-index-web must show "Success"

# Step 5: Run smoke test on live URL
# curl https://[your-domain]/ → must return HTML (not 404)
```

---

## ROLLBACK COMMAND

```bash
# If deploy breaks production:

# Option A: Revert Cloudflare to previous deployment
# Cloudflare Dashboard → Pages → [Project] → Deployments → Previous → Rollback

# Option B: Git revert
git revert HEAD
git push origin main
# Wait for CI + Cloudflare to redeploy

# Option C: Feature flag disable
# In .env: set FEATURE_FLAG_[BROKEN_FEATURE]=false
# Redeploy
```

---

## WHO AND WHAT NOT TO TOUCH DURING DEPLOY

**Do not touch during active deploy:**
- Database production connection string
- NextAuth secret
- Any Cloudflare Page settings
- Stripe webhook endpoint
- Domain DNS settings

**Only Big Ace executes deployment.**
**Marcel observes and logs.**
**Jay Paul Sanchez view only.**

---

## REQUIRED SCREENSHOTS BEFORE DEPLOY IS OFFICIAL

Save to `/proof/deploy/`:
- [ ] Cloudflare dashboard showing both projects as "Success"
- [ ] Homepage loading at live URL
- [ ] `/register` loading at live URL
- [ ] `/login` loading at live URL
- [ ] GitHub CI green run screenshot
- [ ] Smoke test output log

---

*First Controlled Deploy Pack v1.0 — BerntoutGlobal XXL*

---
---
---

# FIRST_REAL_ONBOARDING_PACK.md
## Proving the Platform Works for Real Users

---

## PURPOSE

This is the proof run before opening to real members.
Every gate must pass. No skipping. No "it probably works."

---

## GATE 1 — REGISTER + LOGIN + LOGOUT PROOF

```
Test: New account registration
  1. Go to /register
  2. Fill name, email, password
  3. Submit
  Expected: Account created, redirected to /onboarding OR /dashboard
  Evidence: DB record created, session cookie set

Test: Login
  1. Go to /login
  2. Enter registered email/password
  3. Submit
  Expected: Session created, redirected to correct dashboard
  Evidence: /api/auth/session returns user object

Test: Logout
  1. Click logout
  Expected: Session destroyed, redirected to /login or /
  Evidence: /api/auth/session returns null

Test: Social auth (if enabled)
  1. Click "Continue with Google"
  Expected: OAuth flow, returns to app with session
```

Screenshots required: Registration form → success state → dashboard

---

## GATE 2 — SESSION RESTORE PROOF

```
Test: Session survives refresh
  1. Login
  2. Hard refresh (Ctrl+R)
  Expected: Still logged in, same dashboard
  Evidence: Session cookie persists

Test: Session survives tab close + reopen
  1. Login
  2. Close browser tab
  3. Reopen same URL
  Expected: Still logged in
  Evidence: Persistent session cookie works

Test: Stale session recovery
  1. Login
  2. Wait 2+ hours (or manipulate cookie)
  3. Try to access /dashboard
  Expected: Redirect to /login, not broken state or 500
  Evidence: Clean redirect with no console errors
```

---

## GATE 3 — ONBOARDING FLOW PROOF

### Artist Path
```
1. Register as artist
2. /onboarding/artist loads
3. Complete Step 1: profile setup (name, genre, bio)
4. Complete Step 2: index registration (rank# assigned)
5. Complete Step 3: first article auto-created
6. Complete Step 4: venue unlock (Living Room shown)
7. Skip billing (optional)
8. Complete tutorial (4 steps)
9. Reach "Go Live" prompt
Expected: All steps trackable, % progress shows in dashboard
Evidence: onboarding_progress DB record, article in DB
```

### Fan Path
```
1. Register as fan
2. /onboarding/fan loads
3. Genre selection (pick 2 genres)
4. Artists shown for each genre
5. Follow 1+ artists
6. Enter first venue
7. Seat assigned
8. Upgrade prompt shown (gentle)
Expected: Follow recorded in DB, venue entry works
Evidence: follow record in DB, venue session created
```

---

## GATE 4 — STALE ROUTING RECOVERY PROOF

```
Test: Broken URL recovery
  1. Navigate to /dashboard/artist directly (not through login)
  Expected: Redirect to /login, then back to /dashboard/artist after login
  
Test: 404 recovery
  1. Navigate to /artists/this-does-not-exist
  Expected: Clean 404 page, not blank/crashed

Test: Back button after logout
  1. Login → go to /dashboard → logout
  2. Press browser back button
  Expected: Redirect to /login, not broken dashboard
```

---

## GATE 5 — DASHBOARD ROUTING PROOF

```
Fan:
  /dashboard → correct fan dashboard
  /dashboard/artist → 403 forbidden

Artist:
  /dashboard → correct artist dashboard
  /admin → 403 forbidden

Admin (Big Ace):
  /admin → correct admin panel
  All routes accessible

Marcel:
  /dashboard → analytics-only view
  Cannot access /admin/commands

Jay Paul:
  /dashboard → view-only analytics
  Cannot access /admin at all
```

---

## GATE 6 — ROLE BOUNDARY PROOF

```
Verify: Marcel cannot execute commands
  POST /api/commands → 403

Verify: Jay Paul cannot submit suggestions via command pipeline
  POST /api/dashboard/suggestion → blocked OR routed to Big Ace only

Verify: Fan cannot access artist dashboard
  GET /dashboard/artist → 403 or redirect

Verify: Unauth user cannot access any /dashboard
  GET /dashboard → redirect to /login
```

---

## GATE 7 — ONE CLEAN FAN PATH (END TO END)

```
START: Visit https://[domain]/

Path:
  / → "Sign Up Free" → /register → /onboarding/fan
  → Select genres → Follow 2 artists → Enter first event
  → Seated in Living Room → React to event → Earn 12 points
  → See points balance update
  → See tier bar at 2.4% (12/499)

Expected artifacts:
  - DB: user record
  - DB: fan profile
  - DB: 2 follow records
  - DB: points transaction records (2×5 + 2×1 = 12)
  - UI: points balance visible
  - UI: room entry confirmed

Screenshots: Every step → save to /proof/onboarding/fan/
```

---

## GATE 8 — ONE CLEAN ARTIST PATH (END TO END)

```
START: Visit https://[domain]/

Path:
  / → "Join as Artist" → /register (artist type)
  → /onboarding/artist → complete all 8 steps
  → Dashboard shows rank#, earnings $0, 0 followers
  → Go Live → select Living Room → start stream
  → 1 fan joins (test account) → fan sees artist on screen
  → Artist sees 1 viewer in HUD
  → Stream ends → earnings/analytics update

Expected artifacts:
  - DB: artist profile
  - DB: auto-generated article
  - DB: rank# assigned
  - DB: live event record (started + ended)
  - UI: dashboard shows event in history
  - UI: analytics show 1 viewer

Screenshots: Every step → save to /proof/onboarding/artist/
```

---

## FINAL ONBOARDING READINESS DECLARATION

The platform is ready for real member onboarding when:

- [ ] Gate 1 passes (register/login/logout)
- [ ] Gate 2 passes (session restore)
- [ ] Gate 3 passes (both onboarding paths)
- [ ] Gate 4 passes (stale routing)
- [ ] Gate 5 passes (dashboard routing)
- [ ] Gate 6 passes (role boundaries)
- [ ] Gate 7 passes (fan path end-to-end)
- [ ] Gate 8 passes (artist path end-to-end)
- [ ] All screenshots saved to /proof/onboarding/
- [ ] Big Ace reviews and approves

**SIGN-OFF REQUIRED: Big Ace only**

---

*First Real Onboarding Pack v1.0 — BerntoutGlobal XXL*
