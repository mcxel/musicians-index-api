import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

// POST /api/user/playlists/[id]/songs — add a song to a playlist
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const playlist = await prisma.playlist.findUnique({ where: { id: params.id }, select: { creatorId: true } });
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (playlist.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { songId: string };
  if (!body.songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

  const count = await prisma.playlistItem.count({ where: { playlistId: params.id } });

  try {
    const item = await prisma.playlistItem.create({
      data: { playlistId: params.id, songId: body.songId, position: count },
      include: { song: { select: { id: true, title: true, audioUrl: true, genre: true } } },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Song already in playlist' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/user/playlists/[id]/songs — list songs in a playlist
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = await prisma.playlistItem.findMany({
    where: { playlistId: params.id },
    orderBy: { position: 'asc' },
    include: { song: { select: { id: true, title: true, audioUrl: true, genre: true, bpm: true, coverUrl: true } } },
  });
  return NextResponse.json({ items });
}
