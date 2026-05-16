export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from "next/server";
import { getReferralStats } from "@/lib/referral/ReferralEngine";

// GET /api/referral/stats?fanId=xxx
export async function GET(req: NextRequest) {
  const fanId = req.nextUrl.searchParams.get("fanId")?.trim() ?? "";
  if (!fanId) {
    return NextResponse.json({ error: "fanId required" }, { status: 400 });
  }
  return NextResponse.json(getReferralStats(fanId));
}
