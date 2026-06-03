export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/UserStore';

// In-memory follow graph (persists per server instance)
// Maps followerId → Set of followeeIds
const FOLLOW_MAP = new Map<string, Set<string>>();
const FOLLOWER_MAP = new Map<string, Set<string>>(); // followeeId → Set of followerIds

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const targetId = url.searchParams.get('targetId');

  if (targetId) {
    // Check if current user follows targetId
    const following = FOLLOW_MAP.get(user.id)?.has(targetId) ?? false;
    const followerCount = FOLLOWER_MAP.get(targetId)?.size ?? 0;
    return NextResponse.json({ following, followerCount });
  }

  const following = Array.from(FOLLOW_MAP.get(user.id) ?? []);
  const followers = Array.from(FOLLOWER_MAP.get(user.id) ?? []);
  return NextResponse.json({ following, followers, followingCount: following.length, followerCount: followers.length });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { targetId: string; action: 'follow' | 'unfollow' };
  if (!body.targetId || !body.action) return NextResponse.json({ error: 'targetId and action required' }, { status: 400 });
  if (body.targetId === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  if (body.action === 'follow') {
    if (!FOLLOW_MAP.has(user.id)) FOLLOW_MAP.set(user.id, new Set());
    if (!FOLLOWER_MAP.has(body.targetId)) FOLLOWER_MAP.set(body.targetId, new Set());
    FOLLOW_MAP.get(user.id)!.add(body.targetId);
    FOLLOWER_MAP.get(body.targetId)!.add(user.id);
    return NextResponse.json({ ok: true, following: true, followerCount: FOLLOWER_MAP.get(body.targetId)!.size });
  } else {
    FOLLOW_MAP.get(user.id)?.delete(body.targetId);
    FOLLOWER_MAP.get(body.targetId)?.delete(user.id);
    return NextResponse.json({ ok: true, following: false, followerCount: FOLLOWER_MAP.get(body.targetId)?.size ?? 0 });
  }
}
