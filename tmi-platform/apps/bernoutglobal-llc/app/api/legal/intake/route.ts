import { NextResponse } from "next/server";
import { intakeLegalCase } from "@/lib/server/legalIntakeStore";

interface IntakeBody {
  requesterModule?: string;
  intakeType?: string;
  summary?: string;
  evidenceRefs?: string[];
  jurisdiction?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as IntakeBody;

  if (!body.requesterModule || !body.intakeType || !body.summary) {
    return NextResponse.json({ ok: false, error: "requesterModule, intakeType, and summary are required" }, { status: 400 });
  }

  const created = await intakeLegalCase({
    requesterModule: body.requesterModule,
    intakeType: body.intakeType,
    summary: body.summary,
    evidenceRefs: Array.isArray(body.evidenceRefs) ? body.evidenceRefs : [],
    jurisdiction: body.jurisdiction,
  });

  return NextResponse.json({ ok: true, case: created }, { status: 201 });
}
