# ECONOMY ENGINE — COMPLETE SYSTEM
## Points · Subscriptions · Payouts · Promo · Anti-Fraud

---

# POINTS_ENGINE.md
## How Every User Earns, Spends, and Loses Points

---

## PURPOSE
Points are the platform's core currency.
They determine room starting tier, unlock features, and create a participation economy.

---

## POINTS EARNING — FAN

| Action | Points Earned | Notes |
|---|---|---|
| Watch event (per 5 min) | +10 | Capped at 60/event |
| React during event | +2 | Max 20/event |
| Vote in poll | +5 | |
| Send tip ($5–$24) | +5 | |
| Send tip ($25–$99) | +15 | |
| Send tip ($100+) | +30 | |
| First event of day | +20 | Daily bonus |
| 7-day attendance streak | +100 | Weekly bonus |
| Bring a new user | +150 | Referral |
| Attend premiere | +50 | Special event |
| World Concert attendance | +75 | |
| Complete profile | +50 | One-time |
| Subscribe to Gold+ tier | +200 | Monthly bonus |

---

## POINTS EARNING — ARTIST

| Action | Points Earned | Notes |
|---|---|---|
| Go live (per event) | +25 | |
| Event audience milestone (every 10 viewers) | +10 | |
| Tip received (any amount) | +5 | Per tip |
| Complete Monthly Idol round | +100 | |
| Win a battle | +200 | |
| Win Monthly Idol | +500 | |
| Hit #1 on index | +1000 | |
| Article published | +30 | |
| Profile photo uploaded | +10 | One-time |
| Stream 30+ min | +50 | |
| New fan follow | +5 | Per follow (cap 20/day) |

---

## POINTS SPENDING — FAN

| Action | Points Cost | Notes |
|---|---|---|
| Seat upgrade (Front Row) | 200 pts | Per event |
| Seat upgrade (VIP Box) | 500 pts | Per event |
| Backstage Pass | 800 pts | Per event |
| Artist Eye | 1,000 pts | Limited slots |
| Premium reaction pack | 150 pts | Pack of 20 |
| Bonus vote (battle) | 100 pts | |
| Room entry upgrade (1 tier) | 300 pts | Per session |
| Profile badge | 250 pts | Cosmetic |

---

## POINTS BALANCE THRESHOLDS (Room Entry)

| Points | Starting Room Tier |
|---|---|
| 0–499 | Free (Living Room / Circle) |
| 500–2,499 | Bronze (Bar / Studio) |
| 2,500–9,999 | Gold (Nightclub / Showcase) |
| 10,000–24,999 | Diamond (Premium Club / Mini Hall) |
| 25,000+ | Signature (Concert Hall / Amphitheater) |

---

## POINTS DECAY RULES

Points do NOT reset on a calendar.
They decay slowly if unused:
- No activity for 30 days: -5% of balance
- No activity for 90 days: -15% of balance
- No activity for 180 days: -25% of balance
- Decay never drops below the "Free tier" floor (0)
- Activity resets decay timer

---

# SUBSCRIPTION_BILLING.md
## Membership Tiers and What They Cost

---

## SUBSCRIPTION TIERS

| Tier | Price/Month | Key Benefits |
|---|---|---|
| Free | $0 | Basic access, Living Room start |
| Bronze | $4.99 | Bar/Studio access, +200 pts/month |
| Gold | $12.99 | Nightclub access, VIP features, +500 pts/month |
| Diamond | $24.99 | Full premium access, +1200 pts/month |
| Signature | $49.99 | Elite access, World Concerts, +3000 pts/month |

---

## ARTIST SUBSCRIPTION (PUBLISHING TIERS)

| Tier | Price/Month | Venue Unlock | Revenue Split |
|---|---|---|---|
| Free | $0 | Basement only | 70% tips |
| Bronze | $9.99 | Bar, Studio | 72% tips |
| Gold | $24.99 | Nightclub, Hall | 75% tips |
| Diamond | $59.99 | Premium Club, Arena | 78% tips |
| Signature | $99.99 | All venues | 80% tips |

---

## BILLING RULES

- Stripe and PayPal supported
- Auto-renews monthly
- Cancel anytime (no refund for partial month)
- Downgrade: takes effect next billing cycle
- Upgrade: takes effect immediately (prorated)
- Failed payment: 3-day grace period → downgrade to Free

---

# PAYOUT_SYSTEM.md
## How Artists Get Paid

---

## PAYOUT SCHEDULE

| Revenue Source | Processing | Payout |
|---|---|---|
| Tips | Real-time accumulation | Weekly (Thursday) |
| VIP ticket sales | Event end | Within 5 business days |
| Backstage pass | Event end | Within 5 business days |
| Sponsored events | Brand payment | 15 days after event |
| Replay access | On purchase | Weekly |
| Subscription cuts | Monthly | 1st of month |

---

## PAYOUT METHODS

- Direct bank transfer (ACH)
- PayPal
- Stripe Connect
- Minimum payout: $25
- No maximum

---

## TAX HANDLING

- Artists earning $600+/year: 1099-NEC issued
- W-9 required before first payout
- International: W-8BEN required

---

## PAYOUT DASHBOARD (Artist Sees)

```
┌─────────────────────────────────────────────┐
│  EARNINGS                                    │
│  This week: $284.40                          │
│  This month: $1,204.80                       │
│  Pending payout: $284.40 (Thu, Mar 27)       │
├─────────────────────────────────────────────┤
│  BREAKDOWN                                   │
│  Tips: $180.20                               │
│  VIP tickets: $72.00                         │
│  Replay: $32.20                              │
├─────────────────────────────────────────────┤
│  PAYOUT METHOD: Direct Deposit (Chase ••4421)│
│  [Change Method]                             │
└─────────────────────────────────────────────┘
```

---

# PROMO_CODE_SYSTEM.md
## Promotional Codes and Discount Logic

---

## PROMO CODE TYPES

| Type | Example | Effect |
|---|---|---|
| Flat discount | SAVE10 | $10 off subscription |
| Percent discount | WELCOME25 | 25% off first month |
| Free tier upgrade | GOLDPASS | Gold for 30 days free |
| Points bonus | BONUS500 | +500 points |
| Event access | VIPPASS | Free VIP ticket to event |

---

## FINANCIAL SAFETY RULES (LOCKED)

1. Promo codes never stack
2. Promo codes never apply to existing subscriptions (new only)
3. All codes must be created by Big Ace
4. Marcel can suggest codes but cannot create them
5. Each code has: max uses, expiry date, valid tiers
6. All codes are audited and logged
7. Codes with 0 uses remaining auto-expire

---

*Economy Engine v1.0 — BerntoutGlobal XXL*
