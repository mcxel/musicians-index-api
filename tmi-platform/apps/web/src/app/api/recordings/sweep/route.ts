export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sweepExpired, markExpiringSoon } from "@/lib/recordings/SavedPerformanceService";

/**
 * POST /api/recordings/sweep
 * Internal cron endpoint — sweeps expired records.
 * Protected by a shared secret header. Wire to Vercel Cron or external scheduler.
 */
export async function POST(req: NextRequest) {
  // Simple bearer token guard — set RECORDINGS_SWEEP_SECRET in env
  const auth = req.headers.get("authorization");
  const secret = process.env["RECORDINGS_SWEEP_SECRET"];
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiringSoon = await markExpiringSoon();
    const swept = await sweepExpired();
    return NextResponse.json({
      ok: true,
      expiringSoonMarked: expiringSoon,
      ...swept,
    });
  } catch (err) {
    console.error("[recordings/sweep:POST]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
