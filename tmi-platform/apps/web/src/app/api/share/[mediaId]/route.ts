import { NextRequest, NextResponse } from "next/server";
import { MediaRegistry } from "@/lib/media/MediaRegistry";

/**
 * GET /api/share/[mediaId]
 *
 * Returns public media metadata for the share landing page.
 * Used by both the client-side player and the OG metadata server render.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { mediaId: string } },
): Promise<NextResponse> {
  const { mediaId } = params;

  if (!mediaId || typeof mediaId !== "string" || mediaId.length > 128) {
    return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
  }

  const item = await MediaRegistry.getById(mediaId).catch(() => null);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.visibility !== "public") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip server-only fields before returning
  const safe = {
    id:            item.id,
    type:          item.type,
    title:         item.title,
    description:   item.description ?? null,
    sourceUrl:     item.sourceUrl,
    thumbnailUrl:  item.thumbnailUrl ?? null,
    durationMs:    item.durationMs ?? null,
    isLive:        item.isLive,
    createdAt:     item.createdAt,
  };

  return NextResponse.json({ item: safe }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
