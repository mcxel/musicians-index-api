export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getQueueSummary, listOpenTrustSafetyCases } from "@/lib/trustSafety";

/**
 * GET /api/trust-safety/cases
 * Staff/admin only — open queue for ScamDefenseCenter.
 * Uses requireAdmin (session + email + ADMIN|STAFF) — no cookie-alone fail-open.
 */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
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
