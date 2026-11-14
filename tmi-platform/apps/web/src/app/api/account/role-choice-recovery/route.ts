import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  isGoogleAutoAssignedFanRecoveryEligible,
  ROLE_CHOICE_AUTHORITY_FIELD,
  ROLE_CHOICE_RECOVERY_PROMPT,
} from "@/lib/auth/roleChoiceAuthority";
import { provisionRoleResources } from "@/lib/auth/provisionRoleResources";
import { resolveCompanionProvisioningDecision } from "@/lib/auth/resolveCompanionProvisioningDecision";
import { resolveCompanionProfileOffers } from "@/lib/account/resolveCompanionProfileOffer";

/**
 * GET /api/account/role-choice-recovery
 * Returns whether the signed-in user is eligible for the Google auto-FAN
 * recovery prompt. Never prompts every Fan — see roleChoiceAuthority.
 */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ eligible: false, authenticated: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      role: true,
      onboardingState: true,
      passwordHash: true,
      userRoles: { select: { role: true } },
      accounts: { where: { provider: "google" }, select: { id: true }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ eligible: false, authenticated: true });
  }

  const eligible = isGoogleAutoAssignedFanRecoveryEligible({
    role: String(user.role),
    onboardingState: String(user.onboardingState),
    passwordHash: user.passwordHash,
    hasGoogleAccount: (user.accounts?.length ?? 0) > 0,
    ownedRoles: user.userRoles.map((r) => String(r.role)),
  });

  return NextResponse.json({
    eligible,
    authenticated: true,
    prompt: ROLE_CHOICE_RECOVERY_PROMPT,
    authority: ROLE_CHOICE_AUTHORITY_FIELD,
  });
}

/**
 * POST /api/account/role-choice-recovery
 * Body: { action: "KEEP_FAN" | "ADD_PERFORMER" }
 *
 * KEEP_FAN — mark explicit Fan choice (onboardingState → INCOMPLETE), preserve data.
 * ADD_PERFORMER — additive companion via same path as account menu (never destructive convert).
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = (body.action ?? "").toUpperCase();
  if (action !== "KEEP_FAN" && action !== "ADD_PERFORMER") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const userId = auth.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      onboardingState: true,
      passwordHash: true,
      userRoles: { select: { role: true } },
      accounts: { where: { provider: "google" }, select: { id: true }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const eligible = isGoogleAutoAssignedFanRecoveryEligible({
    role: String(user.role),
    onboardingState: String(user.onboardingState),
    passwordHash: user.passwordHash,
    hasGoogleAccount: (user.accounts?.length ?? 0) > 0,
    ownedRoles: user.userRoles.map((r) => String(r.role)),
  });

  if (!eligible) {
    return NextResponse.json(
      { error: "Not eligible for role-choice recovery", eligible: false },
      { status: 403 },
    );
  }

  if (action === "KEEP_FAN") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "FAN",
        activeRole: "FAN",
        onboardingState: "INCOMPLETE",
      },
    });
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: "FAN" } },
      create: { userId, role: "FAN" },
      update: {},
    });
    await provisionRoleResources(userId, "FAN");

    try {
      await prisma.auditLog.create({
        data: {
          action: "USER_ROLE_CHANGED" as never,
          actorId: userId,
          targetId: userId,
          details: {
            changeType: "role_choice_recovery_keep_fan",
            authority: ROLE_CHOICE_AUTHORITY_FIELD,
          } as never,
        },
      });
    } catch {
      /* non-blocking */
    }

    const res = NextResponse.json({
      ok: true,
      action: "KEEP_FAN",
      onboardingState: "INCOMPLETE",
      hubUrl: "/hub/fan",
    });
    res.cookies.set("tmi_role", "fan", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set("tmi_onboarding_state", "incomplete", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  // ADD_PERFORMER — additive only (companion-profile path)
  const accountRealRoles = Array.from(
    new Set(
      [String(user.role), ...user.userRoles.map((r) => String(r.role))].map((r) =>
        r.toUpperCase(),
      ),
    ),
  );
  const decision = resolveCompanionProvisioningDecision({
    authenticated: true,
    targetProfile: "PERFORMER",
    accountRealRoles,
  });
  if (!decision.allowed && !decision.alreadyOwned) {
    return NextResponse.json({ error: decision.error }, { status: decision.status });
  }

  const offer = resolveCompanionProfileOffers().PERFORMER;
  if (!offer.isFree) {
    return NextResponse.json(
      { error: "This companion profile requires purchase, which isn't available yet." },
      { status: 402 },
    );
  }

  if (!decision.alreadyOwned) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: "PERFORMER" } },
      create: { userId, role: "PERFORMER" },
      update: {},
    });
    await provisionRoleResources(userId, "PERFORMER");
  }

  // Mark explicit role choice complete; keep Fan primary, switch active to Performer.
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingState: "INCOMPLETE",
      activeRole: "PERFORMER",
    },
  });

  try {
    await prisma.auditLog.create({
      data: {
        action: "USER_ROLE_CHANGED" as never,
        actorId: userId,
        targetId: userId,
        details: {
          changeType: "role_choice_recovery_add_performer",
          authority: ROLE_CHOICE_AUTHORITY_FIELD,
          additive: true,
        } as never,
      },
    });
  } catch {
    /* non-blocking */
  }

  const res = NextResponse.json({
    ok: true,
    action: "ADD_PERFORMER",
    onboardingState: "INCOMPLETE",
    hubUrl: "/hub/performer",
  });
  res.cookies.set("tmi_role", "performer", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set("tmi_onboarding_state", "incomplete", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
