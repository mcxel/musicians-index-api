export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getXpValue } from '@/lib/xp/XpActionRegistry';
import { DAILY_XP_CAP } from '@/lib/progression/ProgressionEngine';

/**
 * POST /api/magazine/read-xp
 *
 * Server-side enforcement for magazine article-completion XP — the missing
 * piece behind ProgressionEngine.grantXp(), which is real logic (correct
 * XpActionRegistry values, a real daily-cap calculation) but runs 100%
 * client-side in localStorage against the literal placeholder userId
 * "anonymous-magazine-reader". That means today, magazine reading XP never
 * reaches a real account, never survives a page reload or a second device,
 * and the "once per story" / daily-cap rules are trivially bypassed by
 * clearing localStorage.
 *
 * This route is the real authority: real signed-in user, real per-article
 * dedup (ParticipationLedger.metadata.targetId), real daily cap enforced
 * against actual persisted grants for today, real XP value from the
 * canonical XpActionRegistry (Rule 8) — same underlying UserStats /
 * ParticipationLedger tables /api/xp/grant already writes to, so magazine
 * XP is the same real XP everywhere else on the platform, not a second pool.
 *
 * The client-side dwell-time / completion-trigger logic in MagazineShell
 * (MIN_READ_MS, pageOpenDoesNotGrant) stays exactly as-is — that's a real,
 * honest signal for *when* to ask, not what's being fixed here.
 */

const ACTION_KEY = 'read_article' as const;

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value ?? '';
  const rawEmail = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!sessionId && !rawEmail) {
    // Honest non-grant, not an error — reading without an account just
    // doesn't earn XP, same as everywhere else progression requires auth.
    return NextResponse.json({ ok: true, granted: 0, reason: 'unauthenticated' });
  }

  let body: { pageId?: string } = {};
  try { body = (await req.json()) as { pageId?: string }; } catch { /* default */ }
  const pageId = (body.pageId ?? '').trim();
  if (!pageId) {
    return NextResponse.json({ ok: false, error: 'pageId required' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(sessionId ? [{ id: sessionId }] : []),
        ...(rawEmail ? [{ email: rawEmail }] : []),
      ],
    },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: true, granted: 0, reason: 'unauthenticated' });
  }
  const userId = user.id;

  // Once-per-story: has this exact user already earned XP for this exact
  // page, ever? Survives reloads/devices, unlike the client-side Set.
  const existing = await prisma.participationLedger.findFirst({
    where: {
      userId,
      actionType: ACTION_KEY,
      metadata: { path: ['targetId'], equals: pageId },
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, granted: 0, reason: 'already_earned' });
  }

  // Real daily cap — sum of today's real persisted read_article grants for
  // this user, not a client-side localStorage bucket.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysGrants = await prisma.participationLedger.findMany({
    where: { userId, actionType: ACTION_KEY, timestamp: { gte: startOfDay } },
    select: { points: true },
  });
  const earnedToday = todaysGrants.reduce((sum, g) => sum + g.points, 0);
  const room = Math.max(0, DAILY_XP_CAP - earnedToday);
  if (room <= 0) {
    return NextResponse.json({ ok: true, granted: 0, reason: 'daily_cap_reached', earnedToday, dailyCap: DAILY_XP_CAP });
  }

  const faceValue = getXpValue(ACTION_KEY);
  const granted = Math.min(faceValue, room);
  const capped = granted < faceValue;

  await prisma.$transaction([
    prisma.userStats.upsert({
      where: { userId },
      update: { xp: { increment: granted } },
      create: { userId, xp: granted },
    }),
    prisma.participationLedger.create({
      data: {
        userId,
        actionType: ACTION_KEY,
        points: granted,
        metadata: { targetId: pageId },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, granted, capped, earnedToday: earnedToday + granted, dailyCap: DAILY_XP_CAP });
}
