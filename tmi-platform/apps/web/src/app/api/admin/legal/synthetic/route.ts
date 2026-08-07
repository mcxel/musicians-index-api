export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { runSyntheticCertificationExercise } from "@/lib/legal";

/**
 * POST /api/admin/legal/synthetic
 * End-to-end synthetic certification using synthetic accounts only.
 * Reconstructs timeline from Legal Audit Ledger.
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => ({}))) as { actor?: string };
    const actor = body.actor?.trim() || "admin-certification";
    if (actor.toLowerCase() === "system" || actor.toLowerCase() === "agent") {
      return NextResponse.json(
        { error: "Synthetic exercise requires a human actor label" },
        { status: 403 },
      );
    }

    const result = runSyntheticCertificationExercise(actor);
    return NextResponse.json({
      ok: result.ok,
      caseId: result.caseId,
      steps: result.steps,
      blockedBeforeApproval: result.blockedBeforeApproval,
      deliveredAfterApproval: result.deliveredAfterApproval,
      chain: result.chain,
      reconstructionSummary: result.ledgerReconstruction.summary,
      error: result.error,
    });
  } catch (err) {
    console.error("[admin/legal/synthetic]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Synthetic exercise failed" },
      { status: 500 },
    );
  }
}
