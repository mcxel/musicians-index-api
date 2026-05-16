import { NextRequest, NextResponse } from "next/server";
import { listCommerceItems, type CommerceCategory } from "@/lib/commerce/commerceEngine";

export async function GET(req: NextRequest) {
  const categoryParam = req.nextUrl.searchParams.get("category") ?? undefined;
  const category = categoryParam as CommerceCategory | undefined;
  return NextResponse.json({ ok: true, items: listCommerceItems(category) });
}
