import { NextResponse } from "next/server";
import { updateFundingRequest } from "@/lib/server/workforceFundingStore";

interface WorkforceRejectBody {
  requestId?: string;
  reason?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WorkforceRejectBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateFundingRequest(body.requestId, {
    status: "REJECTED",
    action: "REJECT",
    note: body.reason,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Funding request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, request: updated });
}
