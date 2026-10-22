import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { shouldNoIndexRoute } from './src/lib/seo/SeoIndexingRules';
import { isFanShellRole, isPerformerShellRole } from './src/lib/auth/sessionRole';
import { businessHubRequiresAuthentication } from './src/lib/workspace/business/businessCapabilityGate';

const ADMIN_PATHS = ['/admin', '/api/admin', '/contest/admin'];

// Rule 26 — Identity Policy: Avatar ownership and cosmetic inventory are
// Fan-only surfaces.  Performers are represented by real photos/video.
// Admins/Staff may access for QA oversight.
const FAN_ONLY_PATHS = [
  '/avatar',
  '/avatar-builder',
  '/avatar-center',
  '/inventory/cosmetics',
  '/inventory/emotes',
  '/inventory/nfts',
  '/inventory/props',
  '/settings/avatar',
];
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
  // Venue Preview & Certification Runtime — performer/admin only (Rule 26).
  '/venue/preview',
  '/live/venue-preview',
];

const AUTH_WHITELIST = [
  '/auth',
  '/api/auth',
  '/health',
  '/support/account-recovery',
  '/privacy',
  '/terms',
  '/guidelines',
  '/community-guidelines',
  '/about',
  '/contact',
  '/dmca',
  '/cookie-policy',
  '/refund-policy',
  '/whats-new',
  // Stripe calls these directly — it authenticates via Stripe-Signature
  // header verification inside the route handler, never a session cookie.
  '/api/stripe/webhook',
  '/api/stripe/webhook-health',
  '/api/debug',
];

// These paths are always reachable regardless of platform visibility
const VISIBILITY_WHITELIST = [
  '/coming-soon',
  '/auth',
  '/api/auth',
  '/signup',
  '/join',
  '/health',
  '/support',
  '/privacy',
  '/terms',
  '/guidelines',
  '/community-guidelines',
  '/about',
  '/contact',
  '/dmca',
  '/cookie-policy',
  '/refund-policy',
  '/whats-new',
  '/api/admin',
  '/admin',
  '/contest',
  '/_next',
  '/favicon.ico',
  '/api/stripe/webhook',
  '/api/stripe/webhook-health',
  '/cert',
  '/jumbotron',
  '/battles',
  '/cypher',
];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function normalizeRef(input: string | null): string | null {
  if (!input) return null;
  const value = input.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return value || null;
}

// Extract all user roles — always merges tmi_role (primary) + tmi_roles (multi-role).
// tmi_roles must never shadow the authoritative single-role cookie.
function getUserRoles(req: NextRequest): string[] {
  const roles = new Set<string>();

  const singleRole = req.cookies.get('tmi_role')?.value;
  if (singleRole) roles.add(singleRole.toUpperCase());

  try {
    const rolesJson = req.cookies.get('tmi_roles')?.value;
    if (rolesJson) {
      const parsed = JSON.parse(rolesJson);
      if (Array.isArray(parsed)) {
        parsed.forEach((r) => roles.add(String(r).toUpperCase()));
      }
    }
  } catch {
    // Ignore malformed tmi_roles — tmi_role fallback already added above.
  }

  return [...roles];
}

// Check if user has any of the required roles
function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return userRoles.some(r => requiredRoles.includes(r.toUpperCase()));
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
  const r = role.toUpperCase();
  if (r === 'PERFORMER' || r === 'ARTIST' || r === 'BAND') return '/hub/performer';
  if (r === 'WRITER') return '/hub/writer';
  if (r === 'VENUE') return '/hub/venue';
  if (r === 'PROMOTER') return '/hub/promoter';
  if (r === 'SPONSOR') return '/hub/sponsor';
  if (r === 'ADVERTISER') return '/hub/advertiser';
  // FAN / USER / ADMIN / STAFF land on Fan Command Center.
  // Admin does not auto-enter Overseer — that remains an explicit GPS destination.
  return '/hub/fan';
}

function resolvePrimaryPathForRoles(userRoles: string[]): string | null {
  const precedence = ['PERFORMER', 'ARTIST', 'BAND', 'FAN', 'USER', 'MEMBER', 'SPONSOR', 'ADVERTISER', 'VENUE', 'WRITER', 'PROMOTER', 'ADMIN', 'STAFF'];
  const match = precedence.find((role) => hasAnyRole(userRoles, [role]));
  if (match) return roleDashboardPath(match);
  return null;
}

// Internal design-reference paths that must never be publicly served.
// These files live in public/ for historical/tooling reasons but contain
// HTML prototypes, MD directives, and design-reference images — not runtime assets.
const QUARANTINED_PUBLIC_PREFIXES = [
  '/blueprints/',
  '/assets/Tmi Homepage',
  '/assets/_converted_webp/',
  '/assets/game show and venue skins/',
  '/assets/Host , Julius , and extra/',
  '/assets/Venue Skins Plus Seating/',
  '/assets/Profiles/',
  '/assets/The Musician',
];

function isQuarantined(pathname: string): boolean {
  return QUARANTINED_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function applyCacheHeaders(response: NextResponse, pathname: string): NextResponse {
  if (
    pathname.startsWith("/hub/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/checkout")
  ) {
    response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  } else if (!pathname.startsWith("/_next/") && !pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }
  return response;
}

function applyCrawlHeaders(response: NextResponse, pathname: string): NextResponse {
  if (shouldNoIndexRoute(pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

/** Forward pathname to RSC so root layout can skip platform chrome on auth. */
function nextWithPathname(req: NextRequest, pathname: string): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}


/**
 * Resolves the public, client-facing origin behind reverse proxies (Cloudflare tunnels, etc.).
 * Guarantees that internal listener origins (localhost:3101, 127.0.0.1:3101) never leak
 * to the mobile browser / physical phone in redirect Location headers.
 */
function resolvePublicOrigin(req: NextRequest): string {
  const rawForwardedHost = req.headers.get('x-forwarded-host');
  const forwardedHost = rawForwardedHost ? rawForwardedHost.split(',')[0].trim().replace(/[^a-zA-Z0-9.\-:]/g, '') : '';
  const host = forwardedHost || req.headers.get('host') || req.nextUrl.host;

  const rawForwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedProto = rawForwardedProto ? rawForwardedProto.split(',')[0].trim().toLowerCase() : '';
  const proto = (forwardedProto === 'https' || forwardedProto === 'http')
    ? forwardedProto
    : (req.nextUrl.protocol ? req.nextUrl.protocol.replace(':', '') : 'http');

  if (host) {
    return `${proto}://${host}`;
  }
  return req.nextUrl.origin;
}

/**
 * Builds a safe redirect response that:
 * 1. Preserves relative internal redirect paths in the Location header (e.g. '/auth?next=...')
 *    so the client never escapes its current origin.
 * 2. Uses the public origin (from trusted forwarded headers) for the absolute fallback URL,
 *    ensuring internal listener addresses (localhost:3101) are never leaked.
 * 3. Prevents open redirects by rejecting external or protocol-relative targets ('//').
 */
function safeRedirect(
  req: NextRequest,
  destination: string | URL,
  status: 301 | 302 | 307 | 308 = 307
): NextResponse {
  const publicOrigin = resolvePublicOrigin(req);
  let targetUrl: URL;

  if (typeof destination === 'string') {
    if (destination.startsWith('/') && !destination.startsWith('//')) {
      targetUrl = new URL(destination, publicOrigin);
    } else {
      try {
        const parsed = new URL(destination, publicOrigin);
        if (parsed.origin === publicOrigin) {
          targetUrl = parsed;
        } else {
          targetUrl = new URL('/home/1', publicOrigin);
        }
      } catch {
        targetUrl = new URL('/home/1', publicOrigin);
      }
    }
  } else {
    const relativePath = destination.pathname + destination.search + destination.hash;
    targetUrl = new URL(relativePath, publicOrigin);
  }

  return NextResponse.redirect(targetUrl, status);
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const proofMode = req.nextUrl.searchParams.get('proof') === '1';
  const isLocalHost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';

  // Never intercept Next internals — matcher already excludes `_next/static` /
  // `_next/image`, but keep an explicit short-circuit so auth/quarantine never
  // rewrites chunks/CSS into HTML (hydration killer on hubs).
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Local visual-cert bypass for performer command center proof runs.
  // Never active outside localhost.
  if (proofMode && isLocalHost && (pathname === '/hub/performer' || pathname.startsWith('/hub/performer/'))) {
    return nextWithPathname(req, pathname);
  }

  // Blueprint/design-reference quarantine — return 404 before any other check.
  if (isQuarantined(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Logged-in landing redirect ──────────────────────────────────────────────
  // Authenticated visits to `/` and home land on the canonical role hub,
  // never the legacy /dashboard workspace container.
  const isMarketingOrLobby =
    pathname === '/' ||
    pathname === '/lobby' ||
    pathname === '/home' ||
    pathname === '/home/1' ||
    pathname === '/home/1-2' ||
    pathname === '/home/2' ||
    pathname === '/home/3' ||
    pathname === '/home/4' ||
    pathname === '/home/5';

  if (isMarketingOrLobby) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    if (sessionCookie) {
      const hub = resolvePrimaryPathForRoles(getUserRoles(req)) ?? '/hub/fan';
      return applyCacheHeaders(safeRedirect(req, hub, 307), hub);
    }
  }
  if (pathname === '/') {
    return applyCacheHeaders(safeRedirect(req, '/home/1', 307), pathname);
  }
  // ────────────────────────────────────────────────────────────────────────────

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
    const userRoles = getUserRoles(req);
    const hasAdminAccess = hasAnyRole(userRoles, ['ADMIN', 'STAFF']);

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signin = new URL('/auth', resolvePublicOrigin(req));
      signin.searchParams.set('next', pathname);
      return safeRedirect(req, signin, 307);
    }

    if (!hasAdminAccess) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
      }
      return safeRedirect(req, '/home/1', 307);
    }
  }

  // Rule 26 — Fan-only path gating (avatar ownership, cosmetic inventory).
  // Non-fans who navigate directly to these paths are redirected to their
  // role hub.  Unauthenticated users are sent to sign-in.
  const isFanOnlyPath = FAN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (isFanOnlyPath) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    if (!sessionCookie) {
      const signin = new URL('/auth', resolvePublicOrigin(req));
      signin.searchParams.set('next', pathname);
      return safeRedirect(req, signin, 307);
    }
    const userRoles = getUserRoles(req);
    const isFan = hasAnyRole(userRoles, ['FAN']);
    const isAdminOrStaff = hasAnyRole(userRoles, ['ADMIN', 'STAFF']);
    if (!isFan && !isAdminOrStaff) {
      const redirectPath = resolvePrimaryPathForRoles(userRoles) ?? '/hub/fan';
      return safeRedirect(req, redirectPath, 307);
    }
  }

  if (pathname === '/dashboard') {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    if (sessionCookie) {
      const hub = resolvePrimaryPathForRoles(getUserRoles(req)) ?? '/hub/fan';
      return safeRedirect(req, hub, 307);
    }
  }

  const LEGACY_REDIRECTS: Record<string, string> = {
    '/dashboard/fan': '/hub/fan',
    '/dashboard/performer': '/hub/performer',
    '/dashboard/artist': '/hub/performer',
    '/dashboard/producer': '/hub/performer',
    '/dashboard/sponsor': '/hub/sponsor',
    '/dashboard/advertiser': '/hub/advertiser',
    '/dashboard/venue': '/hub/venue',
    '/dashboard/writer': '/hub/writer',
    '/dashboard/promoter': '/hub/promoter',
    '/fan/theater': '/hub/fan',
    '/fan/dashboard': '/hub/fan',
  };
  if (LEGACY_REDIRECTS[pathname]) {
    return safeRedirect(req, LEGACY_REDIRECTS[pathname], 307);
  }

  // Hub path multi-role routing: verify user has the role they're accessing
  const hubMatch = pathname.match(/^\/hub\/([a-z-]+)/);
  if (hubMatch) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const requestedHub = hubMatch[1];
    if (businessHubRequiresAuthentication(requestedHub) && !sessionCookie) {
      const signin = new URL('/auth', resolvePublicOrigin(req));
      signin.searchParams.set('next', pathname + (search || ''));
      return applyCacheHeaders(safeRedirect(req, signin, 307), pathname);
    }
    if (sessionCookie) {
      const requestedRole = requestedHub; // 'fan', 'performer', 'sponsor', etc.
      const userRoles = getUserRoles(req);

      if (userRoles.length === 0) {
        // Safe redirect to onboarding for active sessions with no role cookies set yet.
        // DO NOT delete tmi_session here — clearing tmi_session while the user is
        // completing onboarding forces an invalid logout and sends them back to sign-in.
        return safeRedirect(req, '/onboarding', 307);
      }

      // Map dashboard path to required roles
      const roleMap: Record<string, string[]> = {
        'fan': ['FAN', 'USER', 'MEMBER'], // USER/MEMBER are the fan shell (sessionRole FAN_ROLES)
        'performer': ['PERFORMER', 'ARTIST', 'BAND'],
        'sponsor': ['SPONSOR'],
        'advertiser': ['ADVERTISER'],
        'venue': ['VENUE'],
        'writer': ['WRITER'],
        'promoter': ['PROMOTER'],
      };

      const allowedRoles = roleMap[requestedRole] || [];
      // Admin/staff can preview any hub for oversight/QA without holding that
      // role themselves — otherwise "Fan Page"/"Performer Page" from the
      // Overseer Deck just bounces an admin straight back to /admin.
      const shellAccess = requestedRole === 'fan'
        ? userRoles.some((role) => isFanShellRole(role))
        : requestedRole === 'performer'
          ? userRoles.some((role) => isPerformerShellRole(role))
          : hasAnyRole(userRoles, allowedRoles);
      const hasAccess = shellAccess || hasAnyRole(userRoles, ['ADMIN', 'STAFF']);

      if (!hasAccess) {
        const redirectPath = resolvePrimaryPathForRoles(userRoles) ?? '/auth';

        if (redirectPath === pathname) {
          return nextWithPathname(req, pathname);
        }

        return safeRedirect(req, redirectPath, 307);
      }
    }
  }

  if (pathname === '/account/recovery') {
    return safeRedirect(req, '/support/account-recovery' + (search || ''), 307);
  }

  if (pathname === '/auth/login') {
    return safeRedirect(req, '/auth/signin' + (search || ''), 301);
  }

  if (pathname === '/contest/admin' || pathname.startsWith('/contest/admin/')) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const userRoles = getUserRoles(req);
    const hasAdminAccess = hasAnyRole(userRoles, ['ADMIN', 'STAFF']);

    if (!sessionCookie) {
      const signin = new URL('/auth/signin', resolvePublicOrigin(req));
      signin.searchParams.set('next', pathname);
      return safeRedirect(req, signin, 307);
    }

    if (!hasAdminAccess) {
      return safeRedirect(req, '/home/1', 307);
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
    if (sessionCookie) {
      const userRoles = getUserRoles(req);

      const redirectPath = resolvePrimaryPathForRoles(userRoles);
      if (!redirectPath) {
        // Safe redirect to onboarding for active sessions with no roles yet
        return safeRedirect(req, '/onboarding', 307);
      }

      const target = nextParam && !nextParam.startsWith('/auth') ? nextParam : redirectPath;
      if (target === pathname) {
        return nextWithPathname(req, pathname);
      }
      return safeRedirect(req, target, 307);
    }
  }

  // ── Visibility gate ─────────────────────────────────────────────────────────
  // tmi_visibility cookie is set by /api/admin/overseer when flags change.
  // Default: allow (cookie absent = site has never been locked down).
  const visibility = req.cookies.get('tmi_visibility')?.value ?? 'public';
  if (visibility === 'private' && !matchesAny(pathname, VISIBILITY_WHITELIST)) {
    const userRoles = getUserRoles(req);
    const isAdminUser = hasAnyRole(userRoles, ['ADMIN', 'STAFF']);
    if (!isAdminUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Platform not yet public', code: 'PRIVATE_MODE' }, { status: 503 });
      }
      return safeRedirect(req, '/coming-soon', 307);
    }
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (matchesAny(pathname, AUTH_WHITELIST)) {
    return withReferralCookies(applyCacheHeaders(applyCrawlHeaders(nextWithPathname(req, pathname), pathname), pathname));
  }

  const isAdmin     = matchesAny(pathname, ADMIN_PATHS);
  const isProtected = matchesAny(pathname, PROTECTED_PATHS);

  if (isAdmin || isProtected) {
    const sessionCookie = req.cookies.get('tmi_session')?.value;
    const userRoles = getUserRoles(req);

    if (!sessionCookie) {
      // Pricing/membership CTAs navigate to GET /api/stripe/checkout?priceId=…
      // as a real browser link. A JSON 401 dead-ends that purchase chain;
      // send them through auth and return to the same checkout URL after login.
      const isStripeCheckoutNav =
        pathname === '/api/stripe/checkout' ||
        pathname.startsWith('/api/stripe/checkout/');
      if (isStripeCheckoutNav) {
        const signin = new URL('/auth', resolvePublicOrigin(req));
        signin.searchParams.set('next', pathname + (search || ''));
        return safeRedirect(req, signin, 307);
      }
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signin = new URL('/auth', resolvePublicOrigin(req));
      // Preserve query (skin/cert/occ/roomId) so PREVIEW VENUE return does not flicker.
      signin.searchParams.set('next', pathname + (search || ''));
      return applyCacheHeaders(safeRedirect(req, signin, 307), pathname);
    }

    // Venue Preview — performer / venue / admin only (Rule 26). Fans never land here.
    const isVenuePreviewPath =
      pathname === '/venue/preview' ||
      pathname.startsWith('/venue/preview/') ||
      pathname === '/live/venue-preview' ||
      pathname.startsWith('/live/venue-preview/');
    if (isVenuePreviewPath) {
      const allowed = hasAnyRole(userRoles, [
        'PERFORMER',
        'ARTIST',
        'BAND',
        'VENUE',
        'ADMIN',
        'STAFF',
      ]);
      if (!allowed) {
        const redirectPath = resolvePrimaryPathForRoles(userRoles) ?? '/hub/fan';
        if (redirectPath === pathname) {
          return nextWithPathname(req, pathname);
        }
        return safeRedirect(req, redirectPath, 307);
      }
    }

    // Onboarding Enforcer Gate — Disabled to prevent locking users into the onboarding flow.
    // This allows users to view the dashboard and dismiss or continue setup at their own pace.
    // const onboardingStateCookie = req.cookies.get('tmi_onboarding_state')?.value;
    // const onboardingComplete = onboardingStateCookie === 'complete';
    // if (!onboardingComplete && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api/')) {
    //   const healUrl = new URL('/api/auth/onboarding-heal', req.url);
    //   healUrl.searchParams.set('next', pathname);
    //   return NextResponse.redirect(healUrl, 307);
    // }

    if (isAdmin && !hasAnyRole(userRoles, ['ADMIN', 'STAFF'])) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
      }

      return safeRedirect(req, '/home/1', 307);
    }
  }

  return withReferralCookies(applyCacheHeaders(applyCrawlHeaders(nextWithPathname(req, pathname), pathname), pathname));
}

export const config = {
  matcher: [
    // Static 3D/binary assets must bypass middleware — bobblehead_v0.glb (~2MB) was
    // starved under hub telemetry load when routed through auth/visibility checks,
    // so Fan Avatar Canister never received a GLB response (Playwright glb:[] / 60s timeout).
    '/((?!_next/static|_next/image|favicon\\.ico|google27b9fc359205edb8\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf|bin|hdr|ktx2|wasm)$).*)',
  ],
};
