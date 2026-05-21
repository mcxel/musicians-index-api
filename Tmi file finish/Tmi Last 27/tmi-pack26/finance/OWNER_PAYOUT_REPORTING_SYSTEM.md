# OWNER_PAYOUT_REPORTING_SYSTEM.md
## What Owners Can See — Reporting Dashboards
### BerntoutGlobal XXL / The Musician's Index

---

## OWNER FINANCE DASHBOARD (/admin/finance/profit)

Available to: Big Ace (admin role) only

Shows:
- Current week's calculated distribution (pending approval)
- Last 4 weeks of distributions
- Year-to-date totals
- Owner A (Marcel) total received: year-to-date
- Owner B (Jay Paul) total received: year-to-date

---

## WEEKLY SNAPSHOT DETAIL (/admin/finance/profit/[weekId])

Shows full breakdown for a specific week:
- Gross revenue by source (tips, beats, tickets, credits, etc.)
- Stripe fees total
- Artist payouts issued
- Refunds/chargebacks
- Operating costs by category
- Reserve allocation
- Distributable profit
- Owner A share + status (pending/paid/failed)
- Owner B share + status
- Approve button (if still pending)

---

## PAYOUT HISTORY (/admin/finance/payouts)

Shows all owner payouts (historical):
- Date
- Owner name
- Amount
- Method (PayPal/Stripe/manual)
- Status
- Transaction ID (PayPal or Stripe)
- Download receipt link

---

## RESERVE STATUS (/admin/finance/reserves)

Shows:
- Current reserve balance
- Minimum target
- This week's allocation
- Draws against reserve (refunds, emergencies)
- Health status (HEALTHY / BELOW_MIN / CRITICAL)

---

## REVENUE BREAKDOWN (/admin/finance/revenue)

Shows revenue by source with drill-down:
- Tips (by artist, by week)
- Beats (by producer, by license type)
- Tickets (by event, by week)
- Fan clubs (by artist, by tier)
- Credits (bundles purchased)
- Avatars (items sold)
- Sponsors (active campaigns)

---

## API ENDPOINTS (ADMIN ONLY)

```
GET  /api/admin/finance/profit-snapshot?week={weekId}
GET  /api/admin/finance/profit-history?limit=12
POST /api/admin/finance/profit-snapshot/:weekId/approve
GET  /api/admin/finance/payouts?limit=20
GET  /api/admin/finance/reserves
GET  /api/admin/finance/revenue?from={date}&to={date}
GET  /api/admin/finance/tax-export?year={YYYY}
POST /api/admin/finance/operating-cost  ← log a business expense
```
