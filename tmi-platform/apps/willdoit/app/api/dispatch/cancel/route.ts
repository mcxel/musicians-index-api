import { NextResponse } from "next/server";
import { updateDispatch } from "@/lib/server/dispatchStore";

interface CancelDispatchBody {
  requestId?: string;
  reason?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as CancelDispatchBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateDispatch(body.requestId, {
    status: "CANCELLED",
    notes: body.reason,
    eventType: "willdoit.dispatch.cancelled",
    eventPayload: { reason: body.reason ?? "cancelled" },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Dispatch request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dispatch: updated });
}
