/**
 * Refund / chargeback revocation for durable store entitlements (owner-approved 2026-11-18).
 *
 * Called from the Stripe webhook's charge.refunded branch alongside the existing boost and
 * YoPho revocations. Covers what that branch did NOT revoke before:
 *   - store_item_ownerships  (StoreItemEngine lobby/venue items AND Foundry catalog items "foundry:*")
 *   - venue_skin_ownerships   (VenueSkinCommerce, purchased skins only — tier/season-pass untouched)
 *
 * Matching is by the exact payment reference recorded at fulfilment: store items store the
 * payment intent; venue skins store the Checkout Session id, so the caller passes the
 * session ids that belong to the payment intent (looked up read-only from Stripe).
 *
 * Partial refunds: a Stripe refund carries no line-item identity, so we cannot know WHICH
 * item was refunded. Nothing is revoked automatically on a partial refund; the result says
 * so and the webhook logs it for ops. Full refund → every entitlement on that payment.
 * Idempotent: a duplicate event deletes zero rows. Errors propagate so Stripe retries.
 */
import type { QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { storeItemSku, venueSkinSku } from "@/lib/commerce/CommerceCatalogContract";

export type RefundRevocationResult =
  | { status: "REVOKED"; storeItems: number; venueSkins: number; refs: string[] }
  | { status: "PARTIAL_REFUND_NOT_REVOKED"; refs: string[] }
  | { status: "NO_PAYMENT_REF"; refs: [] };

export async function revokeRefundedEntitlements(
  q: QueueSql,
  input: { paymentIntentId: string | null; checkoutSessionIds: string[]; fullyRefunded: boolean },
): Promise<RefundRevocationResult> {
  const refs = [input.paymentIntentId, ...input.checkoutSessionIds].filter((r): r is string => Boolean(r));
  if (refs.length === 0) return { status: "NO_PAYMENT_REF", refs: [] };
  if (!input.fullyRefunded) return { status: "PARTIAL_REFUND_NOT_REVOKED", refs };

  const items = await q.query<{ userId: string; itemId: string }>(
    `DELETE FROM store_item_ownerships WHERE "stripePaymentId" = ANY($1::text[]) RETURNING "userId", "itemId"`,
    [refs],
  );
  const skins = await q.query<{ userId: string; skinId: string }>(
    `DELETE FROM venue_skin_ownerships
      WHERE "stripePaymentId" = ANY($1::text[]) AND "unlockedVia" = 'purchase'
      RETURNING "userId", "skinId"`,
    [refs],
  );
  // Keep this process's in-memory fallback consistent with the durable rows.
  for (const r of items) OwnershipRuntime.revokeEntitlement(r.userId, storeItemSku(r.itemId));
  for (const r of skins) OwnershipRuntime.revokeEntitlement(r.userId, venueSkinSku(r.skinId));
  return { status: "REVOKED", storeItems: items.length, venueSkins: skins.length, refs };
}
