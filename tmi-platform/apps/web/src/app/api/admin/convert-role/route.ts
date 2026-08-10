export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  convertUserRole,
  previewUserForConversion,
  resolveUserIdFromEmail,
  type RoleConversionRequest,
} from "@/lib/auth/roleConversionEngine";
import { normalizeAccountType, type ProvisionAccountType } from "@/lib/auth/provisionRoleResources";
import { prisma } from "@/lib/prisma";

const ALLOWED_ADMIN_EMAILS = new Set(["berntmusic33@gmail.com"]);

async function getActorId(): Promise<{ actorId: string | null; isAdmin: boolean }> {
  const jar = cookies();
  const role = jar.get("tmi_role")?.value;
  const email = jar.get("tmi_user_email")?.value?.trim().toLowerCase() ?? "";
  const sid = jar.get("tmi_session_id")?.value;

  if (!sid) return { actorId: null, isAdmin: false };
  if (role !== "ADMIN" && !ALLOWED_ADMIN_EMAILS.has(email)) {
    return { actorId: null, isAdmin: false };
  }

  // Resolve actorId from email cookie
  const actor = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return { actorId: actor?.id ?? "admin", isAdmin: true };
}

/** GET /api/admin/convert-role?userId=… or ?email=… — preview user state */
export async function GET(req: NextRequest) {
  const { isAdmin } = await getActorId();
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId") ?? "";
  const email = searchParams.get("email") ?? "";

  if (!userId && email) {
    const resolved = await resolveUserIdFromEmail(email);
    if (!resolved) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    userId = resolved;
  }

  if (!userId) return NextResponse.json({ error: "userId or email required" }, { status: 400 });

  const preview = await previewUserForConversion(userId);
  if (!preview) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, preview });
}

/** POST /api/admin/convert-role — execute role conversion */
export async function POST(req: NextRequest) {
  const { actorId, isAdmin } = await getActorId();
  if (!isAdmin || !actorId) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let body: {
    userId?: string;
    email?: string;
    targetRole?: string;
    targetTier?: string;
    reason?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let userId = body.userId ?? "";

  // Resolve userId from email if not provided directly
  if (!userId && body.email) {
    const resolved = await resolveUserIdFromEmail(body.email);
    if (!resolved) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    userId = resolved;
  }

  if (!userId) {
    return NextResponse.json({ error: "userId or email required" }, { status: 400 });
  }

  if (!body.targetRole) {
    return NextResponse.json({ error: "targetRole required" }, { status: 400 });
  }

  const targetRole = normalizeAccountType([body.targetRole]) as ProvisionAccountType;

  const request: RoleConversionRequest = {
    userId,
    targetRole,
    targetTier: body.targetTier,
    actorId,
    reason: body.reason,
  };

  const result = await convertUserRole(request);

  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}
