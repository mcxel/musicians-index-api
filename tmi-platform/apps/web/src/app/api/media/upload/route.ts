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
    // Owner is always from the authenticated cookie — never from the request body.
    const cookieEmail = req.cookies.get("tmi_user_email")?.value ?? "";
    const cookieId    = req.cookies.get("tmi_session_id")?.value ?? "";
    const cookieRole  = req.cookies.get("tmi_role")?.value ?? "fan";

    if (!cookieEmail && !cookieId) {
      return NextResponse.json({ ok: false, error: "Sign in to upload", code: "UNAUTHENTICATED" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let title = "", rawType = "song", simulatedFileName = "", simulatedSizeBytes = 0;
    let uploadedFile: File | null = null;

    try {
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
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Could not read upload request", code: "PARSE_ERROR" }, { status: 400 });
    }

    const ownerId  = cookieEmail || cookieId;
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
    if (!result.ok) {
      const code = result.error?.includes("too large") ? "FILE_TOO_LARGE"
                 : result.error?.includes("not allowed") ? "UNSUPPORTED_FORMAT"
                 : "UPLOAD_ERROR";
      return NextResponse.json({ ...result, code }, { status: 400 });
    }

    // Replace simulated CDN URL with a real stored URL when an actual file was sent.
    if (uploadedFile && result.assetId) {
      try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          const { put } = await import("@vercel/blob");
          const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const blob = await put(`tmi-media/${ownerId}/${result.assetId}-${safeName}`, uploadedFile, { access: "public" });
          (result as unknown as Record<string, unknown>).url = blob.url;
        } else if (uploadedFile.size <= 10 * 1024 * 1024) {
          const bytes = Buffer.from(await uploadedFile.arrayBuffer());
          (result as unknown as Record<string, unknown>).url = `data:${uploadedFile.type};base64,${bytes.toString("base64")}`;
        }
        // >10 MB without Blob: keep simulated URL; track metadata saves but audio won't play.
      } catch (storageErr) {
        console.error("[media/upload storage]", storageErr);
      }
    }

    const resolvedGenre = uploadReq.genre?.trim() || "Other";
    const resolvedBpm = Number.isFinite(uploadReq.bpm) ? Number(uploadReq.bpm) : 120;

    // Persist to DB — all DB ops in one try/catch so a connection error never
    // throws past this block and causes a 500 on an otherwise-successful upload.
    if (result.assetId && result.url) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ id: ownerId }, { email: ownerId }] },
          select: { id: true },
        });

        if (dbUser) {
          const isVideo = mediaType === "video" || mediaType === "interview" || mediaType === "venue_promo";
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
          } else if (mediaType === "song") {
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
          } else if (mediaType === "beat") {
            // Beat uploads go to both Song (for playback) and Beat (for marketplace).
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
            const beatSlug = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
            });
          }
        }
      } catch (dbErr) {
        // DB write failed but storage succeeded — log for ops, don't 500.
        // The client gets 201 with a note; the asset exists in the CDN store.
        console.error("[media/upload DB registration failed]", dbErr);
        return NextResponse.json(
          { ...result, dbWarning: "Asset stored but library registration failed — retry or contact support." },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[media/upload]", err);
    return NextResponse.json({ ok: false, error: "Upload failed. Please try again.", code: "INTERNAL_ERROR" }, { status: 500 });
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
