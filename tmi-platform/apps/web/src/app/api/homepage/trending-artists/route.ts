export const dynamic = 'force-dynamic';
import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest, NextResponse } from "next/server";

// Shape must match the TrendingArtist interface in lib/api/homepage.ts —
// callers (e.g. Home12Page's mapTrending) read r.id/r.stageName/r.genres/
// r.followers/r.views directly off a bare array, not an {artists:[...]} wrapper.
const FALLBACK_ARTISTS = [
  { id: "nova-cipher", slug: "nova-cipher", stageName: "Nova Cipher", genres: ["EDM"],     followers: 4200, views: 8600,  verified: false, image: null },
  { id: "zion-freq",   slug: "zion-freq",   stageName: "Zion Freq",  genres: ["Hip-Hop"], followers: 3900, views: 7400,  verified: false, image: null },
  { id: "astra-nova",  slug: "astra-nova",  stageName: "Astra Nova", genres: ["R&B"],     followers: 3500, views: 6800,  verified: false, image: null },
  { id: "big-ace",     slug: "big-ace",     stageName: "Big Ace",    genres: ["Hip-Hop"], followers: 3100, views: 6100,  verified: false, image: null },
  { id: "ray-journey", slug: "ray-journey", stageName: "Ray Journey",genres: ["Jazz"],    followers: 2800, views: 5400,  verified: false, image: null },
];

export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get("limit") ?? "20";
    const res = await proxyToApi(req as unknown as Request, `/artist/trending?limit=${limit}`);
    if (res.ok) return res;
    return NextResponse.json(FALLBACK_ARTISTS);
  } catch {
    return NextResponse.json(FALLBACK_ARTISTS);
  }
}
