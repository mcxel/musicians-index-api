export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

/**
 * GET /api/auth/my-roles
 *
 * Returns the list of roles assigned to the current session user,
 * so the RoleSwitcherWidget can show only what the user actually holds.
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
    return NextResponse.json(
      { roles: [auth.user.role], primaryRole: auth.user.role, activeRole: null },
      { status: 200 },
    );
  }

  const allRoles = Array.from(
    new Set([user.role as string, ...user.userRoles.map((r) => r.role as string)]),
  );

  return NextResponse.json({
    roles: allRoles,
    primaryRole: user.role as string,
    activeRole: user.activeRole as string | null,
  });
}
