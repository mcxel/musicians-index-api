import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const parsedRole   = request.cookies.get('tmi_role')?.value ?? '(none)';

  return NextResponse.json({
    ok: true,
    cookieHeader,
    parsedRole,
    allCookieKeys: request.cookies.getAll().map(c => c.name),
  });
}
