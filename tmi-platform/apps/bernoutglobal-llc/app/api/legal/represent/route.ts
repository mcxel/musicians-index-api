import { NextResponse } from "next/server";
import { updateLegalCase } from "@/lib/server/legalIntakeStore";

interface RepresentBody {
  caseId?: string;
  counsel?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RepresentBody;
  if (!body.caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required" }, { status: 400 });
  }

  const updated = await updateLegalCase(body.caseId, {
    status: "REPRESENTING",
    eventType: "legal.represent",
    eventPayload: {
      counsel: body.counsel ?? "BERNTOUT LAW",
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, case: updated });
}
