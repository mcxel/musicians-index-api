export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { isRealPriceId, STRIPE_PRODUCTS } from "@/lib/stripe/products";
import { getPointPackBySku, type PointPackSku } from "@/lib/points/PointPackCatalog";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/points/checkout
 * Body: { packSku: PointPackSku }
 * Creates Stripe Checkout for a locked point pack. 503 if Stripe keys missing.
 */
export async function POST(req: NextRequest) {
  let body: { packSku?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const pack = getPointPackBySku(body.packSku);
  if (!pack) {
    return NextResponse.json(
      { error: "Unknown packSku", code: "UNKNOWN_PACK", packs: ["points_099", "points_199", "points_499", "points_999", "points_1999"] },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const buyer = fanEmail
    ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() }, select: { id: true } })
    : null;
  if (!buyer) {
    return NextResponse.json({ error: "Sign in required to buy points", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const product = STRIPE_PRODUCTS[pack.productKey];
  const { origin } = req.nextUrl;

  try {
    const lineItem = isRealPriceId(product.priceId)
      ? { price: product.priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd" as const,
            unit_amount: pack.priceCents,
            product_data: {
              name: product.name,
              description: `Grants ${pack.points} TMI points to your wallet`,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: `${origin}/store/points?purchased=1&sku=${pack.sku}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/points?canceled=1`,
      ...(fanEmail ? { customer_email: fanEmail } : {}),
      metadata: {
        type: "points_pack",
        packSku: pack.sku as PointPackSku,
        points: String(pack.points),
        buyerId: buyer.id,
        userEmail: fanEmail,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "No Stripe checkout URL" }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      pack: { sku: pack.sku, points: pack.points, priceCents: pack.priceCents },
    });
  } catch (err) {
    console.error("[api/points/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}

/** GET — catalog + balance (honest empty if unauthenticated). */
export async function GET(req: NextRequest) {
  const { POINT_PACKS } = await import("@/lib/points/PointPackCatalog");
  const { getFanCreditsBalance } = await import("@/lib/points/pointsFulfillment");
  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  let balance = 0;
  let userId: string | null = null;
  if (fanEmail) {
    const buyer = await prisma.user.findFirst({
      where: { email: fanEmail.toLowerCase() },
      select: { id: true },
    });
    if (buyer) {
      userId = buyer.id;
      balance = await getFanCreditsBalance(buyer.id);
    }
  }
  return NextResponse.json({
    packs: POINT_PACKS.map((p) => ({
      sku: p.sku,
      name: p.name,
      priceCents: p.priceCents,
      priceLabel: `$${(p.priceCents / 100).toFixed(2)}`,
      points: p.points,
      blurb: p.blurb,
    })),
    balance,
    userId,
    stripeConfigured: Boolean(getStripe()),
  });
}
