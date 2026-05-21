import { NextResponse } from "next/server";
import { updateFundingRequest } from "@/lib/server/workforceFundingStore";

interface WorkforceReimburseBody {
  requestId?: string;
  amount?: number;
  note?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WorkforceReimburseBody;
  if (!body.requestId) {
    return NextResponse.json({ ok: false, error: "requestId is required" }, { status: 400 });
  }

  const updated = await updateFundingRequest(body.requestId, {
    status: "REIMBURSED",
    action: "REIMBURSE",
    amount: typeof body.amount === "number" ? body.amount : undefined,
    note: body.note,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Funding request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, request: updated });
}
