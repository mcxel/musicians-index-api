/**
 * Webhook surface quarantine — canonical fulfillment only.
 */

export const CANONICAL_STRIPE_WEBHOOK_PATH = "/api/stripe/webhook";

export const NON_CANONICAL_STRIPE_WEBHOOK_PATHS = [
  "/api/webhooks/stripe",
  "/api/finance/webhook/stripe",
  "/api/yo/purchase/webhook",
] as const;

export const WEBHOOK_QUARANTINE_POLICY = {
  canonicalPath: CANONICAL_STRIPE_WEBHOOK_PATH,
  ticketFulfillmentAllowedOnlyOnCanonical: true,
  financeWebhookMayNotMintTickets: true,
  nestLegacyMustNotDualFulfill: true,
  note: "Configure Stripe Dashboard to canonical path only. Side channels ack/telemetry only.",
} as const;
