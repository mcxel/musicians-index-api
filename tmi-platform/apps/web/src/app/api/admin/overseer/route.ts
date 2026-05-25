export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { platformOverseer, type OverseerFlags } from '@/lib/ops/PlatformOverseerEngine';

const ALLOWED_ADMINS = new Set(['berntmusic33@gmail.com']);

function isAdmin(): boolean {
  const jar   = cookies();
  const role  = jar.get('tmi_role')?.value;
  const email = jar.get('tmi_user_email')?.value ?? '';
  const sid   = jar.get('tmi_session_id')?.value;
  return !!sid && (role === 'ADMIN' || ALLOWED_ADMINS.has(email));
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  return NextResponse.json({
    flags:   platformOverseer.getFlags(),
    history: platformOverseer.getHistory(),
    ready:   platformOverseer.isSoftLaunchReady(),
  });
}

function visibilityResponse(snap: { visibility: string }, body: Record<string, unknown>) {
  const res = NextResponse.json(body);
  res.cookies.set('tmi_visibility', snap.visibility, {
    path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  let body: { action?: string; flags?: Partial<OverseerFlags> };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const updatedBy = cookies().get('tmi_user_email')?.value ?? 'admin';

  if (body.action === 'soft-launch') {
    const snap = platformOverseer.activateSoftLaunch(updatedBy);
    return visibilityResponse(snap, { ok: true, snapshot: snap, message: 'Soft launch beacon activated.' });
  }
  if (body.action === 'public') {
    const snap = platformOverseer.activatePublic(updatedBy);
    return visibilityResponse(snap, { ok: true, snapshot: snap, message: 'Platform set to PUBLIC.' });
  }
  if (body.action === 'lockdown') {
    const snap = platformOverseer.lockDown(updatedBy);
    return visibilityResponse(snap, { ok: true, snapshot: snap, message: 'Platform locked down.' });
  }
  if (body.flags) {
    const snap = platformOverseer.setFlags(body.flags, updatedBy);
    return visibilityResponse(snap, { ok: true, snapshot: snap });
  }

  return NextResponse.json({ error: 'action or flags required' }, { status: 400 });
}
