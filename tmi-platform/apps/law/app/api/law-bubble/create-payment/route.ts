import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// POST /api/law-bubble/create-payment
// Creates a Stripe PaymentIntent for a Law Bubble credit purchase.
// TODO: Replace mock with real Stripe SDK before production.

const VALID_AMOUNTS_CENTS = [500, 1000, 2000]; // $5, $10, $20

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, userId } = body as Record<string, unknown>;

  if (typeof amount !== "number" || !VALID_AMOUNTS_CENTS.includes(amount)) {
    return NextResponse.json(
      { error: `amount must be one of ${VALID_AMOUNTS_CENTS.join(", ")} cents` },
      { status: 400 }
    );
  }

  if (typeof userId !== "string" || userId.length > 128) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  // ── Mock PaymentIntent (replace with real Stripe before production) ──────────
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const intent = await stripe.paymentIntents.create({
  //   amount,
  //   currency: "usd",
  //   metadata: { userId, moduleId: "law" },
  // });
  // return NextResponse.json({ clientSecret: intent.client_secret });

  const mockId = `pi_${Date.now()}_${randomBytes(4).toString("hex")}`;
  return NextResponse.json({
    clientSecret: `${mockId}_secret_mock`,
    paymentIntentId: mockId,
    amount,
    currency: "usd",
    _mock: true,
  });
}
