export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * P0 identity hardening:
 * - Never serialize internal/admin emails to non-admin clients
 * - Return only current scoped user identity
 */
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
 * GET /api/auth/session
 * Returns stable auth state. Always 200 — never 401 — so frontend polling never crashes.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;
  const role = (req.cookies.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const tier = req.cookies.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = req.cookies.get('tmi_user_email')?.value ?? '';

  const csrfToken = 'tmi-phase1-csrf';

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ authenticated: false, csrfToken, user: null, expires: null });
  }

  const scopedEmail = redactEmailForRole(rawEmail, role);
  const userId = sessionId.substring(0, 8);
  const displayName = scopedEmail ? scopedEmail.split('@')[0] : userId;

  return NextResponse.json({
    authenticated: true,
    csrfToken,
    user: {
      id: userId,
      email: scopedEmail,
      name: displayName,
      role,
      tier,
      onboardingState: 'complete',
    },
    role,
    tier,
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  });
}
