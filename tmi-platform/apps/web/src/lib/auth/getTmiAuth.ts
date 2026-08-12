import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { resolveTierFromDb } from '@/lib/auth/resolveAuthoritativeTier';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';

export interface TmiAuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tier: string;
  };
}

// Shared identity resolution for server components/route handlers that don't
// have direct access to a NextRequest — same cookie contract as
// /api/auth/me and /api/auth/session (tmi_session_id, tmi_session,
// tmi_role, tmi_tier, tmi_user_email), just callable without a req object.
export async function getTmiAuth(): Promise<TmiAuthSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('tmi_session_id')?.value;
  const sessionToken = cookieStore.get('tmi_session')?.value;
  if (!sessionId || !sessionToken) return null;

  const role = (cookieStore.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const cookieTier = cookieStore.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = cookieStore.get('tmi_user_email')?.value ?? '';
  // P0 Identity/Entitlement Integrity: cookie is only a fallback if the
  // fresh DB read below fails — it's not the authority.
  let tier: string = cookieTier;

  let id = sessionId;
  let dbDisplayName: string | null = null;
  if (rawEmail) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: rawEmail },
        select: {
          id: true,
          displayName: true,
          tier: true,
          userProfile: { select: { displayName: true } },
        },
      });
      if (dbUser?.id) id = dbUser.id;
      dbDisplayName = dbUser?.displayName ?? dbUser?.userProfile?.displayName ?? null;
      if (dbUser) {
        tier = resolveTierFromDb(rawEmail, dbUser.tier);
      }
    } catch {
      // Keep full session fallback identity when DB is unavailable.
    }
  }

  return {
    user: {
      id,
      name: resolveSessionDisplayName({
        email: rawEmail,
        dbDisplayName,
        userId: id,
      }),
      email: rawEmail,
      role,
      tier,
    },
  };
}
