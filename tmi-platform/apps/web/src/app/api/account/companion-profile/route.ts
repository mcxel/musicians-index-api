import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { resolveCompanionProvisioningDecision } from "@/lib/auth/resolveCompanionProvisioningDecision";
import { provisionRoleResources, type ProvisionAccountType } from "@/lib/auth/provisionRoleResources";
import {
  resolveCompanionProfileOffers,
  type CompanionProfileType,
} from "@/lib/account/resolveCompanionProfileOffer";

const ROLE_TO_HUB: Record<string, string> = {
  PERFORMER: "/hub/performer",
  FAN: "/hub/fan",
};

/**
 * GET /api/account/companion-profile
 *
 * Returns the current FAN/PERFORMER companion-profile offers (price/free
 * status) so the account menu can render "ADD PERFORMER FREE" or
 * "ADD PERFORMER — $X.XX" without hardcoding either.
 *
 * Response: { offers: { FAN: CompanionOffer, PERFORMER: CompanionOffer } }
 */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ offers: resolveCompanionProfileOffers() });
}

/**
 * POST /api/account/companion-profile
 *
 * Provisions a missing FAN or PERFORMER companion profile for the
 * authenticated account — this is how "ADD PERFORMER FREE"/"ADD FAN FREE"
 * must work, never by calling /api/auth/switch-role for a role the account
 * doesn't hold yet (that endpoint correctly 403s in that case; it switches
 * among owned roles, it doesn't create new ones).
 *
 * Unlike /api/admin/convert-role (admin-only, REPLACES the primary role),
 * this is additive only: the account's existing primary `role` and `tier`
 * are never touched. It only adds a UserRole row for the companion profile,
 * runs the same Rule 26 provisionRoleResources() used at signup, and
 * optionally switches activeRole into the newly created profile.
 *
 * Body: { targetProfile: "FAN" | "PERFORMER", switchToNewProfile?: boolean }
 * Response: { ok, provisioned, alreadyOwned, targetProfile, offer, activeRole, hubUrl }
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { targetProfile?: string; switchToNewProfile?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetProfile = (body.targetProfile ?? "").toUpperCase();
  const switchToNewProfile = body.switchToNewProfile ?? true;

  const userId = auth.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      userRoles: { select: { role: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const accountRealRoles = Array.from(
    new Set(
      [user.role as string, ...user.userRoles.map((r) => r.role as string)].map((r) =>
        r.toUpperCase(),
      ),
    ),
  );

  const decision = resolveCompanionProvisioningDecision({
    authenticated: true,
    targetProfile,
    accountRealRoles,
  });

  if (!decision.allowed) {
    return NextResponse.json({ error: decision.error }, { status: decision.status });
  }

  const typedTarget = targetProfile as CompanionProfileType;
  const offer = resolveCompanionProfileOffers()[typedTarget];

  // Scope-honest: no companion-profile pricing/checkout flow exists yet.
  // If the canonical offer resolver ever reports a paid companion profile,
  // fail closed rather than silently provisioning it for free or fabricating
  // a checkout — this is a real limitation, not a decorative check.
  if (!offer.isFree) {
    return NextResponse.json(
      { error: "This companion profile requires purchase, which isn't available yet." },
      { status: 402 },
    );
  }

  if (decision.alreadyOwned) {
    return NextResponse.json({
      ok: true,
      provisioned: false,
      alreadyOwned: true,
      targetProfile: typedTarget,
      offer,
      activeRole: switchToNewProfile ? typedTarget : undefined,
      hubUrl: switchToNewProfile ? ROLE_TO_HUB[typedTarget] : undefined,
    });
  }

  // Additive only — never touches the account's existing primary role/tier.
  await prisma.userRole.upsert({
    where: { userId_role: { userId, role: typedTarget as any } },
    create: { userId, role: typedTarget as any },
    update: {},
  });

  const provisionResult = await provisionRoleResources(userId, typedTarget as ProvisionAccountType);

  try {
    // No dedicated AuditLogAction enum value exists for this yet (schema
    // changes are out of scope for this fix) -- reuse USER_ROLE_CHANGED,
    // distinguished via details.changeType, rather than add a new enum
    // member and its migration mid-feature.
    await prisma.auditLog.create({
      data: {
        action: "USER_ROLE_CHANGED" as any,
        actorId: userId,
        targetId: userId,
        details: ({
          changeType: "companion_profile_added",
          targetProfile: typedTarget,
          offer,
          provisionOk: provisionResult.ok,
        }) as any,
      },
    });
  } catch {
    // Audit failure is non-blocking — the provisioning has already committed.
  }

  let activeRole: string | undefined;
  let hubUrl: string | undefined;

  if (switchToNewProfile) {
    await prisma.user.update({
      where: { id: userId },
      data: { activeRole: typedTarget as any },
    });
    activeRole = typedTarget;
    hubUrl = ROLE_TO_HUB[typedTarget];
  }

  const response = NextResponse.json({
    ok: provisionResult.ok,
    provisioned: true,
    alreadyOwned: false,
    targetProfile: typedTarget,
    offer,
    activeRole,
    hubUrl,
    provisionSteps: provisionResult.steps,
  });

  if (switchToNewProfile) {
    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
    response.cookies.set("tmi_role", typedTarget.toLowerCase(), {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
  }

  return response;
}
