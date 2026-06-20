import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

// GET /api/user/content — returns all content owned by the logged-in user
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [songs, videos, playlists] = await Promise.all([
    prisma.song.findMany({
      where: { uploaderId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, genre: true, bpm: true, audioUrl: true, coverUrl: true, isPublic: true, status: true, playCount: true, createdAt: true },
    }),
    prisma.video.findMany({
      where: { uploaderId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, genre: true, videoUrl: true, thumbnailUrl: true, isPublic: true, status: true, viewCount: true, createdAt: true },
    }),
    prisma.playlist.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, description: true, coverUrl: true, isPublic: true, isMixtape: true, shareToken: true, createdAt: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return NextResponse.json({ songs, videos, playlists });
}

// POST /api/user/content — create a new playlist
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { name?: string; description?: string; isPublic?: boolean };
  if (!body.name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const playlist = await prisma.playlist.create({
    data: {
      creatorId: user.id,
      name: body.name.trim(),
      description: body.description,
      isPublic: body.isPublic ?? true,
    },
    select: { id: true, name: true, isPublic: true, shareToken: true, createdAt: true },
  });

  return NextResponse.json({ playlist }, { status: 201 });
}
