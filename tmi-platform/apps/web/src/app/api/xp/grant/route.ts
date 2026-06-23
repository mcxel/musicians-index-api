export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { grantXP, XP_VALUES } from '@/lib/xp/xpEngine';
import type { XPSource } from '@/lib/xp/xpEngine';
import { prisma } from '@/lib/prisma';

const VALID_CLIENT_SOURCES: XPSource[] = [
  'article_read',
  'stream_listen',
  'stream_react',
  'vote_cast',
  'room_attend',
];

/**
 * Persists XP to UserStats in the database.
 * Also writes a ParticipationLedger entry for audit.
 * Non-fatal: falls back to in-memory only if DB is unavailable.
 */
async function persistXpToDb(userId: string, source: string, amount: number): Promise<void> {
  await prisma.userStats.upsert({
    where: { userId },
    update: { xp: { increment: amount } },
    create: { userId, xp: amount },
  });
  await prisma.participationLedger.create({
    data: { userId, actionType: source, points: amount },
  });
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: { source?: string } = {};
  try { body = await req.json() as { source?: string }; } catch { /* default */ }

  const source = body.source as XPSource;
  if (!source || !VALID_CLIENT_SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const amount = XP_VALUES[source];

  // In-memory grant (for level display, event dispatch, XP levels)
  const total = grantXP({ userId: sessionId, source, amount });

  // Resolve real DB user from email cookie, then persist to UserStats
  const rawEmail = req.cookies.get('tmi_user_email')?.value;
  let dbUserId: string | null = null;
  if (rawEmail) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: rawEmail },
        select: { id: true },
      });
      if (dbUser) dbUserId = dbUser.id;
    } catch {
      // Non-fatal: proceed with in-memory total
    }
  }

  if (dbUserId) {
    try {
      await persistXpToDb(dbUserId, source, amount);
    } catch (err) {
      // Non-fatal: in-memory XP still granted
      console.error('[xp/grant] DB persistence failed:', err);
    }
  }

  return NextResponse.json({ ok: true, source, amount, total });
}
