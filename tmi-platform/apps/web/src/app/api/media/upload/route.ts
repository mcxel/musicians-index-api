export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { UploadRequest, MediaType } from "@/lib/media/MediaAssetEngine";
import prisma from "@/lib/prisma";

const UI_TYPE_MAP: Record<string, MediaType> = {
  Video: "video", Audio: "song", Beat: "beat", "Beat Pack": "beat",
  Image: "article_media", Song: "song", Interview: "interview",
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let title = "", rawType = "song", ownerId = "", simulatedFileName = "", simulatedSizeBytes = 0;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      title = (fd.get("title") as string) ?? "";
      rawType = (fd.get("type") as string) ?? "Audio";
      const file = fd.get("file") as File | null;
      simulatedFileName = file?.name ?? "upload";
      simulatedSizeBytes = file?.size ?? 0;
    } else {
      const body = await req.json() as UploadRequest & { rawType?: string };
      title = body.title ?? "";
      rawType = body.rawType ?? (body.type as string) ?? "song";
      simulatedSizeBytes = body.simulatedSizeBytes ?? 0;
      ownerId = body.ownerId ?? "";
    }

    // Owner from cookie (client uploads always come from the logged-in user)
    const cookieEmail = req.cookies.get("tmi_user_email")?.value ?? "";
    const cookieRole  = req.cookies.get("tmi_role")?.value ?? "fan";
    if (!ownerId) ownerId = cookieEmail || "guest";
    const ownerName = cookieEmail ? cookieEmail.split("@")[0] : "user";

    if (!title.trim()) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const mediaType: MediaType = UI_TYPE_MAP[rawType] ?? (rawType as MediaType) ?? "song";
    const ownerRole = (["performer","fan","venue","sponsor","advertiser","promoter"].includes(cookieRole)
      ? cookieRole : "fan") as UploadRequest["ownerRole"];

    const uploadReq: UploadRequest = {
      ownerId, ownerName, ownerRole,
      type: mediaType, title,
      simulatedFileName, simulatedSizeBytes,
    };

    const result = await MediaEngine.upload(uploadReq);
    if (!result.ok) return NextResponse.json(result, { status: 400 });

    // Persist to DB so CRUD routes (/api/songs/[id], /api/videos/[id]) can manage it
    if (result.assetId && result.url) {
      const dbUser = cookieEmail
        ? await prisma.user.findUnique({ where: { email: cookieEmail }, select: { id: true } })
        : null;
      if (dbUser) {
        const isVideo = mediaType === "video" || mediaType === "interview" || mediaType === "venue_promo";
        try {
          if (isVideo) {
            await prisma.video.create({
              data: {
                id: result.assetId,
                uploaderId: dbUser.id,
                title: uploadReq.title,
                videoUrl: result.url,
                genre: uploadReq.genre,
                status: 'ACTIVE',
              },
            });
          } else if (mediaType === "song" || mediaType === "beat") {
            await prisma.song.create({
              data: {
                id: result.assetId,
                uploaderId: dbUser.id,
                title: uploadReq.title,
                audioUrl: result.url,
                genre: uploadReq.genre,
                bpm: uploadReq.bpm,
                status: 'ACTIVE',
              },
            });
          }
        } catch {
          // Non-fatal: in-memory asset already created; DB write fails gracefully
        }
      }
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
