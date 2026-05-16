export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from "next/server";
import { getSurfaceBots, getVisibleBots, getSurfaceBotCount, type SurfaceKey } from "@/lib/botRegistry";

export async function GET(req: NextRequest) {
  const surface = (req.nextUrl.searchParams.get("surface") ?? "home1") as SurfaceKey;
  const visibleOnly = req.nextUrl.searchParams.get("visible") === "true";

  const bots = visibleOnly ? getVisibleBots(surface) : getSurfaceBots(surface);
  const counts = getSurfaceBotCount(surface);

  return NextResponse.json({
    surface,
    counts,
    bots,
    timestamp: new Date().toISOString(),
  });
}
