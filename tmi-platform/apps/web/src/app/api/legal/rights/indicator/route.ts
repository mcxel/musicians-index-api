export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getRightsIndicatorState, type MediaSurface } from "@/lib/legal";

const SURFACES = new Set([
  "LIVE",
  "PLAYLIST",
  "BATTLE",
  "CYPHER",
  "CHALLENGE",
  "SNIP",
  "YOPHO",
  "MAGAZINE",
  "MEMORY_WALL",
  "VENUE",
  "MEDIA_LOCKER",
]);

/** GET /api/legal/rights/indicator — public compact rights state for live shells. */
export async function GET(req: NextRequest) {
  try {
    const assetId = req.nextUrl.searchParams.get("assetId");
    const surfaceRaw = (req.nextUrl.searchParams.get("surface") ?? "BATTLE").toUpperCase();
    const surface = (SURFACES.has(surfaceRaw) ? surfaceRaw : "BATTLE") as MediaSurface;
    const indicator = getRightsIndicatorState({
      assetId: assetId || null,
      userRecordingOrBroadcasting: req.nextUrl.searchParams.get("recording") === "1",
      freestyleActive: req.nextUrl.searchParams.get("freestyle") === "1",
      surface,
    });
    return NextResponse.json({ ok: true, indicator });
  } catch (err) {
    console.error("[legal/rights/indicator]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Indicator failed" },
      { status: 500 },
    );
  }
}
