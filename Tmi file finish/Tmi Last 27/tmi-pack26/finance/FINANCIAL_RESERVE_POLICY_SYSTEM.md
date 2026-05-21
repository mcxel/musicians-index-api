# FINANCIAL_RESERVE_POLICY_SYSTEM.md
## Platform Financial Reserve — Protection Against Refunds and Losses
### BerntoutGlobal XXL / The Musician's Index

---

## WHY A RESERVE EXISTS

The reserve protects the platform and owners from:
- Unexpected surge in refund requests
- Chargeback claims arriving after distribution
- Infrastructure cost spikes
- Business continuity during low-revenue periods

---

## RESERVE TARGETS

```
Minimum reserve balance: $1,000 (launch period)
Target reserve balance:  $5,000 (operational period, 6 months post-launch)
Emergency threshold:     $500 (trigger Big Ace alert if balance drops here)
```

These amounts are configurable by Big Ace at /admin/finance/reserves.

---

## RESERVE ALLOCATION RULES

```
1. If current reserve < minimum target:
   → Replenish reserve FIRST before any owner distribution
   → Weekly replenishment: max 50% of weekly distributable profit
   → Distribution occurs only on remaining profit

2. If current reserve > 2× target:
   → Excess above 2× target is added to distributable profit for that week

3. Reserve is NEVER touched for operating costs
   → Operating costs come from platform net revenue
   → Reserve is for emergency/liability coverage only
```

---

## WHAT RESERVE COVERS

```
Automatic reserve draws:
  - Refunds on tickets for cancelled events
  - Confirmed chargeback losses after review
  - Emergency platform cost (e.g., emergency CDN scaling)

Never automatic:
  - Owner distributions (always require Big Ace approval)
  - Artist payouts (funded directly from transaction at time of tip/sale)
  - Operating costs (funded from net revenue, not reserve)
```

---

## RESERVE AUDIT

Monthly: owner-finance-bot generates reserve health report
Weekly: reserve balance visible on /admin/finance/reserves
Alert: automated notification if reserve drops below $500

---

## CHARGEBACK RESERVE

Stripe holds a separate chargeback reserve for new accounts.
This is separate from the platform reserve above.
Stripe releases chargeback reserve gradually as account history builds.
Track Stripe's reserve separately in the financial dashboard.
