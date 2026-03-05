import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Duplicate of src middleware to ensure Next picks it up when building at app root
const ADMIN_PATHS = ['/admin', '/api/admin', '/api/promo', '/api/hub/registry'];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const matched = ADMIN_PATHS.some(p => pathname.startsWith(p));
  if (!matched) return NextResponse.next();

  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return new NextResponse('Unauthorized', { status: 401 });
    const role = (token.role || '').toString().toUpperCase();
    if (role === 'ADMIN' || role === 'STAFF') return NextResponse.next();
    return new NextResponse('Forbidden', { status: 403 });
  } catch (err) {
    console.error('middleware auth error', err);
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/promo/:path*', '/api/hub/registry'],
};
