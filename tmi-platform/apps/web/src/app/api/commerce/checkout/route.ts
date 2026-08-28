/**
 * POST /api/commerce/checkout
 *
 * Artist-store checkout — NEVER trusts client price.
 * Body: { productId: string, idempotencyKey?: string, requestMsg?: string, occasion?: string, yourName?: string }
 *
 * Loads product + artist wallet (Connect) + TMI fee → Stripe Session with price_data.
 * Reuses the canonical /api/stripe/webhook (metadata.type = artist_commerce).
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";
import {
  getArtistProductById,
  decrementArtistProductInventory,
} from "@/lib/commerce/ArtistCommerceCatalog";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import {
  calculateCreatorCommerceSplit,
  describeCreatorCommerceFee,
} from "@/lib/commerce/RevenueSplitEngine";
import {
  resolveFanUserIdFromEmail,
} from "@/lib/tips/tipFulfillment";

type CheckoutBody = {
  productId?: string;
  idempotencyKey?: string;
  requestMsg?: string;
  occasion?: string;
  yourName?: string;
  successUrl?: string;
  cancelUrl?: string;
};

function feePresetForType(type: string): string {
  switch (type) {
    case "SHOUTOUT":
      return "shoutout";
    case "MEET_AND_GREET":
      return "meet_greet";
    case "MERCH":
      return "merch";
    case "VIP_PASS":
    case "LICENSING_PACK":
    case "DIGITAL_PRODUCT":
    default:
      return "store";
  }
}

export async function POST(req: NextRequest) {
  if (process.env.STRIPE_PAUSE_MODE === "true") {
    return NextResponse.json(
      {
        paused: true,
        message: "Payments are temporarily processing — your request is saved and will be fulfilled shortly.",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody = {};
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = (body.productId ?? "").trim();
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await getArtistProductById(productId);
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not found or inactive", code: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }
  if (product.inventory != null && product.inventory <= 0) {
    return NextResponse.json({ error: "Sold out", code: "SOLD_OUT" }, { status: 409 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const buyerId = (await resolveFanUserIdFromEmail(fanEmail)) ?? "";
  if (!fanEmail || !buyerId) {
    return NextResponse.json({ error: "Sign in required", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const sellerTier = await resolveSellerCommerceTier(product.artistId);
  const split = calculateCreatorCommerceSplit(product.priceCents, 0, sellerTier);
  const platformFeeCents = split.splits.platform.cents;
  const feePreset = feePresetForType(product.type);

  const wallet = await prisma.wallet.findUnique({
    where: { userId: product.artistId },
    select: { stripeAccountId: true, stripeOnboarded: true },
  });
  const connectReady =
    Boolean(wallet?.stripeOnboarded) &&
    Boolean(wallet?.stripeAccountId) &&
    /^acct_[A-Za-z0-9]+$/.test(wallet?.stripeAccountId ?? "");

  const { origin } = req.nextUrl;
  const orderId = `aco_${randomBytes(10).toString("hex")}`;
  const idempotencyKey =
    (body.idempotencyKey?.trim() || req.headers.get("idempotency-key")?.trim() || "") ||
    `artist_commerce_${createHash("sha256")
      .update(`${buyerId}:${productId}:${Math.floor(Date.now() / 60_000)}`)
      .digest("hex")
      .slice(0, 32)}`;

  // Record pending order before Stripe redirect (server-side idempotency / audit)
  const existing = await prisma.order.findFirst({
    where: { providerPaymentId: idempotencyKey },
    select: { id: true, status: true },
  });
  if (existing?.status === "CHECKOUT_OPEN" || existing?.status === "PAID") {
    // Re-create is ok for CHECKOUT_OPEN; block only if already paid
    if (existing.status === "PAID") {
      return NextResponse.json({ error: "Order already paid", code: "ALREADY_PAID" }, { status: 409 });
    }
  } else {
    await prisma.order
      .create({
        data: {
          id: orderId,
          provider: "STRIPE",
          providerPaymentId: idempotencyKey,
          amountCents: product.priceCents,
          currency: product.currency,
          status: "CHECKOUT_PENDING",
          buyerUserId: buyerId,
        },
      })
      .catch(async () => {
        // Collision on idempotency — reuse
      });
  }

  const successUrl =
    body.successUrl?.startsWith("/")
      ? `${origin}${body.successUrl}`
      : `${origin}/payment-success?type=artist_commerce&productId=${encodeURIComponent(product.id)}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl =
    body.cancelUrl?.startsWith("/")
      ? `${origin}${body.cancelUrl}`
      : `${origin}/store/creator?notice=checkout-cancelled`;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: product.currency.toLowerCase() || "usd",
              unit_amount: product.priceCents,
              product_data: {
                name: product.title,
                description:
                  product.description?.slice(0, 200) ||
                  describeCreatorCommerceFee(sellerTier),
                ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
              },
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: fanEmail,
        metadata: {
          type: "artist_commerce",
          artistId: product.artistId,
          productId: product.id,
          buyerId,
          orderId: existing?.id ?? orderId,
          productType: product.type,
          sellerTier,
          platformFeeCents: String(platformFeeCents),
          sellerShareCents: String(split.splits.artist.cents),
          feePreset,
          yourName: (body.yourName ?? "").slice(0, 80),
          occasion: (body.occasion ?? "").slice(0, 80),
          requestMsg: (body.requestMsg ?? "").slice(0, 400),
          connectDestination: connectReady ? (wallet?.stripeAccountId ?? "") : "",
        },
        ...(connectReady
          ? {
              payment_intent_data: {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                  destination: wallet!.stripeAccountId!,
                },
              },
            }
          : {}),
      },
      { idempotencyKey },
    );

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL from Stripe" }, { status: 502 });
    }

    await prisma.order
      .updateMany({
        where: { providerPaymentId: idempotencyKey },
        data: {
          status: "CHECKOUT_OPEN",
          providerPaymentId: session.id,
        },
      })
      .catch(() => {});

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      orderId: existing?.id ?? orderId,
      product: {
        id: product.id,
        title: product.title,
        type: product.type,
        priceCents: product.priceCents,
      },
    });
  } catch (err) {
    console.error("[commerce/checkout]", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}

/** Inventory touch helper exported for webhook — re-export path. */
export { decrementArtistProductInventory };
