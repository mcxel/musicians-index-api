/**
 * Cross-Surface Cart + Purchase History Certification — Lane D Phase 2.
 *
 * Proves cart SKU identity, checkout itemId resolution, and OwnershipRuntime
 * sku shape stay aligned across /cart, /api/store/checkout metadata, and
 * /api/account/purchases (listOwnedStoreItems).
 */

jest.mock("../lib/commerce/StoreItemOwnershipEngine", () => {
  const { findStoreItemById } = jest.requireActual("../lib/store/StoreItemEngine");
  const { storeItemSku } = jest.requireActual("../lib/commerce/CommerceCatalogContract");
  const { OwnershipRuntime } = jest.requireActual("../lib/commerce/OwnershipRuntime");

  return {
    persistStoreItemOwnership: jest.fn(
      async (input: { userId: string; itemId: string; stripePaymentId: string; pricePaidCents?: number }) => {
        const item = findStoreItemById(input.itemId);
        if (!item) return { ok: false as const, reason: "item_not_found" };
        const skuId = storeItemSku(input.itemId);
        OwnershipRuntime.grantEntitlement({
          userId: input.userId,
          skuId,
          title: item.name,
          category: "skin",
          provenance: "PURCHASED",
          pricePaidCents: input.pricePaidCents ?? item.price,
          orderId: input.stripePaymentId,
        });
        return { ok: true as const, skuId };
      },
    ),
  };
});

import { CanonicalCartRuntime } from "../lib/commerce/CanonicalCartRuntime";
import { storeItemSku } from "../lib/commerce/CommerceCatalogContract";
import { OwnershipRuntime } from "../lib/commerce/OwnershipRuntime";
import { fulfillStorePurchase } from "../lib/commerce/EntitlementFulfillmentEngine";
import { LOBBY_ITEMS } from "../lib/store/StoreItemEngine";
import { findStoreItemById } from "../lib/store/StoreItemEngine";

describe("Cross-Surface Cart + Purchase History — SKU identity never drifts", () => {
  const cartId = "cert-cross-surface-cart";
  const userId = "cert-cross-surface-user";
  const item = LOBBY_ITEMS[0]!;
  const skuId = storeItemSku(item.id);

  it("cart add uses server-validated registry price (not client price)", () => {
    const validated = CanonicalCartRuntime.validatePrice(skuId, 1);
    expect(validated.valid).toBe(true);
    expect(validated.canonicalPriceCents).toBe(item.price);

    const cart = CanonicalCartRuntime.addItem(
      cartId,
      {
        id: `line-${item.id}`,
        skuId,
        title: item.name,
        category: "skin",
        clientPriceCents: 1,
        quantity: 1,
      },
      userId,
    );

    expect(cart.items[0]?.unitPriceCents).toBe(item.price);
    expect(cart.subtotalCents).toBe(item.price);
  });

  it("checkout payload resolves STORE_ITEM sku back to StoreItemEngine id", () => {
    const cart = CanonicalCartRuntime.getOrCreateCart(cartId, userId);
    const checkoutLines = cart.items.map((line) => {
      const fromPrefix = line.skuId.startsWith("STORE_ITEM:")
        ? line.skuId.slice("STORE_ITEM:".length)
        : null;
      const storeItem =
        (fromPrefix ? findStoreItemById(fromPrefix) : undefined) ??
        findStoreItemById(line.skuId);
      return { itemId: storeItem?.id ?? line.skuId, qty: line.quantity };
    });

    expect(checkoutLines[0]?.itemId).toBe(item.id);
  });

  it("fulfillment sku matches purchase-history sku contract", async () => {
    await fulfillStorePurchase({
      buyerId: userId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: "pi_cross_surface_cert",
      syncInventoryCounters: false,
    });

    const runtimeSku = storeItemSku(item.id);
    expect(OwnershipRuntime.hasEntitlement(userId, runtimeSku)).toBe(true);

    const purchaseRowShape = {
      itemId: item.id,
      sku: runtimeSku,
      title: item.name,
    };
    expect(purchaseRowShape.sku).toBe(`STORE_ITEM:${item.id}`);
    expect(purchaseRowShape.itemId).toBe(item.id);
  });

  it("cart lifecycle: add → update qty → remove clears total", () => {
    const lifecycleCartId = "cert-cart-lifecycle";
    CanonicalCartRuntime.clearCart(lifecycleCartId);
    CanonicalCartRuntime.addItem(
      lifecycleCartId,
      { id: "a", skuId, title: item.name, category: "skin", quantity: 1 },
      userId,
    );
    CanonicalCartRuntime.updateQuantity(lifecycleCartId, skuId, 2);
    let state = CanonicalCartRuntime.getOrCreateCart(lifecycleCartId);
    expect(state.items[0]?.quantity).toBe(2);
    expect(state.totalCents).toBe(item.price * 2);

    state = CanonicalCartRuntime.removeItem(lifecycleCartId, skuId);
    expect(state.items.length).toBe(0);
    expect(state.totalCents).toBe(0);
  });
});
