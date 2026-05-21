import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(request: NextRequest): NextResponse | null {
  const cookieHeader =
    request.headers.get('cookie') ||
    request.headers.get('Cookie') ||
    '';

  // Belt-and-suspenders: try both raw header and parsed cookies API
  const parsedRole = request.cookies.get('tmi_role')?.value ?? '';

  const isAdmin =
    cookieHeader.includes('tmi_role=admin') ||
    cookieHeader.includes('tmi_role=ADMIN') ||
    parsedRole.toLowerCase() === 'admin';

  console.log('[requireAdmin]', { isAdmin, cookieHeader, parsedRole });

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required', cookieHeader, parsedRole },
      { status: 403 },
    );
  }

  return null;
}
