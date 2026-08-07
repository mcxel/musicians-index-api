export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { deliverDisclosurePackage } from "@/lib/legal";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/legal/cases/[id]/deliver
 * Hard-gated by HumanApprovalGate + VERIFIED authority.
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;

  try {
    const body = (await req.json().catch(() => ({}))) as { actor?: string };
    const result = deliverDisclosurePackage({
      caseId: id,
      actor: body.actor?.trim() || "admin",
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, case: result.case ?? null },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true, case: result.case });
  } catch (err) {
    console.error("[admin/legal/deliver]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delivery failed" },
      { status: 500 },
    );
  }
}
