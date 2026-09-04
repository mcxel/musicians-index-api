export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  extractBlobPathname,
  isBlobStorageAvailable,
  isSafeBlobPathname,
  pathnameOwnedByUser,
} from "@/lib/media/blobStorage";

function mimeFromPath(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "m4a") return "audio/mp4";
  if (ext === "aac") return "audio/aac";
  if (ext === "flac") return "audio/flac";
  if (ext === "webm") return "video/webm";
  if (ext === "mp4") return "video/mp4";
  if (ext === "mov") return "video/quicktime";
  return "application/octet-stream";
}

async function userMayReadPathname(userId: string, email: string, role: string, pathname: string): Promise<boolean> {
  const elevated = role === "ADMIN" || role === "SUPERADMIN" || role === "OWNER" || role === "STAFF";
  if (elevated) return true;
  if (pathname.startsWith("uploads/")) return true;
  if (pathnameOwnedByUser(pathname, userId, email)) return true;

  const playbackNeedle = pathname;
  const [song, video, beat] = await Promise.all([
    prisma.song.findFirst({
      where: { uploaderId: userId, audioUrl: { contains: playbackNeedle } },
      select: { id: true },
    }).catch(() => null),
    prisma.video.findFirst({
      where: { uploaderId: userId, videoUrl: { contains: playbackNeedle } },
      select: { id: true },
    }).catch(() => null),
    prisma.beat.findFirst({
      where: {
        producerId: userId,
        OR: [
          { previewUrl: { contains: playbackNeedle } },
          { taggedUrl: { contains: playbackNeedle } },
          { audioAssetUrl: { contains: playbackNeedle } },
        ],
      },
      select: { id: true },
    }).catch(() => null),
  ]);
  return Boolean(song || video || beat);
}

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Sign in to play this media." }, { status: 401 });
  }

  if (!isBlobStorageAvailable()) {
    return NextResponse.json({ error: "Cloud storage is not available in this environment." }, { status: 503 });
  }

  const raw = req.nextUrl.searchParams.get("pathname") ?? "";
  const pathname = extractBlobPathname(raw) ?? (isSafeBlobPathname(raw) ? raw : null);
  if (!pathname) {
    return NextResponse.json({ error: "Missing or invalid pathname." }, { status: 400 });
  }

  const allowed = await userMayReadPathname(auth.user.id, auth.user.email, auth.user.role, pathname);
  if (!allowed) {
    return NextResponse.json({ error: "Not authorized to play this media." }, { status: 403 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: req.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "Media file not found." }, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    if (result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Media file not found." }, { status: 404 });
    }

    return new NextResponse(result.stream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || mimeFromPath(pathname),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
        ...(result.blob.etag ? { ETag: result.blob.etag } : {}),
      },
    });
  } catch (err) {
    console.error("[media/blob GET] stream failed");
    if (err instanceof Error) console.error("[media/blob GET]", err.message);
    return NextResponse.json({ error: "Unable to stream media." }, { status: 502 });
  }
}
