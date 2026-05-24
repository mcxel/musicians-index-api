// api/finance/payouts/run/route.ts — Trigger payout cycle (admin only, server-side)

import { NextRequest, NextResponse } from "next/server";
import { buildCreatorPayoutQueue, runPayoutCycle, runAdminPayoutCycle } from "@/lib/finance/PayoutScheduler";
import { dispatchNotification } from "@/lib/finance/PayoutNotificationEngine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const mode = (body.mode as string) ?? "creators"; // "creators" | "admins" | "all"

  const results: Record<string, unknown> = {};

  if (mode === "creators" || mode === "all") {
    const queued = buildCreatorPayoutQueue();
    const processed = runPayoutCycle();

    // Send payout_sent notifications
    for (const p of processed) {
      dispatchNotification({
        event: "payout_sent",
        recipientId: p.recipientId,
        amountCents: p.amountCents,
        payoutId: p.id,
      });
    }

    results.creators = { queued: queued.length, processed: processed.length };
  }

  if (mode === "admins" || mode === "all") {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    runAdminPayoutCycle(weekAgo, now);
    results.admins = { status: "processed" };
  }

  return NextResponse.json({ ok: true, ...results });
}
