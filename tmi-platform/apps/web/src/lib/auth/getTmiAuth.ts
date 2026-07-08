import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';

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
  const cookieUserId = cookieStore.get('tmi_user_id')?.value;

  const role = (cookieStore.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const cookieTier = cookieStore.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = cookieStore.get('tmi_user_email')?.value ?? '';
  const tier = isFounderDiamondEmail(rawEmail) ? 'DIAMOND' : cookieTier;

  let id = cookieUserId || sessionId;
  if (rawEmail && !cookieUserId) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { email: rawEmail }, select: { id: true } });
      if (dbUser?.id) id = dbUser.id;
    } catch {
      // Keep full session fallback identity when DB is unavailable.
    }
  }

  return {
    user: {
      id,
      name: rawEmail ? rawEmail.split('@')[0] : `user-${id.substring(0, 8)}`,
      email: rawEmail,
      role,
      tier,
    },
  };
}
