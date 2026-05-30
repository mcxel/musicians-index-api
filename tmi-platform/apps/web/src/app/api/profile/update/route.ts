export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbReady, getUserByEmail } from '@/lib/auth/UserStore';

type ProfileBody = {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: Record<string, string>;
  // Artist-specific
  stageName?: string;
  genres?: string[];
  skills?: string[];
  label?: string;
  // Fan-specific
  favoriteGenres?: string[];
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

  // Try persisting to Prisma if DB is available
  let saved = false;
  try {
    if (process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient } = require('@prisma/client') as { PrismaClient: new (opts: object) => Record<string, unknown> };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPg } = require('@prisma/adapter-pg') as { PrismaPg: new (pool: unknown) => unknown };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require('pg') as { Pool: new (opts: object) => unknown };
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter }) as {
        userProfile: {
          upsert: (args: {
            where: { userId: string };
            create: Record<string, unknown>;
            update: Record<string, unknown>;
          }) => Promise<{ id: string }>;
        };
        artistProfile: {
          upsert: (args: {
            where: { userId: string };
            create: Record<string, unknown>;
            update: Record<string, unknown>;
          }) => Promise<{ id: string }>;
        };
        fanProfile: {
          upsert: (args: {
            where: { userId: string };
            create: Record<string, unknown>;
            update: Record<string, unknown>;
          }) => Promise<{ id: string }>;
        };
        $disconnect: () => Promise<void>;
      };

      const profileData = {
        userId: user.id,
        displayName: body.displayName,
        bio: body.bio,
        website: body.website,
        location: body.location,
        avatarUrl: body.avatarUrl,
        bannerUrl: body.bannerUrl,
        socialLinks: body.socialLinks,
      };
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: profileData,
        update: profileData,
      });

      const role = user.role.toLowerCase();
      if (role === 'artist' || role === 'performer') {
        const artistData = {
          userId: user.id,
          stageName: body.stageName,
          genres: body.genres ?? [],
          skills: body.skills ?? [],
          label: body.label,
        };
        await prisma.artistProfile.upsert({
          where: { userId: user.id },
          create: artistData,
          update: artistData,
        });
      }

      if (role === 'fan') {
        const fanData = { userId: user.id, favoriteGenres: body.favoriteGenres ?? [], bio: body.bio };
        await prisma.fanProfile.upsert({
          where: { userId: user.id },
          create: fanData,
          update: fanData,
        });
      }

      await prisma.$disconnect();
      saved = true;
    }
  } catch (err) {
    console.error('[api/profile/update] DB write failed (non-fatal):', err);
  }

  const response = NextResponse.json({ ok: true, saved, displayName: body.displayName ?? user.displayName });

  if (body.displayName) {
    response.cookies.set('tmi_display_name', body.displayName, COOKIE_OPTS);
  }

  return response;
}

// Also support POST for compatibility
export const POST = PUT;
