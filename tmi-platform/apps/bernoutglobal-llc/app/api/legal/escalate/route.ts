import { NextResponse } from "next/server";
import { updateLegalCase } from "@/lib/server/legalIntakeStore";

interface EscalateBody {
  caseId?: string;
  reason?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as EscalateBody;
  if (!body.caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required" }, { status: 400 });
  }

  const updated = await updateLegalCase(body.caseId, {
    status: "ESCALATED",
    eventType: "legal.escalate",
    summaryAppend: body.reason,
    eventPayload: {
      reason: body.reason ?? "escalated",
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, case: updated });
}
