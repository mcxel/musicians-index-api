export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getLegalRuntimeSnapshot } from "@/lib/legal";

/** GET /api/admin/legal/snapshot — LegalCommandCenter data. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const snap = getLegalRuntimeSnapshot();
    return NextResponse.json({ ok: true, ...snap });
  } catch (err) {
    console.error("[admin/legal/snapshot]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Snapshot failed" },
      { status: 500 },
    );
  }
}
