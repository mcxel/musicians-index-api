import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { isBeatExclusivelySold } from "@/lib/beats/BeatInventoryEngine";
import {
  describeBeatFeeSplit,
  splitBeatSaleCents,
} from "@/lib/beats/beatFulfillment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { beatId, licenseType, price, auctionId } = body as {
      beatId?: string;
      licenseType?: string;
      price?: number;
      auctionId?: string;
    };

    const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
    const buyerUser = fanEmail
      ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() } })
      : null;
    const buyerId = buyerUser?.id ?? "guest";

    if (!beatId || !licenseType || price == null) {
      return NextResponse.json(
        { ok: false, error: "Missing beat purchasing parameters" },
        { status: 400 },
      );
    }

    const amountCents = Math.floor(Number(price));
    if (!Number.isFinite(amountCents) || amountCents < 99) {
      return NextResponse.json(
        { ok: false, error: "Invalid price (min 99¢)" },
        { status: 400 },
      );
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json(
        { ok: false, error: "Beat track not found in vault" },
        { status: 404 },
      );
    }

    if (isBeatExclusivelySold(beatId) || beat.tags?.includes("exclusively-sold")) {
      return NextResponse.json(
        { ok: false, error: "This beat was sold exclusively and left the competition vault." },
        { status: 409 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: "Payments not configured", code: "STRIPE_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const { producerCents, platformCents } = splitBeatSaleCents(amountCents);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Beat License: ${beat.title} (${String(licenseType).toUpperCase()})`,
              description: `${describeBeatFeeSplit()} · producer ${producerCents}¢ / TMI ${platformCents}¢`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      ...(fanEmail ? { customer_email: fanEmail } : {}),
      metadata: {
        type: "beat",
        beatId: beat.id,
        buyerId,
        licenseType: String(licenseType),
        producerId: beat.producerId,
        producerCents: String(producerCents),
        platformFeeCents: String(platformCents),
        feePreset: "beat",
        ...(auctionId ? { auctionId: String(auctionId) } : {}),
      },
      success_url: `${appUrl}/beats/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/beats/marketplace?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Stripe returned no checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      fee: describeBeatFeeSplit(),
      producerCents,
      platformCents,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Stripe Beat Checkout Error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
