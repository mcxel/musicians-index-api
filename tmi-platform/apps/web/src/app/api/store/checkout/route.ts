import { NextResponse } from "next/server";
import { checkout } from "@/lib/commerce/commerceEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "checkout_items_required" }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, checkout: checkout(items) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 409 });
  }
}
