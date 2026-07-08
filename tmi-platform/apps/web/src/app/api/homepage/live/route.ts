export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { getActiveSessions, registerLiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

// GlobalLiveSessionRegistry is the platform's single authoritative source for
// live sessions (every Go Live writes here). It must be checked first — the
// external API_BASE_URL proxy below is a legacy/optional events feed, not a
// replacement, and falls through to an honest empty array when unconfigured.
export async function GET(req: NextRequest) {
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "4";
  const parsedLimit = Number.parseInt(rawLimit, 10);
  const limit = Number.isNaN(parsedLimit) ? 4 : Math.max(1, Math.min(20, parsedLimit));

  // DB cold-start recovery: rebuild sessions from persisted DB fields if registry is empty
  let activeSessions = getActiveSessions();
  if (activeSessions.length === 0) {
    const liveUsers = await prisma.user.findMany({
      where: { isLive: true },
      select: { id: true, displayName: true, liveRoomId: true, liveGenre: true },
    }).catch(() => []);
    for (const u of liveUsers) {
      if (u.liveRoomId) {
        registerLiveSession({
          userId:      u.id,
          displayName: u.displayName ?? u.id,
          title:       `${u.displayName ?? u.id} — Live`,
          category:    (u.liveGenre as import('@/lib/broadcast/GlobalLiveSessionRegistry').StreamCategory) ?? 'live',
          roomId:      u.liveRoomId,
        });
      }
    }
    activeSessions = getActiveSessions();
  }

  const registrySessions = activeSessions.slice(0, limit).map((s) => ({
    userId:       s.userId,
    displayName:  s.displayName,
    title:        s.title,
    category:     s.category,
    roomId:       s.roomId,
    accentColor:  s.accentColor,
    viewerCount:  s.viewerCount,
    thumbnailUrl: s.thumbnailUrl,
  }));

  if (registrySessions.length > 0) {
    return NextResponse.json({
      status: "ok",
      source: "registry",
      timestamp: new Date().toISOString(),
      rooms: registrySessions,
      events: registrySessions,
      streams: [],
    });
  }

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

  return NextResponse.json({
    status: "ok",
    source: "empty",
    timestamp: new Date().toISOString(),
    rooms: [],
    events: [],
    streams: [],
  });
}
