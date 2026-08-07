export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { classifyProtectedPlayback } from "@/lib/legal";

/** GET /api/legal/rights/playback-gate?assetId= — ProtectedPlaybackGate classification. */
export async function GET(req: NextRequest) {
  try {
    const assetId = req.nextUrl.searchParams.get("assetId")?.trim();
    if (!assetId) {
      return NextResponse.json({ error: "assetId is required" }, { status: 400 });
    }
    const decision = classifyProtectedPlayback(assetId);
    return NextResponse.json({ ok: true, decision });
  } catch (err) {
    console.error("[legal/rights/playback-gate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Playback gate failed" },
      { status: 500 },
    );
  }
}
