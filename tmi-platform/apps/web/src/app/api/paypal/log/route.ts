// api/paypal/log/route.ts — Log a PayPal payment intent to the revenue ledger

import { NextRequest, NextResponse } from "next/server";
import { recordTransaction, type TransactionType } from "@/lib/finance/revenueLedger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  const userId = body.userId as string | undefined;
  const amount = body.amount as number | undefined;
  const recipientId = body.recipientId as string | undefined;
  const type = (body.type as TransactionType | undefined) ?? "tip";

  if (!userId || !amount) {
    return NextResponse.json({ error: "userId and amount required" }, { status: 400 });
  }

  const entry = recordTransaction(
    type,
    amount,
    userId,
    recipientId,
    undefined,
    { method: "paypal" }
  );

  return NextResponse.json({ ok: true, entry });
}
