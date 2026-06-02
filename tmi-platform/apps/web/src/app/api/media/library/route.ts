export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";

// GET /api/media/library?ownerId=xxx[&type=song]
export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const type = req.nextUrl.searchParams.get("type");
  if (!ownerId) return NextResponse.json({ ok: false, error: "ownerId required" }, { status: 400 });
  let assets = MediaEngine.getByOwner(ownerId);
  if (type) assets = assets.filter(a => a.type === type);
  return NextResponse.json({ ok: true, assets, total: assets.length });
}
