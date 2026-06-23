export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/user/profile — return current user's profile fields
export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, displayName: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { displayName: true, bio: true, avatarUrl: true, bannerUrl: true, website: true, location: true },
    });

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: profile?.displayName ?? user.displayName ?? null,
        bio: profile?.bio ?? null,
        profileImageUrl: profile?.avatarUrl ?? null,
        bannerUrl: profile?.bannerUrl ?? null,
        website: profile?.website ?? null,
        location: profile?.location ?? null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[api/user/profile GET]', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// PATCH /api/user/profile
// Accepts: { profileImageUrl?, displayName?, bio?, bannerUrl?, website?, location? }
// Updates the authenticated user's UserProfile row and optionally User.displayName.
// Auth: requires valid tmi_user_email cookie.
export async function PATCH(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: {
    profileImageUrl?: string;
    displayName?: string;
    bio?: string;
    bannerUrl?: string;
    website?: string;
    location?: string;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Map profileImageUrl → avatarUrl for the UserProfile model
    const avatarUrl = body.profileImageUrl;

    // Update User.displayName so it propagates everywhere immediately
    if (body.displayName) {
      await prisma.user.update({
        where: { id: user.id },
        data: { displayName: body.displayName },
      });
    }

    // Upsert UserProfile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(body.bannerUrl !== undefined && { bannerUrl: body.bannerUrl }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.location !== undefined && { location: body.location }),
      },
      update: {
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(body.bannerUrl !== undefined && { bannerUrl: body.bannerUrl }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.location !== undefined && { location: body.location }),
      },
    });

    const res = NextResponse.json({ ok: true, saved: true });

    // Persist display name to cookie for client-side reads
    if (body.displayName) {
      res.cookies.set('tmi_display_name', body.displayName, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return res;
  } catch (err) {
    console.error('[api/user/profile PATCH]', err);
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
  }
}
