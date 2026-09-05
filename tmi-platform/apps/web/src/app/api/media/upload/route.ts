export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import type { UploadRequest, MediaType } from "@/lib/media/MediaAssetEngine";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { persistUploadedMediaFile, persistVerifiedBlobPathname } from "@/lib/media/persistUploadedMedia";
import { isDurablePlayableMediaUrl } from "@/lib/media/durablePlayableUrl";
import { isSafeBlobPathname, pathnameOwnedByUser } from "@/lib/media/blobStorage";

const UI_TYPE_MAP: Record<string, MediaType> = {
  Video: "video", Audio: "song", Beat: "beat", "Beat Pack": "beat",
  Image: "article_media", Song: "song", Interview: "interview",
};

export async function POST(req: NextRequest) {
  try {
    const auth = await getTmiAuth();
    const cookieEmail = req.cookies.get("tmi_user_email")?.value ?? "";
    const cookieId    = req.cookies.get("tmi_session_id")?.value ?? "";
    const cookieRole  = req.cookies.get("tmi_role")?.value ?? "fan";

    if (!auth && !cookieEmail && !cookieId) {
      return NextResponse.json({ ok: false, error: "Sign in to upload", code: "UNAUTHENTICATED" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let title = "", rawType = "song", simulatedFileName = "", simulatedSizeBytes = 0;
    let uploadedFile: File | null = null;
    let genre = "";
    let bpmRaw = "";
    let blobPathname: string | null = null;

    try {
      if (contentType.includes("application/json")) {
        const body = await req.json() as UploadRequest & {
          rawType?: string;
          blobPathname?: string;
          type?: string;
        };
        title = body.title ?? "";
        rawType = body.rawType ?? (body.type as string) ?? "song";
        simulatedSizeBytes = body.simulatedSizeBytes ?? 0;
        simulatedFileName = body.simulatedFileName ?? "";
        genre = body.genre ?? "";
        bpmRaw = body.bpm != null ? String(body.bpm) : "";
        if (typeof body.blobPathname === "string" && isSafeBlobPathname(body.blobPathname)) {
          blobPathname = body.blobPathname;
        } else if (body.blobPathname) {
          return NextResponse.json({ ok: false, error: "Invalid storage path.", code: "INVALID_BLOB_PATH" }, { status: 400 });
        }
      } else if (contentType.includes("multipart/form-data")) {
        const fd = await req.formData();
        title = (fd.get("title") as string) ?? "";
        rawType = (fd.get("type") as string) ?? "Audio";
        genre = String(fd.get("genre") ?? "");
        bpmRaw = String(fd.get("bpm") ?? "");
        const file = fd.get("file");
        if (file instanceof File && file.size > 0) {
          uploadedFile = file;
          simulatedFileName = file.name;
          simulatedSizeBytes = file.size;
        }
      } else {
        const body = await req.json() as UploadRequest & { rawType?: string };
        title = body.title ?? "";
        rawType = body.rawType ?? (body.type as string) ?? "song";
        simulatedSizeBytes = body.simulatedSizeBytes ?? 0;
        simulatedFileName = body.simulatedFileName ?? "";
        genre = body.genre ?? "";
        bpmRaw = body.bpm != null ? String(body.bpm) : "";
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Could not read upload request", code: "PARSE_ERROR" }, { status: 400 });
    }

    const ownerId  = auth?.user.id || cookieEmail || cookieId;
    const ownerName = auth?.user.name || (cookieEmail ? cookieEmail.split("@")[0] : "user");

    if (!title.trim()) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const mediaType: MediaType = UI_TYPE_MAP[rawType] ?? (rawType as MediaType) ?? "song";
    const needsAudibleFile = mediaType === "song" || mediaType === "beat" || mediaType === "video" || mediaType === "interview" || mediaType === "venue_promo";
    if (needsAudibleFile && !uploadedFile && !blobPathname) {
      return NextResponse.json(
        { ok: false, error: "An audio or video file is required. Metadata-only uploads are not saved.", code: "FILE_REQUIRED" },
        { status: 400 },
      );
    }

    const ownerRole = (["performer","fan","venue","sponsor","advertiser","promoter"].includes(cookieRole)
      ? cookieRole : "fan") as UploadRequest["ownerRole"];

    const inferredFormat = (
      uploadedFile?.name.split(".").pop()
      || simulatedFileName.split(".").pop()
      || blobPathname?.split(".").pop()
      || "mp3"
    ).toLowerCase();

    const uploadReq: UploadRequest = {
      ownerId, ownerName, ownerRole,
      type: mediaType, title,
      genre: genre || undefined,
      bpm: bpmRaw ? Number(bpmRaw) : undefined,
      simulatedFileName, simulatedSizeBytes,
      simulatedFormat: inferredFormat as UploadRequest["simulatedFormat"],
    };

    const result = await MediaEngine.upload(uploadReq);
    if (!result.ok) {
      const code = result.error?.includes("too large") ? "FILE_TOO_LARGE"
                 : result.error?.includes("not allowed") ? "UNSUPPORTED_FORMAT"
                 : "UPLOAD_ERROR";
      return NextResponse.json({ ...result, code }, { status: 400 });
    }

    let persistedUrl: string | null = null;
    if ((uploadedFile || blobPathname) && result.assetId) {
      if (blobPathname && !pathnameOwnedByUser(blobPathname, ownerId, auth?.user.email)) {
        return NextResponse.json({ ok: false, error: "Storage path is not owned by this account.", code: "FORBIDDEN_PATH" }, { status: 403 });
      }
      const stored = blobPathname
        ? await persistVerifiedBlobPathname(blobPathname)
        : await persistUploadedMediaFile({
            file: uploadedFile!,
            ownerId,
            fallbackExt: mediaType === "video" || mediaType === "interview" || mediaType === "venue_promo" ? "mp4" : "mp3",
          });
      if (!stored.ok) {
        return NextResponse.json({ ok: false, error: stored.error, code: "STORAGE_UNAVAILABLE" }, { status: stored.status });
      }
      persistedUrl = stored.url;
      result.url = stored.url;
      result.status = "ready";
    }

    if (needsAudibleFile && !isDurablePlayableMediaUrl(persistedUrl)) {
      return NextResponse.json(
        { ok: false, error: "Upload was not stored with a playable URL. Nothing was saved.", code: "UNPLAYABLE_SOURCE" },
        { status: 503 },
      );
    }

    const resolvedGenre = uploadReq.genre?.trim() || "Other";
    const resolvedBpm = Number.isFinite(uploadReq.bpm) ? Number(uploadReq.bpm) : 120;

    if (result.assetId && persistedUrl) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ id: ownerId }, { email: ownerId }, ...(auth?.user.email ? [{ email: auth.user.email }] : [])] },
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
                videoUrl: persistedUrl,
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
                audioUrl: persistedUrl,
                genre: resolvedGenre,
                bpm: resolvedBpm,
                status: 'ACTIVE',
              },
            });
          } else if (mediaType === "beat") {
            await prisma.song.create({
              data: {
                id: result.assetId,
                uploaderId: dbUser.id,
                title: uploadReq.title,
                audioUrl: persistedUrl,
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
                previewUrl: persistedUrl,
                taggedUrl: persistedUrl,
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
        console.error("[media/upload DB registration failed]", dbErr);
        return NextResponse.json(
          { ok: false, error: "File stored but library registration failed. Retry or contact support.", code: "DB_BIND_FAILED", url: persistedUrl, assetId: result.assetId },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ...result, url: persistedUrl ?? result.url, ok: true }, { status: 201 });
  } catch (err) {
    console.error("[media/upload]", err);
    return NextResponse.json({ ok: false, error: "Upload failed. Please try again.", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

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
