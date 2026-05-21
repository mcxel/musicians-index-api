# POST_MOVE_SMOKE_TEST_ORDER.md
## Exact Smoke Test Sequence After Repo Move
### BerntoutGlobal XXL / The Musician's Index

Run these in order. Stop and fix before proceeding if any step fails.

---

## TIER 0 — BUILD MUST PASS FIRST (5 min)

```bash
pnpm install --frozen-lockfile
pnpm -C packages/db run build
pnpm -C apps/api typecheck          # fix errors before continuing
pnpm -C apps/api run build          # must exit 0
pnpm -C apps/web typecheck          # fix errors before continuing
pnpm -C apps/web run build          # must exit 0

# If build fails: do NOT proceed. Fix the build first.
```

---

## TIER 1 — INFRASTRUCTURE (5 min)

Run after deploying to staging:

```bash
curl https://api.themusiciansindex.com/health
# Expected: {"status":"ok","timestamp":"..."}
# Fail: API is not running or DB is unreachable

curl https://api.themusiciansindex.com/api/readyz
# Expected: {"status":"ok","db":"ok","redis":"ok"}
# Fail: DB or Redis connection broken

curl -I https://themusiciansindex.com/
# Expected: HTTP/2 200
# Fail: Web app not deployed or Cloudflare misconfigured

curl -I https://themusiciansindex.com/sitemap.xml
# Expected: HTTP/2 200 (valid XML)
# Fail: sitemap.ts not working

curl -I https://themusiciansindex.com/robots.txt
# Expected: HTTP/2 200
# Fail: robots.ts not working
```

---

## TIER 2 — DISCOVERY-FIRST (CRITICAL — blocks deploy if fails)

```bash
pnpm test:discovery
# This test verifies:
#   1. Lobby wall returns rooms sorted by viewers ascending
#   2. Artist with 0 viewers appears at position 1
#   3. Search returns live rooms first
#   4. No viewer-count drift breaking sort order
#
# DEPLOY IS BLOCKED if this test fails.
# Fix: verify useRoomList({ sort:'viewers_asc' }) is wired correctly
```

---

## TIER 3 — AUTH AND PROFILES (10 min, manual)

```
□ Signup: create new account → profile auto-created → redirects to /onboarding
□ Login: existing account → session created → redirects to /dashboard
□ Protected route: visit /dashboard without auth → redirects to /login
□ Admin route: visit /admin without admin role → redirect or 403
□ Diamond badge: visit /artists/berntmusic33 → Diamond badge visible (cyan, glowing)
□ Diamond badge: visit B.J. M Beat's profile → Diamond badge visible
□ billing-integrity-bot: trigger manually → confirm both Diamond statuses logged
```

---

## TIER 4 — CORE FEATURES (15 min, manual)

```
□ Search: type "artist" → results appear, LIVE rooms at top
□ Lobby wall: open /lobby → rooms sorted by viewer count ascending
□ Room: open any room → scene background loads → viewer count updates
□ Feed: open /feed → correct empty state or items if following anyone
□ Notifications: bell visible → open panel → no JS errors
□ Settings: open /settings/profile → form loads → save works
□ Error page: visit /this-page-does-not-exist → NotFoundShell renders
□ Mobile: open on phone → bottom tab bar visible → all 5 tabs work
```

---

## TIER 5 — ECONOMY (15 min, Stripe test mode)

```
□ Tip: open room → Tip $1 → Stripe test payment → 
       TipExplosionEffect animates → artist wallet +$0.70 → platform +$0.30
□ Fan credits: /credits → buy 100-credit bundle → 
               Stripe test payment → balance shows 100
□ Beat preview: /beats → play button → tagged preview audio plays
□ Beat license: click Buy Basic → Stripe test payment → BeatLicense created
□ Fan club: /fan-club/{artistSlug}/join → select tier → 
            Stripe checkout → membership created
□ Wallet: /wallet → available/pending/lifetime all show → 
          payout button disabled below $20
□ Anti-bot: attempt to buy 9 tickets for same event → 429 limit_exceeded
```

---

## TIER 6 — SAFETY (10 min, manual with test accounts)

```
□ Kid ↔ kid: create two child accounts → both can message each other ✓
□ Adult → kid: adult account sends DM to child account → 403 Forbidden ✓
□ Kid performer creation: attempt without parent approval → BLOCKED ✓
□ Parent approval: parent approves performer → status becomes 'approved' ✓
□ Ticket anti-bot: submit without Turnstile token → 400 bot_detected ✓
□ Block user: block an account → blocked user sees "Profile unavailable" ✓
```

---

## TIER 7 — ADMIN (10 min, Big Ace account)

```
□ /admin/command-center → all 6 panels visible
□ /admin/feature-flags → toggle a non-critical flag → propagates within 60s
□ /admin/logs → recent logs visible
□ /admin/finance/profit → weekly snapshot visible (even if $0 for test)
□ /admin/finance/profit → distribution calculation runs → owner shares shown
□ Emergency broadcast: /admin/emergency → test broadcast sends
```

---

## TIER 8 — OWNER PROFIT (5 min, Big Ace account)

```
□ /admin/finance → Financial overview loads
□ /admin/finance/profit → Current week snapshot visible
□ Approve button works → OwnerPayout records created
□ Marcel's payout destination shows: berntmusic33@gmail.com (PayPal)
□ Jay Paul's destination shows (after his configuration)
□ Reserve balance visible at /admin/finance/reserves
□ Tax export: /admin/finance/tax?year=2026 → JSON downloads
```

---

## PASS CRITERIA

All tiers must pass before any of these happen:
- Staging → Production promotion
- First real user onboarded
- First public announcement
- Any marketing activity

If any tier fails:
1. Stop immediately
2. Document the failure
3. Fix and re-run that tier
4. Re-run all subsequent tiers
5. Only proceed when all 8 tiers pass

---

## FINAL COMMAND

```bash
# Run automated proofs
pnpm test:discovery    # MUST pass
pnpm test:smoke        # MUST pass

# If both pass, platform is ready for GO_LIVE_SIGNOFF_PACK.md completion
echo "All smoke tests passed. Proceed to GO_LIVE_SIGNOFF_PACK.md"
```
