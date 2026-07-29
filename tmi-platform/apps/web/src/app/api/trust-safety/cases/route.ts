export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getQueueSummary, listOpenTrustSafetyCases } from "@/lib/trustSafety";

/**
 * GET /api/trust-safety/cases
 * Staff/admin only — open queue for ScamDefenseCenter.
 * Accepts ADMIN cookie (tmi_role=admin|ADMIN) or STAFF via same requireAdmin
 * extension below.
 */
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

export async function GET(req: NextRequest) {
  const denied = requireStaffOrAdmin(req);
  if (denied) return denied;

  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
    const [cases, summary] = await Promise.all([
      listOpenTrustSafetyCases(limit),
      getQueueSummary(),
    ]);

    return NextResponse.json({
      ok: true,
      summary,
      cases,
      moderatorLevels: [
        { id: "community", label: "Community Moderator" },
        { id: "safety_team", label: "Safety Team" },
        { id: "big_ace_executive", label: "Big Ace Executive" },
      ],
    });
  } catch (err) {
    console.error("[trust-safety/cases]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to load cases",
        summary: { open: 0, reviewing: 0, restricted: 0, evidencePackages: 0 },
        cases: [],
      },
      { status: 500 },
    );
  }
}
