export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { approveDisclosureCase } from "@/lib/legal";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/legal/cases/[id]/approve
 * Human/counsel approval gate — agents/system cannot approve.
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as {
      actor?: string;
      decision?: "APPROVED" | "DENIED";
      note?: string;
    };
    const actor = body.actor?.trim() || "";
    const decision = body.decision === "DENIED" ? "DENIED" : "APPROVED";
    if (!actor || actor.toLowerCase() === "system" || actor.toLowerCase() === "agent") {
      return NextResponse.json(
        { error: "Human/counsel actor required — agents cannot approve disclosure" },
        { status: 403 },
      );
    }

    const result = approveDisclosureCase({
      caseId: id,
      actor,
      decision,
      note: body.note,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, case: result });
  } catch (err) {
    console.error("[admin/legal/approve]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Approval failed" },
      { status: 500 },
    );
  }
}
