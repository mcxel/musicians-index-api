import { NextResponse } from "next/server";
import { createDispatch } from "@/lib/server/dispatchStore";

interface CreateDispatchBody {
  requesterModule?: string;
  requestType?: string;
  workerQuantityMode?: string;
  workerTypes?: string[];
  workerCount?: number;
  location?: string;
  urgency?: string;
  notes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as CreateDispatchBody;

  if (!body.requesterModule || !body.requestType || !body.workerQuantityMode || !body.location || !body.urgency) {
    return NextResponse.json({ ok: false, error: "Missing required dispatch fields" }, { status: 400 });
  }

  const workerTypes = Array.isArray(body.workerTypes) ? body.workerTypes : [];
  const workerCount = typeof body.workerCount === "number" ? body.workerCount : workerTypes.length || 1;

  const created = await createDispatch({
    requesterModule: body.requesterModule,
    requestType: body.requestType,
    workerQuantityMode: body.workerQuantityMode,
    workerTypes,
    workerCount,
    location: body.location,
    urgency: body.urgency,
    notes: body.notes,
  });

  return NextResponse.json({ ok: true, dispatch: created }, { status: 201 });
}
