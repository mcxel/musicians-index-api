import { NextResponse } from "next/server";
import { createIncident, transitionIncident } from "@/lib/server/securityIncidentStore";

interface QuarantineBody {
  incidentId?: string;
  moduleId?: string;
  severity?: "low" | "medium" | "high" | "critical";
  summary?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as QuarantineBody;

  if (!body.incidentId) {
    if (!body.moduleId || !body.summary) {
      return NextResponse.json({ ok: false, error: "moduleId and summary are required when incidentId is missing" }, { status: 400 });
    }

    const created = await createIncident({
      moduleId: body.moduleId,
      severity: body.severity ?? "high",
      summary: body.summary,
    });

    const quarantined = await transitionIncident(created.incidentId, {
      status: "QUARANTINED",
      actionType: "security.quarantine",
      payload: { moduleId: created.moduleId },
    });

    return NextResponse.json({ ok: true, incident: quarantined ?? created }, { status: 201 });
  }

  const updated = await transitionIncident(body.incidentId, {
    status: "QUARANTINED",
    actionType: "security.quarantine",
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, incident: updated });
}
