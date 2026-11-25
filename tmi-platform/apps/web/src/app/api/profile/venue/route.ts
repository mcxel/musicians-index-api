export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbReady, getUserByEmail } from '@/lib/auth/UserStore';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

type VenueBody = {
  venueName?: string;
  venueType?: string;
  capacity?: string;
  city?: string;
  state?: string;
  contactEmail?: string;
  website?: string;
  bio?: string;
  services?: string[];
};

// P0 security fix (2026-11-17): identity previously came from the
// client-settable tmi_user_email cookie (sessionId was only checked for
// presence, never validated). See
// CLAUDE_P0_SESSION_FORGERY_FINDING_2026-11-17.md.
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const email = auth.user.email;

  let body: VenueBody = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { venueName, venueType, capacity, city, state, contactEmail, website, bio, services } = body;
  if (!venueName) return NextResponse.json({ error: 'venueName is required' }, { status: 400 });

  await dbReady;
  const user = getUserByEmail(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Try persisting to Prisma if DB is available
  try {
    if (process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient } = require('@prisma/client') as { PrismaClient: new (opts?: object) => Record<string, unknown> };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPg } = require('@prisma/adapter-pg') as { PrismaPg: new (pool: unknown) => unknown };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require('pg') as { Pool: new (opts: object) => unknown };
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter }) as {
        venueProfile: {
          upsert: (args: {
            where: { userId: string };
            create: Record<string, unknown>;
            update: Record<string, unknown>;
          }) => Promise<{ id: string }>;
        };
        $disconnect: () => Promise<void>;
      };

      const venueData = {
        userId: user.id,
        venueName: venueName ?? '',
        venueType: (venueType ?? 'CLUB').toUpperCase(),
        description: [bio, services?.length ? `Services: ${services.join(', ')}` : ''].filter(Boolean).join('\n\n'),
        website: website ?? '',
      };

      await prisma.venueProfile.upsert({
        where: { userId: user.id },
        create: venueData,
        update: { ...venueData },
      });

      await prisma.$disconnect();
    }
  } catch (err) {
    console.error('[api/profile/venue] DB write failed (non-fatal):', err);
  }

  return NextResponse.json({
    ok: true,
    venueName,
    city,
    state,
    capacity,
    contactEmail,
    services,
    message: 'Venue profile saved.',
  });
}
