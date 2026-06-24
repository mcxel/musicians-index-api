import { NextRequest, NextResponse } from 'next/server';
import { registerLiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import type { StreamCategory } from '@/lib/broadcast/GlobalLiveSessionRegistry';

const EVENT_TYPE_TO_CATEGORY: Record<string, StreamCategory> = {
  'battle':            'battle',
  'cypher':            'cypher',
  'challenge':         'challenge',
  'joke-off':          'battle',
  'dance-off':         'battle',
  'dirty-dozens':      'battle',
  'beat-battle':       'battle',
  'producer-showcase': 'session',
  'dance-party':       'live',
  'open-mic':          'live',
  'talent-showcase':   'live',
  'custom':            'live',
};

// Tier gate: Gold, Platinum, Diamond, or special roles
const GOLD_TIERS = ['Gold', 'Platinum', 'Diamond'];

function canCreateEvent(tier: string, role?: string): boolean {
  if (GOLD_TIERS.includes(tier)) return true;
  if (role === 'dj' || role === 'venue' || role === 'promoter' || role === 'admin') return true;
  return false;
}

function generateRoomId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get('tmi_user_email')?.value ?? req.cookies.get('tmi_user_id')?.value;
  const tier   = req.cookies.get('tmi_user_tier')?.value ?? 'FREE';
  const role   = req.cookies.get('tmi_role')?.value ?? 'performer';
  const displayName = req.cookies.get('tmi_display_name')?.value ?? userId ?? 'Unknown';

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json() as {
    eventType?: string;
    hostOption?: string;
    title?: string;
    timerMinutes?: number | 'unlimited';
    maxPerformers?: number;
  };

  if (!canCreateEvent(tier, role)) {
    return NextResponse.json({ error: 'Gold tier or higher required to create events' }, { status: 403 });
  }

  if (!body.eventType) {
    return NextResponse.json({ error: 'eventType required' }, { status: 400 });
  }

  const roomId = generateRoomId();
  const eventId = `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const category = EVENT_TYPE_TO_CATEGORY[body.eventType] ?? 'live';
  const title = body.title ?? body.eventType;

  // Register with GlobalLiveSessionRegistry so the lobby wall sees this event
  registerLiveSession({
    userId,
    displayName,
    title,
    category,
    roomId,
    privacy: 'PUBLIC',
    performerTier: tier.toLowerCase() as 'gold' | 'platinum' | 'diamond' | 'free' | 'silver',
    accentColor: '#AA2DFF',
  });

  return NextResponse.json({
    ok: true,
    eventId,
    roomId,
    eventType: body.eventType,
    hostOption: body.hostOption,
    title,
    timerMinutes: body.timerMinutes ?? 30,
    maxPerformers: body.maxPerformers ?? 2,
    category,
    createdBy: userId,
    liveRoomUrl: `/live/rooms/${roomId}`,
  });
}
