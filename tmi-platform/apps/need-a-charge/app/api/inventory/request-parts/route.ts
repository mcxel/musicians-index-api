import { NextResponse } from "next/server";
import { createPartsRequest } from "@/lib/server/partsRequestStore";

interface RequestPartsBody {
  itemSku?: string;
  quantity?: number;
  reason?: string;
  requestedBy?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RequestPartsBody;
  if (!body.itemSku || typeof body.quantity !== "number" || !body.reason) {
    return NextResponse.json({ ok: false, error: "itemSku, quantity, and reason are required" }, { status: 400 });
  }

  const created = await createPartsRequest({
    itemSku: body.itemSku,
    quantity: body.quantity,
    reason: body.reason,
    requestedBy: body.requestedBy ?? "need-a-charge.ops",
  });

  return NextResponse.json(
    {
      ok: true,
      request: created,
      supplierModule: "transistor-hut",
      supplierReserveRoute: "/api/inventory/parts",
    },
    { status: 201 }
  );
}
