import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

function forbiddenWithSanitization() {
  const denied = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  denied.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
  denied.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
  denied.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
  denied.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
  return denied;
}

export async function GET(request: NextRequest) {
  // SECURITY (2026-09-23, Batch 2): verified DB role via getTmiAuth() —
  // the previous tmi_role cookie check was forgeable by any caller.
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return forbiddenWithSanitization();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const parsedRole = request.cookies.get('tmi_role')?.value ?? '(none)';

  return NextResponse.json({
    ok: true,
    cookieHeader,
    parsedRole,
    allCookieKeys: request.cookies.getAll().map((c) => c.name),
  });
}
