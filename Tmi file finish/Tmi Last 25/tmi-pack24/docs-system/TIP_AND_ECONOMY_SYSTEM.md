# TIP_AND_ECONOMY_SYSTEM.md
## Virtual Currency, Tipping, and Fan Economy
### BerntoutGlobal XXL / The Musician's Index

---

## ECONOMY OVERVIEW

TMI has a lightweight fan economy built around:
- **Tips** — real-money tips sent from fan to artist during live rooms
- **Fan Credits** — platform virtual currency (purchased in bundles)
- **Beat Licenses** — producers earn from beat licensing fees
- **Booking Fees** — artists earn from fan/venue bookings

---

## TIPPING FLOW

```
Fan in live room taps Tip button
     ↓
Tip amount selector ($1 / $5 / $10 / $25 / Custom)
     ↓
Confirm (show artist name + amount)
     ↓
Stripe Payment Intent
     ↓
Payment confirmed
     ↓
tip-processing-bot: record, notify artist, trigger visual
     ↓
TipExplosionEffect fires in room (name + amount floats up)
     ↓
Revenue split: 70% artist, 30% platform (minus Stripe fees)
```

## FAN CREDITS

Credits are optional. Artists may offer credit-gated content.
- Credits purchased via Stripe (bundles: 100/$5, 500/$20, 1500/$50)
- Credits do NOT expire
- Credits are not cash — not withdrawable
- Credits can be spent on: exclusive previews, backstage passes, fan club perks

## REVENUE SPLIT TABLE

| Transaction | Artist % | Platform % | Notes |
|---|---|---|---|
| Real-money tip | 70% | 30% | Minus Stripe fees |
| Beat license | 80% | 20% | Minus Stripe fees |
| Booking fee | 75% | 25% | Minus Stripe fees |
| Fan Credit purchase | 0% | 100% | Credits are platform currency |
| Subscription | 0% | 100% | Funds platform infrastructure |

## ARTIST PAYOUT

- Artists can withdraw earnings via Stripe Connect
- Minimum payout: $20
- Payout schedule: Weekly (every Sunday) or on-demand above $50

## ROUTES
`/wallet` — artist earnings dashboard + withdrawal
`/tip/{artistSlug}` — direct tip link (shareable)
`/credits` — fan credit purchase
