export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbReady, getUserByEmail } from '@/lib/auth/UserStore';
import prisma from '@/lib/prisma';

type ProfileBody = {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: Record<string, string>;
  stageName?: string;
  genres?: string[];
  skills?: string[];
  label?: string;
  favoriteGenres?: string[];
  onboardingState?: 'NO_ROLE_SELECTED' | 'INCOMPLETE' | 'COMPLETE';
  onboardingStep?: string;
};

const COOKIE_OPTS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

export async function PUT(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  if (!sessionId || !email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: ProfileBody = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  await dbReady;
  const user = getUserByEmail(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let saved = false;
  try {
    // Update User.displayName directly so performers list reflects it immediately
    if (body.displayName) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { displayName: body.displayName },
      });
    }

    if (body.onboardingState) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingState: body.onboardingState as any },
      });
    }

    // Merge existing social links to avoid wiping out metadata
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { socialLinks: true },
    });
    const currentLinks = (existingProfile?.socialLinks as Record<string, any>) ?? {};
    const updatedLinks = {
      ...currentLinks,
      ...(body.socialLinks ?? {}),
      ...(body.onboardingStep !== undefined && { onboarding_step: body.onboardingStep }),
    };

    // userProfile — avatar, bio, links
    await prisma.userProfile.upsert({
      where:  { userId: user.id },
      create: {
        userId:      user.id,
        displayName: body.displayName,
        bio:         body.bio,
        website:     body.website,
        location:    body.location,
        avatarUrl:   body.avatarUrl,
        bannerUrl:   body.bannerUrl,
        socialLinks: updatedLinks,
      },
      update: {
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.bio         !== undefined && { bio:         body.bio         }),
        ...(body.website     !== undefined && { website:     body.website     }),
        ...(body.location    !== undefined && { location:    body.location    }),
        ...(body.avatarUrl   !== undefined && { avatarUrl:   body.avatarUrl   }),
        ...(body.bannerUrl   !== undefined && { bannerUrl:   body.bannerUrl   }),
        socialLinks: updatedLinks,
      },
    });

    // artistProfile — genres saved for ALL roles so orbit shows real genre tags
    if (body.genres !== undefined || body.stageName !== undefined || body.skills !== undefined || body.label !== undefined) {
      await prisma.artistProfile.upsert({
        where:  { userId: user.id },
        create: {
          userId:    user.id,
          stageName: body.stageName,
          genres:    body.genres    ?? [],
          skills:    body.skills    ?? [],
          label:     body.label,
        },
        update: {
          ...(body.stageName !== undefined && { stageName: body.stageName }),
          ...(body.genres    !== undefined && { genres:    body.genres    }),
          ...(body.skills    !== undefined && { skills:    body.skills    }),
          ...(body.label     !== undefined && { label:     body.label     }),
        },
      });
    }

    const role = user.role.toLowerCase();
    if (role === 'fan' && body.favoriteGenres !== undefined) {
      await prisma.fanProfile.upsert({
        where:  { userId: user.id },
        create: { userId: user.id, favoriteGenres: body.favoriteGenres, bio: body.bio },
        update: { favoriteGenres: body.favoriteGenres, ...(body.bio !== undefined && { bio: body.bio }) },
      });
    }

    saved = true;
  } catch (err) {
    console.error('[api/profile/update] DB write failed (non-fatal):', err);
  }

  const response = NextResponse.json({ ok: true, saved, displayName: body.displayName ?? user.displayName });

  if (body.displayName) {
    response.cookies.set('tmi_display_name', body.displayName, COOKIE_OPTS);
  }

  if (body.onboardingState) {
    response.cookies.set('tmi_onboarding_state', body.onboardingState.toLowerCase(), COOKIE_OPTS);
  }

  return response;
}

export const POST = PUT;
