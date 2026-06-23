export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/profile/role-extension
 *
 * Saves role-specific profile fields that go beyond the base UserProfile.
 * Uses UserProfile.socialLinks as a flexible JSON container for fields that
 * don't yet have dedicated Prisma models (Sponsor, Advertiser, Promoter).
 *
 * Performer types are handled separately at /api/profile/performer-types.
 * Venue profiles are handled at /api/profile/venue.
 *
 * Accepted body shape (all fields optional):
 * {
 *   // Performer-specific
 *   performerTypes: string[];   // Use /api/profile/performer-types instead
 *   city: string;
 *   state: string;
 *   featuredSong: string;       // URL or title of featured track
 *   instagram: string;
 *   twitter: string;
 *   soundcloud: string;
 *   spotify: string;
 *
 *   // Sponsor-specific
 *   companyName: string;
 *   industry: string;
 *   budgetRange: string;        // e.g. "$1k–$5k"
 *   contactEmail: string;
 *   website: string;
 *
 *   // Advertiser-specific
 *   adBudget: string;
 *   targetAudience: string;
 *
 *   // Promoter-specific
 *   regions: string;            // comma-separated regions
 *   eventTypes: string;         // comma-separated event types
 * }
 *
 * All provided fields are merged into UserProfile.socialLinks (JSON),
 * preserving any fields not included in this request.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: Record<string, string | string[] | undefined> = {};
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Social-links style fields (stored under known keys in socialLinks JSON)
  const SOCIAL_KEYS = ['instagram', 'twitter', 'soundcloud', 'spotify', 'website'] as const;
  // Role-extension keys stored flat in socialLinks
  const EXTENSION_KEYS = [
    'city', 'state', 'featuredSong',
    'companyName', 'industry', 'budgetRange', 'contactEmail',
    'adBudget', 'targetAudience',
    'regions', 'eventTypes',
  ] as const;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, userProfile: { select: { socialLinks: true } } },
    });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    // Merge incoming fields into existing socialLinks blob
    const existing = (user.userProfile?.socialLinks ?? {}) as Record<string, string>;
    const merged: Record<string, string> = { ...existing };

    for (const key of [...SOCIAL_KEYS, ...EXTENSION_KEYS]) {
      if (body[key] !== undefined && typeof body[key] === 'string') {
        merged[key] = body[key] as string;
      }
    }

    // Also handle location and website in UserProfile directly
    const updateData: Record<string, string | typeof merged> = { socialLinks: merged };
    if (typeof body.website === 'string') updateData.website = body.website;
    if (typeof body.city === 'string' || typeof body.state === 'string') {
      const city  = typeof body.city  === 'string' ? body.city  : '';
      const state = typeof body.state === 'string' ? body.state : '';
      updateData.location = [city, state].filter(Boolean).join(', ');
    }

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        socialLinks: merged,
        ...(updateData.website   && { website:  updateData.website  as string }),
        ...(updateData.location  && { location: updateData.location as string }),
      },
      update: {
        socialLinks: merged,
        ...(updateData.website   && { website:  updateData.website  as string }),
        ...(updateData.location  && { location: updateData.location as string }),
      },
    });

    return NextResponse.json({ ok: true, saved: Object.keys(body) });
  } catch (err) {
    console.error('[profile/role-extension] DB error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to save profile extension.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        userProfile: { select: { socialLinks: true, website: true, location: true } },
        performerTypes: { select: { type: true } },
        artistProfile: { select: { stageName: true, genres: true } },
      },
    });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const socialLinks = (user.userProfile?.socialLinks ?? {}) as Record<string, string>;

    return NextResponse.json({
      ok: true,
      role: user.role,
      extension: {
        ...socialLinks,
        website: user.userProfile?.website ?? socialLinks.website ?? '',
        location: user.userProfile?.location ?? '',
        performerTypes: user.performerTypes.map((pt) => pt.type),
        stageName: user.artistProfile?.stageName ?? '',
        genres: user.artistProfile?.genres ?? [],
      },
    });
  } catch (err) {
    console.error('[profile/role-extension] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load profile extension.' }, { status: 500 });
  }
}
