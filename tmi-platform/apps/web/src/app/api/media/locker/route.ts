import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { toClientPlayableMediaUrl } from '@/lib/media/blobStorage';

// GET /api/media/locker
// Returns the authenticated user's uploaded songs and videos.
// Consumed by MediaLockerCanister.tsx.
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json(
      { items: [], error: 'Unauthorized. Log in to view Media Locker.' },
      { status: 401 },
    );
  }

  try {
    const userId = auth.user.id;

    const [songs, videos] = await Promise.all([
      prisma.song.findMany({
        where: { uploaderId: userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, title: true, audioUrl: true, createdAt: true },
      }).catch(() => [] as { id: string; title: string; audioUrl: string; createdAt: Date }[]),
      prisma.video.findMany({
        where: { uploaderId: userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, title: true, videoUrl: true, createdAt: true },
      }).catch(() => [] as { id: string; title: string; videoUrl: string; createdAt: Date }[]),
    ]);

    const items = [
      ...songs.map((s) => ({
        id: s.id,
        title: s.title,
        type: 'songs' as const,
        url: toClientPlayableMediaUrl(s.audioUrl),
        addedAt: s.createdAt.toISOString().slice(0, 10),
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        type: 'videos' as const,
        url: toClientPlayableMediaUrl(v.videoUrl),
        addedAt: v.createdAt.toISOString().slice(0, 10),
      })),
    ].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error('[media/locker GET]', err);
    return NextResponse.json(
      { items: [], error: 'Unable to load Media Locker from database' },
      { status: 500 },
    );
  }
}
