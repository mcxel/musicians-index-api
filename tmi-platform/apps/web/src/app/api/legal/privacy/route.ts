export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { submitPrivacyRequest } from "@/lib/legal";

const TYPES = new Set(["ACCESS", "DELETE", "CORRECT", "EXPORT", "OPT_OUT"]);

/**
 * POST /api/legal/privacy — public privacy rights intake.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      requesterEmail?: string;
      requestType?: string;
      notes?: string;
    };
    const requesterEmail = body.requesterEmail?.trim() ?? "";
    const requestType = body.requestType?.trim().toUpperCase() ?? "";
    if (!requesterEmail || !TYPES.has(requestType)) {
      return NextResponse.json(
        { error: "requesterEmail and a valid requestType are required" },
        { status: 400 },
      );
    }

    const record = submitPrivacyRequest({
      requesterEmail,
      requestType: requestType as "ACCESS" | "DELETE" | "CORRECT" | "EXPORT" | "OPT_OUT",
      notes: body.notes,
    });

    return NextResponse.json({
      ok: true,
      requestId: record.requestId,
      caseId: record.caseId,
      status: record.status,
    });
  } catch (err) {
    console.error("[legal/privacy]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Privacy intake failed" },
      { status: 500 },
    );
  }
}
