import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(request: NextRequest): NextResponse | null {
  const cookieHeader =
    request.headers.get('cookie') ||
    request.headers.get('Cookie') ||
    '';

  // Manual parse: trim both key and value to avoid leading/trailing space bugs
  let cookieRole = '';
  let sessionRaw = '';
  let phase11Raw = '';

  for (const segment of cookieHeader.split(';')) {
    const eqIdx = segment.indexOf('=');
    if (eqIdx === -1) continue;
    const key   = segment.slice(0, eqIdx).trim();
    const value = segment.slice(eqIdx + 1).trim();
    if (key === 'tmi_role')       cookieRole = value.toUpperCase();
    if (key === 'tmi_session')    sessionRaw = value;
    if (key === 'phase11_session') phase11Raw = value;
  }

  // tmi_session format: "sessionId|ROLE|tier"
  const sessionRole = sessionRaw.split('|')[1]?.trim().toUpperCase() ?? null;
  // phase11_session format: "sessionId|ROLE|tier" (same structure)
  const phase11Role = phase11Raw.split('|')[1]?.trim().toUpperCase() ?? null;

  const isAdmin =
    cookieRole  === 'ADMIN' ||
    cookieRole  === 'STAFF' ||
    sessionRole === 'ADMIN' ||
    sessionRole === 'STAFF' ||
    phase11Role === 'ADMIN' ||
    phase11Role === 'STAFF';

  const hasAnySession = cookieRole || sessionRaw || phase11Raw;

  if (!hasAnySession) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!isAdmin) {
    console.warn('[requireAdmin] ADMIN FAIL:', { cookieRole, sessionRole, phase11Role });
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return null;
}
