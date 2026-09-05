export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveTierFromDb } from "@/lib/auth/resolveAuthoritativeTier";
import { getProfileConfig, saveProfileConfig } from "@/lib/profile/ProfileConfigService";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function resolveOwner(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, tier: true },
  });
  return user ?? null;
}

// ─── GET /api/profile/config ──────────────────────────────────────────────────

/**
 * Returns the authenticated owner's current public profile config.
 * If no config exists yet, returns canonical defaults — never 404.
 */
export async function GET(req: NextRequest) {
  const user = await resolveOwner(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const config = await getProfileConfig(user.id);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("[api/profile/config GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to load config." }, { status: 500 });
  }
}

// ─── PUT /api/profile/config ──────────────────────────────────────────────────

/**
 * Persists a profile config update for the authenticated owner.
 * Validates all fields and style pack entitlements server-side.
 * Never accepts a userId in the request body — always uses the cookie session.
 */
export async function PUT(req: NextRequest) {
  const user = await resolveOwner(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  // Reject if client tried to supply a userId (OWASP: mass-assignment guard)
  if ("userId" in body || "id" in body) {
    return NextResponse.json({ ok: false, error: "userId must not be supplied by the client." }, { status: 400 });
  }

  const tier = resolveTierFromDb(user.email ?? "", user.tier);

  try {
    const result = await saveProfileConfig(user.id, tier, body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status ?? 422 });
    }
    return NextResponse.json({ ok: true, config: result.config });
  } catch (err) {
    console.error("[api/profile/config PUT]", err);
    return NextResponse.json({ ok: false, error: "Failed to save config." }, { status: 500 });
  }
}
