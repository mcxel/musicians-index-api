import { NextResponse } from "next/server";
import { createFundingRequest } from "@/lib/server/workforceFundingStore";

interface WorkforceRequestBody {
  requesterModule?: string;
  requesterPerson?: string;
  requestType?: string;
  accountingCategory?: string;
  fundingSource?: string;
  workerCount?: number;
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
  notes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WorkforceRequestBody;

  if (
    !body.requesterModule ||
    !body.requesterPerson ||
    !body.requestType ||
    !body.accountingCategory ||
    !body.fundingSource
  ) {
    return NextResponse.json({ ok: false, error: "Missing required workforce request fields" }, { status: 400 });
  }

  const created = await createFundingRequest({
    requesterModule: body.requesterModule,
    requesterPerson: body.requesterPerson,
    requestType: body.requestType,
    accountingCategory: body.accountingCategory,
    fundingSource: body.fundingSource,
    workerCount: typeof body.workerCount === "number" ? body.workerCount : 1,
    estimatedCostLow: typeof body.estimatedCostLow === "number" ? body.estimatedCostLow : 0,
    estimatedCostHigh: typeof body.estimatedCostHigh === "number" ? body.estimatedCostHigh : 0,
    notes: body.notes,
  });

  return NextResponse.json({ ok: true, request: created }, { status: 201 });
}
