/**
 * GET /api/media/my-playlists
 * Returns the authenticated user's playlists (id + name + track count).
 * Used by MediaUrlImporter for the "add to playlist" picker.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function authedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playlists = await prisma.playlist.findMany({
    where: { creatorId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({
    playlists: playlists.map((p) => ({ id: p.id, name: p.name, trackCount: p._count.items })),
  });
}
