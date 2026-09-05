export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { runExpirationSweep } from "@/lib/savedPerformances/SavedPerformanceService";
import { fireExpirationWarnings } from "@/lib/savedPerformances/SavedPerformanceNotifications";

/**
 * POST /api/saved-performances/sweep
 * Internal cron endpoint — requires CRON_SECRET header.
 * Marks expiring/expired records and fires user notifications.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const [sweep, notified] = await Promise.all([
    runExpirationSweep(),
    fireExpirationWarnings(),
  ]);

  return NextResponse.json({
    ok: true,
    markedExpiringSoon: sweep.markedExpiringSoon,
    markedDeletionPending: sweep.markedDeletionPending,
    notificationsFired: notified,
  });
}
