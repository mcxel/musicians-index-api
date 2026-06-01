export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { UploadRequest } from "@/lib/media/MediaAssetEngine";

// POST /api/media/upload
// Body: UploadRequest JSON
// Returns: UploadResult JSON
//
// In production: parse multipart/form-data, stream to Cloudflare R2,
//   return CDN URL. For soft launch: simulate via MediaAssetEngine.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as UploadRequest;

    // Basic validation
    if (!body.ownerId || !body.type || !body.title?.trim()) {
      return NextResponse.json({ ok: false, error: "ownerId, type, and title are required" }, { status: 400 });
    }

    const result = await MediaEngine.upload(body);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[media/upload]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

// GET /api/media/upload — returns allowed formats/sizes for each media type
export async function GET() {
  const types = ["song","beat","video","challenge_entry","battle_entry","cypher_entry","interview","sponsor_asset","venue_promo","nft_asset","article_media"] as const;
  const catalog = Object.fromEntries(types.map(t => [
    t,
    {
      allowedFormats: MediaEngine.getAllowedFormats(t),
      maxSizeMB: MediaEngine.getMaxSizeMB(t),
    }
  ]));
  return NextResponse.json({ ok: true, catalog });
}
