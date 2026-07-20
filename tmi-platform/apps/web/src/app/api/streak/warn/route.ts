/**
 * GET /api/streak/warn
 * Called by Vercel cron daily at 7 AM UTC.
 * Fires streak_warning emails to users whose streak expires today.
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { StreakEngine } from '@/lib/gamification/StreakEngine';
import { getUserById } from '@/lib/auth/UserStore';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { waitUntil } from '@vercel/functions';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const atRisk = StreakEngine.getAtRiskUsers();
  const sendPromises: Promise<unknown>[] = [];
  let sent = 0;

  for (const userId of atRisk) {
    const user = getUserById(userId);
    if (!user?.email) continue;

    const streak = StreakEngine.getStreak(userId);
    sendPromises.push(sendEmail({
      to: user.email,
      type: 'streak_warning',
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        multiplier: streak.currentStreak >= 7 ? '2.5' :
                    streak.currentStreak >= 5 ? '2.0' :
                    streak.currentStreak >= 3 ? '1.5' :
                    streak.currentStreak >= 2 ? '1.2' : '1.0',
      },
    }));
    sent++;
  }

  // waitUntil on the whole batch — not bare `void` per iteration — so a cron
  // job with many recipients can't have its later sends cut off when the
  // function returns (see register/route.ts for the full explanation,
  // 2026-07-19).
  waitUntil(Promise.all(sendPromises).catch(() => {}));

  return NextResponse.json({ ok: true, atRisk: atRisk.length, sent });
}
