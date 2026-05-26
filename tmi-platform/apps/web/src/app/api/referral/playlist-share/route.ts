export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import {
  getPlaylistShareSnapshot,
  recordPlaylistShareEvent,
  type PlaylistShareEventType,
} from '@/lib/share/ShareTrackingEngine';
import { awardXP } from '@/lib/profile/ProfileRewardsEngine';

interface ShareBody {
  event: PlaylistShareEventType;
  playlistId: string;
  curatorId: string;
  referrerId?: string;
  source?: string;
  platform?: string;
}

const VALID_EVENTS = new Set<PlaylistShareEventType>(['share', 'copy', 'open', 'click']);

function cleanId(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const normalized = input.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return normalized || fallback;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`playlist-share:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: Partial<ShareBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const event = body.event;
  if (!event || !VALID_EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: 'Invalid share event' }, { status: 400 });
  }

  const playlistId = cleanId(body.playlistId, 'playlist');
  const curatorId = cleanId(body.curatorId, 'curator');
  const referrerId = cleanId(body.referrerId, curatorId);

  const snapshot = recordPlaylistShareEvent({
    event,
    playlistId,
    curatorId,
    referrerId,
    source: body.source,
    platform: body.platform,
    occurredAt: Date.now(),
  });

  // Lightweight XP loop for phase 1 launch behavior.
  if (event === 'share') {
    await awardXP(curatorId, 25, 'Playlist Viral Share');
  }
  if (event === 'click' && referrerId) {
    await awardXP(referrerId, 10, 'Playlist Viral Clickthrough');
  }

  return NextResponse.json({ ok: true, snapshot });
}

export async function GET(req: NextRequest) {
  const playlistId = cleanId(req.nextUrl.searchParams.get('playlistId') || undefined, 'playlist');
  return NextResponse.json({ ok: true, snapshot: getPlaylistShareSnapshot(playlistId) });
}
