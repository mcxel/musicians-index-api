export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getBigAceBusinessActivitySummary } from "@/lib/businessCommunications/BigAceBusinessCommunicationsRuntime";

/** GET /api/admin/business-comms/summary — honest Big Ace business activity (Rule 20). */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const summary = getBigAceBusinessActivitySummary();
  return NextResponse.json({ ok: true, summary });
}
