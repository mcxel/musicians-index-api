export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest, NextResponse } from "next/server";

const FALLBACK_ARTISTS = [
  { slug: "nova-cipher",  name: "Nova Cipher",  genre: "EDM",     rank: 1, isLive: false, viewerCount: 0 },
  { slug: "zion-freq",    name: "Zion Freq",    genre: "Hip-Hop", rank: 2, isLive: false, viewerCount: 0 },
  { slug: "astra-nova",   name: "Astra Nova",   genre: "R&B",     rank: 3, isLive: false, viewerCount: 0 },
  { slug: "big-ace",      name: "Big Ace",      genre: "Hip-Hop", rank: 4, isLive: false, viewerCount: 0 },
  { slug: "ray-journey",  name: "Ray Journey",  genre: "Jazz",    rank: 5, isLive: false, viewerCount: 0 },
];

export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get("limit") ?? "20";
    const res = await proxyToApi(req as unknown as Request, `/artist/trending?limit=${limit}`);
    if (res.ok) return res;
    return NextResponse.json({ artists: FALLBACK_ARTISTS, source: "fallback" });
  } catch {
    return NextResponse.json({ artists: FALLBACK_ARTISTS, source: "fallback" });
  }
}
