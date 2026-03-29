# OWNER_PROFIT_DISTRIBUTION_SYSTEM.md
## Platform Profit → Owner Distribution — Complete System
### BerntoutGlobal XXL / The Musician's Index

---

## CORE RULE: REVENUE IS NOT PROFIT

This distinction is permanent and non-negotiable.

```
GROSS REVENUE                    ← all money collected by Stripe
  - Stripe processing fees       ← ~2.9% + $0.30 per transaction
  - Artist payouts               ← tips (70%), beats (80%), bookings (75%)
  - Fan Club creator payouts     ← subscription share to artist
  - Refunds issued               ← customer refunds
  - Chargeback losses            ← disputed payments
  - Reserve holding              ← see FINANCIAL_RESERVE_POLICY_SYSTEM.md
────────────────────────────────
= PLATFORM NET REVENUE           ← platform's actual collected share

  - Platform operating costs    ← hosting (Render, Cloudflare), third-party APIs
  - Bot/automation costs        ← ElevenLabs, email (Resend), monitoring
  - Reserve replenishment       ← maintain minimum reserve threshold
────────────────────────────────
= PLATFORM NET PROFIT           ← distributable to owners

Platform Net Profit is the ONLY amount that can be distributed to owners.
Never distribute from gross revenue.
Never distribute while reserve is below minimum.
```

---

## OWNER STRUCTURE

```
Owner A: Marcel Dickens        — [OWNERSHIP_PCT_A]%
Owner B: J. Paul Sanchez       — [OWNERSHIP_PCT_B]%
Operating Reserve              — [RESERVE_PCT]%
Retained Earnings              — [RETAINED_PCT]%
```

**Note:** Replace [OWNERSHIP_PCT_A] and [OWNERSHIP_PCT_B] with exact percentages agreed between Marcel and Jay Paul. These must be set in the platform's admin configuration before first distribution. The system will not process distributions without confirmed percentages.

Sum of all buckets must equal 100%.

---

## DISTRIBUTION CALCULATION (Weekly, Sunday Midnight UTC)

```typescript
// Calculated by owner-finance-bot
async function calculateWeeklyDistribution(weekStart: Date, weekEnd: Date) {
  const grossRevenue = await sumTransactions(weekStart, weekEnd, 'revenue');
  const stripeFees   = await sumTransactions(weekStart, weekEnd, 'stripe_fee');
  const artistPayouts = await sumTransactions(weekStart, weekEnd, 'artist_payout');
  const refunds      = await sumTransactions(weekStart, weekEnd, 'refund');
  const chargebacks  = await sumTransactions(weekStart, weekEnd, 'chargeback');

  const platformNetRevenue = grossRevenue - stripeFees - artistPayouts - refunds - chargebacks;
  
  const operatingCosts = await getOperatingCosts(weekStart, weekEnd);
  const reserveReplenishment = await calculateReserveNeeds();

  const distributableProfit = platformNetRevenue - operatingCosts - reserveReplenishment;

  if (distributableProfit <= 0) return { distributable: 0, reason: 'no_profit' };

  return {
    grossRevenue,
    stripeFees,
    artistPayouts,
    refunds,
    chargebacks,
    platformNetRevenue,
    operatingCosts,
    reserveReplenishment,
    distributableProfit,
    ownerAShare: distributableProfit * OWNER_PCT_A,
    ownerBShare: distributableProfit * OWNER_PCT_B,
    reserveShare: distributableProfit * RESERVE_PCT,
    retainedShare: distributableProfit * RETAINED_PCT,
  };
}
```

---

## DISTRIBUTION PROCESS

```
Step 1: owner-finance-bot calculates weekly distribution (Sunday midnight)
Step 2: Snapshot saved to OwnerProfitSnapshot table
Step 3: Big Ace receives in-app + email notification with summary
Step 4: Big Ace reviews snapshot at /admin/finance/profit
Step 5: Big Ace confirms or adjusts distribution
Step 6: On confirmation: OwnerPayout records created for each owner
Step 7: Transfer initiated to each owner's configured payout destination
Step 8: Payout confirmation logged in OwnerPayoutAuditLog
Step 9: Tax export updated for accounting
```

---

## PAYOUT TIMING

```
Revenue settlement window: 7 days (Stripe standard hold for new accounts)
Safety window: +7 days (refund/chargeback reserve)
Total hold before distribution: ~14 days minimum from transaction
Weekly distribution calculation: Sunday midnight UTC
Big Ace approval: within 48 hours of calculation
Transfer to owner: within 24 hours of approval
Owner receives funds: 1–5 business days depending on payout method
```

---

## MINIMUM DISTRIBUTION THRESHOLD

```
Minimum distributable profit to trigger distribution: $100 total
If profit < $100: roll over to next week
If profit < $100 for 4 consecutive weeks: Big Ace notified for review
```
