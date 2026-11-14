export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import prisma from '@/lib/prisma';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

type ProfileBody = {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
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

function missingColumn(err: unknown): boolean {
  const code = (err as { code?: string }).code;
  const message = err instanceof Error ? err.message : String(err);
  return code === "P2022" || code === "P2021" || message.includes("does not exist");
}

export async function PUT(req: NextRequest) {
  let email = req.cookies.get('tmi_user_email')?.value;
  const userIdCookie = req.cookies.get('tmi_user_id')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  let body: ProfileBody = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Multi-source fallback user lookup so cold starts or missing email cookies never block onboarding
  let user: { id: string; role: string; displayName: string | null; email?: string | null } | null = null;

  const identitySelect = { id: true, role: true, email: true } as const;

  const signed = await getTmiAuth();
  if (signed?.user?.id) {
    const row = await prisma.user.findUnique({ where: { id: signed.user.id }, select: identitySelect });
    if (row) user = { ...row, displayName: null };
  }

  if (!user && email) {
    const row = await prisma.user.findUnique({ where: { email }, select: identitySelect });
    if (row) user = { ...row, displayName: null };
  }

  if (!user && userIdCookie) {
    const row = await prisma.user.findUnique({ where: { id: userIdCookie }, select: identitySelect });
    if (row) user = { ...row, displayName: null };
  }

  // P0 Media Integrity: never bind avatar/profile writes to an unrelated "first user".
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Log in to update profile.', saved: false }, { status: 401 });
  }

  let saved = false;
  try {
    // Update User.displayName directly so performers list reflects it immediately
    if (body.displayName) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data:  { displayName: body.displayName },
        });
      } catch (err) {
        if (!missingColumn(err)) throw err;
      }
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
    }).catch((err: unknown) => {
      if (missingColumn(err)) return null;
      throw err;
    });
    const currentLinks = (existingProfile?.socialLinks as Record<string, any>) ?? {};
    const updatedLinks = {
      ...currentLinks,
      ...(body.socialLinks ?? {}),
      ...(body.onboardingStep !== undefined && { onboarding_step: body.onboardingStep }),
    };

    // userProfile — avatar, bio, links
    try {
      await prisma.userProfile.upsert({
        where:  { userId: user.id },
        select: { id: true, bio: true },
        create: {
          userId:      user.id,
          displayName: body.displayName || user.displayName,
          bio:         body.bio,
          website:     body.website,
          location:    body.location,
          ...(body.city !== undefined && { city: body.city }),
          ...(body.state !== undefined && { state: body.state }),
          ...(body.country !== undefined && { country: body.country }),
          avatarUrl:   body.avatarUrl,
          bannerUrl:   body.bannerUrl,
          socialLinks: updatedLinks,
        },
        update: {
          ...(body.displayName !== undefined && { displayName: body.displayName }),
          ...(body.bio         !== undefined && { bio:         body.bio         }),
          ...(body.website     !== undefined && { website:     body.website     }),
          ...(body.location    !== undefined && { location:    body.location    }),
          ...(body.city        !== undefined && { city:        body.city        }),
          ...(body.state       !== undefined && { state:       body.state       }),
          ...(body.country     !== undefined && { country:     body.country     }),
          ...(body.avatarUrl   !== undefined && { avatarUrl:   body.avatarUrl   }),
          ...(body.bannerUrl   !== undefined && { bannerUrl:   body.bannerUrl   }),
          socialLinks: updatedLinks,
        },
      });
    } catch (err) {
      if (!missingColumn(err)) throw err;
      const prior = await prisma.$queryRaw<Array<{ bio: string | null; displayName: string | null; location: string | null; website: string | null; avatarUrl: string | null; bannerUrl: string | null }>>`
        SELECT bio, "displayName", location, website, "avatarUrl", "bannerUrl"
        FROM "UserProfile" WHERE "userId" = ${user.id}
      `;
      const current = prior[0];
      const nextBio = body.bio !== undefined ? body.bio : current?.bio ?? null;
      const nextName = body.displayName !== undefined ? body.displayName : current?.displayName ?? user.displayName;
      const nextLocation = body.location !== undefined ? body.location : current?.location ?? null;
      const nextWebsite = body.website !== undefined ? body.website : current?.website ?? null;
      const nextAvatar = body.avatarUrl !== undefined ? body.avatarUrl : current?.avatarUrl ?? null;
      const nextBanner = body.bannerUrl !== undefined ? body.bannerUrl : current?.bannerUrl ?? null;
      const links = JSON.stringify(updatedLinks);
      await prisma.$executeRaw`
        INSERT INTO "UserProfile" ("id","userId","displayName","bio","location","website","avatarUrl","bannerUrl","socialLinks","createdAt","updatedAt")
        VALUES (${randomUUID()}, ${user.id}, ${nextName}, ${nextBio}, ${nextLocation}, ${nextWebsite}, ${nextAvatar}, ${nextBanner}, CAST(${links} AS jsonb), NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET
          "displayName" = EXCLUDED."displayName",
          bio = EXCLUDED.bio,
          location = EXCLUDED.location,
          website = EXCLUDED.website,
          "avatarUrl" = EXCLUDED."avatarUrl",
          "bannerUrl" = EXCLUDED."bannerUrl",
          "socialLinks" = EXCLUDED."socialLinks",
          "updatedAt" = NOW()
      `;
    }

    // artistProfile — genres saved for ALL roles so orbit shows real genre tags
    if (body.genres !== undefined || body.stageName !== undefined || body.skills !== undefined || body.label !== undefined || body.articleHeroImageUrl !== undefined) {
      try {
        await prisma.artistProfile.upsert({
          where:  { userId: user.id },
          select: { id: true, stageName: true },
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
      } catch (err) {
        if (!missingColumn(err)) throw err;
        const genres = body.genres ?? [];
        const skills = body.skills ?? [];
        const updated = await prisma.$executeRaw`
          UPDATE "ArtistProfile"
          SET "stageName" = COALESCE(${body.stageName ?? null}, "stageName"),
              genres = CASE WHEN ${body.genres !== undefined} THEN ${genres}::text[] ELSE genres END,
              skills = CASE WHEN ${body.skills !== undefined} THEN ${skills}::text[] ELSE skills END,
              label = COALESCE(${body.label ?? null}, label)
          WHERE "userId" = ${user.id}
        `;
        if (updated === 0) {
          await prisma.$executeRaw`
            INSERT INTO "ArtistProfile" (id, "userId", "stageName", genres, skills, label)
            VALUES (${randomUUID()}, ${user.id}, ${body.stageName ?? null}, ${genres}::text[], ${skills}::text[], ${body.label ?? null})
          `;
        }
      }
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
    console.error('[api/profile/update] DB write failed:', err);
    return NextResponse.json(
      { ok: false, saved: false, error: 'Profile update failed to persist.' },
      { status: 500 },
    );
  }

  if (!saved) {
    return NextResponse.json({ ok: false, saved: false, error: 'Profile update did not persist.' }, { status: 500 });
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
