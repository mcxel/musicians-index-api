export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
 */
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;
  const role = (req.cookies.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const tier = req.cookies.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = req.cookies.get('tmi_user_email')?.value ?? '';

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const email = redactEmailForRole(rawEmail, role);
  const id = sessionId.substring(0, 8);
  const name = email ? email.split('@')[0] : id;

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id,
        name,
        email,
        role,
        tier,
      },
    },
    { status: 200 }
  );
}
