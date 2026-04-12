import { proxyToApi } from "@/lib/apiProxy";
import { featuredArtists } from "@/lib/placeholders/featuredArtists";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "6";
  const parsedLimit = Number.parseInt(rawLimit, 10);
  const limit = Number.isNaN(parsedLimit) ? 6 : Math.max(1, Math.min(30, parsedLimit));

  const upstream = await proxyToApi(req as unknown as Request, `/artist/releases/new?limit=${limit}`);
  if (upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json({
      status: "ok",
      source: "live",
      timestamp: new Date().toISOString(),
      releases: Array.isArray(payload) ? payload : payload?.releases ?? [],
    });
  }

  return NextResponse.json({
    status: "ok",
    source: "fallback",
    timestamp: new Date().toISOString(),
    releases: featuredArtists.slice(0, limit).map((artist, index) => ({
      id: artist.id,
      artist: artist.name,
      title: `${artist.name} - New Drop`,
      rank: index + 1,
      genre: artist.genre ?? "Open",
    })),
  });
}
