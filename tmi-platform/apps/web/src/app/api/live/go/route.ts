/**
 * POST /api/live/go  — register current session user as live
 * DELETE /api/live/go — end broadcast
 * GET  /api/live/go  — list all currently live users from LiveRegistry
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { LiveRegistry } from '@/lib/broadcast/LiveRegistry';

function sessionUserId(req: NextRequest): string | null {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return null;
  return sessionId.substring(0, 8);
}

export async function POST(req: NextRequest) {
  const userId = sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { displayName?: string; genre?: string; roomId?: string } = {};
  try { body = await req.json(); } catch { /* body optional */ }

  const entry = LiveRegistry.register({
    userId,
    displayName: body.displayName ?? userId,
    genre: body.genre ?? 'Live',
    viewerCount: 0,
    roomId: body.roomId,
  });

  return NextResponse.json({ ok: true, entry }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const userId = sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  LiveRegistry.unregister(userId);
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  const live = LiveRegistry.getLiveUsers();
  return NextResponse.json({ live, count: live.length });
}
