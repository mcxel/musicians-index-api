export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { MediaType } from "@/lib/media/MediaAssetEngine";

// GET /api/media/feed?tab=live|uploads|trending|battles|cyphers|ranked&limit=6
// Returns real MediaAsset data for the BillboardContentFeed tabs
// ranked: returns top assets sorted by plays+revenue composite score
export async function GET(req: NextRequest) {
  const tab   = req.nextUrl.searchParams.get("tab") ?? "uploads";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "6"), 20);

  let assets;
  switch (tab) {
    case "live":
      assets = MediaEngine.getByType("livestream" as MediaType, "ready");
      break;
    case "uploads":
      assets = [...MediaEngine.getAll()]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "trending":
      assets = [...MediaEngine.getAll()]
        .filter(a => a.status === "ready")
        .sort((a, b) => b.plays - a.plays);
      break;
    case "battles":
      assets = MediaEngine.getByType("battle_entry" as MediaType, "ready")
        .sort((a, b) => b.plays - a.plays);
      break;
    case "cyphers":
      assets = MediaEngine.getByType("cypher_entry" as MediaType, "ready")
        .sort((a, b) => b.plays - a.plays);
      break;
    case "ranked":
      // Composite score: plays + (revenue * 200) — tips outweigh passive plays
      assets = [...MediaEngine.getAll()]
        .filter(a => a.status === "ready")
        .sort((a, b) => (b.plays + b.revenue * 200) - (a.plays + a.revenue * 200));
      break;
    default:
      assets = [...MediaEngine.getAll()];
  }

  return NextResponse.json({
    ok: true,
    tab,
    assets: assets.slice(0, limit).map(a => ({
      id:        a.id,
      title:     a.title,
      artist:    a.ownerName,
      type:      a.type,
      plays:     a.plays,
      url:       a.url,
      status:    a.status,
      createdAt: a.createdAt,
    })),
    total: assets.length,
  });
}
