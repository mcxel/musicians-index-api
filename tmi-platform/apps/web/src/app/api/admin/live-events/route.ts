import { NextRequest, NextResponse } from 'next/server';
import { getAdminLiveEvents, emitAdminLiveEvent, type AdminLiveEventType } from '@/lib/admin/AdminLiveEventEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

const ALLOWED_TYPES: AdminLiveEventType[] = [
  'join',
  'payment',
  'engagement',
  'alert',
  'viral',
  'arena_moderation',
  'submission_received',
  'submission_approved',
];

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:admin-live-events:get`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '20'), 1), 100);
  return NextResponse.json({ events: getAdminLiveEvents(limit) });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:admin-live-events:post`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    message?: string;
    meta?: Record<string, string | number | boolean | null>;
  };

  if (!body.type || !ALLOWED_TYPES.includes(body.type as AdminLiveEventType)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }
  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const event = emitAdminLiveEvent({
    type: body.type as AdminLiveEventType,
    message: body.message,
    meta: body.meta,
  });

  return NextResponse.json({ ok: true, event }, { status: 201 });
}
