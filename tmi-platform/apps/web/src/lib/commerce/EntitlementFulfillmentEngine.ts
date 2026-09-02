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
