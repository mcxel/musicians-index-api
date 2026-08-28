export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSavedPerformanceTelemetry } from "@/lib/savedPerformances/SavedPerformanceService";

/**
 * GET /api/saved-performances/telemetry
 * Admin-only capacity planning data — not user-facing.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const data = await getSavedPerformanceTelemetry();

  return NextResponse.json({
    ok: true,
    ...data,
    totalStorageBytes: data.totalStorageBytes.toString(),
  });
}
