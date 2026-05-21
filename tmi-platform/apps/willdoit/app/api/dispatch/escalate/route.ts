import { NextResponse } from "next/server";
import { updateDispatch } from "@/lib/server/dispatchStore";

interface EscalateDispatchBody {
  requestId?: string;
  reason?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as EscalateDispatchBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateDispatch(body.requestId, {
    status: "FAILED_ESCALATED",
    notes: body.reason,
    eventType: "willdoit.dispatch.escalated",
    eventPayload: {
      reason: body.reason ?? "escalated",
      severity: body.severity ?? "high",
    },
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Dispatch request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dispatch: updated });
}
