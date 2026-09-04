export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import prisma from "@/lib/prisma";
import { reconcilePendingStoreOrders } from "@/lib/commerce/EntitlementFulfillmentEngine";

/**
 * GET  — observability: lists current PAID_PENDING_FULFILLMENT orders and
 *        their retry history (fulfillmentRetryCount/lastFulfillmentAttemptAt/
 *        lastFulfillmentError). Read-only.
 * POST — triggers reconcilePendingStoreOrders(): re-verifies each pending
 *        order against Stripe and retries the durable ownership grant.
 *        Idempotent (upserts on the ownership unique key) — safe to call
 *        repeatedly. Admin-gated; no scheduled worker exists for this yet.
 */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const pending = await prisma.order.findMany({
    where: { status: "PAID_PENDING_FULFILLMENT" },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      buyerUserId: true,
      providerPaymentId: true,
      amountCents: true,
      currency: true,
      fulfillmentRetryCount: true,
      lastFulfillmentAttemptAt: true,
      lastFulfillmentError: true,
    },
  });

  return NextResponse.json({ ok: true, count: pending.length, orders: pending });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const limit = Number.isFinite(body?.limit) ? Math.max(1, Math.min(100, Number(body.limit))) : 25;

  const results = await reconcilePendingStoreOrders(limit);
  const summary = {
    RECOVERED: results.filter((r) => r.outcome === "RECOVERED").length,
    STILL_PENDING: results.filter((r) => r.outcome === "STILL_PENDING").length,
    NOT_APPLICABLE: results.filter((r) => r.outcome === "NOT_APPLICABLE").length,
    ERROR: results.filter((r) => r.outcome === "ERROR").length,
  };

  return NextResponse.json({ ok: true, examined: results.length, summary, results });
}
