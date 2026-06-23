/**
 * GET /api/promoter/events — real events for the logged-in promoter.
 * Events are currently created by Venues/Admins (Rule 17). Until a promoter↔event
 * FK exists in the schema, returns honest empty state so the profile page can
 * render "No events yet" rather than fake data (Rule 20).
 *
 * When the Event model gains a promoterUserId field, replace the stub query below
 * with: prisma.event.findMany({ where: { promoterUserId: promoterId } })
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolvePromoterId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    }).catch(() => null);
    if (user?.id && user.role === 'PROMOTER') return user.id;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const promoterId = await resolvePromoterId(req);

  if (!promoterId) {
    return NextResponse.json({ events: [], authenticated: false });
  }

  // No promoterUserId column exists yet on Event — return honest empty state.
  // Replace this with a real query once the schema migration adds promoterUserId.
  return NextResponse.json({
    events: [],
    authenticated: true,
    promoterId,
    note: 'Event promotion associations are not yet stored in this schema version.',
  });
}
