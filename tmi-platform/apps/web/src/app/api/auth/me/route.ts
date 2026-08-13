export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTierFromDb } from '@/lib/auth/resolveAuthoritativeTier';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';
import prisma from '@/lib/prisma';

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
 */
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;
  const role = (req.cookies.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const cookieTier = req.cookies.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = req.cookies.get('tmi_user_email')?.value ?? '';
  // P0 Identity/Entitlement Integrity: cookie is only a fallback if the
  // fresh DB read below fails — it's not the authority.
  let tier: string = cookieTier;

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const email = redactEmailForRole(rawEmail, role);
  let id = sessionId;
  let dbDisplayName: string | null = null;

  try {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionId },
          ...(rawEmail ? [{ email: rawEmail }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        name: true,
        tier: true,
        userProfile: { select: { displayName: true } },
      },
    });
    if (dbUser?.id) id = dbUser.id;
    dbDisplayName =
      dbUser?.displayName ??
      dbUser?.userProfile?.displayName ??
      dbUser?.name ??
      null;
    if (dbUser) {
      tier = resolveTierFromDb(dbUser.email ?? rawEmail, dbUser.tier);
    }
  } catch {
    // Keep session fallback identity when DB is unavailable.
  }

  const name = resolveSessionDisplayName({
    email: rawEmail,
    dbDisplayName,
    userId: id,
  });

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
