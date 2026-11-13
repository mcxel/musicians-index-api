/**
 * Local unit certification — AdPurchaseFulfillmentAuthority (pure + mocked prisma).
 * No Stripe mutations. No production DB. COMMIT/PUSH/DEPLOY remain OFF.
 */

import {
  AD_PURCHASE_ORDER_KIND,
  buildAdPurchaseOrderPersistFields,
  ensureAdPurchasePendingActivation,
  parseAdPurchaseFulfillmentMetadata,
} from "@/lib/commerce/AdPurchaseFulfillmentAuthority";

describe("AdPurchaseFulfillmentAuthority", () => {
  it("builds durable Order fields without auto-activation", () => {
    const fields = buildAdPurchaseOrderPersistFields(
      {
        type: "ad_purchase",
        refId: "mag_home_hero",
        productName: "Magazine Hero",
        creativeUrl: "https://cdn.example/creative.jpg",
        startDate: "2026-12-01",
        buyerEmail: "buyer@example.com",
      },
      "2026-11-12T00:00:00.000Z",
    );

    expect(fields.orderKind).toBe(AD_PURCHASE_ORDER_KIND);
    expect(fields.refId).toBe("mag_home_hero");
    expect(fields.status).toBe("PAID_PENDING_FULFILLMENT");
    expect(fields.adActivationStatus).toBe("PENDING_CREATIVE_REVIEW");

    const meta = JSON.parse(fields.fulfillmentMetadataJson);
    expect(meta.autoActivated).toBe(false);
    expect(meta.requiresCreativeReview).toBe(true);
    expect(meta.creativeUrl).toBe("https://cdn.example/creative.jpg");
    expect(meta.slotId).toBe("mag_home_hero");
  });

  it("parses fulfillment metadata safely", () => {
    const raw = buildAdPurchaseOrderPersistFields({
      refId: "slot_a",
      zone: "home_1",
    }).fulfillmentMetadataJson;
    const parsed = parseAdPurchaseFulfillmentMetadata(raw);
    expect(parsed?.refId).toBe("slot_a");
    expect(parsed?.zone).toBe("home_1");
    expect(parsed?.autoActivated).toBe(false);
    expect(parseAdPurchaseFulfillmentMetadata("not-json")).toBeNull();
    expect(parseAdPurchaseFulfillmentMetadata(null)).toBeNull();
  });

  it("ensureAdPurchasePendingActivation never escalates to LIVE", async () => {
    const update = jest.fn(async () => ({}));
    const result = await ensureAdPurchasePendingActivation({
      orderId: "ord_test_1",
      prisma: { order: { update } },
      stripeMetadata: { type: "ad_purchase", refId: "slot_b" },
    });

    expect(result.ok).toBe(true);
    expect(result.activationStatus).toBe("PENDING_CREATIVE_REVIEW");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ord_test_1" },
        data: expect.objectContaining({
          orderKind: AD_PURCHASE_ORDER_KIND,
          adActivationStatus: "PENDING_CREATIVE_REVIEW",
          status: "PAID_PENDING_FULFILLMENT",
        }),
      }),
    );
  });

  it("leaves existing LIVE / APPROVED / REJECTED status untouched", async () => {
    const update = jest.fn(async () => ({}));
    const live = await ensureAdPurchasePendingActivation({
      orderId: "ord_live",
      prisma: { order: { update } },
      existing: { adActivationStatus: "LIVE", orderKind: "ad_purchase", refId: "x" },
    });
    expect(live.activationStatus).toBe("LIVE");
    expect(update).not.toHaveBeenCalled();

    const approved = await ensureAdPurchasePendingActivation({
      orderId: "ord_approved",
      prisma: { order: { update } },
      existing: { adActivationStatus: "APPROVED", orderKind: "ad_purchase", refId: "x" },
    });
    expect(approved.activationStatus).toBe("APPROVED");
    expect(update).toHaveBeenCalled();
  });
});
