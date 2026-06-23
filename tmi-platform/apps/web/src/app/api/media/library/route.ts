export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { MediaAsset } from "@/lib/media/MediaAssetEngine";
import prisma from "@/lib/prisma";

// GET /api/media/library?ownerId=xxx[&type=song]
export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const type = req.nextUrl.searchParams.get("type");
  if (!ownerId) return NextResponse.json({ ok: false, error: "ownerId required" }, { status: 400 });

  let assets = MediaEngine.getByOwner(ownerId);

  try {
    const email = req.cookies.get("tmi_user_email")?.value;
    const dbUser = email
      ? await prisma.user.findUnique({ where: { email }, select: { id: true, displayName: true, role: true } })
      : null;

    // Allow users to fetch their own persisted library regardless of legacy ownerId variance.
    if (dbUser && (dbUser.id === ownerId || ownerId.startsWith("guest") || ownerId.length <= 16)) {
      const [songs, videos] = await Promise.all([
        prisma.song.findMany({
          where: { uploaderId: dbUser.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true,
            audioUrl: true,
            playCount: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.video.findMany({
          where: { uploaderId: dbUser.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            genre: true,
            videoUrl: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

      const ownerName = dbUser.displayName ?? "Performer";
      const ownerRole = (dbUser.role?.toLowerCase() === "performer" ? "performer" : "fan") as MediaAsset["ownerRole"];

      const songAssets: MediaAsset[] = songs.map((s) => ({
        id: s.id,
        ownerId: dbUser.id,
        ownerName,
        ownerRole,
        type: "song",
        status: "ready",
        title: s.title,
        format: "mp3",
        sizeBytes: 0,
        bpm: s.bpm ?? undefined,
        genre: s.genre ?? undefined,
        tags: [],
        url: s.audioUrl,
        plays: s.playCount,
        downloads: 0,
        revenue: 0,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        metadata: {},
      }));

      const videoAssets: MediaAsset[] = videos.map((v) => ({
        id: v.id,
        ownerId: dbUser.id,
        ownerName,
        ownerRole,
        type: "video",
        status: "ready",
        title: v.title,
        format: "mp4",
        sizeBytes: 0,
        genre: v.genre ?? undefined,
        tags: [],
        url: v.videoUrl,
        plays: v.viewCount,
        downloads: 0,
        revenue: 0,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
        metadata: {},
      }));

      const byId = new Map<string, MediaAsset>();
      for (const asset of [...assets, ...songAssets, ...videoAssets]) {
        byId.set(asset.id, asset);
      }
      assets = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  } catch {
    // Best-effort merge; fallback remains in-memory assets.
  }

  if (type) assets = assets.filter(a => a.type === type);
  return NextResponse.json({ ok: true, assets, total: assets.length });
}
