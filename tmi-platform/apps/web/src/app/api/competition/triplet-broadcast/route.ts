import { NextRequest, NextResponse } from "next/server";
import { tripleEventBroadcastEngine } from "@/lib/competition/TripleEventBroadcastEngine";

export const dynamic = "force-dynamic";

/**
 * GET /api/competition/triplet-broadcast
 *
 * Public discovery endpoint emitting the current server-authoritative
 * 15-minute 3-card event pool [A, B, C].
 *
 * Features:
 * - Server-authoritative 15:00 countdown clock (timeRemainingMs).
 * - Automated expired-card reaper: cards with expiresAt <= now are never returned.
 * - Cache-Control: no-store, private (ensures zero stale countdown displays).
 * - Zero master asset leakage.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const testNow = searchParams.get("now");
    const now = testNow ? Number(testNow) : Date.now();

    const cycleState = tripleEventBroadcastEngine.getCurrentCycle(now);
    const activeEvents = tripleEventBroadcastEngine.reapExpiredEvents(cycleState.triplet, now);

    return NextResponse.json(
      {
        ok: true,
        cycleId: cycleState.cycleId,
        cycleIndex: cycleState.cycleIndex,
        cycleStartEpoch: cycleState.cycleStartEpoch,
        cycleEndEpoch: cycleState.cycleEndEpoch,
        timeRemainingMs: cycleState.timeRemainingMs,
        activeCardCount: activeEvents.length,
        events: activeEvents,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-TMI-Broadcast-Cycle": cycleState.cycleId,
        },
      },
    );
  } catch (err) {
    console.error("[api/competition/triplet-broadcast] Failed:", err);
    return NextResponse.json(
      { ok: false, error: "BROADCAST_CYCLE_UNAVAILABLE" },
      { status: 500 },
    );
  }
}
