import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth/UserStore';
import { ARTIST_SEED } from '@/lib/artists/artistSeed';

export const dynamic = 'force-dynamic';

// Curated image pool for users who haven't uploaded a photo yet
const CURATED_IMAGES = [
  '/tmi-curated/mag-20.jpg', '/tmi-curated/mag-28.jpg', '/tmi-curated/mag-35.jpg',
  '/tmi-curated/mag-42.jpg', '/tmi-curated/mag-50.jpg', '/tmi-curated/mag-58.jpg',
  '/tmi-curated/mag-66.jpg', '/tmi-curated/mag-74.jpg', '/tmi-curated/mag-82.jpg',
];

export type PublicPerformer = {
  id: string;
  name: string;
  avatarUrl: string;
  tier: string;
  isLive: boolean;
  score: number;
  route: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  const registered = getAllUsers(limit);

  // Map registered users to the orbit payload shape
  const live: PublicPerformer[] = registered.map((u, i) => ({
    id: u.id,
    name: u.displayName,
    // Cycle through curated images until users upload portraits
    avatarUrl: CURATED_IMAGES[i % CURATED_IMAGES.length] ?? '/tmi-curated/mag-20.jpg',
    tier: u.tier,
    isLive: false,
    score: 1000 + (registered.length - i) * 37,
    route: `/profile/${u.id}`,
  }));

  // If we have fewer than 6 real users, pad with seed artists so the orbit always looks full
  if (live.length < 6) {
    const needed = 9 - live.length;
    const seedPad: PublicPerformer[] = ARTIST_SEED.slice(0, needed).map((a, i) => ({
      id: a.id,
      name: a.name,
      avatarUrl: a.image,
      tier: a.tier,
      isLive: false,
      score: 900 - i * 20,
      route: `/profile/performer/${a.id}`,
    }));
    live.push(...seedPad);
  }

  return NextResponse.json(live.slice(0, limit), {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
