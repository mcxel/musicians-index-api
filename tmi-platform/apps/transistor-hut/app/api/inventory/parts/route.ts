import { NextResponse } from "next/server";
import { listCatalog, reservePart } from "@/lib/server/inventoryStore";

interface ReserveBody {
  sku?: string;
  quantity?: number;
}

export async function GET() {
  const catalog = await listCatalog();
  return NextResponse.json({ ok: true, catalog });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ReserveBody;
  if (!body.sku || typeof body.quantity !== "number") {
    return NextResponse.json({ ok: false, error: "sku and quantity are required" }, { status: 400 });
  }

  const result = await reservePart({ sku: body.sku, quantity: body.quantity });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Unable to reserve stock", remaining: result.remaining ?? 0 }, { status: 409 });
  }

  return NextResponse.json({ ok: true, sku: body.sku, reserved: body.quantity, remaining: result.remaining });
}
