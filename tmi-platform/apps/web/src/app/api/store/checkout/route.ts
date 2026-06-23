import { NextRequest, NextResponse } from "next/server";
import { listCommerceItems } from "@/lib/commerce/commerceEngine";
import { getStripe } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

// Was previously a synchronous fake "checkout" — computed payout splits and
// decremented in-memory stock without ever charging a real card. Now creates
// a real Stripe Checkout Session; fulfillment (stock decrement + Order
// record) happens in the webhook only after Stripe confirms payment.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requestedItems: { itemId: string; qty: number }[] = Array.isArray(body?.items) ? body.items : [];
  if (requestedItems.length === 0) {
    return NextResponse.json({ ok: false, error: "checkout_items_required" }, { status: 400 });
  }

  const catalog = listCommerceItems();
  const lineItems: { price_data: { currency: "usd"; unit_amount: number; product_data: { name: string } }; quantity: number }[] = [];
  for (const requested of requestedItems) {
    const item = catalog.find((entry) => entry.id === requested.itemId);
    if (!item) {
      return NextResponse.json({ ok: false, error: `item_not_found:${requested.itemId}` }, { status: 404 });
    }
    if (item.stock < requested.qty) {
      return NextResponse.json({ ok: false, error: `insufficient_stock:${item.id}` }, { status: 409 });
    }
    lineItems.push({
      price_data: { currency: "usd", unit_amount: Math.round(item.price * 100), product_data: { name: item.name } },
      quantity: requested.qty,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "payments_not_configured" }, { status: 503 });
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const { origin } = req.nextUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/store?status=purchased&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?status=cancelled`,
      metadata: {
        type: "store",
        items: JSON.stringify(requestedItems),
        fanEmail,
      },
    });
    if (!session.url) throw new Error("No session URL from Stripe");
    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("[store/checkout]", error);
    return NextResponse.json({ ok: false, error: "checkout_failed" }, { status: 500 });
  }
}
