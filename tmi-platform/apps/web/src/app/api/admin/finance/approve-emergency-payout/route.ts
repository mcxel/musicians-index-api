// api/admin/finance/approve-emergency-payout/route.ts — Emergency payout approval

import { NextRequest, NextResponse } from "next/server";
import { getScheduledPayouts } from "@/lib/finance/PayoutScheduler";
import { dispatchNotification } from "@/lib/finance/PayoutNotificationEngine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const payoutId = body.payoutId as string | undefined;
  const approvedBy = body.approvedBy as string | undefined;

  if (!payoutId || !approvedBy) {
    return NextResponse.json({ error: "payoutId and approvedBy required" }, { status: 400 });
  }

  const payouts = getScheduledPayouts("queued");
  const target = payouts.find(p => p.id === payoutId);

  if (!target) {
    return NextResponse.json({ error: "Payout not found or not in queued state" }, { status: 404 });
  }

  // Mark as processing immediately (bypass schedule)
  target.status = "processing";
  target.processedAt = Date.now();
  // In production: trigger Stripe Connect transfer here
  target.status = "paid";

  dispatchNotification({
    event: "payout_sent",
    recipientId: target.recipientId,
    amountCents: target.amountCents,
    payoutId: target.id,
  });

  return NextResponse.json({
    ok: true,
    payout: target,
    approvedBy,
    processedAt: new Date().toISOString(),
  });
}
