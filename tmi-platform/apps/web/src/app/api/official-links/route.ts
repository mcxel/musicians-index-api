export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();

  if (role !== 'artist') {
    return NextResponse.json({ error: 'Artist role required' }, { status: 403 });
  }

  // Artist must have completed onboarding profile before adding official links
  const onboarded = req.cookies.get('tmi_artist_onboarded')?.value;
  if (!onboarded) {
    return NextResponse.json({ error: 'Complete artist onboarding before adding official links' }, { status: 403 });
  }

  let body: { platform?: string; url?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  if (!body.platform || !body.url) {
    return NextResponse.json({ error: 'platform and url are required' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, platform: body.platform, url: body.url });
}
