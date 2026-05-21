import { NextResponse } from "next/server";
import { transitionIncident } from "@/lib/server/securityIncidentStore";

interface IsolateBody {
  incidentId?: string;
  reason?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as IsolateBody;
  if (!body.incidentId) {
    return NextResponse.json({ ok: false, error: "incidentId is required" }, { status: 400 });
  }

  const updated = await transitionIncident(body.incidentId, {
    status: "ISOLATED",
    actionType: "security.isolate",
    payload: { reason: body.reason ?? "manual isolate" },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, incident: updated });
}
