import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

const VALID_TIERS = ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const;
type Tier = (typeof VALID_TIERS)[number];

/**
 * POST /api/admin/users/grant-tier
 *
 * Marcel-only: grant a complimentary tier (any level, including DIAMOND lifetime)
 * to one or more email addresses.
 *
 * Body: { grants: Array<{ email: string; tier: Tier; note?: string }> }
 *
 * Security: admin role required. Each grant is written to AuditLog.
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: { grants: { email: string; tier: string; note?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body?.grants) || body.grants.length === 0) {
    return NextResponse.json({ error: "grants array required" }, { status: 400 });
  }

  if (body.grants.length > 50) {
    return NextResponse.json({ error: "Max 50 grants per request" }, { status: 400 });
  }

  const results: { email: string; status: "granted" | "not_found" | "error"; tier?: string }[] = [];

  for (const grant of body.grants) {
    const { email, tier, note } = grant;

    if (!email || typeof email !== "string") {
      results.push({ email: email ?? "(missing)", status: "error" });
      continue;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedTier = (tier ?? "").toUpperCase() as Tier;

    if (!VALID_TIERS.includes(normalizedTier)) {
      results.push({ email: normalizedEmail, status: "error" });
      continue;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, tier: true },
      });

      if (!user) {
        results.push({ email: normalizedEmail, status: "not_found" });
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { tier: normalizedTier },
      });

      // Audit trail (best-effort)
      await prisma.auditLog.create({
        data: {
          actorId: auth.user.id,
          targetId: user.id,
          action: "ADMIN_GRANT_TIER",
          details: {
            grantedBy: auth.user.email,
            previousTier: user.tier,
            newTier: normalizedTier,
            note: note ?? null,
            grantedAt: new Date().toISOString(),
          },
        },
      }).catch(() => {});

      results.push({ email: normalizedEmail, status: "granted", tier: normalizedTier });
    } catch {
      results.push({ email: normalizedEmail, status: "error" });
    }
  }

  const grantedCount = results.filter((r) => r.status === "granted").length;

  return NextResponse.json({
    ok: true,
    grantedCount,
    results,
  });
}
