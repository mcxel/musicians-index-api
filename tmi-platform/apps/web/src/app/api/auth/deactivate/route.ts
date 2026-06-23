export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const COOKIE_CLEAR = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
};

/**
 * POST /api/auth/deactivate
 * Soft-deactivates the account: sets UserSettings.deletionRequestedAt, clears all session cookies.
 * Hard delete is never performed — data is preserved for support recovery.
 */
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('tmi_session_id')?.value;
  const userEmail = req.cookies.get('tmi_user_email')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  // Soft-deactivate: mark the account in DB so it's filterable
  if (userEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      if (user) {
        const now = new Date();
        await prisma.userSettings.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            deletionRequestedAt: now,
          },
          update: {
            deletionRequestedAt: now,
          },
        });
      }
    } catch (err) {
      console.error('[auth/deactivate] DB soft-deactivate failed:', err);
      // Non-fatal: still clear cookies so user is logged out
    }
  }

  const res = NextResponse.json({ ok: true });

  // Clear all TMI auth cookies
  for (const name of ['tmi_session_id', 'tmi_user_id', 'tmi_user_email', 'tmi_tier', 'tmi_role', 'tmi_display_name']) {
    res.cookies.set(name, '', COOKIE_CLEAR);
  }

  return res;
}
