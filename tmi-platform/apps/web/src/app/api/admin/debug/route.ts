import { NextRequest, NextResponse } from 'next/server';

function forbiddenWithSanitization() {
  const denied = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  denied.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
  denied.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
  denied.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
  denied.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
  return denied;
}

export async function GET(request: NextRequest) {
  const role = (request.cookies.get('tmi_role')?.value ?? '').toUpperCase();
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
