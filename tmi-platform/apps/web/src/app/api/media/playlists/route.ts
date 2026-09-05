import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId") || auth?.user?.id;

  if (!creatorId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const playlists = await prisma.playlist.findMany({
      where: { creatorId },
      include: {
        items: {
          include: { song: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ ok: true, playlists, total: playlists.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const creatorId = (typeof body.creatorId === "string" ? body.creatorId : "") || auth?.user?.id;
  const name = typeof body.name === "string" ? body.name : "My Imported Playlist";
  const description = typeof body.description === "string" ? body.description : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl : "";
  const tracksInput = Array.isArray(body.tracks) ? body.tracks : [];

  if (!creatorId || (!sourceUrl && tracksInput.length === 0)) {
    return NextResponse.json(
      { ok: false, error: "creatorId and sourceUrl/tracks required" },
      { status: 400 }
    );
  }

  try {
    const playlist = await prisma.playlist.create({
      data: {
        creatorId,
        name,
        description: description || `Imported from ${sourceUrl}`,
        isPublic: true,
      },
    });

    const items = [];
    for (let i = 0; i < tracksInput.length; i++) {
      const tr = tracksInput[i] as Record<string, unknown>;
      const title = typeof tr.title === "string" ? tr.title : `Track ${i + 1}`;
      const artist = typeof tr.artist === "string" ? tr.artist : "Unknown Artist";
      const audioUrl = typeof tr.audioUrl === "string" ? tr.audioUrl : sourceUrl;
      if (audioUrl.startsWith("blob:") || audioUrl.includes("cdn.themusiciansindex.com/media/")) {
        return NextResponse.json(
          { ok: false, error: "Track source must be a refresh-safe URL, not a temporary blob: link." },
          { status: 400 },
        );
      }

      const song = await prisma.song.create({
        data: {
          uploaderId: creatorId,
          title,
          artistName: artist,
          audioUrl,
        },
      });

      const item = await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          songId: song.id,
          position: i,
        },
        include: { song: true },
      });
      items.push(item);
    }

    return NextResponse.json({
      ok: true,
      playlist: {
        ...playlist,
        items,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("id");
  const requestingUserId = searchParams.get("userId") || auth?.user?.id;

  if (!playlistId || !requestingUserId) {
    return NextResponse.json(
      { ok: false, error: "playlist id and requesting userId required" },
      { status: 400 }
    );
  }

  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return NextResponse.json({ ok: false, error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.creatorId !== requestingUserId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: You are not the creator of this playlist" },
        { status: 403 }
      );
    }

    await prisma.playlist.delete({ where: { id: playlistId } });
    return NextResponse.json({ ok: true, deletedId: playlistId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
