import { NextResponse } from "next/server";
import { createWorkforceHook } from "@/lib/server/workforceHooksStore";

interface WorkforceHookBody {
  requestType?: "cleanup" | "repair" | "emergency" | "event_staff";
  crowdPhase?: "pre-show" | "group-round" | "finale";
  workerCount?: number;
  urgency?: "normal" | "high" | "critical";
  notes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WorkforceHookBody;
  if (!body.requestType || !body.crowdPhase) {
    return NextResponse.json({ ok: false, error: "requestType and crowdPhase are required" }, { status: 400 });
  }

  const created = await createWorkforceHook({
    requestType: body.requestType,
    crowdPhase: body.crowdPhase,
    workerCount: typeof body.workerCount === "number" ? body.workerCount : 1,
    urgency: body.urgency ?? "normal",
    notes: body.notes,
  });

  return NextResponse.json(
    {
      ok: true,
      dispatchHook: created,
      targetDispatchRoute: "/api/dispatch/create",
      targetModule: "willdoit",
    },
    { status: 201 }
  );
}
