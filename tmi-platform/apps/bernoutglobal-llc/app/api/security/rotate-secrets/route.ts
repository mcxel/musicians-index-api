import { NextResponse } from "next/server";
import { transitionIncident } from "@/lib/server/securityIncidentStore";

interface RotateSecretsBody {
  incidentId?: string;
  rotatedKeys?: string[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RotateSecretsBody;
  if (!body.incidentId) {
    return NextResponse.json({ ok: false, error: "incidentId is required" }, { status: 400 });
  }

  const updated = await transitionIncident(body.incidentId, {
    status: "SECRETS_ROTATED",
    actionType: "security.rotate_secrets",
    payload: {
      rotatedKeys: Array.isArray(body.rotatedKeys) ? body.rotatedKeys : [],
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, incident: updated });
}
