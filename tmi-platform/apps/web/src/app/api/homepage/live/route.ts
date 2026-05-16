export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { liveRooms } from "@/lib/placeholders/liveRooms";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "4";
  const parsedLimit = Number.parseInt(rawLimit, 10);
  const limit = Number.isNaN(parsedLimit) ? 4 : Math.max(1, Math.min(20, parsedLimit));

  const upstream = await proxyToApi(req as unknown as Request, `/events/upcoming?limit=${limit}`);
  if (upstream.ok) {
    const events = (await upstream.json().catch(() => [])) as Array<Record<string, unknown>>;
    return NextResponse.json({
      status: "ok",
      source: "live",
      timestamp: new Date().toISOString(),
      rooms: events,
      events,
      streams: [],
    });
  }

  const fallbackRooms = liveRooms.slice(0, limit);
  return NextResponse.json({
    status: "ok",
    source: "fallback",
    timestamp: new Date().toISOString(),
    rooms: fallbackRooms,
    events: fallbackRooms,
    streams: [],
  });
}
