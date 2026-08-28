export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { renewSave } from "@/lib/recordings/SavedPerformanceService";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/recordings/[id]/renew
 * Renews a saved performance — extends expiresAt by 90 days.
 * Same storage asset — no copy created.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await renewSave(userId, id);
    if (!result.ok) {
      const status = result.error.includes("NOT_FOUND") ? 404 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true, record: result.record });
  } catch (err) {
    console.error("[recordings/[id]/renew:POST]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
