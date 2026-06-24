import { NextRequest, NextResponse } from 'next/server';
import { endLiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';

type OwnerActionType = 'pause' | 'resume' | 'extend' | 'end' | 'replace-host' | 'invite-performer' | 'remove-performer' | 'pin-sponsor' | 'pin-beat';

interface OwnerActionBody {
  type: OwnerActionType;
  minutes?: number | 'unlimited';
  newHostId?: string;
  userId?: string;
  sponsorId?: string;
  beatId?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const userId = req.cookies.get('tmi_user_email')?.value ?? req.cookies.get('tmi_user_id')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json() as OwnerActionBody;
  const { eventId } = params;

  switch (body.type) {
    case 'pause':
      return NextResponse.json({
        ok: true, status: 'paused',
        message: `Event ${eventId} paused`,
      });

    case 'resume':
      return NextResponse.json({
        ok: true, status: 'live',
        message: `Event ${eventId} resumed`,
      });

    case 'extend': {
      const label = body.minutes === 'unlimited' ? 'unlimited' : `${body.minutes}m`;
      return NextResponse.json({
        ok: true, status: 'live',
        message: `Event extended ${label}`,
        extendedBy: body.minutes,
      });
    }

    case 'end':
      // Remove from live session registry so lobby walls update immediately
      endLiveSession(userId);
      return NextResponse.json({
        ok: true, status: 'ended',
        message: 'Event ended — winners being tallied',
      });

    case 'replace-host':
      return NextResponse.json({
        ok: true, status: 'live',
        message: `Host replaced`,
      });

    case 'invite-performer':
      return NextResponse.json({
        ok: true, status: 'live',
        message: `Performer invited`,
      });

    case 'remove-performer':
      return NextResponse.json({
        ok: true, status: 'live',
        message: `Performer removed`,
      });

    case 'pin-sponsor':
      return NextResponse.json({ ok: true, status: 'live', message: 'Sponsor pinned' });

    case 'pin-beat':
      return NextResponse.json({ ok: true, status: 'live', message: 'Beat pinned' });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
