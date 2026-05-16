export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { winnerEntries } from "@/lib/placeholders/winnerEntries";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "10";
  const parsedLimit = Number.parseInt(rawLimit, 10);
  const limit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(50, parsedLimit));

  const upstream = await proxyToApi(req as unknown as Request, `/artist/top10?limit=${limit}`);
  if (upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json({
      status: "ok",
      source: "live",
      timestamp: new Date().toISOString(),
      items: Array.isArray(payload) ? payload : payload?.items ?? [],
    });
  }

  const fallbackItems = winnerEntries.slice(0, limit).map((entry) => ({
    rank: entry.rank,
    artist: entry.artist,
    title: entry.artist,
    score: entry.score,
    genre: entry.category,
  }));

  return NextResponse.json({
    status: "ok",
    source: "fallback",
    timestamp: new Date().toISOString(),
    items: fallbackItems,
  });
}
