import { NextResponse } from "next/server";
import { updateLegalCase } from "@/lib/server/legalIntakeStore";

interface ArchiveBody {
  caseId?: string;
  closureProof?: string[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ArchiveBody;
  if (!body.caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required" }, { status: 400 });
  }

  const proofList = Array.isArray(body.closureProof) ? body.closureProof : [];
  const updated = await updateLegalCase(body.caseId, {
    status: "CLOSED_WITH_PROOF",
    eventType: "legal.archive",
    eventPayload: {
      closureProof: proofList,
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, case: updated });
}
