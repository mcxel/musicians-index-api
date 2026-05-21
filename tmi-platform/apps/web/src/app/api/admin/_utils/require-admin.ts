import { NextRequest, NextResponse } from 'next/server';

function parseSessionRole(sessionToken: string | undefined): string | null {
  if (!sessionToken) return null;

  // Preferred format: tmi_session = "userId|ROLE|issuedAt"
  const [, role] = sessionToken.split('|');
  if (role && role.trim().length > 0) return role.trim().toUpperCase();

  // Backward compatibility: token may be plain opaque string with no embedded role.
  return null;
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const session = request.cookies.get('tmi_session')?.value;
  const cookieRole = request.cookies.get('tmi_role')?.value?.toUpperCase();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const sessionRole = parseSessionRole(session);

  const isAdmin =
    sessionRole === 'ADMIN' ||
    sessionRole === 'STAFF' ||
    cookieRole === 'ADMIN';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return null;
}
