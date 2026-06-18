import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin', '/contest/admin'];
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
  // Stripe calls these directly — it authenticates via Stripe-Signature
  // header verification inside the route handler, never a session cookie.
  // Blocking these with the generic /api/stripe session check returns 401
  // to every webhook delivery before signature verification can even run.
  '/api/stripe/webhook',
  '/api/stripe/webhook-health',
];

// These paths are always reachable regardless of platform visibility
const VISIBILITY_WHITELIST = [
  '/coming-soon',
  '/auth',
  '/api/auth',
  '/health',
  '/support',
  '/api/admin',
  '/admin',
  '/contest',
  '/_next',
  '/favicon.ico',
  // Stripe must always be able to deliver webhooks, even in private/coming-soon mode
  '/api/stripe/webhook',
  '/api/stripe/webhook-health',
];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function normalizeRef(input: string | null): string | null {
  if (!input) return null;
  const value = input.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return value || null;
}

function isPlaylistSurface(pathname: string): boolean {
  return (
    pathname.startsWith('/playlist') ||
    pathname.startsWith('/playlists') ||
    pathname.startsWith('/writers') ||
    pathname.startsWith('/profile')
  );
}

function roleDashboardPath(role: string): string {
  switch (role.toUpperCase()) {
    case 'ADMIN':
    case 'STAFF':
      return '/admin';
    case 'PERFORMER':
    case 'ARTIST':
      return '/hub/performer';
    case 'FAN':
      return '/hub/fan';
    case 'SPONSOR':
      return '/hub/sponsor';
    case 'PROMOTER':
      return '/hub/promoter';
    case 'ADVERTISER':
      return '/hub/advertiser';
    case 'VENUE':
      return '/hub/venue';
    case 'WRITER':
      return '/hub/writer';
    default:
      return '/hub/fan';
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const incomingRef = normalizeRef(req.nextUrl.searchParams.get('ref'));
  const incomingPlaylist = normalizeRef(req.nextUrl.searchParams.get('playlist'));
  const incomingCurator = normalizeRef(req.nextUrl.searchParams.get('curator'));

  const withReferralCookies = (res: NextResponse): NextResponse => {
    if (!incomingRef || !isPlaylistSurface(pathname)) return res;

    const secure = req.nextUrl.protocol === 'https:';
    res.cookies.set('tmi_ref', incomingRef, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure,
      httpOnly: false,
    });
    if (incomingPlaylist) {
      res.cookies.set('tmi_ref_playlist', incomingPlaylist, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure,
        httpOnly: false,
      });
    }
    if (incomingCurator) {
      res.cookies.set('tmi_ref_curator', incomingCurator, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure,
        httpOnly: false,
      });
    }
    return res;
  };

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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signin = new URL('/auth', req.url);
      signin.searchParams.set('next', pathname);
      return NextResponse.redirect(signin, 307);
    }

    if (tokenRole !== 'ADMIN' && tokenRole !== 'STAFF') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/home/1', req.url), 307);
    }
  }

  const LEGACY_REDIRECTS: Record<string, string> = {
    '/dashboard/fan': '/hub/fan',
    '/dashboard/performer': '/hub/performer',
    '/dashboard/artist': '/hub/performer',
    '/dashboard/sponsor': '/hub/sponsor',
    '/dashboard/advertiser': '/hub/advertiser',
    '/dashboard/venue': '/hub/venue',
    '/dashboard/writer': '/hub/writer',
    '/dashboard/promoter': '/hub/promoter',
    '/fan/theater': '/hub/fan',
    '/fan/dashboard': '/hub/fan',
  };
  if (LEGACY_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(LEGACY_REDIRECTS[pathname], req.url), 301);
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

  if (pathname === '/contest/admin' || pathname.startsWith('/contest/admin/')) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const tokenRole = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();

    if (!sessionCookie) {
      const signin = new URL('/auth/signin', req.url);
      signin.searchParams.set('next', pathname);
      return NextResponse.redirect(signin, 307);
    }

    if (tokenRole !== 'ADMIN' && tokenRole !== 'STAFF') {
      return NextResponse.redirect(new URL('/home/1', req.url), 307);
    }
  }

  const nextParam = req.nextUrl.searchParams.get('next');
  if (nextParam && (!nextParam.startsWith('/') || nextParam.startsWith('//'))) {
    return NextResponse.json({ error: 'Invalid redirect target' }, { status: 400 });
  }

  const isAuthSurface =
    pathname === '/auth' ||
    pathname === '/auth/signin' ||
    pathname === '/auth/login';

  if (isAuthSurface) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const tokenRole = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
    if (sessionCookie) {
      const target = nextParam || roleDashboardPath(tokenRole);
      return NextResponse.redirect(new URL(target, req.url), 307);
    }
  }

  // ── Visibility gate ─────────────────────────────────────────────────────────
  // tmi_visibility cookie is set by /api/admin/overseer when flags change.
  // Default: allow (cookie absent = site has never been locked down).
  const visibility = req.cookies.get('tmi_visibility')?.value ?? 'public';
  if (visibility === 'private' && !matchesAny(pathname, VISIBILITY_WHITELIST)) {
    const role = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
    const isAdminUser = role === 'ADMIN' || role === 'STAFF';
    if (!isAdminUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Platform not yet public', code: 'PRIVATE_MODE' }, { status: 503 });
      }
      return NextResponse.redirect(new URL('/coming-soon', req.url), 307);
    }
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (matchesAny(pathname, AUTH_WHITELIST)) {
    return withReferralCookies(NextResponse.next());
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
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
      }

      return NextResponse.redirect(new URL('/home/1', req.url), 307);
    }
  }

  return withReferralCookies(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|google27b9fc359205edb8\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
