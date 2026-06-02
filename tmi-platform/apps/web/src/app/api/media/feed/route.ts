export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { MediaType } from "@/lib/media/MediaAssetEngine";

// GET /api/media/feed?tab=live|uploads|trending|battles|cyphers&limit=6
// Returns real MediaAsset data for the BillboardContentFeed tabs
export async function GET(req: NextRequest) {
  const tab   = req.nextUrl.searchParams.get("tab") ?? "uploads";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "6"), 20);

  let assets;
  switch (tab) {
    case "live":
      // Live = assets with isLive flag OR livestream type that are ready
      assets = MediaEngine.getByType("livestream" as MediaType, "ready");
      break;
    case "uploads":
      // Most recent across all types, any status
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
