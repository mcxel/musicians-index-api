import { NextResponse } from "next/server";
import { transitionIncident } from "@/lib/server/securityIncidentStore";

interface RecoverBody {
  incidentId?: string;
  checkpointId?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RecoverBody;
  if (!body.incidentId) {
    return NextResponse.json({ ok: false, error: "incidentId is required" }, { status: 400 });
  }

  const updated = await transitionIncident(body.incidentId, {
    status: "RECOVERED",
    actionType: "security.recover",
    payload: {
      checkpointId: body.checkpointId ?? null,
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, incident: updated });
}
