# TMI — Tomorrow's Verification Checklist
## Before ANY new feature work, complete every item here

---

## STOP ORDER

Do not build:
- Challenge Arena
- New widgets, drawers, or overlays  
- New homepage variants
- New 3D systems
- New bot systems
- New dashboard panels

Until this checklist is 100% checked off.

---

## 1. PRODUCTION VISUAL AUDIT

Open each URL in a fresh incognito window (hard refresh, cache cleared).
Take a screenshot of: **top of page · middle · bottom**.
Compare each screenshot to `WORLD_ARCHITECTURE.md`.

### Home Pages

| Page | Expected | Pass? |
|------|----------|-------|
| `/home/1` | Magazine masthead → editorial belt → scrolling tabloid underlay → orbital wheel → World Lobby venue cards | ☐ |
| `/home/2` | News Desk — "Music News, Interviews, and Studio Recaps" headline visible | ☐ |
| `/home/3` | Live World Surface — "Enter Live Venue World" + venue grid | ☐ |
| `/home/4` | Ad Magazine — billboard hero + editorial blocks | ☐ |
| `/home/5` | Battle/Cypher Surface — battle cards + lobby wall | ☐ |

**Home 1 specific checks:**
- [ ] TMI masthead with typewriter color cycle is visible at top
- [ ] Magazine editorial belt ("THIS WEEK IN TMI") appears before the orbital wheel
- [ ] Scrolling tabloid panels (yellow/pink/cyan/black) visible BEHIND orbital wheel
- [ ] Orbital wheel floating on top of tabloid panels
- [ ] BACK / NEXT buttons work on orbital
- [ ] Click orbital node → lobby modal opens with 3D arena preview
- [ ] World Lobby venue cards visible when you scroll down
- [ ] Each venue card shows mini arena preview + Tip/Ticket/Subscribe buttons
- [ ] World Dance Party card shows dance floor (NO SEATING badge), not an arena

---

## 2. ARENA ROUTE AUDIT

Open each URL. Confirm the arena system loads — NOT a placeholder, not a blank screen, not an emoji fallback.

| Route | Expected | Pass? |
|-------|----------|-------|
| `/rooms/world-concert` | 3D AudienceScene (Arena, 18,500 cap) above the set list + seating grid | ☐ |
| `/rooms/cypher` | AudienceScene (Theater, 2,730 cap) with cypher-themed UI | ☐ |
| `/rooms/world-dance-party` | DanceArena3D — dance floor, NO chairs, NO rows | ☐ |
| `/battles/live` | AudienceScene (Arena, 18,500 cap) + battle match grid | ☐ |
| `/battles` | ArenaEventShell header (Battle Arena) above the battle listing | ☐ |
| `/cypher` | ArenaEventShell header (Cypher Arena) above the schedule/rules | ☐ |
| `/challenge` | ArenaEventShell header (Outdoor, 8,200 cap) above challenge cards | ☐ |
| `/live/rooms` | Billboard lobby wall — scrollable, video tile panels, hover shows JOIN + SIT | ☐ |

**What PASS looks like:**
- Canvas renders crowd (back of heads in fan view)
- No blank gray boxes
- No standalone emoji (🎤 by itself = placeholder = FAIL)
- No "RouteStubPage" text

---

## 3. REVENUE FLOW VERIFICATION

Only run after visual audit passes.

### 3A — Stripe Environment (Vercel Dashboard)

Check **Vercel → Settings → Environment Variables** — these must all exist:

- [ ] `STRIPE_SECRET_KEY` — starts with `sk_live_` (or `sk_test_` for smoke test)
- [ ] `STRIPE_WEBHOOK_SECRET` — starts with `whsec_`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — starts with `pk_live_`
- [ ] `STRIPE_PAUSE_MODE` = `false`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_FAN_MONTHLY` = `price_...`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ARTIST_MONTHLY` = `price_...`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_VIP_MONTHLY` = `price_...`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_VENUE_MONTHLY` = `price_...`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_MONTHLY` = `price_...`

Also check:
- [ ] `DATABASE_URL` is pointing to production (Neon/Postgres), not localhost
- [ ] `RESEND_API_KEY` is set
- [ ] `NEXTAUTH_SECRET` is set (32-char random string)
- [ ] `NEXTAUTH_URL` = `https://themusiciansindex.com`
- [ ] `ADMIN_EMAILS` = `berntmusic33@gmail.com,bigace@berntoutglobal.com`

### 3B — Webhook Registration (Stripe Dashboard)

- [ ] Go to `https://dashboard.stripe.com/webhooks`
- [ ] Endpoint URL: `https://themusiciansindex.com/api/stripe/webhook`
- [ ] Events enabled: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.deleted`
- [ ] Signing secret copied to Vercel as `STRIPE_WEBHOOK_SECRET`

### 3C — Smoke Test

Use Stripe test card: `4242 4242 4242 4242` exp `12/30` CVC `123`

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| $2.99 Fan Sub | `/subscribe` → Fan plan → checkout → pay | Land on `/payment-success`, Stripe shows recurring subscription, welcome email received | ☐ |
| $5.00 Tip | Any artist profile → 💰 TIP → checkout → pay | Stripe shows one-time payment, artist tip total updates | ☐ |
| Webhook receipt | Check Vercel logs after each payment | `[stripe/webhook] checkout.session.completed` in logs | ☐ |

---

## 4. ADMIN / MISSION CONTROL

- [ ] `/admin` loads — no blank pages, no auth errors
- [ ] `/admin/users` shows user list  
- [ ] `/admin/revenue` shows revenue dashboard (even if $0)
- [ ] `/admin/magazine` shows magazine editor tabs

---

## 5. WHAT OPENS P1 (CHALLENGE ARENA)

All of the above must be ✓ before building the Challenge Arena.

When this checklist passes, P1 is:

```
/rooms/challenge-arena
  Song vs Song
  Winner stays
  Next challenger enters immediately
  Nonstop queue all day
  Live audience voting (AudienceScene Arena, 18,500 cap)
  Stripe tips active in the room
  Revenue hook: Tip · Ticket · Subscribe visible
```

**DO NOT START P1 UNTIL THIS FILE IS FULLY CHECKED.**

---

*BerntoutGlobal LLC · TMI Production Verification*  
*Checklist version: 2026-05-31*
