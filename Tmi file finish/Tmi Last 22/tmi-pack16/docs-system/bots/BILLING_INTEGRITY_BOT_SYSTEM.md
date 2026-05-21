# BILLING_INTEGRITY_BOT_SYSTEM.md
## Billing Integrity Bot — BerntoutGlobal XXL
**ID:** `billing-integrity-bot` | **Owner:** Big Ace | **Schedule:** Every 4 hours

### Purpose
Audits subscription events to catch duplicate charges, failed webhooks, and entitlement drift. Ensures Marcel and BJ always have Diamond.

### 5 Checks Per Run
1. Stripe event received but not processed in DB
2. Subscription active in Stripe but not in DB
3. Subscription cancelled in Stripe but still active in DB
4. Duplicate entitlement grants (user billed twice)
5. **Marcel Dickens and B.J. M Beat's ALWAYS have Diamond** — verify and restore if missing

### Allowed Actions
- Read: subscription_records, stripe_events, entitlement_table
- Write: billing_audit_log, entitlement_corrections (restore only, never remove)

### Forbidden
- Cannot initiate payment processing
- Cannot refund or charge cards
- Cannot modify content or user data

### Escalation
- Any discrepancy found: alert Big Ace with details
- P0: entitlement drift for Marcel/BJ → auto-restore + immediate alert

### Logging
- Channel: `bot-logs:billing-integrity` | Level: warn | Persist: 365 days
