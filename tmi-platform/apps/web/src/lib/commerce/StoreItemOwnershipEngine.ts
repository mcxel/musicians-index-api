import prisma from '@/lib/prisma';
import { OwnershipRuntime } from '@/lib/commerce/OwnershipRuntime';
import {
  findStoreItemById,
  type StoreCategory,
} from '@/lib/store/StoreItemEngine';
import { storeItemSku } from '@/lib/commerce/CommerceCatalogContract';

/**
 * Durable ownership for StoreItemEngine catalog purchases (lobby + venue skins).
 *
 * Venue commerce has TWO paths — do not merge:
 *   A) StoreItemEngine VENUE_ITEMS → /store/venues → this table (itemId venue-*)
 *   B) VenueSkinCommerce VENUE_SKINS → /store/venue-skins → venue_skin_ownerships
 *
 * Lobby skins: StoreItemEngine LOBBY_ITEMS → /store/lobbies → this table.
 */

export async function persistStoreItemOwnership(input: {
  userId: string;
  itemId: string;
  stripePaymentId: string;
  pricePaidCents?: number;
}): Promise<{ ok: true; skuId: string } | { ok: false; reason: string }> {
  const item = findStoreItemById(input.itemId);
  if (!item) return { ok: false, reason: 'item_not_found' };

  const skuId = storeItemSku(item.id);

  await prisma.storeItemOwnership.upsert({
    where: { userId_itemId: { userId: input.userId, itemId: item.id } },
    create: {
      userId: input.userId,
      itemId: item.id,
      category: item.category,
      stripePaymentId: input.stripePaymentId,
      pricePaidCents: input.pricePaidCents ?? item.price,
    },
    update: {
      stripePaymentId: input.stripePaymentId,
      pricePaidCents: input.pricePaidCents ?? item.price,
    },
  });

  OwnershipRuntime.grantEntitlement({
    userId: input.userId,
    skuId,
    title: item.name,
    category: item.category === 'venue' || item.category === 'lobby' ? 'skin' : 'reward',
    provenance: 'PURCHASED',
    pricePaidCents: input.pricePaidCents ?? item.price,
    orderId: input.stripePaymentId,
  });

  return { ok: true, skuId };
}

export async function listOwnedStoreItems(userId: string) {
  const rows = await prisma.storeItemOwnership.findMany({
    where: { userId },
    orderBy: { purchasedAt: 'desc' },
  });
  return rows.map((row) => {
    const item = findStoreItemById(row.itemId);
    return {
      itemId: row.itemId,
      sku: storeItemSku(row.itemId),
      category: row.category as StoreCategory,
      title: item?.name ?? row.itemId,
      pricePaidCents: row.pricePaidCents,
      purchasedAt: row.purchasedAt.toISOString(),
      stripePaymentId: row.stripePaymentId,
    };
  });
}

export async function hasStoreItemAccess(userId: string, itemId: string): Promise<boolean> {
  const row = await prisma.storeItemOwnership.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });
  if (row) return true;
  return OwnershipRuntime.hasEntitlement(userId, storeItemSku(itemId));
}
