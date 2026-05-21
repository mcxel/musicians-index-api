import { NextResponse } from "next/server";
import { updateFundingRequest } from "@/lib/server/workforceFundingStore";

interface WorkforceApproveBody {
  requestId?: string;
  note?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WorkforceApproveBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateFundingRequest(body.requestId, {
    status: "APPROVED",
    action: "APPROVE",
    note: body.note,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Funding request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, request: updated });
}
