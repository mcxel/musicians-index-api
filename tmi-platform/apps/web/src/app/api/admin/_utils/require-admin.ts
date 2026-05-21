import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(request: NextRequest): NextResponse | null {
  const cookieHeader =
    request.headers.get('cookie') ||
    request.headers.get('Cookie') ||
    '';

  const isAdmin =
    cookieHeader.includes('tmi_role=admin') ||
    cookieHeader.includes('tmi_role=ADMIN');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return null;
}
