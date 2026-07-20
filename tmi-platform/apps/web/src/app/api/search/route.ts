export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Real people search — performers and fans, backed by the actual User/
 * ArtistProfile/UserProfile tables. The previous /search page filtered a
 * hardcoded array of 6 fake artists client-side; it never queried a real
 * account. Role rule (per platform direction, 2026-07-19):
 *   - Performers are searchable by anyone (discovery is public).
 *   - Fans are only searchable by other authenticated fans (Booking
 *     Department policy keeps performers from directly reaching fans —
 *     see CLAUDE.md Rule 17/Booking Department System — and unauthenticated
 *     visitors have no reason to browse the fan directory).
 * isQA accounts are excluded per the schema's own annotation on User.isQA
 * ("Must be excluded from discovery, rankings, leaderboards, search").
 */

const PERFORMER_ROLES: Role[] = [Role.PERFORMER, Role.ARTIST, Role.BAND];

async function getRequesterRole(req: NextRequest): Promise<{ id: string; role: Role } | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  return user ? { id: user.id, role: user.role } : null;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  const type = req.nextUrl.searchParams.get('type') === 'fans' ? 'fans' : 'performers';

  if (type === 'fans') {
    const requester = await getRequesterRole(req);
    if (!requester || requester.role !== Role.FAN) {
      return NextResponse.json({ results: [], error: 'Fan search requires a signed-in fan account' }, { status: 403 });
    }
  }

  const roleFilter: Role[] = type === 'fans' ? [Role.FAN] : PERFORMER_ROLES;

  const users = await prisma.user.findMany({
    where: {
      isQA: false,
      role: { in: roleFilter },
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
              { artistProfile: { stageName: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      role: true,
      tier: true,
      isLive: true,
      userProfile: { select: { avatarUrl: true, location: true } },
      artistProfile: { select: { slug: true, stageName: true, genres: true, verified: true, followers: true } },
    },
    take: 30,
    orderBy: q ? undefined : { lastSeenAt: 'desc' },
  });

  const results = users.map((u) => {
    const isPerformer = PERFORMER_ROLES.includes(u.role);
    const name = u.artistProfile?.stageName ?? u.displayName ?? u.name ?? 'TMI Member';
    const profileRoute = isPerformer
      ? `/profile/performer/${u.artistProfile?.slug ?? u.id}`
      : `/profile/fan/${u.id}`;
    return {
      id: u.id,
      name,
      role: u.role,
      tier: u.tier,
      isLive: u.isLive,
      avatarUrl: u.userProfile?.avatarUrl ?? null,
      location: u.userProfile?.location ?? null,
      genre: u.artistProfile?.genres?.[0] ?? null,
      verified: u.artistProfile?.verified ?? false,
      followers: u.artistProfile?.followers ?? 0,
      profileRoute,
    };
  });

  return NextResponse.json({ results, query: q, type });
}
