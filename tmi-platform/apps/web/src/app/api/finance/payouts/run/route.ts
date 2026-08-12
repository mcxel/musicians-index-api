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
    const processed = await runPayoutCycle();

    // Only notify recipients whose transfer actually succeeded — a failed
    // Stripe transfer must never generate a "you got paid" notification.
    const paid = processed.filter(p => p.status === "paid");
    const failed = processed.filter(p => p.status === "failed");
    for (const p of paid) {
      dispatchNotification({
        event: "payout_sent",
        recipientId: p.recipientId,
        amountCents: p.amountCents,
        payoutId: p.id,
      });
    }

    results.creators = { queued: queued.length, paid: paid.length, failed: failed.length };
  }

  if (mode === "admins" || mode === "all") {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    await runAdminPayoutCycle(weekAgo, now);
    results.admins = { status: "processed" };
  }

  return NextResponse.json({ ok: true, ...results });
}
