/**
 * GET /api/venue/profile — fetch venue's stats, events, rooms, and activity
 * Real implementation: queries Prisma for venue's events, bookings, occupancy
 * Launch version: returns honest empty state per Rule 20 (No Fake Data)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveVenueId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    }).catch(() => null);
    if (user?.id && user.role === 'VENUE') return user.id;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const venueId = await resolveVenueId(req);

  if (!venueId) {
    return NextResponse.json({
      stats: [],
      events: [],
      rooms: [],
      activity: [],
      authenticated: false,
    });
  }

  // TODO: Replace with real queries once venue/event schema relationships are finalized
  // For now, return honest empty state (Rule 20)
  return NextResponse.json({
    stats: [
      { label: 'Rooms Active', value: '0', color: '#22c55e', icon: '🏟️' },
      { label: 'Tickets Sold', value: '0', color: '#00FFFF', icon: '🎫' },
      { label: 'Avg Occupancy', value: '—', color: '#FFD700', icon: '📊' },
      { label: 'Revenue (MTD)', value: '$0', color: '#FF2DAA', icon: '💰' },
      { label: 'Events Booked', value: '0', color: '#00FF88', icon: '📅' },
      { label: 'Fan Capacity', value: '0', color: '#AA2DFF', icon: '👥' },
    ],
    events: [],
    rooms: [],
    activity: [],
    authenticated: true,
    venueId,
    message: 'No upcoming events. Book your first event to get started.',
  });
}
