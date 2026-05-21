import { NextResponse } from "next/server";
import { updateDispatch } from "@/lib/server/dispatchStore";

interface CompleteDispatchBody {
  requestId?: string;
  notes?: string;
  proof?: string[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as CompleteDispatchBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateDispatch(body.requestId, {
    status: "COMPLETED",
    notes: body.notes,
    eventType: "willdoit.dispatch.completed",
    eventPayload: { proof: Array.isArray(body.proof) ? body.proof : [] },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Dispatch request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dispatch: updated });
}
