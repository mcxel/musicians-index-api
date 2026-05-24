// api/finance/payouts/status/route.ts — Payout status for a recipient

import { NextRequest, NextResponse } from "next/server";
import { getScheduledPayouts } from "@/lib/finance/PayoutScheduler";
import { getNotificationLog } from "@/lib/finance/PayoutNotificationEngine";
import { getReleasableHolds } from "@/lib/finance/RefundRiskEngine";

export async function GET(req: NextRequest) {
  const recipientId = req.nextUrl.searchParams.get("recipientId");
  if (!recipientId) {
    return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  }

  const payouts = getScheduledPayouts().filter(p => p.recipientId === recipientId);
  const notifications = getNotificationLog(recipientId, 20);
  const releasable = getReleasableHolds(recipientId);

  return NextResponse.json({
    recipientId,
    payouts,
    releasableBalance: releasable.reduce((s, h) => s + h.creatorCut, 0),
    notifications,
  });
}
