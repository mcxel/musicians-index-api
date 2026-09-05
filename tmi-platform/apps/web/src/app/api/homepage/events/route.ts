export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = Math.max(1, Math.min(20, parseInt(req.nextUrl.searchParams.get("limit") ?? "4", 10) || 4));

  // 1. If upstream API is configured, attempt proxy first
  if (process.env.API_BASE_URL) {
    try {
      const res = await proxyToApi(req as unknown as Request, `/events/upcoming?limit=${limit}`);
      if (res.ok) return res;
    } catch {
      // Fall through to canonical DB query
    }
  }

  // 2. Query canonical upcoming events from database
  try {
    const upcoming = await prisma.event.findMany({
      where: {
        startsAt: { gte: new Date() },
        status: { not: "CANCELED" },
      },
      orderBy: { startsAt: "asc" },
      take: limit,
    });

    if (upcoming && upcoming.length > 0) {
      const mapped = upcoming.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt ? e.endsAt.toISOString() : null,
        venue: e.venueName ?? "Main Arena",
        coverImage: null,
        eventType: "CONCERT",
        hostName: null,
      }));
      return NextResponse.json(mapped);
    }
  } catch (err) {
    console.warn("[api/homepage/events] Prisma upcoming query:", err);
  }

  // 3. If no real records exist, return empty array (do not fabricate fake events)
  return NextResponse.json([]);
}
