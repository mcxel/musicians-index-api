export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getRightsComplianceSnapshot } from "@/lib/legal";

/** GET /api/admin/legal/rights — Copyright & IP pillar snapshot. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    return NextResponse.json({ ok: true, ...getRightsComplianceSnapshot() });
  } catch (err) {
    console.error("[admin/legal/rights]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rights snapshot failed" },
      { status: 500 },
    );
  }
}
