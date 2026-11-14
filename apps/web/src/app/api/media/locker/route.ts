import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { toClientPlayableMediaUrl } from '@/lib/media/blobStorage';

export const dynamic = 'force-dynamic';

async function resolveAuthedUserId(req: NextRequest): Promise<{ id: string; name: string; email: string } | null> {
  const auth = await getTmiAuth();
  if (auth?.user?.id) {
    return { id: auth.user.id, name: auth.user.name ?? '', email: auth.user.email ?? '' };
  }

  // Fallback to direct cookie reading for dev/cert contexts
  const sessionId = req.cookies.get('tmi_session_id')?.value || req.cookies.get('tmi_user_id')?.value;
  const email = req.cookies.get('tmi_user_email')?.value;

  if (sessionId) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionId },
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true, displayName: true, name: true, email: true },
    }).catch(() => null);

    if (user) {
      return { id: user.id, name: user.displayName || user.name || '', email: user.email || '' };
    }
  }

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, displayName: true, name: true, email: true },
    }).catch(() => null);
    if (user) {
      return { id: user.id, name: user.displayName || user.name || '', email: user.email || '' };
    }
  }

  return null;
}

// GET /api/media/locker?type=all|songs|videos&q=searchQuery
export async function GET(req: NextRequest) {
  const user = await resolveAuthedUserId(req);
  if (!user) {
    return NextResponse.json(
      { items: [], total: 0, error: 'Unauthorized. Please sign in to view your Media Locker.' },
      { status: 401 },
    );
  }

  try {
    const userId = user.id;
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const typeFilter = (url.searchParams.get('type') || 'all').toLowerCase();

    const [songs, videos] = await Promise.all([
      (typeFilter === 'all' || typeFilter === 'songs' || typeFilter === 'song')
        ? prisma.song.findMany({
            where: {
              uploaderId: userId,
              status: 'ACTIVE',
              ...(q
                ? {
                    OR: [
                      { title: { contains: q, mode: 'insensitive' } },
                      { artistName: { contains: q, mode: 'insensitive' } },
                      { genre: { contains: q, mode: 'insensitive' } },
                    ],
                  }
                : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: {
              id: true,
              title: true,
              artistName: true,
              audioUrl: true,
              coverUrl: true,
              genre: true,
              duration: true,
              createdAt: true,
              playCount: true,
            },
          }).catch(() => [])
        : Promise.resolve([]),

      (typeFilter === 'all' || typeFilter === 'videos' || typeFilter === 'video')
        ? prisma.video.findMany({
            where: {
              uploaderId: userId,
              status: 'ACTIVE',
              ...(q
                ? {
                    OR: [
                      { title: { contains: q, mode: 'insensitive' } },
                      { description: { contains: q, mode: 'insensitive' } },
                      { genre: { contains: q, mode: 'insensitive' } },
                    ],
                  }
                : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: {
              id: true,
              title: true,
              description: true,
              videoUrl: true,
              thumbnailUrl: true,
              genre: true,
              duration: true,
              createdAt: true,
              viewCount: true,
            },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const items = [
      ...songs.map((s) => ({
        id: s.id,
        title: s.title,
        artistName: s.artistName || user.name || 'Artist',
        type: 'songs' as const,
        mediaType: 'song' as const,
        url: toClientPlayableMediaUrl(s.audioUrl),
        coverUrl: s.coverUrl || null,
        genre: s.genre || 'General',
        duration: s.duration || null,
        addedAt: s.createdAt.toISOString().slice(0, 10),
        playCount: s.playCount || 0,
        isSolo: true,
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        artistName: user.name || 'Performer',
        description: v.description || '',
        type: 'videos' as const,
        mediaType: 'video' as const,
        url: toClientPlayableMediaUrl(v.videoUrl),
        thumbnailUrl: v.thumbnailUrl || null,
        genre: v.genre || 'Video',
        duration: v.duration || null,
        addedAt: v.createdAt.toISOString().slice(0, 10),
        playCount: v.viewCount || 0,
        isSolo: true,
      })),
    ].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

    return NextResponse.json({
      items,
      total: items.length,
      user: { id: user.id, name: user.name },
    });
  } catch (err) {
    console.error('[media/locker GET]', err);
    return NextResponse.json(
      { items: [], total: 0, error: 'Unable to load Media Locker from database.' },
      { status: 500 },
    );
  }
}

// POST /api/media/locker — Save a solo media track or video directly
export async function POST(req: NextRequest) {
  const user = await resolveAuthedUserId(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Sign in to save to Media Locker.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      title?: string;
      artistName?: string;
      mediaType?: 'song' | 'video';
      url?: string;
      genre?: string;
      coverUrl?: string;
      duration?: number;
      description?: string;
    };

    const title = (body.title || '').trim();
    const url = (body.url || '').trim();
    const mediaType = body.mediaType === 'video' ? 'video' : 'song';
    const artistName = (body.artistName || user.name || 'Artist').trim();

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required.' }, { status: 400 });
    }

    if (mediaType === 'song') {
      const song = await prisma.song.create({
        data: {
          uploaderId: user.id,
          title,
          artistName,
          audioUrl: url,
          genre: body.genre || 'Hip-Hop',
          coverUrl: body.coverUrl || null,
          duration: body.duration || null,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({
        ok: true,
        item: {
          id: song.id,
          title: song.title,
          artistName: song.artistName,
          mediaType: 'song',
          url: toClientPlayableMediaUrl(song.audioUrl),
          genre: song.genre,
          addedAt: song.createdAt.toISOString().slice(0, 10),
        },
      }, { status: 201 });
    } else {
      const video = await prisma.video.create({
        data: {
          uploaderId: user.id,
          title,
          description: body.description || null,
          videoUrl: url,
          thumbnailUrl: body.coverUrl || null,
          genre: body.genre || 'Visual',
          duration: body.duration || null,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({
        ok: true,
        item: {
          id: video.id,
          title: video.title,
          artistName,
          mediaType: 'video',
          url: toClientPlayableMediaUrl(video.videoUrl),
          genre: video.genre,
          addedAt: video.createdAt.toISOString().slice(0, 10),
        },
      }, { status: 201 });
    }
  } catch (err: any) {
    console.error('[media/locker POST]', err);
    return NextResponse.json({ error: err?.message || 'Failed to save to Media Locker.' }, { status: 500 });
  }
}

// DELETE /api/media/locker?id=...&type=song|video
export async function DELETE(req: NextRequest) {
  const user = await resolveAuthedUserId(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type') || 'song';

  if (!id) {
    return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
  }

  try {
    if (type === 'video') {
      await prisma.video.deleteMany({
        where: { id, uploaderId: user.id },
      });
    } else {
      await prisma.song.deleteMany({
        where: { id, uploaderId: user.id },
      });
    }
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    console.error('[media/locker DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete media item.' }, { status: 500 });
  }
}
