export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { renewPerformance } from "@/lib/savedPerformances/SavedPerformanceService";

/** POST /api/saved-performances/[id]/renew */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await renewPerformance(auth.user.id, params.id);

  if (!result.ok) {
    const status = result.errorCode === "SAVED_PERFORMANCE_NOT_FOUND" ? 404 : 422;
    return NextResponse.json({ ok: false, errorCode: result.errorCode }, { status });
  }

  return NextResponse.json({ ok: true, newExpiresAt: result.newExpiresAt });
}
