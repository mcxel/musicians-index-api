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
 * Admin-only dashboard switching (Marcel Dickens, 2026-07-24: "fans and
 * performers cannot switch to each other's accounts. Only administrators
 * can do this."). A non-admin account may genuinely hold multiple real
 * UserRole rows (e.g. after an admin-driven role conversion via
 * /api/admin/convert-role, which is additive and never removes the old
 * role), but that must never grant it self-service switching between its
 * own hubs — only ADMIN/STAFF/governance accounts may call this endpoint.
 * The UI gate (RoleSwitcherWidget, AccountCommandMenu's Hubs section) is
 * enforced client-side too, but this server check is the real boundary.
 *
 * Only roles present in userRoles[] are allowed for the caller — no
 * privilege escalation into a role never assigned to the account.
 *
 * Body: { role: string }
 * Response: { ok, activeRole, hubUrl }
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { role: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let targetRole = body.role?.toUpperCase();
  if (!targetRole) {
    return NextResponse.json({ error: "role required" }, { status: 400 });
  }
  // Normalize fan aliases so triad switch always lands on FAN hub
  if (targetRole === "MEMBER" || targetRole === "USER") targetRole = "FAN";
  if (targetRole === "ARTIST") {
    // Artist persona maps to performer hub for governance triad
    // (ARTIST remains allowed; hub is /hub/performer)
  }

  const userId = auth.user.id;

  // Look up user with their assigned roles
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

  const allowedRoles = new Set(
    [user.role as string, ...user.userRoles.map((r) => r.role as string)].map((r) =>
      r.toUpperCase(),
    ),
  );

  // Admin-only dashboard switching, checked against the account's real DB
  // role/userRoles (not the tmi_role cookie, which is exactly what this
  // endpoint mutates on every switch — a cookie-based check would lock a
  // governance member out the moment they'd switched into a non-admin view).
  const primary = (user.role as string).toUpperCase();
  const isAdminAccount =
    primary === "ADMIN" ||
    primary === "STAFF" ||
    allowedRoles.has("ADMIN") ||
    allowedRoles.has("STAFF") ||
    isGovernanceMember(auth.user.email);

  if (!isAdminAccount) {
    return NextResponse.json(
      { error: "Forbidden: dashboard switching is admin-only" },
      { status: 403 },
    );
  }

  // Governance / ADMIN operators may switch ADMIN ↔ FAN ↔ PERFORMER
  // even when UserRole rows were never seeded — triad switch for Justin / Jay Paul.
  for (const r of GOVERNANCE_SWITCHABLE_ROLES) allowedRoles.add(r);

  if (!allowedRoles.has(targetRole)) {
    return NextResponse.json(
      { error: `Role ${targetRole} not assigned to your account` },
      { status: 403 },
    );
  }

  // Persist activeRole to DB
  await prisma.user.update({
    where: { id: userId },
    data: { activeRole: targetRole as any },
  });

  const hubUrl =
    targetRole === "ADMIN"
      ? adminHubForEmail(auth.user.email)
      : (ROLE_TO_HUB[targetRole] ?? "/home/1");

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
