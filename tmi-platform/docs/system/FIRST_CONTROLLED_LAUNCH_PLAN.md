# FIRST_CONTROLLED_LAUNCH_PLAN.md
# First Controlled Launch Plan
# This is the go-live checklist and sequence for the first platform launch.

## Launch Philosophy

The first launch is a **controlled launch** — not a public wide-open launch.
We launch with a fixed set of users (admin, 2 invited artists, a small fan group).
We run one of each core platform experience manually.
We verify everything is working before opening to the public.

---

## Pre-Launch Gate (Must All Be Green Before Proceeding)

### Technical Gates
- [ ] Build passes (frontend + backend)
- [ ] CI green (`.github/workflows/ci.yml`)
- [ ] All LOCKED systems passing (auth, onboarding, RBAC, middleware)
- [ ] Database seeded (admin user, Marcel Diamond, B.J.M. Diamond)
- [ ] Environment variables verified (`docs/system/ENV_KEY_MAP.md`)
- [ ] Stripe connected (test mode for launch, live after verification)
- [ ] Email provider connected (transactional emails working)
- [ ] Domain live and HTTPS enforced
- [ ] Sentry / error monitoring active
- [ ] Logging active (API logs, auth events, bot runs)

### Content Gates
- [ ] First magazine issue created and marked `isLive = true`
- [ ] At least 3 artist profiles complete (Marcel, B.J.M., + 1 more)
- [ ] Homepage belts configured (Promo, Live Now, Charts, Magazine, Games, Sponsor)
- [ ] At least 1 sponsor tile active
- [ ] Event calendar: at least 1 upcoming event
- [ ] Achievements seeded (basic set)
- [ ] Rewards catalog seeded (minimum 3 items)
- [ ] All empty states implemented (no blank screens)
- [ ] All error states implemented (no crash pages)

### User Gates
- [ ] Admin user onboarded and tested
- [ ] Marcel onboarded as ARTIST, Diamond status confirmed
- [ ] B.J.M. onboarded as ARTIST, Diamond status confirmed
- [ ] At least 1 USER/fan test account verified
- [ ] SPONSOR test account verified (if sponsor is live)

---

## Controlled Launch Sequence

### Step 1 — Admin Onboard
1. Admin creates account at `[domain]/auth/signup`
2. Admin completes onboarding
3. Admin role set manually in DB or via seed
4. Admin logs in and verifies Admin Command Center access
5. Admin seeds initial content (issue, belts, rewards)

### Step 2 — Artist Onboard (Marcel)
1. Marcel receives invite link
2. Marcel completes ARTIST onboarding
3. Profile article auto-created
4. Admin verifies Diamond status in artist profile
5. Admin confirms Diamond badge showing in HUD, profile, article

### Step 3 — Artist Onboard (B.J.M.)
1. Same as Marcel onboard sequence
2. Both Diamond artists now visible on platform

### Step 4 — First Stream & Win Run
1. Admin logs in as test fan
2. Navigate to `/streamwin`
3. Play a track, wait 30 seconds
4. Confirm +5 points awarded
5. Confirm points appear in HUD
6. Confirm LedgerEntry created in DB

### Step 5 — First Cypher Run
1. Admin creates cypher session
2. Marcel joins as performer
3. Session starts (manual trigger)
4. Run 1 round
5. Confirm scoring works
6. Confirm winner points awarded

### Step 6 — First Booking Run
1. Admin (or Marcel) submits booking request for a date/venue
2. Admin approves request
3. Event created automatically
4. Event appears in `/tickets` and `/calendar`

### Step 7 — First Game Night Run
1. Admin creates Music Trivia session
2. Fan test account joins
3. Admin triggers game start
4. Run 3 rounds
5. Confirm scoring and prize points

### Step 8 — First Issue Release
1. Admin verifies first issue is live
2. Navigate to `/articles` or `/magazine`
3. Confirm horizontal reader works
4. Confirm article shows artist identity (Diamond theming)

---

## Post-Launch Monitoring (First 48 Hours)

- Monitor API error rate (target: < 1%)
- Monitor auth event log for anomalies
- Monitor bot run logs (WeeklyResetBot scheduled but not run yet)
- Monitor points ledger for unexpected entries
- Confirm email delivery (welcome, onboarding, ticket confirmation)
- Admin manually reviews any reported issues

---

## Rollback Trigger

If any of the following occur in first 48 hours, initiate rollback:

- Auth system returning 500s
- Onboarding flow broken
- Points being awarded incorrectly (double-award, wrong amounts)
- Magazine reader crashes
- Critical data loss (user data, points, profile data missing)

Rollback procedure: see `docs/ROLLBACK_PLAYBOOK.md`
