import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { emitEvent } from "@/lib/analytics/PersonaAnalyticsEngine";

const VALID_ROLES = new Set(["MEMBER", "ARTIST", "ADVERTISER", "SPONSOR", "VENUE", "PERFORMER", "FAN"]);

export async function POST(req: NextRequest) {
  let body: { role?: string; userId?: string } = {};
  try { body = await req.json(); } catch { /* no-op */ }

  const { role, userId } = body;
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
  return NextResponse.json({ ok: true, role: normalizedRole, updatedAt: new Date().toISOString() });
}
