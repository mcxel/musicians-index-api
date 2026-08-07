export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { documentRegistryTypes, listCorporateRecords } from "@/lib/legal";

/** GET /api/admin/legal/vault — corporate records metadata (no secrets). */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    records: listCorporateRecords(),
    registryTypes: documentRegistryTypes(),
  });
}
