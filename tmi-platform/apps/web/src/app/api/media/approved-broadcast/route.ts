import { NextResponse } from "next/server";
import { MediaRegistry } from "@/lib/media/MediaRegistry";

export const dynamic = "force-dynamic";

/** Approved video submissions for Video Shuffle / live broadcast monitors (Rule 20 — real data only). */
export async function GET() {
  try {
    const videos = await MediaRegistry.getApprovedForLiveBroadcast();
    return NextResponse.json({
      ok: true,
      videos: videos.map((v) => ({
        id: v.id,
        title: v.title,
        ownerId: v.ownerId,
        videoUrl: v.sourceUrl,
        thumbnailUrl: v.thumbnailUrl ?? null,
        durationMs: v.durationMs ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ ok: true, videos: [] });
  }
}
