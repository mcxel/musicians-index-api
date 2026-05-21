import { NextResponse } from "next/server";
import { updateLegalCase } from "@/lib/server/legalIntakeStore";

interface ReviewBody {
  caseId?: string;
  reviewNote?: string;
  triageResult?: "keep-open" | "escalate";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ReviewBody;
  if (!body.caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required" }, { status: 400 });
  }

  const updated = await updateLegalCase(body.caseId, {
    eventType: "legal.review",
    summaryAppend: body.reviewNote,
    eventPayload: {
      triageResult: body.triageResult ?? "keep-open",
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, case: updated });
}
