import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/payments/:path*',
    '/api/rewards/:path*',
    '/api/tickets/:path*',
    '/api/learning/:path*',
    '/api/recovery/:path*',
    '/api/visuals/:path*',
    '/api/promos/:path*',
    '/api/stripe/:path*',
    '/account/recovery',
    '/auth/login',
    '/support/account-recovery/:path*',
  ],
};
