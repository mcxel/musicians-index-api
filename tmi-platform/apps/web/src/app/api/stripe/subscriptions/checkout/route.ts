/**
 * GET|POST /api/stripe/subscriptions/checkout
 * Thin alias for TMI subscription checkout — same handler as /api/stripe/checkout.
 * Artist merch/shoutouts use /api/commerce/checkout instead.
 */
export { GET, POST } from "../../checkout/route";
