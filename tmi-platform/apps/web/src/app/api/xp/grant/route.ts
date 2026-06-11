export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { grantXP, XP_VALUES } from '@/lib/xp/xpEngine';
import type { XPSource } from '@/lib/xp/xpEngine';

const VALID_CLIENT_SOURCES: XPSource[] = [
  'article_read',
  'stream_listen',
  'stream_react',
  'vote_cast',
  'room_attend',
];

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: { source?: string } = {};
  try { body = await req.json() as { source?: string }; } catch { /* default */ }

  const source = body.source as XPSource;
  if (!source || !VALID_CLIENT_SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const amount = XP_VALUES[source];
  const total = grantXP({ userId: sessionId, source, amount });

  return NextResponse.json({ ok: true, source, amount, total });
}
