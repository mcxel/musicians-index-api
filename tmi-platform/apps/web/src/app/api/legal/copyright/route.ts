export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { submitCopyrightComplaint } from "@/lib/legal";

/**
 * POST /api/legal/copyright — copyright complaint / takedown intake.
 * Audited; does not auto-remove content.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      claimantName?: string;
      claimantEmail?: string;
      workDescription?: string;
      infringingUrlOrRoom?: string;
      goodFaithStatement?: boolean;
      perjuryStatement?: boolean;
      notes?: string;
    };

    const result = submitCopyrightComplaint({
      claimantName: body.claimantName ?? "",
      claimantEmail: body.claimantEmail ?? "",
      workDescription: body.workDescription ?? "",
      infringingUrlOrRoom: body.infringingUrlOrRoom ?? "",
      goodFaithStatement: Boolean(body.goodFaithStatement),
      perjuryStatement: Boolean(body.perjuryStatement),
      notes: body.notes,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      complaintId: result.complaintId,
      caseId: result.caseId,
      status: result.status,
      message:
        "Complaint received and audited. Claimant verification and preservation follow human process — not auto-removal.",
    });
  } catch (err) {
    console.error("[legal/copyright]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Complaint failed" },
      { status: 500 },
    );
  }
}
