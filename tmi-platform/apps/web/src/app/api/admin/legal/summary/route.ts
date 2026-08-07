export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getCollapsedLegalSummary } from "@/lib/legal";

/** GET /api/admin/legal/summary — collapsed Observatory counts only. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    summary: getCollapsedLegalSummary(),
  });
}
