export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* no body */ }

  // bio is artist-only
  if ('bio' in body && role !== 'artist') {
    return NextResponse.json({ error: 'Artist role required to set bio' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, updated: Object.keys(body) });
}
