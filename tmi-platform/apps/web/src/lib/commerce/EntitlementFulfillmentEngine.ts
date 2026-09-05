/**
 * EntitlementFulfillmentEngine — canonical store purchase fulfillment.
 *
 * Stripe proves payment; this engine grants durable ownership
 * (store_item_ownerships + OwnershipRuntime) so PAID_PENDING_FULFILLMENT
 * orders can be retried when buyerId + item payload are available.
 *
 * Venue commerce has TWO paths — do not merge:
 *   A) StoreItemEngine VENUE_ITEMS → /store/venues → StoreItemOwnershipEngine
 *   B) VenueSkinCommerce VENUE_SKINS → /store/venue-skins → venue_skin_ownerships
 */

import { syncInventory } from '@/lib/commerce/commerceEngine';
import { persistStoreItemOwnership } from '@/lib/commerce/StoreItemOwnershipEngine';
import { OwnershipRuntime } from '@/lib/commerce/OwnershipRuntime';
import { storeItemSku } from '@/lib/commerce/CommerceCatalogContract';
import { getStripe } from '@/lib/stripe/client';
import type Stripe from 'stripe';
import prisma from '@/lib/prisma';

export type StoreFulfillmentLine = { itemId: string; qty: number };

export type StoreFulfillmentResult = {
  inventorySynced: boolean;
  fulfillmentOk: boolean;
  lines: Array<{ itemId: string; ok: boolean; skuId?: string; reason?: string }>;
};

/** Grant StoreItemEngine catalog ownership for a paid checkout payload. */
export async function fulfillStorePurchase(input: {
  buyerId: string;
  items: StoreFulfillmentLine[];
  stripePaymentId: string;
  syncInventoryCounters?: boolean;
}): Promise<StoreFulfillmentResult> {
  const lines: StoreFulfillmentResult['lines'] = [];
  let inventorySynced = false;
  let fulfillmentOk = false;

  if (input.items.length === 0 || !input.buyerId.trim()) {
    return { inventorySynced: false, fulfillmentOk: false, lines };
  }

  try {
    if (input.syncInventoryCounters !== false) {
      for (const line of input.items) {
        syncInventory(line.itemId, line.qty);
      }
      inventorySynced = true;
    }

    const results = await Promise.all(
      input.items.map(async (line) => {
        const persisted = await persistStoreItemOwnership({
          userId: input.buyerId,
          itemId: line.itemId,
          stripePaymentId: input.stripePaymentId,
        });
        return {
          itemId: line.itemId,
          ok: persisted.ok,
          skuId: persisted.ok ? persisted.skuId : undefined,
          reason: persisted.ok ? undefined : persisted.reason,
        };
      }),
    );
    lines.push(...results);
    fulfillmentOk = results.every((r) => r.ok);
  } catch {
    return { inventorySynced: false, fulfillmentOk: false, lines };
  }

  return { inventorySynced, fulfillmentOk, lines };
}

/** Flip a PAID_PENDING_FULFILLMENT order to PAID when fulfillment succeeds. */
export async function markStoreOrderPaidIfFulfilled(input: {
  stripePaymentId: string;
  buyerId: string;
  fulfillment: StoreFulfillmentResult;
}): Promise<'PAID' | 'PAID_PENDING_FULFILLMENT'> {
  const status =
    input.fulfillment.inventorySynced && input.fulfillment.fulfillmentOk && input.buyerId
      ? 'PAID'
      : 'PAID_PENDING_FULFILLMENT';

  await prisma.order.updateMany({
    where: {
      provider: 'STRIPE',
      providerPaymentId: input.stripePaymentId,
      status: 'PAID_PENDING_FULFILLMENT',
    },
    data: { status },
  });

  return status;
}

/**
 * Retry fulfillment for a pending store order when the item payload is known
 * (e.g. re-delivered webhook metadata or admin replay).
 */
export async function retryPendingStoreFulfillment(input: {
  buyerId: string;
  items: StoreFulfillmentLine[];
  stripePaymentId: string;
}): Promise<{ orderStatus: 'PAID' | 'PAID_PENDING_FULFILLMENT'; fulfillment: StoreFulfillmentResult }> {
  const fulfillment = await fulfillStorePurchase({
    buyerId: input.buyerId,
    items: input.items,
    stripePaymentId: input.stripePaymentId,
  });
  const orderStatus = await markStoreOrderPaidIfFulfilled({
    stripePaymentId: input.stripePaymentId,
    buyerId: input.buyerId,
    fulfillment,
  });
  return { orderStatus, fulfillment };
}

/** Same-request usability check — OwnershipRuntime reflects the grant immediately. */
export function storeEntitlementUsable(userId: string, itemId: string): boolean {
  return OwnershipRuntime.hasEntitlement(userId, storeItemSku(itemId));
}

// ─── Reconciliation Worker (Lane D Phase 2, 2026-09-02) ────────────────────
// Activates retryPendingStoreFulfillment() above — previously defined but
// never called from anywhere. Real Stripe verification (never trusts the
// stale Order row alone): re-fetches the original Checkout Session to
// confirm payment actually succeeded and to recover the item payload, since
// Order has no items/metadata column of its own. Every attempt is recorded
// on the order (fulfillmentRetryCount/lastFulfillmentAttemptAt/
// lastFulfillmentError) — never silently swallowed, per the "no ghost
// retries" requirement. Triggered by POST /api/admin/commerce/retry-pending-fulfillment
// (admin-gated) — no scheduled-worker framework exists in this codebase, so
// this stays a manually-triggered admin operation rather than inventing one.

export type ReconcileOutcome = 'RECOVERED' | 'STILL_PENDING' | 'NOT_APPLICABLE' | 'ERROR';

export interface ReconcileResult {
  orderId: string;
  outcome: ReconcileOutcome;
  detail: string;
}

async function recordAttempt(
  orderId: string,
  attemptAt: Date,
  outcome: ReconcileOutcome,
  detail: string,
): Promise<ReconcileResult> {
  await prisma.order
    .update({
      where: { id: orderId },
      data: {
        fulfillmentRetryCount: { increment: 1 },
        lastFulfillmentAttemptAt: attemptAt,
        lastFulfillmentError: outcome === 'RECOVERED' ? null : detail,
        ...(outcome === 'RECOVERED' ? { status: 'PAID' } : {}),
      },
    })
    .catch(() => {});
  return { orderId, outcome, detail };
}

interface PendingOrder {
  id: string;
  providerPaymentId: string | null;
  buyerUserId: string | null;
}

async function reconcileOneOrder(
  order: PendingOrder,
  stripe: NonNullable<ReturnType<typeof getStripe>>,
): Promise<ReconcileResult> {
  const attemptAt = new Date();

  if (!order.providerPaymentId) {
    return recordAttempt(order.id, attemptAt, 'ERROR', 'order has no providerPaymentId to look up');
  }

  try {
    // The live webhook has the Checkout Session object directly in scope;
    // this reconciliation runs later and only has the Order row, so it must
    // re-fetch the session from Stripe — by payment_intent first (the usual
    // case for a completed payment), falling back to treating the stored
    // value as a session id directly (matches the `session.payment_intent
    // || session.id` fallback the webhook itself used when writing the row).
    let session: (Stripe.Checkout.Session & { lastResponse?: any }) | any = null;
    const byPaymentIntent = await stripe.checkout.sessions.list({
      payment_intent: order.providerPaymentId,
      limit: 1,
    });
    session = byPaymentIntent.data[0] ?? null;
    if (!session) {
      session = await stripe.checkout.sessions.retrieve(order.providerPaymentId).catch(() => null);
    }
    if (!session) {
      return recordAttempt(order.id, attemptAt, 'ERROR', 'no matching Stripe Checkout Session found for providerPaymentId');
    }

    // VERIFY PAYMENT — never trust the Order row's status alone.
    if (session.payment_status !== 'paid') {
      return recordAttempt(order.id, attemptAt, 'STILL_PENDING', `Stripe session.payment_status=${session.payment_status}`);
    }

    const metadata = session.metadata ?? {};
    if (metadata.type !== 'store') {
      // Real gap, disclosed rather than mis-handled: NFT/ad_purchase honest
      // stubs also land in PAID_PENDING_FULFILLMENT with the same Order
      // shape, but have no recovery path of their own yet — this worker
      // must not attempt to "fulfill" them as if they were store items.
      return recordAttempt(order.id, attemptAt, 'NOT_APPLICABLE', `metadata.type=${metadata.type ?? 'none'} — not a store order`);
    }

    let items: { itemId: string; qty: number }[] = [];
    try {
      items = JSON.parse(metadata.items || '[]');
    } catch {
      return recordAttempt(order.id, attemptAt, 'ERROR', 'metadata.items was not valid JSON');
    }
    const buyerId = metadata.buyerId || order.buyerUserId || '';
    if (!items.length || !buyerId) {
      return recordAttempt(order.id, attemptAt, 'ERROR', `missing items (${items.length}) or buyerId ("${buyerId}") in session metadata`);
    }

    const { orderStatus, fulfillment } = await retryPendingStoreFulfillment({
      buyerId,
      items,
      stripePaymentId: order.providerPaymentId,
    });

    if (orderStatus === 'PAID') {
      return recordAttempt(order.id, attemptAt, 'RECOVERED', 'fulfillment succeeded on retry');
    }
    const failedLines = fulfillment.lines
      .filter((l) => !l.ok)
      .map((l) => `${l.itemId}:${l.reason ?? 'unknown'}`)
      .join(', ');
    return recordAttempt(order.id, attemptAt, 'STILL_PENDING', failedLines || 'fulfillment still incomplete for an unknown reason');
  } catch (err) {
    return recordAttempt(order.id, attemptAt, 'ERROR', err instanceof Error ? err.message : String(err));
  }
}

/**
 * Reconciles every currently-PAID_PENDING_FULFILLMENT order, oldest first.
 * Idempotent: retryPendingStoreFulfillment/persistStoreItemOwnership upsert
 * on the (userId, itemId) unique key, so re-running this never grants a
 * duplicate entitlement. Returns one result per order examined — callers
 * must not swallow ERROR/STILL_PENDING/NOT_APPLICABLE outcomes.
 */
export async function reconcilePendingStoreOrders(limit = 25): Promise<ReconcileResult[]> {
  const stripe = getStripe();
  if (!stripe) {
    return [{ orderId: '(none)', outcome: 'ERROR', detail: 'Stripe not configured' }];
  }

  const pending = await prisma.order.findMany({
    where: { status: 'PAID_PENDING_FULFILLMENT' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true, providerPaymentId: true, buyerUserId: true },
  });

  const results: ReconcileResult[] = [];
  for (const order of pending) {
    // Sequential, not Promise.all — real Stripe API calls per order, no
    // need to burst-parallelize an admin-triggered maintenance action.
    results.push(await reconcileOneOrder(order, stripe));
  }
  return results;
}
