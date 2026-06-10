import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { emitEvent } from "@/lib/analytics/PersonaAnalyticsEngine";

const VALID_ROLES = new Set(["MEMBER", "ARTIST", "ADVERTISER", "SPONSOR", "VENUE", "PERFORMER", "FAN"]);

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
      return apiRes;
    }
  } catch { /* fall through */ }

  emitTelemetry("local_fallback");
  const fallbackRes = NextResponse.json({ ok: true, role: normalizedRole, updatedAt: new Date().toISOString() });
  fallbackRes.cookies.set('tmi_role', normalizedRole.toLowerCase(), COOKIE_OPTS);
  return fallbackRes;
}
