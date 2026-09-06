import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getMemberByEmail, isGovernanceMember } from "@/lib/auth/GovernanceClusterEngine";
import { GOVERNANCE_SWITCHABLE_ROLES } from "@/lib/auth/resolveSessionIdentity";

const ROLE_TO_HUB: Record<string, string> = {
  ADMIN: "/admin",
  ARTIST: "/hub/performer",
  PERFORMER: "/hub/performer",
  PRODUCER: "/hub/performer",
  BAND: "/hub/performer",
  FAN: "/hub/fan",
  USER: "/hub/fan",
  MEMBER: "/hub/fan",
  WRITER: "/hub/writer",
  VENUE: "/hub/venue",
  PROMOTER: "/hub/promoter",
  SPONSOR: "/hub/sponsor",
  ADVERTISER: "/hub/advertiser",
};

/** Per-member admin hub so Justin/Jay Paul land on their own page, not a shared deck. */
function adminHubForEmail(email: string): string {
  const member = getMemberByEmail(email);
  if (member?.memberId === "justin") return "/admin/justin";
  if (member?.memberId === "jaypaul") return "/admin/jay-paul";
  if (member?.memberId === "marcel") return "/admin/marcel";
  return "/admin";
}

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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let targetRole = body.role?.toUpperCase();
  if (!targetRole) {
    return NextResponse.json({ error: "role required" }, { status: 400 });
  }

  // Normalize aliases
  if (targetRole === "MEMBER" || targetRole === "USER") targetRole = "FAN";
  if (targetRole === "ARTIST" || targetRole === "BAND" || targetRole === "PRODUCER") targetRole = "PERFORMER";

  const userId = auth.user.id;

  // Look up user with their assigned roles and live broadcast state
  const user = await prisma.user.findUnique({
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

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Safety Law (ROLE-10, ROLE-12): Active live broadcast requires safe exit before switching to Fan
  if (user.isLive && targetRole === "FAN" && !body.forceEndLive) {
    return NextResponse.json(
      {
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
      { error: "Forbidden: privileged role escalation denied" },
      { status: 403 },
    );
  }

  // Governance / ADMIN operators may switch ADMIN ↔ FAN ↔ PERFORMER
  for (const r of GOVERNANCE_SWITCHABLE_ROLES) allowedRoles.add(r);

  // Dual-Profile Law (ROLE-01..04): Normal users may freely switch between FAN and PERFORMER
  const isStandardDualRole = targetRole === "FAN" || targetRole === "PERFORMER";
  if (!isStandardDualRole && !isAdminAccount && !allowedRoles.has(targetRole)) {
    return NextResponse.json(
      { error: `Role ${targetRole} not assigned to your account` },
      { status: 403 },
    );
  }

  // Persist activeRole to DB (and safely end live session if forceEndLive was specified)
  await prisma.user.update({
    where: { id: userId },
    data: {
      activeRole: targetRole as any,
      ...(body.forceEndLive ? { isLive: false, liveRoomId: null } : {}),
    },
  });

  const hubUrl =
    targetRole === "ADMIN"
      ? adminHubForEmail(auth.user.email)
      : (ROLE_TO_HUB[targetRole] ?? "/hub/fan");

  // Update tmi_role cookie so getTmiAuth() reflects the switch immediately
  const isProd = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

  const response = NextResponse.json({
    ok: true,
    activeRole: targetRole,
    hubUrl,
  });

  response.cookies.set("tmi_role", targetRole.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return response;
}
