export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import {
  createDisclosureCaseFromIntake,
  knownLegalDataCategories,
  listLegalCases,
  type LegalDataCategory,
} from "@/lib/legal";

const VALID = new Set(knownLegalDataCategories());

/** GET /api/admin/legal/cases */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, cases: listLegalCases(100) });
}

/** POST /api/admin/legal/cases — admin demo intake / case create. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action?: string;
      requesterLabel?: string;
      requesterEmail?: string;
      jurisdictionCode?: string;
      legalBasisSummary?: string;
      requestedCategories?: string[];
      authoritySignals?: Record<string, boolean>;
      emergency?: boolean;
      isSynthetic?: boolean;
    };

    const requestedCategories = (body.requestedCategories ?? ["ACCOUNT", "AUDIT"]).filter(
      (c): c is LegalDataCategory => VALID.has(c as LegalDataCategory),
    );

    const record = createDisclosureCaseFromIntake({
      kind: body.isSynthetic ? "SYNTHETIC_CERTIFICATION" : "GOVERNMENT_DISCLOSURE",
      requesterLabel: body.requesterLabel ?? "Admin demo",
      requesterEmail: body.requesterEmail ?? "admin-demo@tmi.local",
      jurisdictionCode: body.jurisdictionCode ?? "US-FED",
      legalBasisSummary: body.legalBasisSummary ?? "Admin-created disclosure case",
      requestedCategories,
      emergency: Boolean(body.emergency),
      isSynthetic: Boolean(body.isSynthetic),
      authoritySignals: {
        hasBadgeClaim: Boolean(body.authoritySignals?.hasBadgeClaim),
        hasEmailClaim: Boolean(body.authoritySignals?.hasEmailClaim ?? true),
        identityDocumentReceived: Boolean(body.authoritySignals?.identityDocumentReceived),
        agencyRosterMatch: Boolean(body.authoritySignals?.agencyRosterMatch),
        counselReviewed: Boolean(body.authoritySignals?.counselReviewed),
        expired: Boolean(body.authoritySignals?.expired),
        rejected: Boolean(body.authoritySignals?.rejected),
      },
    });

    return NextResponse.json({ ok: true, case: record });
  } catch (err) {
    console.error("[admin/legal/cases]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Case create failed" },
      { status: 500 },
    );
  }
}
