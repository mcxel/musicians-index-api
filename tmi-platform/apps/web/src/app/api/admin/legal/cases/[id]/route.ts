export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import {
  advanceAuthorityVerification,
  getCasePackage,
  getLegalCase,
  type AuthoritySignal,
} from "@/lib/legal";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/legal/cases/[id] */
export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const record = getLegalCase(id);
  if (!record) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    case: record,
    package: getCasePackage(id),
  });
}

/** POST /api/admin/legal/cases/[id] — advance authority, etc. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as {
      action?: string;
      actor?: string;
      signals?: Partial<AuthoritySignal>;
    };

    if (body.action === "advance-authority") {
      const signals: AuthoritySignal = {
        hasBadgeClaim: Boolean(body.signals?.hasBadgeClaim),
        hasEmailClaim: Boolean(body.signals?.hasEmailClaim),
        identityDocumentReceived: Boolean(body.signals?.identityDocumentReceived),
        agencyRosterMatch: Boolean(body.signals?.agencyRosterMatch),
        counselReviewed: Boolean(body.signals?.counselReviewed),
        expired: Boolean(body.signals?.expired),
        rejected: Boolean(body.signals?.rejected),
      };
      const result = advanceAuthorityVerification(
        id,
        signals,
        body.actor?.trim() || "admin",
      );
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, case: result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin/legal/cases/id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
