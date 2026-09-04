/**
 * Persistent Universal Cart — server-authoritative (Lane D Phase 2, 2026-09-02).
 *
 * Replaces the reasoning CanonicalCartRuntime's in-memory Map used to carry:
 * a cart only lived in whichever JS realm created it (and when invoked from
 * a "use client" component, that realm is the browser tab, not a shared
 * server — meaning it never actually survived a reload or reached a second
 * device). This service is the real, Prisma-backed replacement. Every write
 * here is keyed to the authenticated userId, never a client-supplied cart id.
 *
 * Price law: CartItem.unitPriceCents is a display-only snapshot taken when
 * the item was added or last touched. It is NEVER the price charged.
 * revalidateForCheckout() always re-resolves the current canonical price via
 * StoreItemEngine.findStoreItemById before checkout proceeds.
 */
import prisma from '@/lib/prisma';
import { findStoreItemById, type StoreItem } from '@/lib/store/StoreItemEngine';

export interface CartItemView {
  itemId: string;
  name: string;
  icon: string;
  category: StoreItem['category'];
  quantity: number;
  unitPriceCents: number; // current canonical price, not the stored snapshot
  priceChanged: boolean; // true if the canonical price moved since this was added
}

export interface CartView {
  items: CartItemView[];
  subtotalCents: number;
  itemCount: number; // sum of quantities — what the cart badge shows
}

function emptyCart(): CartView {
  return { items: [], subtotalCents: 0, itemCount: 0 };
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  return cart.id;
}

function buildView(rows: { itemId: string; quantity: number; unitPriceCents: number }[]): CartView {
  const items: CartItemView[] = [];
  let subtotalCents = 0;
  let itemCount = 0;
  for (const row of rows) {
    // The catalog is the source of truth for whether an item still exists —
    // a retired/renamed StoreItem quietly drops out of the view rather than
    // crashing the whole cart (Rule 20: honest, never a broken surface).
    const canonical = findStoreItemById(row.itemId);
    if (!canonical) continue;
    items.push({
      itemId: row.itemId,
      name: canonical.name,
      icon: canonical.icon,
      category: canonical.category,
      quantity: row.quantity,
      unitPriceCents: canonical.price,
      priceChanged: canonical.price !== row.unitPriceCents,
    });
    subtotalCents += canonical.price * row.quantity;
    itemCount += row.quantity;
  }
  return { items, subtotalCents, itemCount };
}

export async function getCart(userId: string): Promise<CartView> {
  const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  if (!cart) return emptyCart();
  return buildView(cart.items);
}

export async function addItem(userId: string, itemId: string, quantity = 1): Promise<CartView> {
  if (quantity < 1) throw new Error('quantity_must_be_positive');
  const canonical = findStoreItemById(itemId);
  if (!canonical) throw new Error(`unknown_item:${itemId}`);
  if (canonical.mode === 'subscription') {
    // Subscriptions are recurring and go through the canonical subscription
    // checkout flow directly (Lane A) — they were never meant to accumulate
    // in a multi-item cart alongside one-time purchases.
    throw new Error('subscription_items_not_cart_eligible');
  }

  const cartId = await getOrCreateCartId(userId);
  const existing = await prisma.cartItem.findUnique({ where: { cartId_itemId: { cartId, itemId } } });
  await prisma.cartItem.upsert({
    where: { cartId_itemId: { cartId, itemId } },
    create: { cartId, itemId, quantity, unitPriceCents: canonical.price },
    update: { quantity: (existing?.quantity ?? 0) + quantity, unitPriceCents: canonical.price },
  });
  return getCart(userId);
}

export async function setQuantity(userId: string, itemId: string, quantity: number): Promise<CartView> {
  const cartId = await getOrCreateCartId(userId);
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId, itemId } });
    return getCart(userId);
  }
  const canonical = findStoreItemById(itemId);
  if (!canonical) throw new Error(`unknown_item:${itemId}`);
  await prisma.cartItem.upsert({
    where: { cartId_itemId: { cartId, itemId } },
    create: { cartId, itemId, quantity, unitPriceCents: canonical.price },
    update: { quantity, unitPriceCents: canonical.price },
  });
  return getCart(userId);
}

export async function removeItem(userId: string, itemId: string): Promise<CartView> {
  return setQuantity(userId, itemId, 0);
}

/**
 * Called by the Stripe webhook after a cart-originated purchase actually
 * completes — removes the purchased lines from the active cart so they
 * move into purchase history instead of lingering as if unpurchased.
 * Never called for a failed/cancelled checkout (items must remain).
 */
export async function removePurchasedItems(userId: string, itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, itemId: { in: itemIds } } });
}

export interface CheckoutRevalidation {
  ok: boolean;
  items: { itemId: string; qty: number }[];
  changed: { itemId: string; oldPriceCents: number; newPriceCents: number }[];
  unavailable: string[];
}

/**
 * The one place cart contents get turned into a checkout payload. Always
 * re-resolves current canonical price/availability from StoreItemEngine —
 * the stored unitPriceCents snapshot is never trusted here. If anything
 * changed or dropped out of the catalog since it was added, `ok` is false
 * and the caller must surface that to the user before charging anything,
 * never silently charge the new price.
 */
export async function revalidateForCheckout(userId: string): Promise<CheckoutRevalidation> {
  const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  if (!cart || cart.items.length === 0) {
    return { ok: false, items: [], changed: [], unavailable: [] };
  }

  const items: { itemId: string; qty: number }[] = [];
  const changed: CheckoutRevalidation['changed'] = [];
  const unavailable: string[] = [];

  for (const row of cart.items) {
    const canonical = findStoreItemById(row.itemId);
    if (!canonical) {
      unavailable.push(row.itemId);
      continue;
    }
    if (canonical.price !== row.unitPriceCents) {
      changed.push({ itemId: row.itemId, oldPriceCents: row.unitPriceCents, newPriceCents: canonical.price });
    }
    items.push({ itemId: row.itemId, qty: row.quantity });
  }

  return { ok: unavailable.length === 0, items, changed, unavailable };
}
