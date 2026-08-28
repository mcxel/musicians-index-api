export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTelemetry } from "@/lib/recordings/SavedPerformanceService";

async function isAdmin(req: NextRequest): Promise<boolean> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return false;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/**
 * GET /api/recordings/telemetry
 * Returns aggregate stats for ops/admin monitoring.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const stats = await getTelemetry();
    return NextResponse.json({ ok: true, ...stats });
  } catch (err) {
    console.error("[recordings/telemetry:GET]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
