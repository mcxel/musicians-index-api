import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { emitEvent } from "@/lib/analytics/PersonaAnalyticsEngine";
import prisma from "@/lib/prisma";
import { updateUserRole, type UserRole } from "@/lib/auth/UserStore";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { provisionRoleResources, type ProvisionAccountType } from "@/lib/auth/provisionRoleResources";

const VALID_ROLES = new Set([
  "MEMBER", "ARTIST", "ADVERTISER", "SPONSOR", "VENUE",
  "PERFORMER", "FAN", "WRITER", "PROMOTER",
]);

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60,
  path: "/",
};

/**
 * POST /api/onboarding/role
 * Canonical explicit role choice. Writes User.role + UserRole + sets
 * User.onboardingState = INCOMPLETE (leaves NO_ROLE_SELECTED).
 */
export async function POST(req: NextRequest) {
  let body: { role?: string; userId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* no-op */
  }

  const { role } = body;

  if (role?.toUpperCase() === "ADMIN") {
    return NextResponse.json({ error: "Cannot assign admin role via onboarding" }, { status: 403 });
  }

  if (!role || !VALID_ROLES.has(role.toUpperCase())) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const normalizedRole = role.toUpperCase();
  const lowerRole = normalizedRole.toLowerCase() as UserRole;

  const auth = await getTmiAuth();
  const email =
    auth?.user?.email?.toLowerCase() ??
    req.cookies.get("tmi_user_email")?.value?.toLowerCase() ??
    null;
  const authUserId = auth?.user?.id ?? null;

  if (email) {
    updateUserRole(email, lowerRole);
  }

  let persistedUserId: string | null = authUserId;

  try {
    const u = authUserId
      ? await prisma.user.findUnique({ where: { id: authUserId }, select: { id: true, email: true } })
      : email
        ? await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } })
        : null;

    if (u) {
      persistedUserId = u.id;
      await prisma.user.update({
        where: { id: u.id },
        data: {
          role: normalizedRole as never,
          activeRole: normalizedRole as never,
          // Canonical role-choice completion (leaves NO_ROLE_SELECTED).
          onboardingState: "INCOMPLETE",
        },
      });

      await prisma.userRole.upsert({
        where: { userId_role: { userId: u.id, role: normalizedRole as never } },
        create: { userId: u.id, role: normalizedRole as never },
        update: {},
      });

      const provisionType = (
        normalizedRole === "ARTIST" ? "PERFORMER" : normalizedRole
      ) as ProvisionAccountType;
      if (
        provisionType === "FAN" ||
        provisionType === "PERFORMER" ||
        provisionType === "VENUE" ||
        provisionType === "PROMOTER" ||
        provisionType === "SPONSOR" ||
        provisionType === "ADVERTISER"
      ) {
        await provisionRoleResources(u.id, provisionType);
      }
    }
  } catch (err) {
    console.error("Failed to persist explicit role choice:", err);
    return NextResponse.json({ error: "Failed to save role choice" }, { status: 500 });
  }

  const emitTelemetry = (source: string) => {
    emitEvent({
      eventName: "onboarding.role_assigned",
      domain: "onboarding",
      userId: persistedUserId ?? body.userId ?? "anonymous",
      activePersonaOverride: "fan",
      meta: { role: normalizedRole, source, authority: "User.onboardingState" },
    });
  };

  try {
    const apiRes = await proxyToApi(req as unknown as Request, "/onboarding/role");
    if (apiRes.status < 300) {
      emitTelemetry("backend");
      apiRes.headers.append(
        "Set-Cookie",
        `tmi_role=${normalizedRole.toLowerCase()}; Path=/; SameSite=Lax; Max-Age=604800`,
      );
      apiRes.headers.append(
        "Set-Cookie",
        `tmi_onboarding_state=incomplete; Path=/; SameSite=Lax; Max-Age=604800`,
      );
      return apiRes;
    }
  } catch {
    /* fall through */
  }

  emitTelemetry("local_fallback");
  const fallbackRes = NextResponse.json({
    ok: true,
    role: normalizedRole,
    onboardingState: "INCOMPLETE",
    authority: "User.onboardingState",
    updatedAt: new Date().toISOString(),
  });
  fallbackRes.cookies.set("tmi_role", normalizedRole.toLowerCase(), COOKIE_OPTS);
  fallbackRes.cookies.set("tmi_onboarding_state", "incomplete", COOKIE_OPTS);
  return fallbackRes;
}
