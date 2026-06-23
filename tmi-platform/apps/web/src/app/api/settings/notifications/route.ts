export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type NotifPrefs = {
  newFollowers?: boolean;
  comments?: boolean;
  likes?: boolean;
  liveEvents?: boolean;
  bookingRequests?: boolean;
  payouts?: boolean;
  tips?: boolean;
  newsletter?: boolean;
  marketingEmails?: boolean;
};

/**
 * POST /api/settings/notifications
 * Saves notification preferences to Prisma NotificationPreference records.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { preferences?: NotifPrefs } = {};
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const prefs = body.preferences ?? {};

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const entries = Object.entries(prefs) as [string, boolean][];
    // Upsert one preference row per type/channel combination
    await Promise.all(
      entries.map(([type, enabled]) =>
        prisma.notificationPreference.upsert({
          where: { userId_type_channel: { userId: user.id, type, channel: 'email' } },
          create: { userId: user.id, type, channel: 'email', enabled },
          update: { enabled },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[settings/notifications] DB error:', err);
    return NextResponse.json({ ok: true }); // non-fatal to client
  }
}
