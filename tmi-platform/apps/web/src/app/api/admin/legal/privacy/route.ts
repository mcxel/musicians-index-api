export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { listPrivacyRequests } from "@/lib/legal";

/** GET /api/admin/legal/privacy — privacy rights queue. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    requests: listPrivacyRequests(100),
  });
}
