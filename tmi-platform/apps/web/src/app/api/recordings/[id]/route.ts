export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSave, deleteSave } from "@/lib/recordings/SavedPerformanceService";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/recordings/[id]
 * Returns a single saved performance record owned by the authenticated user.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const record = await getSave(userId, id);
    if (!record) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, record });
  } catch (err) {
    console.error("[recordings/[id]:GET]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/recordings/[id]
 * Marks a saved performance as DELETION_PENDING.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await deleteSave(userId, id);
    if (!result.ok) {
      const status = result.error.includes("NOT_FOUND") ? 404 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recordings/[id]:DELETE]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
