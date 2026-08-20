import { NextRequest, NextResponse } from "next/server";
import { listCommerceItems } from "@/lib/commerce/commerceEngine";
import { getStripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { getFanCreditsBalance, spendFanCredits } from "@/lib/points/pointsFulfillment";
import { quotePointsDiscount } from "@/lib/points/PointDiscountEngine";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import { calculateCreatorCommerceSplit, describeCreatorCommerceFee } from "@/lib/commerce/RevenueSplitEngine";

export const dynamic = "force-dynamic";

/**
 * Store checkout with optional fan points discount on performer items.
 * Settlement (performer + platform fee) is always on full list price P.
 * Cash charge = P − points discount; points burn prepaid liability.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requestedItems: { itemId: string; qty: number }[] = Array.isArray(body?.items) ? body.items : [];
  const pointsToRedeem = Math.max(0, Math.floor(Number(body?.pointsToRedeem ?? 0)));
  const sellerUserId = typeof body?.sellerUserId === "string" ? body.sellerUserId : null;

  if (requestedItems.length === 0) {
    return NextResponse.json({ ok: false, error: "checkout_items_required" }, { status: 400 });
  }

  const catalog = listCommerceItems();
  let productPriceCents = 0;
  const lineNames: string[] = [];
  for (const requested of requestedItems) {
    const item = catalog.find((entry) => entry.id === requested.itemId);
    if (!item) {
      return NextResponse.json({ ok: false, error: `item_not_found:${requested.itemId}` }, { status: 404 });
    }
    if (item.stock < requested.qty) {
      return NextResponse.json({ ok: false, error: `insufficient_stock:${item.id}` }, { status: 409 });
    }
    productPriceCents += Math.round(item.price * 100) * requested.qty;
    lineNames.push(item.name);
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "payments_not_configured", code: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const buyer = fanEmail
    ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() }, select: { id: true } })
    : null;

  const sellerTier = sellerUserId
    ? await resolveSellerCommerceTier(sellerUserId)
    : "FREE";
  const balance = buyer ? await getFanCreditsBalance(buyer.id) : 0;

  const quote = quotePointsDiscount({
    productPriceCents,
    sellerTier,
    pointsAvailable: balance,
    pointsToRedeem,
  });

  if (!quote.ok && pointsToRedeem > 0) {
    return NextResponse.json({
      ok: false,
      error: quote.reason ?? "points_discount_unavailable",
      quote,
      buyPointsHref: "/store/points",
    }, { status: 400 });
  }

  // Burn points before creating Stripe session (idempotent ref ties to session after create)
  let pointsBurnRef = `store_discount_pending_${buyer?.id ?? "guest"}_${Date.now()}`;
  if (quote.pointsApplied > 0) {
    if (!buyer) {
      return NextResponse.json({ ok: false, error: "Sign in required to redeem points", code: "AUTH_REQUIRED" }, { status: 401 });
    }
    const burned = await spendFanCredits({
      userId: buyer.id,
      points: quote.pointsApplied,
      category: "DEBIT_STORE_DISCOUNT",
      referenceId: pointsBurnRef,
      note: `Store points discount (−${quote.pointsApplied} pts / −${quote.discountCents}¢) on P=${productPriceCents}¢`,
    });
    if (!burned.ok) {
      return NextResponse.json({
        ok: false,
        error: burned.error,
        balance: burned.balance,
        buyPointsHref: "/store/points",
      }, { status: 402 });
    }
  }

  const split = calculateCreatorCommerceSplit(productPriceCents, 0, sellerTier);
  const { origin } = req.nextUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: quote.cashChargeCents,
            product_data: {
              name: lineNames.length === 1 ? lineNames[0]! : `TMI Store (${lineNames.length} items)`,
              description: [
                quote.summary,
                describeCreatorCommerceFee(sellerTier),
                quote.pointsApplied > 0
                  ? `Points applied: ${quote.pointsApplied} (−$${(quote.discountCents / 100).toFixed(2)}); settlement on full $${(productPriceCents / 100).toFixed(2)}`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/store?status=purchased&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?status=cancelled`,
      ...(fanEmail ? { customer_email: fanEmail } : {}),
      metadata: {
        type: "store",
        items: JSON.stringify(requestedItems),
        fanEmail,
        buyerId: buyer?.id ?? "",
        sellerUserId: sellerUserId ?? "",
        sellerTier,
        productPriceCents: String(productPriceCents),
        cashChargeCents: String(quote.cashChargeCents),
        pointsApplied: String(quote.pointsApplied),
        discountCents: String(quote.discountCents),
        platformFeeCents: String(split.splits.platform.cents),
        sellerShareCents: String(split.splits.artist.cents),
        feePreset: "store",
        pointsBurnRef,
      },
    });
    if (!session.url) throw new Error("No session URL from Stripe");

    // Retarget burn reference to Stripe session for webhook visibility
    if (quote.pointsApplied > 0 && buyer) {
      await prisma.walletTransaction
        .updateMany({
          where: { referenceId: pointsBurnRef, category: "DEBIT_STORE_DISCOUNT" },
          data: { referenceId: `store_discount_${session.id}` },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      quote,
      fee: describeCreatorCommerceFee(sellerTier),
    });
  } catch (error) {
    console.error("[store/checkout]", error);
    // Best-effort: do not auto-refund points here (session create failed) — ops can credit
    return NextResponse.json({ ok: false, error: "checkout_failed" }, { status: 500 });
  }
}
