export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { followUser, unfollowUser, listFollowersForUser } from '@/lib/social/FollowEngine';
import { recordFanFollow } from '@/lib/social/FanActivityFeedEngine';
import type { FanActivityActor } from '@/lib/social/FanActivityFeedEngine';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const targetId  = req.nextUrl.searchParams.get('userId');
  if (!sessionId || !targetId) return NextResponse.json({ following: false });
  const followers = listFollowersForUser(targetId);
  return NextResponse.json({ following: followers.includes(sessionId), followerCount: followers.length });
}

export async function POST(req: NextRequest) {
  const sessionId    = req.cookies.get('tmi_session_id')?.value;
  const displayName  = req.cookies.get('tmi_user_email')?.value?.split('@')[0] ?? 'Fan';
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { userId: string; userName?: string; action?: 'follow' | 'unfollow' };
  const { userId, userName, action = 'follow' } = body;

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  if (action === 'unfollow') {
    unfollowUser(sessionId, userId);
    return NextResponse.json({ following: false });
  }

  followUser(sessionId, userId);

  // Record in activity feed — only for artist/venue/show targets; fan-to-fan follows skip this
  try {
    const actor: FanActivityActor = { fanId: sessionId, displayName };
    recordFanFollow(actor, userId, userName ?? userId, 'artist');
  } catch {
    // Feed recording is non-critical
  }

  const followers = listFollowersForUser(userId);
  return NextResponse.json({ following: true, followerCount: followers.length });
}
