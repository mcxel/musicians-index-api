export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import prisma from "@/lib/prisma";
import {
  AD_PURCHASE_ORDER_KIND,
  parseAdPurchaseFulfillmentMetadata,
} from "@/lib/commerce/AdPurchaseFulfillmentAuthority";

/**
 * GET — real paid ad_purchase orders awaiting creative review / activation.
 * Never invents campaigns. Never auto-activates ads.
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const rows = await prisma.order.findMany({
    where: {
      OR: [
        { orderKind: AD_PURCHASE_ORDER_KIND },
        {
          status: "PAID_PENDING_FULFILLMENT",
          fulfillmentMetadataJson: { not: null },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      buyerUserId: true,
      providerPaymentId: true,
      amountCents: true,
      currency: true,
      status: true,
      orderKind: true,
      refId: true,
      fulfillmentMetadataJson: true,
      adActivationStatus: true,
      lastFulfillmentError: true,
    },
  });

  const adOrders = rows.filter(
    (r) => r.orderKind === AD_PURCHASE_ORDER_KIND || Boolean(r.adActivationStatus),
  );

  return NextResponse.json({
    ok: true,
    count: adOrders.length,
    orders: adOrders.map((o) => ({
      ...o,
      metadata: parseAdPurchaseFulfillmentMetadata(o.fulfillmentMetadataJson),
    })),
  });
}
