export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getTrustSafetyCaseEvidence } from "@/lib/trustSafety";

function requireStaffOrAdmin(req: NextRequest): NextResponse | null {
  const denied = requireAdmin(req);
  if (!denied) return null;
  const role = (req.cookies.get("tmi_role")?.value ?? "").toLowerCase();
  const cookieHeader = req.headers.get("cookie") || "";
  if (role === "staff" || cookieHeader.includes("tmi_role=staff") || cookieHeader.includes("tmi_role=STAFF")) {
    return null;
  }
  return denied;
}

/** GET /api/trust-safety/cases/[id] — case + evidence (staff/admin). */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const denied = requireStaffOrAdmin(req);
  if (denied) return denied;

  const params = await Promise.resolve(context.params);
  const caseId = params.id;
  if (!caseId) return NextResponse.json({ error: "case id required" }, { status: 400 });

  try {
    const bundle = await getTrustSafetyCaseEvidence(caseId);
    if (!bundle) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ...bundle });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load case" },
      { status: 500 },
    );
  }
}
