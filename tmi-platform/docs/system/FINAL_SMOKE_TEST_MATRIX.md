# FINAL_SMOKE_TEST_MATRIX.md
## Pre-Launch Smoke Tests — Every Critical Path
### BerntoutGlobal XXL / The Musician's Index

Run these before every major deploy and before launch signoff.

---

## INFRASTRUCTURE PROBES

```bash
curl -I https://api.themusiciansindex.com/health
# Expect: 200 {"status":"ok","timestamp":"..."}

curl -I https://api.themusiciansindex.com/api/readyz
# Expect: 200 {"status":"ok","db":"ok","redis":"ok"}

curl -I https://themusiciansindex.com/
# Expect: 200 (web app)

curl -I https://themusiciansindex.com/sitemap.xml
# Expect: 200 valid XML

curl -I https://themusiciansindex.com/robots.txt
# Expect: 200 with correct disallow rules
```

## AUTH FLOWS

```
1. Register new account → profile auto-created → redirects to /onboarding
2. Login → session created → redirects to /dashboard
3. Visit /dashboard without auth → redirects to /login
4. Visit /admin without admin role → redirects to /unauthorized
5. Session expiry → SessionExpiredModal appears → re-login works
```

## CORE FEATURE TESTS

```
1. Search: type "artist" → results appear within 1s → LIVE rooms appear first
2. Lobby wall: loads rooms sorted viewers_asc → position 1 = artist with fewest viewers
3. Profile: /artists/berntmusic33 → Diamond badge shows ✓
4. Room join: click room in lobby → room loads → viewer count increments
5. Notification bell: unread count shows → opens panel → mark all read clears badge
6. Feed: /feed loads → at least "follow artists to see activity" empty state
7. Beats: /beats loads → genre filter works → preview button plays tagged demo
8. Settings: /settings/notifications → toggles save → persist on reload
```

## ECONOMY TESTS (Staging/Stripe Test Mode)

```
1. Tip: POST /api/tips/intent → clientSecret returned → Stripe test payment succeeds → TipExplosionEffect fires
2. Fan credits: purchase 100 bundle → balance updates → credits visible in wallet
3. Beat license: purchase basic license → BeatLicense record created → download link accessible
4. Fan club join: select tier → Stripe checkout → FanClubMembership created
5. Payout onboard: POST /api/wallet/payout-onboard → Stripe Connect URL returned
```

## SAFETY TESTS

```
1. Kid ↔ Kid messaging: create two child accounts → both can message each other ✓
2. Adult → Kid messaging: attempt to message child account → blocked ✓
3. Kid performer creation: attempt without parent approval → blocked ✓
4. Ticket limit: attempt to buy 9 tickets for same event → 429 error ✓
5. Anti-bot: submit ticket purchase without Turnstile token → 400 bot_detected ✓
```

## ADMIN TESTS

```
1. /admin/command-center loads → all 6 panels visible
2. /admin/feature-flags → toggle a flag → propagates within 60s
3. /admin/logs → recent logs show
4. /admin/finance → wallet balances display
5. billing-integrity-bot: manually trigger → Marcel + BJ still show Diamond ✓
```

## DISCOVERY-FIRST VERIFICATION

```
pnpm test:discovery
→ Verifies lobby wall sorts by viewers_asc
→ Verifies 0-viewer artist appears at position 1
→ Verifies search returns live rooms first
→ Verifies /rankings shows correct ordering
→ CRITICAL: this test blocks deployment if it fails
```
