import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

const ROLE_TO_HUB: Record<string, string> = {
  ADMIN: "/admin",
  ARTIST: "/hub/performer",
  PERFORMER: "/hub/performer",
  FAN: "/hub/fan",
  USER: "/hub/fan",
  WRITER: "/hub/writer",
  VENUE: "/hub/venue",
  PROMOTER: "/hub/promoter",
  SPONSOR: "/hub/sponsor",
  ADVERTISER: "/hub/advertiser",
};

/**
 * POST /api/auth/switch-role
 *
 * Switch the active role for an account that holds multiple roles.
 * Only roles present in userRoles[] are allowed — no privilege escalation.
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

  const targetRole = body.role?.toUpperCase();
  if (!targetRole) {
    return NextResponse.json({ error: "role required" }, { status: 400 });
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

  const allowedRoles = new Set([
    user.role as string,
    ...user.userRoles.map((r) => r.role as string),
  ]);

  // Special case: ADMIN can always switch to any role they hold
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

  const hubUrl = ROLE_TO_HUB[targetRole] ?? "/home/1";

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
