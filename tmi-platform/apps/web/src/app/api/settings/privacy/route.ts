export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type PrivacySettings = {
  profileVisibility?: string;
  showLocation?: boolean;
  showOnlineStatus?: boolean;
  allowDirectMessages?: string;
  showInSearch?: boolean;
  allowCollabs?: boolean;
};

/**
 * POST /api/settings/privacy
 * Saves privacy settings to Prisma UserSettings.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { privacy?: PrivacySettings } = {};
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const privacy = body.privacy ?? {};

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        profileVisibility: privacy.profileVisibility ?? 'public',
        showOnlineStatus: privacy.showOnlineStatus ?? true,
        allowMessages: privacy.allowDirectMessages ?? 'followers',
      },
      update: {
        ...(privacy.profileVisibility !== undefined && { profileVisibility: privacy.profileVisibility }),
        ...(privacy.showOnlineStatus  !== undefined && { showOnlineStatus:  privacy.showOnlineStatus  }),
        ...(privacy.allowDirectMessages !== undefined && { allowMessages: privacy.allowDirectMessages }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[settings/privacy] DB error:', err);
    return NextResponse.json({ ok: true }); // non-fatal to client
  }
}
