import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/media/locker
// Returns the authenticated user's uploaded songs and videos.
// Consumed by MediaLockerCanister.tsx.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) {
    return NextResponse.json({ items: [] });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ items: [] });

    const [songs, videos] = await Promise.all([
      prisma.song.findMany({
        where: { uploaderId: user.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, title: true, audioUrl: true, createdAt: true },
      }).catch(() => [] as { id: string; title: string; audioUrl: string; createdAt: Date }[]),
      prisma.video.findMany({
        where: { uploaderId: user.id, status: 'ACTIVE' },
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
        url: s.audioUrl,
        addedAt: s.createdAt.toISOString().slice(0, 10),
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        type: 'videos' as const,
        url: v.videoUrl,
        addedAt: v.createdAt.toISOString().slice(0, 10),
      })),
    ].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[media/locker GET]', err);
    return NextResponse.json({ items: [] });
  }
}
