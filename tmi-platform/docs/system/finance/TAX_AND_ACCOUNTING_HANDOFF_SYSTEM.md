# TAX_AND_ACCOUNTING_HANDOFF_SYSTEM.md
## Tax Records and Accountant Handoff
### BerntoutGlobal XXL / The Musician's Index

---

## IMPORTANT DISCLAIMER

This document is a system design guide, not legal or tax advice.
Marcel Dickens and J. Paul Sanchez should consult a qualified tax professional
regarding their specific tax obligations as platform owners.
The system is designed to export data in a format useful for tax preparation.

---

## WHAT THE PLATFORM TRACKS FOR TAX PURPOSES

```
For the business entity (BerntoutGlobal LLC):
  - Total gross revenue (all transactions)
  - Total Stripe fees paid
  - Total artist/creator payouts issued
  - Total refunds issued
  - Total chargebacks
  - Platform net profit
  - Operating expenses (hosting, APIs, etc.)
  - Owner distributions (for K-1 or equivalent)

For individual creators (1099-K eligibility via Stripe):
  - Artists who receive > $600/year via Stripe Connect are issued 1099-K by Stripe
  - Platform does not issue separate 1099s — Stripe handles this
  - Artists should be notified to track their income
```

---

## TAX EXPORT FORMAT

Route: `/admin/finance/tax?year={YYYY}`

Export contains:
```json
{
  "period": "2026-01-01 to 2026-12-31",
  "grossRevenue": 0,
  "stripeFees": 0,
  "artistPayouts": 0,
  "refunds": 0,
  "chargebacks": 0,
  "platformNetRevenue": 0,
  "operatingCosts": { "hosting": 0, "email": 0, "apis": 0, "other": 0 },
  "distributableProfit": 0,
  "ownerDistributions": [
    { "name": "Marcel Dickens", "total": 0, "paypalEmail": "berntmusic33@gmail.com" },
    { "name": "J. Paul Sanchez", "total": 0, "destination": "..." }
  ],
  "monthlyBreakdown": [...]
}
```

---

## RECORD RETENTION

```
All financial records: retained 7 years (legal requirement)
This includes: transactions, payouts, owner distributions, operating costs
Data not deleted: even if user accounts are deleted, anonymized financial records kept
Format: JSON export + PostgreSQL (backed up to Cloudflare R2)
```

---

## OPERATING EXPENSE TRACKING

Big Ace should enter operating expenses monthly at:
`/admin/finance → Log Operating Cost`

Categories:
- Render hosting
- Cloudflare (pages, R2, DNS)
- Resend (email)
- ElevenLabs (TTS for bots)
- Sentry (error monitoring)
- Other third-party APIs
- Any business expenses related to the platform

These reduce taxable profit and must be tracked accurately.
