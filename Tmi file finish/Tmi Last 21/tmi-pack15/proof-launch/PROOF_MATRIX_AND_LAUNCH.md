# PLATFORM_PROOF_MATRIX.md
## Every System, Every Proof Gate, Every Success Condition

---

## HOW TO USE

Before any system is declared COMPLETE:
1. Run the exact proof command
2. Observe the exact expected output
3. Screenshot or log the result
4. Save to /proof/[system]/[slice].png
5. Only then mark the system COMPLETE in MASTER_BUILD_MATRIX

---

## SLICE 0 — BUILD PROOF

| Check | Command | Expected |
|---|---|---|
| Local build | `pnpm -C apps/web run build` | Exit 0, no errors |
| HUD packages built | `ls packages/hud-*/dist/index.js` | All 4 exist |
| API build | `pnpm -C apps/api run build` | Exit 0, no errors |
| Cloudflare web | Cloudflare Pages dashboard | ✅ Success |
| Cloudflare api | Cloudflare Pages dashboard | ✅ Success |
| Route smoke | `curl https://[domain]/` | HTTP 200 |
| Route smoke | `curl https://[domain]/register` | HTTP 200 |
| Route smoke | `curl https://[domain]/login` | HTTP 200 |
| API health | `curl https://api.[domain]/health` | HTTP 200 |

---

## HOMEPAGE PROOF

| Check | How | Expected |
|---|---|---|
| Crown loads | Open homepage | Crown card shows #1 artist |
| Ring renders | Open homepage | 9 artists in ring positions |
| Crown motion plays | Open homepage | 6-second loop visible |
| Comic insert | Open homepage | Week's comic insert in corner |
| Lobby wall loads | Navigate to /live | 8 room thumbnails visible |
| **Lobby wall sort** | Check first card | **0 viewers = Position 1** |
| Countdown ticks | Open /live | World premiere timer counting |
| Undiscovered boost | Open /live | Lowest-view artist in boost slot |
| Stream & Win | Start streaming | Score increments per minute |
| Editorial cards | Open /editorial | Article cards clickable |
| Genre cluster | Open /editorial | All 6 genres render |
| Page flip | Click corner peel | Transitions to next page |
| Sponsor fallback | Remove active campaign | House ad renders |

---

## AUTH / ONBOARDING PROOF

| Check | How | Expected |
|---|---|---|
| Registration | Fill form, submit | Account created, session started |
| Login | Enter credentials | Session active, role assigned |
| Session persist | Login, refresh page | Still logged in |
| Back after logout | Logout, press back | Redirects to /login |
| Role routing - fan | Login as fan | Lands on /dashboard/fan |
| Role routing - artist | Login as artist | Lands on /dashboard/artist |
| Marcel access | Login as Marcel | Analytics access, no destructive |
| Big Ace access | Login as Big Ace | Full admin access |
| Fan onboarding | New fan account | Genre selection completes |
| Artist onboarding | New artist account | All 8 steps complete |

---

## ECONOMY PROOF

| Check | How | Expected |
|---|---|---|
| Points earn | Stream 5 minutes | Points balance increases |
| Tip | Send tip to artist | Artist earnings increase |
| Spin | Daily spin | Random reward received |
| Subscription | Upgrade to Gold | Tier shows Gold |
| Downgrade | Cancel subscription | Gracefully downgrades |
| Points show in HUD | Earn points | HUD balance updates |

---

## ROOM PROOF (When Rooms Are Live)

| Check | How | Expected |
|---|---|---|
| Room creation | Artist goes live | Room appears in lobby wall |
| Room join | Click room in lobby | Room loads |
| Voice channel | Speak in room | Other users hear |
| Preview window | Artist opens preview | All see same source |
| Preview voice coexist | Preview + voice | Both audible, separate controls |
| Turn queue | Artist claims turn | Others cannot start preview |
| Turn release | Artist ends preview | Next artist can claim |
| Watchdog alert | Simulate stuck queue | Watchdog reports warning |
| Session recovery | Disconnect + reconnect | Session restores |
| Room close | Host closes room | All users removed gracefully |

---

---

# ONBOARDING_PROOF_PACK.md
## The Exact Steps to Onboard the First Real Members

---

## PRE-ONBOARDING CHECKLIST

Before inviting any real member, confirm ALL of these:

### Infrastructure
- [ ] Domain live and HTTPS
- [ ] Auth working (register + login)
- [ ] Email delivery working
- [ ] Database stable
- [ ] No console errors on homepage

### Content
- [ ] At least 1 crown winner showing on Homepage 1
- [ ] At least 1 article on Homepage 3 editorial
- [ ] At least 1 active sponsor in sponsor slot
- [ ] Demo artist profiles visible (Marcel, BJ, Big Kazhdog, Berntout Perductions)

### Economy
- [ ] Points system working
- [ ] Daily spin working
- [ ] Stream & Win accumulating

---

## FIRST ADMIN ONBOARDING (Big Ace)

1. Register with Big Ace credentials
2. Run: `pnpm -C apps/api run seed:admin` (or use Big Ace email in .env)
3. Navigate to `/admin/command-center`
4. Confirm: all runtime health panels show status
5. Navigate to `/admin/crown`
6. Confirm: crown system accessible
7. Navigate to `/admin/feature-flags`
8. Confirm: flags can be toggled

**Proof:** Screenshot of `/admin/command-center` with health showing.

---

## FIRST ARTIST ONBOARDING (Marcel / B.J. M Beat's)

1. Register with artist email
2. Confirm onboarding flow starts (8 steps)
3. Complete all 8 steps
4. Upload profile photo
5. Link a YouTube/Spotify
6. Navigate to `/artists/[slug]`
7. Confirm: Diamond tier badge showing for Marcel and BJ
8. Confirm: media locker shows linked source
9. Go live in a test room
10. Confirm: room appears in lobby wall

**Proof:** Screenshot of artist profile with Diamond badge.

---

## FIRST FAN ONBOARDING

1. Register with fan email
2. Confirm fan onboarding flow starts
3. Select genres
4. Follow at least 1 artist
5. Join a room
6. Stream 2 minutes → confirm points increase
7. Try daily spin → confirm reward received
8. View artist profile page

**Proof:** Screenshot of fan dashboard with points balance.

---

---

# LAUNCH_DAY_COMMAND_PACK.md
## The Exact Commands for Launch Day — In Order

---

## T-24 HOURS (Day Before)

```bash
# Full build check
pnpm run build --all

# Run all tests
pnpm test

# Check all routes
pnpm test:smoke

# Run load test (light)
k6 run scripts/load/pre-launch.js --vus 50 --duration 120s

# Verify all env vars set in Cloudflare
# Verify Stripe webhooks active
# Verify Resend email domain verified
# Verify DNS configured correctly

# Final database migration
pnpm -C packages/db run db:migrate:prod

# Run demo world seed
pnpm -C packages/db run db:seed:demo
```

## T-2 HOURS

```bash
# Deploy to production
git push origin main
# Wait for Cloudflare build ✅

# Smoke test production routes
curl https://themusiciansindex.com/ -I
curl https://themusiciansindex.com/live -I
curl https://themusiciansindex.com/register -I
curl https://api.themusiciansindex.com/health -I

# Verify crown bot will run tonight
# Verify all bots are on their schedule
```

## T-0 (Launch)

```bash
# Enable homepage (feature flag)
POST /api/admin/flags { ENABLE_HOMEPAGE_SYSTEM: true }

# Enable auth/onboarding
POST /api/admin/flags { ENABLE_AUTH: true, ENABLE_ONBOARDING: true }

# Enable Stream & Win
POST /api/admin/flags { ENABLE_STREAM_AND_WIN: true }

# Confirm operator health overlay green
# Confirm watchdog all healthy
# Confirm no P0/P1 alerts

# Announce to first members
```

## ROLLBACK PLAN

If something critical fails at launch:

```bash
# 1. Enable read-only mode immediately
POST /api/admin/flags { EMERGENCY_READ_ONLY_MODE: true }

# 2. Post status message at /status
# 3. Notify Big Ace
# 4. Identify root cause from logs
# 5. Fix in staging
# 6. Redeploy
# 7. Re-test
# 8. Disable read-only mode
POST /api/admin/flags { EMERGENCY_READ_ONLY_MODE: false }
```

---

*Platform Proof Matrix + Onboarding Proof + Launch Day Commands v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
