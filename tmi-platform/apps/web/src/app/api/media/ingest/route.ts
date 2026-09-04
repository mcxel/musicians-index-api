/**
 * POST /api/media/ingest
 *
 * Full URL-based media import pipeline:
 *   validate URL → detect provider → fetch metadata (oEmbed) → duplicate check
 *   → create Song record → optionally add to playlist → return result
 *
 * Body: { url: string, playlistId?: string, title?: string }
 * Auth: cookie tmi_user_email
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveMediaMetadata } from "@/lib/media/MediaIngestionService";

async function authedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Log in to import media.", code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { url?: unknown; playlistId?: unknown; title?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "INVALID_URL" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  const playlistId = typeof body.playlistId === "string" ? body.playlistId.trim() : null;
  const titleOverride = typeof body.title === "string" ? body.title.trim() : null;

  if (!rawUrl) {
    return NextResponse.json({ error: "url is required.", code: "INVALID_URL" }, { status: 400 });
  }

  // ── 1. Resolve metadata ───────────────────────────────────────────────────
  const resolved = await resolveMediaMetadata(rawUrl);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error.message, code: resolved.error.code },
      { status: 422 },
    );
  }

  const { metadata } = resolved;
  const finalTitle = titleOverride || metadata.title || "Untitled";

  // ── 2. Duplicate check (same user + same source URL) ─────────────────────
  const existing = await prisma.song.findFirst({
    where: { uploaderId: userId, audioUrl: metadata.sourceUrl },
    select: { id: true, title: true },
  });

  let songId: string;

  if (existing) {
    // Already imported — still honour playlist add below, but report it
    songId = existing.id;
    if (!playlistId) {
      return NextResponse.json(
        {
          ok: false,
          code: "DUPLICATE_TRACK",
          message: "You've already added this track.",
          songId,
          title: existing.title,
        },
        { status: 409 },
      );
    }
  } else {
    // ── 3. Persist new Song ─────────────────────────────────────────────────
    try {
      const song = await prisma.song.create({
        data: {
          uploaderId: userId,
          title: finalTitle,
          artistName: metadata.artistName ?? undefined,
          audioUrl: metadata.sourceUrl,
          coverUrl: metadata.coverUrl ?? undefined,
          duration: metadata.duration ?? undefined,
          genre: undefined,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      songId = song.id;
    } catch (err) {
      console.error("[media/ingest] Song.create failed", err);
      return NextResponse.json(
        { error: "Failed to save track to your collection.", code: "SAVE_FAILED" },
        { status: 500 },
      );
    }
  }

  // ── 4. Optional: add to playlist ─────────────────────────────────────────
  let addedToPlaylist = false;
  if (playlistId) {
    // Verify ownership before adding
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { creatorId: true },
    });
    if (playlist?.creatorId === userId) {
      try {
        const lastItem = await prisma.playlistItem.findFirst({
          where: { playlistId },
          orderBy: { position: "desc" },
          select: { position: true },
        });
        const nextPos = (lastItem?.position ?? -1) + 1;

        await prisma.playlistItem.upsert({
          where: { playlistId_songId: { playlistId, songId } },
          create: { playlistId, songId, position: nextPos },
          update: {},
        });
        addedToPlaylist = true;
      } catch (err) {
        console.error("[media/ingest] PlaylistItem.upsert failed", err);
        // Non-fatal: song saved, playlist add just failed
      }
    }
  }

  return NextResponse.json(
    {
      ok: true,
      songId,
      title: finalTitle,
      artistName: metadata.artistName,
      coverUrl: metadata.coverUrl,
      duration: metadata.duration,
      provider: metadata.provider,
      sourceUrl: metadata.sourceUrl,
      isDuplicate: Boolean(existing),
      addedToPlaylist,
    },
    { status: existing ? 200 : 201 },
  );
}
