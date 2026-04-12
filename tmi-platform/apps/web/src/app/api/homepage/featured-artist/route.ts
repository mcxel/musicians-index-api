import { proxyToApi } from "@/lib/apiProxy";
import { type NextRequest, NextResponse } from "next/server";

const FALLBACK_FEATURED_ARTISTS = [
  {
    id: "fallback-featured-1",
    stageName: "NOVA REIGN",
    name: "NOVA REIGN",
    slug: "nova-reign",
    genres: ["Neo-Soul"],
    genre: "Neo-Soul",
    followers: 142000,
    views: 2400000,
    verified: true,
    image: null,
    title: '"Frequencies"',
    headline: '"Frequencies" - New Album Out Now',
  },
  {
    id: "fallback-featured-2",
    stageName: "CYPHER KINGS",
    name: "CYPHER KINGS",
    slug: "cypher-kings",
    genres: ["Hip-Hop"],
    genre: "Hip-Hop",
    followers: 198500,
    views: 3100000,
    verified: true,
    image: null,
    title: '"Crown The Undiscovered"',
    headline: '"Crown The Undiscovered" - Live Cypher Open',
  },
  {
    id: "fallback-featured-3",
    stageName: "LUNA VIBE",
    name: "LUNA VIBE",
    slug: "luna-vibe",
    genres: ["R&B"],
    genre: "R&B",
    followers: 121300,
    views: 1870000,
    verified: false,
    image: null,
    title: '"Midnight Echo"',
    headline: '"Midnight Echo" - Tonight\'s Spotlight Cut',
  },
] as const;

function selectFallbackArtist() {
  const index = Math.floor(Math.random() * FALLBACK_FEATURED_ARTISTS.length);
  const selected = FALLBACK_FEATURED_ARTISTS[index];
  return {
    ...selected,
    id: `${selected.id}-${Date.now()}`,
  };
}

export async function GET(req: NextRequest) {
  try {
    const response = await proxyToApi(req as unknown as Request, "/artist/featured");
    if (response.status === 200) {
      return response;
    }
  } catch {
    // Fall through to local fallback.
  }

  return NextResponse.json(selectFallbackArtist(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
