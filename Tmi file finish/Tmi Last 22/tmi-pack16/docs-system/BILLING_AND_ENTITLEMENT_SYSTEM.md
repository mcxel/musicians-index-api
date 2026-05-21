# BILLING_AND_ENTITLEMENT_SYSTEM.md
## How Subscriptions Work — Purchase, Sync, Lapse, Restore
Web: Stripe Checkout → webhook → DB entitlement update → user sees new tier
iOS: Apple IAP sheet → App Store Server Notification → DB update → user sees new tier
Android: Google Play Billing → server notification → DB update
Restore: query Apple/Google → match TMI account → restore entitlement → confirm
Sync triggers: app launch, subscription change, restore attempt, 24h background refresh
If sync fails: show last known tier for 48h → graceful downgrade → never hard-lock
Lapse: day 1 premium rooms read-only | +7d analytics read-only | +30d archived not deleted
Marcel and BJ: PERMANENT DIAMOND — verified by billing-integrity-bot on every 4h run
Refund: 48h auto-refund window. Apple/Google handle their own refunds.
Copilot wires: apps/api/src/services/subscription.service.ts + Stripe webhook handler
