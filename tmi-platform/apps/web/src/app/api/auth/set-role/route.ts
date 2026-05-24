export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateUserRole, type UserRole } from '@/lib/auth/UserStore';

const VALID_ROLES: UserRole[] = ['fan', 'artist', 'performer', 'sponsor', 'advertiser', 'venue', 'writer', 'promoter'];

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60,
  path: '/',
};

export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  if (!sessionId || !email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { role?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const role = (body.role ?? '').toLowerCase() as UserRole;
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 });
  }

  const updated = updateUserRole(email, role);
  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set('tmi_role', role, COOKIE_OPTS);
  return response;
}
