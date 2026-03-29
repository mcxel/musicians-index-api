# REFUND_AND_CHARGEBACK_RESERVE_SYSTEM.md
## How Refunds and Chargebacks Are Handled
### BerntoutGlobal XXL / The Musician's Index

---

## REFUND POLICY

```
Tickets:
  - Full refund if event is cancelled by host/platform
  - No refund if fan cancels (non-refundable by default)
  - Exception: up to 48h before event, 50% refund possible (host must enable)

Tips:
  - Non-refundable (same as cash gift)
  - Fraud cases: platform can issue refund from reserve

Beat licenses:
  - Non-refundable (digital delivery)
  - Exception: if beat was wrongly labeled (producer error), platform issues refund

Fan club subscriptions:
  - Cancel anytime (stops future billing)
  - No refund on current billing period
  - Exception: if artist account is banned, full refund of last payment

Fan credits:
  - Non-refundable (platform currency)
  - Exception: if credits were purchased due to platform error

Avatar store:
  - Non-refundable (digital goods)
  - Exception: technical failure preventing use
```

---

## CHARGEBACK HANDLING

```
Chargeback received from bank:
  1. Stripe holds the disputed amount
  2. Platform has 7 days to respond with evidence
  3. Big Ace notified → gathers evidence (transaction log, usage data, IP)
  4. Response submitted via Stripe dashboard
  5. If platform wins: amount returned
  6. If platform loses: amount deducted from platform account + $15 fee

Chargeback thresholds:
  - Stripe considers >1% chargeback rate as high risk
  - Anti-bot measures on tickets are the primary protection
  - Fan tip minimum ($1) reduces chargeback risk vs. large transactions
```

---

## FINANCIAL IMPACT ON OWNER DISTRIBUTIONS

```
Refunds issued in week N → reduce gross revenue for week N
Chargebacks confirmed in week N → reduce gross revenue for week N
Chargeback disputes pending → do not affect distribution until resolved
Artist payouts are NOT reversed on refund (platform absorbs from reserve if needed)
```

---

## RESERVE DRAW FOR REFUNDS

```
If weekly refunds > weekly reserve replenishment contribution:
  → Draw from reserve to cover artist payout liability
  → Alert Big Ace if reserve drops below $1,000
  → Suspend distributions if reserve drops below $500
```
