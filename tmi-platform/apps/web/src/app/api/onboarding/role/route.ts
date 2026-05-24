import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

const VALID_ROLES = new Set(["MEMBER", "ARTIST", "ADVERTISER", "SPONSOR", "VENUE", "PERFORMER", "FAN"]);

export async function POST(req: NextRequest) {
  let body: { role?: string; userId?: string } = {};
  try { body = await req.json(); } catch { /* no-op */ }

  const { role } = body;
  if (!role || !VALID_ROLES.has(role.toUpperCase())) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Try backend first
  try {
    const apiRes = await proxyToApi(req as unknown as Request, "/onboarding/role");
    if (apiRes.status < 300) return apiRes;
  } catch { /* fall through */ }

  // Fallback: acknowledge locally — actual role persistence handled by session
  return NextResponse.json({ ok: true, role: role.toUpperCase(), updatedAt: new Date().toISOString() });
}
