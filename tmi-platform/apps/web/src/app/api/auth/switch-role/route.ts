import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { isGovernanceMember } from "@/lib/auth/GovernanceClusterEngine";
import { GOVERNANCE_SWITCHABLE_ROLES } from "@/lib/auth/resolveSessionIdentity";
import {
  normalizePersonaSwitchTarget,
  resolvePersonaHubDestination,
} from "@/lib/auth/resolvePersonaHubDestination";

/**
 * POST /api/auth/switch-role
 *
 * Canonical Fan ↔ Performer role switcher + Privileged Admin switcher.
 *
 * Product Laws:
 * 1. ONE authenticated account/login may own both Fan and Performer profiles.
 * 2. Exactly one activeRole context at a time (FAN | PERFORMER).
 * 3. Self-service switching between owned FAN ↔ PERFORMER is available to ALL authenticated users.
 * 4. Switching activeRole does NOT create a second login or account.
 * 5. ADMIN / STAFF persona switching remains strictly privileged (403 for normal users).
 * 6. Active live/venue session prevents unsafe role switching until safely ended/left (409).
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { role: string; forceEndLive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const rawTarget = body.role;
  if (!rawTarget) {
    return NextResponse.json({ ok: false, error: "role required" }, { status: 400 });
  }

  const targetRole = String(normalizePersonaSwitchTarget(rawTarget)).toUpperCase();

  const userId = auth.user.id;

  // Identity/authorization boundary: a DB failure here must never be treated
  // as "safe to continue" — fail closed with a truthful 503 rather than
  // letting an unhandled Prisma error surface as a raw 500 page that the
  // client can't parse.
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        activeRole: true,
        isLive: true,
        liveRoomId: true,
        userRoles: { select: { role: true } },
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "persona_switch_temporarily_unavailable" },
      { status: 503 },
    );
  }

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  // Safety Law (ROLE-10, ROLE-12): Active live broadcast requires safe exit before switching to Fan
  if (user.isLive && targetRole === "FAN" && !body.forceEndLive) {
    return NextResponse.json(
      {
        ok: false,
        error: "Active live broadcast session must be safely ended before switching to Fan mode",
        code: "ACTIVE_LIVE_SESSION_BLOCKED",
        requiresSafeExit: true,
      },
      { status: 409 },
    );
  }

  const allowedRoles = new Set(
    [user.role as string, ...user.userRoles.map((r) => r.role as string)].map((r) =>
      r.toUpperCase(),
    ),
  );

  const primary = (user.role as string).toUpperCase();
  const isAdminAccount =
    primary === "ADMIN" ||
    primary === "STAFF" ||
    allowedRoles.has("ADMIN") ||
    allowedRoles.has("STAFF") ||
    isGovernanceMember(auth.user.email);

  const PRIVILEGED_ROLES = new Set(["ADMIN", "STAFF", "SUPERADMIN", "OVERSEER"]);
  const isTargetPrivileged = PRIVILEGED_ROLES.has(targetRole);

  // Security Law (ROLE-08): Privileged target roles require admin/staff privilege
  if (isTargetPrivileged && !isAdminAccount) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: privileged role escalation denied" },
      { status: 403 },
    );
  }

  // Governance / ADMIN operators may switch ADMIN ↔ FAN ↔ PERFORMER
  for (const r of GOVERNANCE_SWITCHABLE_ROLES) allowedRoles.add(r);

  // Dual-Profile Law (ROLE-01..04): Normal users may freely switch between FAN and PERFORMER
  const isStandardDualRole = targetRole === "FAN" || targetRole === "PERFORMER";
  if (!isStandardDualRole && !isAdminAccount && !allowedRoles.has(targetRole)) {
    return NextResponse.json(
      { ok: false, error: `Role ${targetRole} not assigned to your account` },
      { status: 403 },
    );
  }

  const hubUrl = resolvePersonaHubDestination(targetRole, auth.user.email);
  const isProd = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  const cookieBase = {
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  // Phase 0 — Admin oversight: navigate to Fan/Performer/Admin hubs without
  // stripping permanent ADMIN authority from tmi_role (Rule 31 / persona law).
  const isAdminTriadTarget =
    targetRole === "FAN" || targetRole === "PERFORMER" || targetRole === "ADMIN";
  if (isAdminAccount && isAdminTriadTarget) {
    const response = NextResponse.json({
      ok: true,
      activeRole: primary,
      hubUrl,
      oversight: true,
    });
    const shell =
      targetRole === "ADMIN" ? "admin" : targetRole.toLowerCase();
    response.cookies.set("tmi_hub_shell", shell, { ...cookieBase, httpOnly: false });
    return response;
  }

  // Dual-profile users: persist activeRole + tmi_role for true persona context.
  // Fail closed — never set the role cookie or claim success on a write that
  // didn't actually persist (that would let the client believe it switched
  // while the DB still holds the old activeRole).
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        activeRole: targetRole as any,
        ...(body.forceEndLive ? { isLive: false, liveRoomId: null } : {}),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "persona_switch_temporarily_unavailable" },
      { status: 503 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    activeRole: targetRole,
    hubUrl,
  });

  response.cookies.set("tmi_role", targetRole.toLowerCase(), {
    ...cookieBase,
    httpOnly: true,
  });

  return response;
}
