import { NextResponse } from "next/server";
import { updateDispatch } from "@/lib/server/dispatchStore";

interface AssignDispatchBody {
  requestId?: string;
  assignedWorkers?: string[];
  notes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AssignDispatchBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const assignedWorkers = Array.isArray(body.assignedWorkers) ? body.assignedWorkers : [];
  const updated = await updateDispatch(body.requestId, {
    status: "ASSIGNED",
    assignedWorkers,
    notes: body.notes,
    eventType: "willdoit.dispatch.assigned",
    eventPayload: { assignedWorkers },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Dispatch request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dispatch: updated });
}
