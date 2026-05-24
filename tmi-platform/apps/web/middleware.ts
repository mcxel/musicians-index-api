import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin'];
const PROTECTED_PATHS = [
  '/hub',
  '/dashboard',
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
];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isExplicitAdminPath =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/api/admin' ||
    pathname.startsWith('/api/admin/');

  if (isExplicitAdminPath) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const tokenRole = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        const denied = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        denied.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
        denied.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
        denied.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
        denied.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
        return denied;
      }
      const signin = new URL('/auth', req.url);
      signin.searchParams.set('next', pathname);
      const redirected = NextResponse.redirect(signin, 307);
      redirected.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
      redirected.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
      redirected.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
      redirected.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
      return redirected;
    }

    if (tokenRole !== 'ADMIN' && tokenRole !== 'STAFF') {
      if (pathname.startsWith('/api/')) {
        const denied = NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
        denied.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
        denied.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
        denied.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
        denied.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
        return denied;
      }
      const safe = NextResponse.redirect(new URL('/home/1', req.url), 307);
      safe.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
      safe.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
      safe.cookies.set('tmi_session', '', { path: '/', maxAge: 0, httpOnly: false });
      safe.cookies.set('tmi_session_id', '', { path: '/', maxAge: 0, httpOnly: false });
      return safe;
    }
  }

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

  const nextParam = req.nextUrl.searchParams.get('next');
  if (nextParam && (!nextParam.startsWith('/') || nextParam.startsWith('//'))) {
    return NextResponse.json({ error: 'Invalid redirect target' }, { status: 400 });
  }

  if (matchesAny(pathname, AUTH_WHITELIST)) {
    return NextResponse.next();
  }

  const isAdmin     = matchesAny(pathname, ADMIN_PATHS);
  const isProtected = matchesAny(pathname, PROTECTED_PATHS);

  if (isAdmin || isProtected) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const tokenRole     = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signin = new URL('/auth', req.url);
      signin.searchParams.set('next', pathname);
      return NextResponse.redirect(signin, 307);
    }

    if (isAdmin && tokenRole !== 'ADMIN' && tokenRole !== 'STAFF') {
      if (pathname.startsWith('/api/')) {
        const denied = NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
        denied.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
        denied.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
        return denied;
      }

      const safe = NextResponse.redirect(new URL('/home/1', req.url), 307);
      // sanitize leaked role/email cookies for non-admin session attempting admin routes
      safe.cookies.set('tmi_role', 'USER', { path: '/', httpOnly: false });
      safe.cookies.set('tmi_user_email', '', { path: '/', maxAge: 0, httpOnly: false });
      return safe;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/hub/:path*',
    '/dashboard/:path*',
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
