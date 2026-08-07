export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  createDisclosureCaseFromIntake,
  knownLegalDataCategories,
  type LegalDataCategory,
} from "@/lib/legal";

const VALID = new Set(knownLegalDataCategories());

/**
 * POST /api/legal/government-requests
 * Public intake only — creates case + package draft blocked until human approval.
 * Does NOT grant database access.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      requesterLabel?: string;
      requesterEmail?: string;
      jurisdictionCode?: string;
      legalBasisSummary?: string;
      requestedCategories?: string[];
      emergency?: boolean;
    };

    const requesterLabel = body.requesterLabel?.trim() ?? "";
    const requesterEmail = body.requesterEmail?.trim() ?? "";
    const legalBasisSummary = body.legalBasisSummary?.trim() ?? "";
    if (!requesterLabel || !requesterEmail || !legalBasisSummary) {
      return NextResponse.json(
        { error: "requesterLabel, requesterEmail, and legalBasisSummary are required" },
        { status: 400 },
      );
    }

    const requestedCategories = (body.requestedCategories ?? []).filter((c): c is LegalDataCategory =>
      VALID.has(c as LegalDataCategory),
    );
    if (requestedCategories.length === 0) {
      return NextResponse.json({ error: "At least one valid data category is required" }, { status: 400 });
    }

    const record = createDisclosureCaseFromIntake({
      kind: "GOVERNMENT_DISCLOSURE",
      requesterLabel,
      requesterEmail,
      jurisdictionCode: body.jurisdictionCode ?? "GLOBAL-DEFAULT",
      legalBasisSummary,
      requestedCategories,
      emergency: Boolean(body.emergency),
      authoritySignals: {
        hasBadgeClaim: false,
        hasEmailClaim: true,
        identityDocumentReceived: false,
        agencyRosterMatch: false,
        counselReviewed: false,
      },
    });

    return NextResponse.json({
      ok: true,
      caseId: record.caseId,
      status: record.status,
      authorityState: record.authorityState,
      approvalDecision: record.approvalDecision,
      message:
        "Intake recorded. Package draft prepared. Blocked until human/counsel approval. No database access granted.",
    });
  } catch (err) {
    console.error("[legal/government-requests]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Intake failed" },
      { status: 500 },
    );
  }
}
