import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { emitEvent, } from "@/lib/analytics/PersonaAnalyticsEngine";
import prisma from "@/lib/prisma";
import { updateUserRole, type UserRole } from "@/lib/auth/UserStore";

const VALID_ROLES = new Set(["MEMBER", "ARTIST", "ADVERTISER", "SPONSOR", "VENUE", "PERFORMER", "FAN", "WRITER", "PROMOTER"]);

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

export async function POST(req: NextRequest) {
  let body: { role?: string; userId?: string } = {};
  try { body = await req.json(); } catch { /* no-op */ }

  const { role, userId } = body;

  if (role?.toUpperCase() === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot assign admin role via onboarding' }, { status: 403 });
  }

  if (!role || !VALID_ROLES.has(role.toUpperCase())) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const normalizedRole = role.toUpperCase();

  // Persist role to both DB and in-memory cache so next login gets the right role
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const lowerRole = normalizedRole.toLowerCase() as UserRole;
    updateUserRole(email, lowerRole);
    
    // Asynchronously write to DB
    (async () => {
      try {
        const u = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (u) {
          await prisma.user.update({
            where: { id: u.id },
            data: {
              role: normalizedRole as any,
              onboardingState: 'INCOMPLETE',
            }
          });
          const existingProfile = await prisma.userProfile.findUnique({
            where: { userId: u.id },
            select: { socialLinks: true },
          });
          const currentLinks = (existingProfile?.socialLinks as Record<string, any>) ?? {};
          await prisma.userProfile.upsert({
            where: { userId: u.id },
            create: {
              userId: u.id,
              socialLinks: { ...currentLinks, onboarding_step: '2' },
            },
            update: {
              socialLinks: { ...currentLinks, onboarding_step: '2' },
            }
          });
        }
      } catch (err) {
        console.error('Failed to update user role/onboarding in DB:', err);
      }
    })();
  }

  const emitTelemetry = (source: string) => {
    emitEvent({
      eventName: "onboarding.role_assigned",
      domain: "onboarding",
      userId: userId ?? "anonymous",
      activePersonaOverride: "fan",
      meta: { role: normalizedRole, source },
    });
  };

  // Try backend first
  try {
    const apiRes = await proxyToApi(req as unknown as Request, "/onboarding/role");
    if (apiRes.status < 300) {
      emitTelemetry("backend");
      apiRes.headers.append('Set-Cookie', `tmi_role=${normalizedRole.toLowerCase()}; Path=/; SameSite=Lax; Max-Age=604800`);
      apiRes.headers.append('Set-Cookie', `tmi_onboarding_state=incomplete; Path=/; SameSite=Lax; Max-Age=604800`);
      return apiRes;
    }
  } catch { /* fall through */ }

  emitTelemetry("local_fallback");
  const fallbackRes = NextResponse.json({ ok: true, role: normalizedRole, updatedAt: new Date().toISOString() });
  fallbackRes.cookies.set('tmi_role', normalizedRole.toLowerCase(), COOKIE_OPTS);
  fallbackRes.cookies.set('tmi_onboarding_state', 'incomplete', COOKIE_OPTS);
  return fallbackRes;
}
