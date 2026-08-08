export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { isGovernanceMember } from "@/lib/auth/GovernanceClusterEngine";
import {
  GOVERNANCE_ROLE_DISPLAY_ORDER,
  GOVERNANCE_SWITCHABLE_ROLES,
} from "@/lib/auth/resolveSessionIdentity";

/**
 * GET /api/auth/my-roles
 *
 * Returns the list of roles assigned to the current session user,
 * so the RoleSwitcherWidget can show only what the user actually holds.
 *
 * Governance / hardcoded admins always get ADMIN + FAN + PERFORMER
 * switch targets even if UserRole rows were never provisioned — otherwise
 * Justin / Jay Paul Sanchez pages have no triad switcher.
 *
 * Response: { roles: string[]; primaryRole: string; activeRole: string | null }
 */
export async function GET(_req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json(
      { roles: [], primaryRole: "USER", activeRole: null },
      { status: 200 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      role: true,
      activeRole: true,
      userRoles: { select: { role: true } },
    },
  });

  if (!user) {
    const roles = synthesizeAdminSwitchRoles(auth.user.role, auth.user.email, [auth.user.role]);
    return NextResponse.json(
      { roles, primaryRole: auth.user.role, activeRole: null },
      { status: 200 },
    );
  }

  const base = Array.from(
    new Set([user.role as string, ...user.userRoles.map((r) => r.role as string)]),
  );
  const allRoles = synthesizeAdminSwitchRoles(user.role as string, auth.user.email, base);

  return NextResponse.json({
    roles: allRoles,
    primaryRole: user.role as string,
    activeRole: user.activeRole as string | null,
  });
}

function synthesizeAdminSwitchRoles(
  primaryRole: string,
  email: string,
  existing: string[],
): string[] {
  const roles = new Set(existing.map((r) => r.toUpperCase()));
  // Legacy MEMBER / USER → FAN for switcher tiles
  if (roles.has("MEMBER") || roles.has("USER")) roles.add("FAN");
  const primary = primaryRole.toUpperCase();
  const isAdmin = primary === "ADMIN" || primary === "STAFF" || roles.has("ADMIN") || roles.has("STAFF");
  if (isAdmin || isGovernanceMember(email)) {
    for (const r of GOVERNANCE_SWITCHABLE_ROLES) roles.add(r);
  }
  // Prefer triad order; hide redundant MEMBER/USER when FAN is present
  roles.delete("MEMBER");
  roles.delete("USER");
  // If PERFORMER present, ARTIST is optional alias — keep both so hubs remain reachable
  const ordered: string[] = [];
  for (const r of GOVERNANCE_ROLE_DISPLAY_ORDER) {
    if (roles.has(r)) ordered.push(r);
  }
  for (const r of roles) {
    if (!ordered.includes(r)) ordered.push(r);
  }
  return ordered;
}
