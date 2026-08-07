export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { listJurisdictionPolicies, listLegalDataCatalog } from "@/lib/legal";

/** GET /api/admin/legal/gateway — policies + catalog index for Gateway pillar. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    policies: listJurisdictionPolicies(),
    catalog: listLegalDataCatalog(),
    authorityRule: "Badge/email alone never advances to VERIFIED disclosure eligibility",
  });
}
