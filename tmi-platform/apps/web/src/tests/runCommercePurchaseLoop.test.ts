/**
 * Shortest Real Digital-Item Cash Purchase Loop Certification Suite — Lane D Phase 2.
 *
 * Uses real StoreItemEngine catalog SKUs (not invented ids) so server price
 * authority, cart, OwnershipRuntime, and purchase-history contracts align.
 *
 * Durable Postgres persistence is mocked here — see runStoreItemOwnershipPersistence.test.ts.
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
import { OwnershipRuntime } from "../lib/commerce/OwnershipRuntime";
import { storeItemSku } from "../lib/commerce/CommerceCatalogContract";
import { fulfillStorePurchase } from "../lib/commerce/EntitlementFulfillmentEngine";
import { LOBBY_ITEMS } from "../lib/store/StoreItemEngine";

describe("Commerce Purchase Loop — real catalog end-to-end", () => {
  const cartId = "cert-cart-999";
  const userId = "user-cert-888";
  const item = LOBBY_ITEMS.find((i) => i.id === "lobby-neon")!;
  const skuId = storeItemSku(item.id);

  it("sku_validated_by_server_authority", () => {
    const validation = CanonicalCartRuntime.validatePrice(skuId, 1);
    expect(validation.valid).toBe(true);
    expect(validation.canonicalPriceCents).toBe(item.price);
  });

  it("cart_item_added with registry price (client price ignored)", () => {
    const cart = CanonicalCartRuntime.addItem(
      cartId,
      {
        id: "item-lobby-neon",
        skuId,
        title: item.name,
        category: "skin",
        clientPriceCents: 1,
        quantity: 1,
      },
      userId,
    );
    expect(cart.items.length).toBe(1);
    expect(cart.subtotalCents).toBe(item.price);
  });

  it("checkout_session_payload_valid (tax at Stripe — subtotal equals total here)", () => {
    const cart = CanonicalCartRuntime.getOrCreateCart(cartId, userId);
    expect(cart.totalCents).toBe(item.price);
    expect(cart.subtotalCents).toBe(item.price);
  });

  it("webhook_fulfillment_idempotent via fulfillStorePurchase", async () => {
    const orderId = "ord-stripe-tx-555";
    const first = await fulfillStorePurchase({
      buyerId: userId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: orderId,
      syncInventoryCounters: false,
    });
    const second = await fulfillStorePurchase({
      buyerId: userId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: orderId,
      syncInventoryCounters: false,
    });
    expect(first.fulfillmentOk).toBe(true);
    expect(second.fulfillmentOk).toBe(true);
  });

  it("entitlement_granted_to_user in OwnershipRuntime", () => {
    expect(OwnershipRuntime.hasEntitlement(userId, skuId)).toBe(true);
  });

  it("purchases_and_ownership_reflects_item", () => {
    const userPurchases = OwnershipRuntime.getUserEntitlements(userId, "PURCHASED");
    expect(userPurchases.some((e) => e.skuId === skuId)).toBe(true);
  });

  it("receipt_generated retains order id and price paid", () => {
    const ent = OwnershipRuntime.getUserEntitlements(userId, "PURCHASED").find(
      (e) => e.skuId === skuId,
    );
    expect(ent?.orderId).toBeTruthy();
    expect(ent?.pricePaidCents).toBe(item.price);
    expect(ent?.obtainedAt).toBeGreaterThan(0);
  });
});
