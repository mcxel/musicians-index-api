import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth/UserStore';
import { ARTIST_SEED } from '@/lib/artists/artistSeed';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CURATED_IMAGES = [
  '/tmi-curated/mag-20.jpg', '/tmi-curated/mag-28.jpg', '/tmi-curated/mag-35.jpg',
  '/tmi-curated/mag-42.jpg', '/tmi-curated/mag-50.jpg', '/tmi-curated/mag-58.jpg',
  '/tmi-curated/mag-66.jpg', '/tmi-curated/mag-74.jpg', '/tmi-curated/mag-82.jpg',
];

const GENRE_POOL = [
  'Hip-Hop', 'R&B', 'Trap', 'Pop', 'Electronic',
  'Freestyle', 'Soul', 'Afrobeat', 'Alternative', 'Gospel',
];

export type PublicPerformer = {
  id: string;
  name: string;
  avatarUrl: string;
  tier: string;
  isLive: boolean;
  score: number;
  route: string;
  genre: string;
};

function scoreAt(i: number, total: number) {
  return 1000 + (total - i) * 37;
}

function seedPad(live: PublicPerformer[]): PublicPerformer[] {
  if (live.length >= 6) return live;
  const needed = 9 - live.length;
  const extra: PublicPerformer[] = ARTIST_SEED.slice(0, needed).map((a, i) => ({
    id: a.id,
    name: a.name,
    avatarUrl: a.image,
    tier: a.tier,
    isLive: false,
    score: 900 - i * 20,
    route: `/artists/${a.id}`,
    genre: a.genre,
  }));
  return [...live, ...extra];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  // ── Prisma path (production) ─────────────────────────────────────────────────
  try {
    const dbUsers = await prisma.user.findMany({
      take: limit,
      orderBy: { userCreatedAt: 'desc' },
      include: {
        userProfile:   { select: { avatarUrl: true } },
        artistProfile: { select: { genres: true } },
      },
    });

    if (dbUsers.length > 0) {
      const live: PublicPerformer[] = dbUsers.map((u, i) => ({
        id: u.id,
        name: u.displayName ?? u.name ?? u.email?.split('@')[0] ?? 'Member',
        // Real uploaded photo wins; curated placeholder until they upload
        avatarUrl: u.userProfile?.avatarUrl ?? CURATED_IMAGES[i % CURATED_IMAGES.length] ?? '/tmi-curated/mag-20.jpg',
        tier: u.tier,
        isLive: false,
        score: scoreAt(i, dbUsers.length),
        route: `/profile/${u.id}`,
        genre: u.artistProfile?.genres?.[0] ?? GENRE_POOL[i % GENRE_POOL.length] ?? 'Hip-Hop',
      }));

      return NextResponse.json(seedPad(live).slice(0, limit), {
        headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
      });
    }
  } catch (err) {
    console.error('[performers] DB read failed, falling back to UserStore:', err);
  }

  // ── UserStore fallback (dev / no DATABASE_URL) ───────────────────────────────
  const registered = getAllUsers(limit);
  const live: PublicPerformer[] = registered.map((u, i) => ({
    id: u.id,
    name: u.displayName,
    avatarUrl: CURATED_IMAGES[i % CURATED_IMAGES.length] ?? '/tmi-curated/mag-20.jpg',
    tier: u.tier,
    isLive: false,
    score: scoreAt(i, registered.length),
    route: `/profile/${u.id}`,
    genre: GENRE_POOL[i % GENRE_POOL.length] ?? 'Hip-Hop',
  }));

  return NextResponse.json(seedPad(live).slice(0, limit), {
    headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
  });
}
