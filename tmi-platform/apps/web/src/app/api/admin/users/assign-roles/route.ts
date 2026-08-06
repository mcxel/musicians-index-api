import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

const VALID_ROLES = [
  "USER", "FAN", "ARTIST", "PERFORMER", "BAND", "SPONSOR",
  "ADVERTISER", "VENUE", "WRITER", "PROMOTER", "STAFF", "ADMIN", "JUDGE",
] as const;
type ValidRole = (typeof VALID_ROLES)[number];

/**
 * POST /api/admin/users/assign-roles
 *
 * Assign one or more roles to a user account. Used to give BJM (and similar
 * multi-hat accounts) performer + admin + fan access simultaneously.
 *
 * Body: { email: string; roles: string[]; primaryRole?: string }
 *
 * Sets user.role = primaryRole (first in list if not specified).
 * Upserts one UserRole record per role.
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: { email: string; roles: string[]; primaryRole?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.email || !Array.isArray(body.roles) || body.roles.length === 0) {
    return NextResponse.json({ error: "email and roles[] required" }, { status: 400 });
  }

  const normalizedEmail = body.email.toLowerCase().trim();
  const roles = body.roles
    .map((r) => r.toUpperCase() as ValidRole)
    .filter((r) => VALID_ROLES.includes(r));

  if (roles.length === 0) {
    return NextResponse.json({ error: "No valid roles provided" }, { status: 400 });
  }

  const primaryRole = (body.primaryRole?.toUpperCase() ?? roles[0]) as ValidRole;
  if (!VALID_ROLES.includes(primaryRole)) {
    return NextResponse.json({ error: "Invalid primaryRole" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Update primary role
  await prisma.user.update({
    where: { id: user.id },
    data: { role: primaryRole as any },
  });

  // Upsert all roles in UserRole junction table
  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: role as any } },
      update: {},
      create: { userId: user.id, role: role as any },
    });
  }

  // Audit trail (best-effort)
  await prisma.auditLog.create({
    data: {
      actorId: auth.user.id,
      targetId: user.id,
      action: "ADMIN_ASSIGN_ROLES",
      details: {
        grantedBy: auth.user.email,
        roles,
        primaryRole,
        assignedAt: new Date().toISOString(),
      },
    },
  }).catch(() => {});

  const assignedRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    select: { role: true },
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, primaryRole },
    assignedRoles: assignedRoles.map((r) => r.role),
  });
}
