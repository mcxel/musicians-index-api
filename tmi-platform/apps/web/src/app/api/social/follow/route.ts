export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recordFanFollow } from '@/lib/social/FanActivityFeedEngine';
import type { FanActivityActor } from '@/lib/social/FanActivityFeedEngine';

/**
 * Was backed by an in-memory Map (FollowEngine) — real code, but it never
 * persisted (reset on every redeploy/cold start) and doesn't share state
 * across serverless instances, so a follow made on one request could be
 * invisible on the next. Rewired to the real `Follow` Prisma model (already
 * defined in schema.prisma, previously unused by any route). Same request/
 * response shape as before — FollowButton.tsx and app/friends/page.tsx need
 * no changes.
 */

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const followerId = await resolveUserId(req);
  const targetId = req.nextUrl.searchParams.get('userId');
  if (!followerId || !targetId) return NextResponse.json({ following: false });

  const [existing, followerCount] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId: targetId } } }),
    prisma.follow.count({ where: { followingId: targetId } }),
  ]);

  return NextResponse.json({ following: !!existing, followerCount });
}

export async function POST(req: NextRequest) {
  const followerId = await resolveUserId(req);
  if (!followerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { userId?: string; userName?: string; action?: 'follow' | 'unfollow' };
  const { userId: targetId, userName, action = 'follow' } = body;
  if (!targetId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  if (targetId === followerId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  if (action === 'unfollow') {
    await prisma.follow.deleteMany({ where: { followerId, followingId: targetId } }).catch(() => {});
    const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
    return NextResponse.json({ following: false, followerCount });
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId: targetId } },
    create: { followerId, followingId: targetId },
    update: {},
  });

  try {
    const displayName = req.cookies.get('tmi_user_email')?.value?.split('@')[0] ?? 'Fan';
    const actor: FanActivityActor = { fanId: followerId, displayName };
    recordFanFollow(actor, targetId, userName ?? targetId, 'artist');
  } catch {
    // Feed recording is non-critical
  }

  const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
  return NextResponse.json({ following: true, followerCount });
}
