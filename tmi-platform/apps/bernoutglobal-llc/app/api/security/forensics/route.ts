import { NextResponse } from "next/server";
import { transitionIncident } from "@/lib/server/securityIncidentStore";

interface ForensicsBody {
  incidentId?: string;
  evidenceRefs?: string[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ForensicsBody;
  if (!body.incidentId) {
    return NextResponse.json({ ok: false, error: "incidentId is required" }, { status: 400 });
  }

  const updated = await transitionIncident(body.incidentId, {
    status: "FORENSICS_CAPTURED",
    actionType: "security.forensics",
    payload: {
      evidenceRefs: Array.isArray(body.evidenceRefs) ? body.evidenceRefs : [],
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, incident: updated });
}
