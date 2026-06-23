export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  if (!email || !sessionId) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userProfile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
          },
        },
        artistProfile: {
          select: {
            genres: true,
            stageName: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        displayName: user.userProfile?.displayName ?? user.displayName ?? null,
        bio: user.userProfile?.bio ?? null,
        avatarUrl: user.userProfile?.avatarUrl ?? null,
        bannerUrl: user.userProfile?.bannerUrl ?? null,
        genres: user.artistProfile?.genres ?? [],
        stageName: user.artistProfile?.stageName ?? null,
      },
    });
  } catch (error) {
    console.error('[api/profile/self] failed', error);
    return NextResponse.json({ ok: false, error: 'Failed to load profile' }, { status: 500 });
  }
}
