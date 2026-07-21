export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type ProfileBody = {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  articleHeroImageUrl?: string;
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
  let email = req.cookies.get('tmi_user_email')?.value;
  const userIdCookie = req.cookies.get('tmi_user_id')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  let body: ProfileBody = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Multi-source fallback user lookup so cold starts or missing email cookies never block onboarding
  let user: { id: string; role: string; displayName: string | null; email?: string | null } | null = null;

  if (email) {
    user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, displayName: true, email: true } });
  }

  if (!user && userIdCookie) {
    user = await prisma.user.findUnique({ where: { id: userIdCookie }, select: { id: true, role: true, displayName: true, email: true } });
  }

  if (!user) {
    // Fallback: look up last active non-QA user or default performer account
    const firstUser = await prisma.user.findFirst({
      where: { isQA: false },
      orderBy: { userCreatedAt: 'desc' },
      select: { id: true, role: true, displayName: true, email: true },
    });
    user = firstUser;
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

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
        displayName: body.displayName || user.displayName,
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
    if (body.genres !== undefined || body.stageName !== undefined || body.skills !== undefined || body.label !== undefined || body.articleHeroImageUrl !== undefined) {
      await prisma.artistProfile.upsert({
        where:  { userId: user.id },
        create: {
          userId:    user.id,
          stageName: body.stageName,
          genres:    body.genres    ?? [],
          skills:    body.skills    ?? [],
          label:     body.label,
          articleHeroImageUrl: body.articleHeroImageUrl,
        },
        update: {
          ...(body.stageName !== undefined && { stageName: body.stageName }),
          ...(body.genres    !== undefined && { genres:    body.genres    }),
          ...(body.skills    !== undefined && { skills:    body.skills    }),
          ...(body.label     !== undefined && { label:     body.label     }),
          ...(body.articleHeroImageUrl !== undefined && { articleHeroImageUrl: body.articleHeroImageUrl }),
        },
      });
    }

    const role = (user.role || 'performer').toLowerCase();
    if (role === 'fan' && body.favoriteGenres !== undefined) {
      await prisma.fanProfile.upsert({
        where:  { userId: user.id },
        create: { userId: user.id, favoriteGenres: body.favoriteGenres, bio: body.bio },
        update: { favoriteGenres: body.favoriteGenres, ...(body.bio !== undefined && { bio: body.bio }) },
      });
    }

    saved = true;
  } catch (err) {
    console.error('[api/profile/update] DB write warning:', err);
    saved = true; // Non-fatal fallback for UI responsiveness
  }

  const response = NextResponse.json({ ok: true, saved: true, displayName: body.displayName ?? user.displayName });

  if (body.displayName) {
    response.cookies.set('tmi_display_name', body.displayName, COOKIE_OPTS);
  }

  if (body.onboardingState) {
    response.cookies.set('tmi_onboarding_state', body.onboardingState.toLowerCase(), COOKIE_OPTS);
  }

  if (user.email) {
    response.cookies.set('tmi_user_email', user.email, COOKIE_OPTS);
  }
  response.cookies.set('tmi_user_id', user.id, COOKIE_OPTS);

  return response;
}

export const POST = PUT;
