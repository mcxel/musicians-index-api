export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { followUser, unfollowUser, listFollowersForUser } from '@/lib/social/FollowEngine';

// POST /api/artist/follow
// Body: { artistSlug: string; action: 'follow' | 'unfollow' }
// Used by components/common/FollowButton.tsx
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { artistSlug?: string; action?: 'follow' | 'unfollow' };
  const { artistSlug, action = 'follow' } = body;

  if (!artistSlug) return NextResponse.json({ error: 'artistSlug required' }, { status: 400 });

  if (action === 'unfollow') {
    unfollowUser(sessionId, artistSlug);
    return NextResponse.json({ following: false });
  }

  followUser(sessionId, artistSlug);
  const followers = listFollowersForUser(artistSlug);
  return NextResponse.json({ following: true, followerCount: followers.length });
}

// GET /api/artist/follow?artistSlug=...
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const artistSlug = req.nextUrl.searchParams.get('artistSlug');
  if (!artistSlug) return NextResponse.json({ following: false, followerCount: 0 });
  const followers = listFollowersForUser(artistSlug);
  return NextResponse.json({
    following: sessionId ? followers.includes(sessionId) : false,
    followerCount: followers.length,
  });
}
