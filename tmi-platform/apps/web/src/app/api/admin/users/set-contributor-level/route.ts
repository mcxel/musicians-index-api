import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import type { ContributorLevel } from "@/lib/editorial-economy/types";

const VALID_LEVELS: ContributorLevel[] = ["new-contributor", "verified-contributor", "trusted-editor", "staff-editor"];

/**
 * POST /api/admin/users/set-contributor-level
 *
 * Admin-only: the real promotion path for /editorial/review's trust gate
 * (trusted-editor/staff-editor). Same getTmiAuth() ADMIN check as
 * grant-tier/assign-roles — no second permission system.
 *
 * Body: { email: string; level: ContributorLevel }
 *
 * Scope note: this writes to ContributorAccountEngine's in-memory account
 * (see the persistence audit — the editorial-economy module has no Prisma
 * model yet), so the grant does not survive a server restart until that
 * migration happens. It's still the real promotion action, not a stub.
 */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: { email?: string; level?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  const level = body.level as ContributorLevel;
  if (!email || !VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "email and a valid level are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, displayName: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const previous = contributorAccountEngine.get(user.id);
  const account = previous
    ? contributorAccountEngine.updateLevel(user.id, level)
    : contributorAccountEngine.create({
        contributorId: user.id,
        displayName: user.displayName ?? user.name ?? user.email ?? "TMI Contributor",
        level,
      });

  await prisma.auditLog
    .create({
      data: {
        actorId: auth.user.id,
        targetId: user.id,
        // No dedicated AuditLogAction enum value exists for this yet (that's
        // a schema migration — out of scope here); USER_ROLE_CHANGED is the
        // closest real category and "kind" in details disambiguates it.
        action: "USER_ROLE_CHANGED",
        details: {
          kind: "CONTRIBUTOR_LEVEL",
          grantedBy: auth.user.email,
          previousLevel: previous?.level ?? null,
          newLevel: level,
          grantedAt: new Date().toISOString(),
        },
      },
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, email: user.email, level: account?.level ?? level });
}
