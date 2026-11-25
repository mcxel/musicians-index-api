/**
 * Thin import alias for Stripe webhook payout reconciliation.
 *
 * Canonical authority: performerPayoutRailAuthority.ts
 * Webhook imports this bridge name; do not duplicate payout logic here.
 */
export {
  reconcilePayoutWebhookEvent,
  type WebhookReconciliationResult,
} from "@/lib/booking/performerPayoutRailAuthority";
