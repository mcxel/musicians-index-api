import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { isBeatExclusivelySold } from "@/lib/beats/BeatInventoryEngine";
import {
  describeBeatFeeSplit,
  splitBeatSaleCents,
} from "@/lib/beats/beatFulfillment";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import { getFanCreditsBalance, spendFanCredits } from "@/lib/points/pointsFulfillment";
import { quotePointsDiscount } from "@/lib/points/PointDiscountEngine";
import { resolveAppOrigin } from "@/lib/runtime/canonicalEndpointResolver";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { beatId, licenseType, price, auctionId, pointsToRedeem } = body as {
      beatId?: string;
      licenseType?: string;
      price?: number;
      auctionId?: string;
      pointsToRedeem?: number;
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

    const productPriceCents = Math.floor(Number(price));
    if (!Number.isFinite(productPriceCents) || productPriceCents < 99) {
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

    const sellerTier = await resolveSellerCommerceTier(beat.producerId);
    // Settlement always on full list price P
    const { producerCents, platformCents, tier } = splitBeatSaleCents(
      productPriceCents,
      0,
      sellerTier,
    );

    const balance = buyerUser ? await getFanCreditsBalance(buyerUser.id) : 0;
    const redeem = Math.max(0, Math.floor(Number(pointsToRedeem ?? 0)));
    const quote = quotePointsDiscount({
      productPriceCents,
      sellerTier: tier,
      pointsAvailable: balance,
      pointsToRedeem: redeem,
    });

    if (!quote.ok && redeem > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: quote.reason ?? "points_discount_unavailable",
          quote,
          buyPointsHref: "/store/points",
        },
        { status: 400 },
      );
    }

    let pointsBurnRef = "";
    if (quote.pointsApplied > 0) {
      if (!buyerUser) {
        return NextResponse.json(
          { ok: false, error: "Sign in required to redeem points", code: "AUTH_REQUIRED" },
          { status: 401 },
        );
      }
      pointsBurnRef = `beat_discount_${beatId}_${buyerUser.id}_${Date.now()}`;
      const burned = await spendFanCredits({
        userId: buyerUser.id,
        points: quote.pointsApplied,
        category: "DEBIT_BEAT_DISCOUNT",
        referenceId: pointsBurnRef,
        note: `Beat points discount (−${quote.pointsApplied} pts) on P=${productPriceCents}¢`,
      });
      if (!burned.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: burned.error,
            balance: burned.balance,
            buyPointsHref: "/store/points",
          },
          { status: 402 },
        );
      }
    }

    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const appUrl = resolveAppOrigin({ host, proto });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Beat License: ${beat.title} (${String(licenseType).toUpperCase()})`,
              description: [
                describeBeatFeeSplit(tier),
                `producer ${producerCents}¢ / TMI ${platformCents}¢ on full P`,
                quote.pointsApplied > 0
                  ? `Fan paid ${quote.cashChargeCents}¢ cash + ${quote.pointsApplied} pts (−${quote.discountCents}¢)`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · "),
            },
            unit_amount: quote.cashChargeCents,
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
        // Settlement amounts on full P (not cash charge)
        productPriceCents: String(productPriceCents),
        producerCents: String(producerCents),
        platformFeeCents: String(platformCents),
        cashChargeCents: String(quote.cashChargeCents),
        pointsApplied: String(quote.pointsApplied),
        discountCents: String(quote.discountCents),
        sellerTier: tier,
        feePreset: "beat",
        ...(pointsBurnRef ? { pointsBurnRef } : {}),
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

    if (quote.pointsApplied > 0 && pointsBurnRef) {
      await prisma.walletTransaction
        .updateMany({
          where: { referenceId: pointsBurnRef, category: "DEBIT_BEAT_DISCOUNT" },
          data: { referenceId: `beat_discount_${session.id}` },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      fee: describeBeatFeeSplit(tier),
      sellerTier: tier,
      producerCents,
      platformCents,
      quote,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Stripe Beat Checkout Error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
