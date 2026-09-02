/**
 * Entitlement Fulfillment Certification — Lane D Phase 2.
 *
 * Proves PAID_PENDING_FULFILLMENT can become usable via OwnershipRuntime
 * when fulfillStorePurchase / retryPendingStoreFulfillment runs with a
 * real buyerId + StoreItemEngine item payload.
 *
 * Uses mocked durable persistence — physical Postgres round-trip lives in
 * runStoreItemOwnershipPersistence.test.ts.
 */

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    order: {
      updateMany: jest.fn(async () => ({ count: 0 })),
    },
  },
}));

jest.mock("../lib/commerce/StoreItemOwnershipEngine", () => {
  const { findStoreItemById } = jest.requireActual("../lib/store/StoreItemEngine");
  const { storeItemSku } = jest.requireActual("../lib/commerce/CommerceCatalogContract");
  const { OwnershipRuntime } = jest.requireActual("../lib/commerce/OwnershipRuntime");

  return {
    persistStoreItemOwnership: jest.fn(
      async (input: { userId: string; itemId: string; stripePaymentId: string; pricePaidCents?: number }) => {
        if (!input.userId.trim()) return { ok: false as const, reason: "missing_buyer" };
        const item = findStoreItemById(input.itemId);
        if (!item) return { ok: false as const, reason: "item_not_found" };
        const skuId = storeItemSku(input.itemId);
        OwnershipRuntime.grantEntitlement({
          userId: input.userId,
          skuId,
          title: item.name,
          category: item.category === "venue" || item.category === "lobby" ? "skin" : "reward",
          provenance: "PURCHASED",
          pricePaidCents: input.pricePaidCents ?? item.price,
          orderId: input.stripePaymentId,
        });
        return { ok: true as const, skuId };
      },
    ),
  };
});

import { OwnershipRuntime } from "../lib/commerce/OwnershipRuntime";
import { storeItemSku } from "../lib/commerce/CommerceCatalogContract";
import {
  fulfillStorePurchase,
  retryPendingStoreFulfillment,
  storeEntitlementUsable,
} from "../lib/commerce/EntitlementFulfillmentEngine";
import { LOBBY_ITEMS } from "../lib/store/StoreItemEngine";

describe("EntitlementFulfillmentEngine — PAID_PENDING → OwnershipRuntime usable", () => {
  const buyerId = "lane-d-phase2-buyer";
  const item = LOBBY_ITEMS.find((i) => i.id === "lobby-chill")!;
  const stripePaymentId = "pi_lane_d_entitlement_cert";

  it("fulfillStorePurchase grants same-request OwnershipRuntime access", async () => {
    const result = await fulfillStorePurchase({
      buyerId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId,
      syncInventoryCounters: false,
    });

    expect(result.fulfillmentOk).toBe(true);
    expect(result.lines.every((l) => l.ok)).toBe(true);
    expect(storeEntitlementUsable(buyerId, item.id)).toBe(true);
    expect(OwnershipRuntime.hasEntitlement(buyerId, storeItemSku(item.id))).toBe(true);
  });

  it("retryPendingStoreFulfillment is idempotent on duplicate delivery", async () => {
    const first = await retryPendingStoreFulfillment({
      buyerId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: `${stripePaymentId}_retry`,
    });
    const second = await retryPendingStoreFulfillment({
      buyerId,
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: `${stripePaymentId}_retry`,
    });

    expect(first.fulfillment.fulfillmentOk).toBe(true);
    expect(second.fulfillment.fulfillmentOk).toBe(true);
    const entitlements = OwnershipRuntime.getUserEntitlements(buyerId, "PURCHASED");
    const matches = entitlements.filter((e) => e.skuId === storeItemSku(item.id));
    expect(matches.length).toBe(1);
  });

  it("missing buyerId path stays PAID_PENDING (no fake ownership)", async () => {
    const result = await fulfillStorePurchase({
      buyerId: "",
      items: [{ itemId: item.id, qty: 1 }],
      stripePaymentId: "pi_missing_buyer",
      syncInventoryCounters: false,
    });
    expect(result.fulfillmentOk).toBe(false);
  });
});
