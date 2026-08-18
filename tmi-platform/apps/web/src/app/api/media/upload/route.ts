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
    let uploadedFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      title = (fd.get("title") as string) ?? "";
      rawType = (fd.get("type") as string) ?? "Audio";
      const file = fd.get("file") as File | null;
      simulatedFileName = file?.name ?? "upload";
      simulatedSizeBytes = file?.size ?? 0;
      uploadedFile = file;
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

    // ── Real file storage ──────────────────────────────────────────────────────
    // MediaEngine returns a simulated CDN URL.  If the request contained an
    // actual file, replace it with a real persistent URL so the track can
    // actually be played back.
    if (uploadedFile && result.assetId) {
      try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          const { put } = await import("@vercel/blob");
          const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const blobPath = `tmi-media/${ownerId || "anon"}/${result.assetId}-${safeName}`;
          const blob = await put(blobPath, uploadedFile, { access: "public" });
          (result as unknown as Record<string, unknown>).url = blob.url;
        } else if (uploadedFile.size <= 10 * 1024 * 1024) {
          // No Blob configured — store as base64 data URL for soft launch
          // (works for tracks up to ~10 MB; larger tracks need Blob storage).
          const bytes = Buffer.from(await uploadedFile.arrayBuffer());
          (result as unknown as Record<string, unknown>).url = `data:${uploadedFile.type};base64,${bytes.toString("base64")}`;
        }
        // Files >10 MB without Blob: keep the simulated URL; the track will
        // not be playable but the metadata is saved.  The UI already warns
        // users via the 503 from /api/upload/media for the primary upload path.
      } catch (storageErr) {
        console.error("[media/upload storage]", storageErr);
        // Non-fatal: fall back to simulated URL rather than failing the whole request
      }
    }
    // ───────────────────────────────────────────────────────────────────────────

    const resolvedGenre = uploadReq.genre?.trim() || "Other";
    const resolvedBpm = Number.isFinite(uploadReq.bpm) ? Number(uploadReq.bpm) : 120;

    // Persist to DB so CRUD routes (/api/songs/[id], /api/videos/[id], Beat Vault) can manage it
    if (result.assetId && result.url) {
      const resolvedUserId = ownerId || cookieEmail;
      const dbUser = resolvedUserId
        ? await prisma.user.findFirst({
            where: {
              OR: [{ id: resolvedUserId }, { email: resolvedUserId }],
            },
            select: { id: true },
          })
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
                genre: resolvedGenre,
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
                genre: resolvedGenre,
                bpm: resolvedBpm,
                status: 'ACTIVE',
              },
            });
            const beatSlug = `media-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            await prisma.beat.create({
              data: {
                id: result.assetId,
                title: uploadReq.title,
                producerId: dbUser.id,
                slug: beatSlug,
                tags: ["media-upload"],
                previewUrl: result.url,
                taggedUrl: result.url,
                genre: resolvedGenre,
                bpm: resolvedBpm,
                basicPrice: 299,
                premiumPrice: 999,
                exclusivePrice: 4999,
                status: 'draft',
                moderationStatus: 'PENDING',
                adminSubmitted: false,
                producerName: ownerName,
              },
            }).catch(() => null);
          }
        } catch (dbErr) {
          console.error("[media/upload DB error]", dbErr);
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
