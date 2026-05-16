import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ── Route protection tiers ───────────────────────────────────────────────────

const ADMIN_PATHS = ['/admin', '/api/admin'];
const PROTECTED_PATHS = [
  '/api/payments',
  '/api/rewards',
  '/api/tickets',
  '/api/learning',
  '/api/recovery',
  '/api/visuals',
  '/api/promos',
  '/api/stripe',
];

const AUTH_WHITELIST = [
  '/auth',
  '/api/auth',
  '/health',
  '/support/account-recovery',
  '/api/admin/phase1-invite',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function securityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

// ── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Legacy path redirects
  if (pathname === '/account/recovery') {
    return NextResponse.redirect(
      new URL('/support/account-recovery' + (search || ''), req.url),
      307,
    );
  }

  if (pathname === '/auth/login') {
    return NextResponse.redirect(
      new URL('/auth/signin' + (search || ''), req.url),
      301,
    );
  }

  // 2. Open redirect guard on `next` param
  const nextParam = req.nextUrl.searchParams.get('next');
  if (nextParam && (!nextParam.startsWith('/') || nextParam.startsWith('//'))) {
    return NextResponse.json({ error: 'Invalid redirect target' }, { status: 400 });
  }

  // 3. Auth-whitelisted paths — pass through
  if (matchesAny(pathname, AUTH_WHITELIST)) {
    return securityHeaders(NextResponse.next());
  }

  // 4. Admin + protected path enforcement
  const isAdmin     = matchesAny(pathname, ADMIN_PATHS);
  const isProtected = matchesAny(pathname, PROTECTED_PATHS);

  if (isAdmin || isProtected) {
    let tokenRole  = '';
    let tokenValid = false;

    try {
      const jwt = await getToken({
        req: req as Parameters<typeof getToken>[0]['req'],
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (jwt) {
        tokenRole  = ((jwt.role as string) || '').toUpperCase();
        tokenValid = true;
      }
    } catch {
      // fall through to cookie check
    }

    // Fallback: custom session cookie from /api/auth/signin
    if (!tokenValid && req.cookies.get('tmi_session')?.value) {
      tokenRole  = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
      tokenValid = true;
    }

    if (!tokenValid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signin = new URL('/auth', req.url);
      signin.searchParams.set('next', pathname);
      return NextResponse.redirect(signin, 307);
    }

    if (isAdmin && tokenRole !== 'ADMIN' && tokenRole !== 'STAFF') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/home/1', req.url), 307);
    }
  }

  return securityHeaders(NextResponse.next());
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
