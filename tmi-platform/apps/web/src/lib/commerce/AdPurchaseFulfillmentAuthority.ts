/**
 * AdPurchaseFulfillmentAuthority — durable trail for Stripe ad_purchase orders.
 *
 * Payment capture already creates Order rows. This authority:
 * 1. Shapes durable fields (orderKind / refId / metadata / activation status)
 * 2. Ensures pending creative-review state is queryable by Admin
 * 3. NEVER auto-activates paid ads into ACTIVE_SPONSOR_ZONES or live campaigns
 *
 * Reuses Order + existing AdCampaign/AdCreative models for later human approval.
 * Does not create a second payment or ad-decision engine.
 */

export const AD_PURCHASE_ORDER_KIND = "ad_purchase" as const;

export type AdActivationStatus =
  | "PENDING_CREATIVE_REVIEW"
  | "AWAITING_ADMIN"
  | "APPROVED"
  | "REJECTED"
  | "LIVE";

export type AdPurchaseStripeMetadata = {
  type?: string;
  refId?: string;
  buyerEmail?: string;
  userEmail?: string;
  creativeUrl?: string;
  startDate?: string;
  productName?: string;
  zone?: string;
  slotId?: string;
};

export type AdPurchaseFulfillmentMetadata = {
  refId: string | null;
  creativeUrl: string | null;
  startDate: string | null;
  productName: string | null;
  zone: string | null;
  slotId: string | null;
  buyerEmail: string | null;
  recordedAt: string;
  autoActivated: false;
  requiresCreativeReview: true;
};

export type AdPurchaseOrderPersistFields = {
  orderKind: typeof AD_PURCHASE_ORDER_KIND;
  refId: string | null;
  fulfillmentMetadataJson: string;
  adActivationStatus: AdActivationStatus;
  status: "PAID_PENDING_FULFILLMENT";
};

/** Pure builder for webhook / tests — no DB, no Stripe side effects. */
export function buildAdPurchaseOrderPersistFields(
  metadata: AdPurchaseStripeMetadata,
  nowIso = new Date().toISOString(),
): AdPurchaseOrderPersistFields {
  const refId = (metadata.refId || metadata.slotId || "").trim() || null;
  const payload: AdPurchaseFulfillmentMetadata = {
    refId,
    creativeUrl: metadata.creativeUrl?.trim() || null,
    startDate: metadata.startDate?.trim() || null,
    productName: metadata.productName?.trim() || null,
    zone: metadata.zone?.trim() || null,
    slotId: metadata.slotId?.trim() || refId,
    buyerEmail: (metadata.buyerEmail || metadata.userEmail || "").trim() || null,
    recordedAt: nowIso,
    autoActivated: false,
    requiresCreativeReview: true,
  };

  return {
    orderKind: AD_PURCHASE_ORDER_KIND,
    refId,
    fulfillmentMetadataJson: JSON.stringify(payload),
    adActivationStatus: "PENDING_CREATIVE_REVIEW",
    status: "PAID_PENDING_FULFILLMENT",
  };
}

export function parseAdPurchaseFulfillmentMetadata(
  raw: string | null | undefined,
): AdPurchaseFulfillmentMetadata | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdPurchaseFulfillmentMetadata>;
    return {
      refId: parsed.refId ?? null,
      creativeUrl: parsed.creativeUrl ?? null,
      startDate: parsed.startDate ?? null,
      productName: parsed.productName ?? null,
      zone: parsed.zone ?? null,
      slotId: parsed.slotId ?? null,
      buyerEmail: parsed.buyerEmail ?? null,
      recordedAt: parsed.recordedAt ?? "",
      autoActivated: false,
      requiresCreativeReview: true,
    };
  } catch {
    return null;
  }
}

/**
 * Ensure a paid ad order has a discoverable pending-activation trail.
 * Does not set LIVE / does not write ACTIVE_SPONSOR_ZONES.
 */
export async function ensureAdPurchasePendingActivation(input: {
  orderId: string;
  prisma: {
    order: {
      update: (args: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => Promise<unknown>;
    };
  };
  existing?: {
    orderKind?: string | null;
    refId?: string | null;
    fulfillmentMetadataJson?: string | null;
    adActivationStatus?: string | null;
  };
  stripeMetadata?: AdPurchaseStripeMetadata;
}): Promise<{ ok: true; activationStatus: AdActivationStatus; detail: string }> {
  const built = buildAdPurchaseOrderPersistFields(input.stripeMetadata ?? {
    type: AD_PURCHASE_ORDER_KIND,
    refId: input.existing?.refId ?? undefined,
  });

  const activationStatus =
    (input.existing?.adActivationStatus as AdActivationStatus | null) === "LIVE" ||
    (input.existing?.adActivationStatus as AdActivationStatus | null) === "APPROVED" ||
    (input.existing?.adActivationStatus as AdActivationStatus | null) === "REJECTED"
      ? (input.existing!.adActivationStatus as AdActivationStatus)
      : "PENDING_CREATIVE_REVIEW";

  // Never escalate to LIVE here — creative review is human-gated.
  if (activationStatus === "LIVE") {
    return {
      ok: true,
      activationStatus,
      detail: "Order already LIVE — no auto-change from fulfillment worker",
    };
  }

  await input.prisma.order.update({
    where: { id: input.orderId },
    data: {
      orderKind: input.existing?.orderKind || built.orderKind,
      refId: input.existing?.refId || built.refId,
      fulfillmentMetadataJson:
        input.existing?.fulfillmentMetadataJson || built.fulfillmentMetadataJson,
      adActivationStatus: activationStatus,
      status: "PAID_PENDING_FULFILLMENT",
      lastFulfillmentAttemptAt: new Date(),
      lastFulfillmentError: null,
    },
  });

  return {
    ok: true,
    activationStatus,
    detail: `Ad purchase durable trail ensured — ${activationStatus} (no auto-activation)`,
  };
}
