export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbReady, getUserByEmail, updateUserTier } from '@/lib/auth/UserStore';

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

export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  if (!sessionId || !email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

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

  // Mark user as venue role — ensures dashboard routing is correct
  if (user.role !== 'venue') {
    updateUserTier(email, user.tier);
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
