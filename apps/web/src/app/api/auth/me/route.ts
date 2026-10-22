export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  entitlementEvidenceFromUser,
  resolveTierFromDb,
} from '@/lib/auth/resolveAuthoritativeTier';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';
import {
  SESSION_IDENTITY_COOKIE,
  verifySignedUserIdentity,
} from '@/lib/auth/verifiedSessionIdentity';
import { resolveCanonicalSession } from '@/lib/auth/getTmiAuth';

function isPrivilegedRole(role: string): boolean {
  const normalized = role.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'STAFF';
}

function isInternalEmail(email: string): boolean {
  const v = email.trim().toLowerCase();
  if (!v.includes('@')) return false;
  return (
    v.endsWith('@themusiciansindex.com') ||
    v.endsWith('@berntoutglobal.com') ||
    v.includes('+admin@')
  );
}

function redactEmailForRole(email: string, role: string): string {
  if (!email) return '';
  if (isPrivilegedRole(role)) return email;
  if (isInternalEmail(email)) return '';
  return email;
}

/**
 * GET /api/auth/me
 * Self-only identity endpoint with email redaction for non-admin users.
 * Display name uses the same resolver as /api/auth/session — never raw email local-part leaks.
 *
 * SECURITY (2026-09-23, Batch 2): identity is resolved exclusively from the
 * HMAC-signed tmi_uid_sig cookie — never from tmi_session_id (an opaque
 * token that never matches a real User.id) or the plain, client-writable
 * tmi_user_email cookie. Previously this route matched
 * `OR: [{ id: sessionId }, { email: rawEmail }]`, which in practice let
 * anyone set tmi_user_email to a victim's address and be treated as that
 * victim. A missing/forged signature now returns unauthenticated; there is
 * no fallback that trusts client-supplied identity.
 */
export async function GET(req: NextRequest) {
  const verifiedUserId = verifySignedUserIdentity(req.cookies.get(SESSION_IDENTITY_COOKIE)?.value);
  const cookieRole = req.cookies.get('tmi_role')?.value ?? null;
  if (!verifiedUserId) {
    return NextResponse.json(
      { authenticated: false, authority: 'unauthenticated', reason: 'missing_cookie', user: null },
      { status: 200 },
    );
  }
  const decision = await resolveCanonicalSession(verifiedUserId, cookieRole);

  if (decision.outcome !== 'authenticated') {
    return NextResponse.json(
      {
        authenticated: false,
        authority: decision.outcome === 'unavailable' ? 'unavailable' : 'unauthenticated',
        reason: decision.reason,
        user: null,
      },
      { status: 200 },
    );
  }

  const dbUser = decision.user;
  const role = dbUser.role;
  const tier = resolveTierFromDb(dbUser.email, dbUser.tier, entitlementEvidenceFromUser(dbUser));
  const email = redactEmailForRole(dbUser.email, role);
  const name = resolveSessionDisplayName({
    email: dbUser.email,
    dbName: dbUser.name,
    userId: dbUser.id,
  });

  return NextResponse.json(
    {
      authenticated: true,
      authority: 'authenticated',
      user: {
        id: dbUser.id,
        name,
        email,
        role,
        tier,
      },
    },
    { status: 200 },
  );
}
