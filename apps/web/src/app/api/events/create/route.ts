import { NextRequest, NextResponse } from 'next/server';
import { registerLiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import type { StreamCategory } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import {
  canCreateRule38Experience,
  isRule38Experience,
  tierIndex,
} from '@/lib/subscriptions/BattleCreationGate';
import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';

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

function normalizeTier(raw: string): SubscriptionTier {
  const upper = raw.toUpperCase();
  if (upper === 'RUBY') return 'RUBY';
  return raw.toLowerCase() as SubscriptionTier;
}

// SECURITY (2026-09-23): this route previously derived identity from raw
// `tmi_user_email`/`tmi_user_id` cookies (no session validation) and tier
// from a `tmi_user_tier` cookie that is never set anywhere else in the
// codebase (always defaults to 'FREE' in practice, but forgeable by any
// client), then granted room creation to ANY account whose `tmi_role`
// cookie said dj/venue/promoter/admin — completely ignoring subscription
// tier. This is the exact "performer-subtype/role gates creation" pattern
// already corrected for World Dance Party, alive here in a separate legacy
// route. Confirmed via the 2026-09-23 subscription audit to have zero real
// UI callers (its one frontend, StartEventWizard.tsx, is not imported
// anywhere), but the route itself was directly callable by anyone who knew
// the URL, independent of any UI. Converged onto the same real,
// server-verified auth + Rule 38 tier authority /api/live/go now uses —
// no role-based bypass of any kind remains.
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json() as {
    eventType?: string;
    hostOption?: string;
    title?: string;
    timerMinutes?: number | 'unlimited';
    maxPerformers?: number;
  };

  if (!body.eventType) {
    return NextResponse.json({ error: 'eventType required' }, { status: 400 });
  }

  const category = EVENT_TYPE_TO_CATEGORY[body.eventType] ?? 'live';
  const tier = normalizeTier(auth.user.tier || 'free');

  const allowed = isRule38Experience(category)
    ? canCreateRule38Experience(category, tier).allowed
    : tierIndex(tier) >= tierIndex('gold');
  if (!allowed) {
    return NextResponse.json(
      { error: isRule38Experience(category) ? 'Silver tier or higher required to create this event' : 'Gold tier or higher required to create this event' },
      { status: 403 },
    );
  }

  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const eventId = `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const title = body.title ?? body.eventType;

  // Register with GlobalLiveSessionRegistry so the lobby wall sees this event
  registerLiveSession({
    userId: auth.user.id,
    displayName: auth.user.name,
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
    createdBy: auth.user.id,
    liveRoomUrl: `/live/rooms/${roomId}`,
  });
}
