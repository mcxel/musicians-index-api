export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  getDigitalOffer,
  quoteDigitalOffer,
} from "@/lib/tickets/DigitalTicketOfferEngine";
import {
  TICKET_FEE_POLICY_ID,
  resolveTicketFee,
} from "@/lib/tickets/TicketFeeResolver";
import type { TicketTier } from "@/lib/tickets/ticketCore";

const TRUSTED_HOSTS = new Set([
  "themusiciansindex.com",
  "www.themusiciansindex.com",
  "localhost",
]);

function isTrustedUrl(raw: string): boolean {
  if (raw.startsWith("/")) return true;
  try {
    const url = new URL(raw);
    return TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const TIER_LABEL: Record<string, string> = {
  STANDARD: "Standard Admission",
  VIP: "VIP Floor Pass",
  BACKSTAGE: "Backstage Access",
  MEET_AND_GREET: "Meet & Greet",
  SEASON_PASS: "Season Pass",
  BATTLE_PASS: "Battle Pass",
  RAFFLE_PASS: "Raffle Entry",
  SPONSOR_GIFT: "Sponsor Gift Ticket",
};

/**
 * Buyer checkout — authoritative seller price + TicketFeePolicy fee as separate line items
 * so Stripe shows no surprise fee. Issuance happens on webhook / fulfillment.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const offerId = typeof body?.offerId === "string" ? body.offerId.trim() : "";
    const eventSlug =
      typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";
    const eventId =
      typeof body?.eventId === "string" ? body.eventId.trim() : eventSlug;
    const venueSlug =
      typeof body?.venueSlug === "string" ? body.venueSlug.trim() : "digital";
    const tier: TicketTier =
      typeof body?.tier === "string" ? (body.tier as TicketTier) : "STANDARD";
    const quantity =
      typeof body?.quantity === "number" && body.quantity > 0
        ? Math.min(Math.floor(body.quantity), 10)
        : 1;

    // Prefer offer-backed price (authoritative). Fallback face value only for legacy paths.
    let sellerPriceCents: number;
    let productName: string;
    let resolvedOfferId = offerId;

    if (offerId) {
      const offer = await getDigitalOffer(offerId);
      if (!offer) {
        return NextResponse.json({ error: "offer_not_found" }, { status: 404 });
      }
      if (offer.status !== "on_sale" && offer.status !== "published") {
        return NextResponse.json({ error: "offer_not_on_sale" }, { status: 409 });
      }
      const quote = await quoteDigitalOffer(offerId, quantity);
      sellerPriceCents = quote.offer.priceCents;
      productName = offer.title;
      resolvedOfferId = offer.id;
    } else {
      if (!eventSlug) {
        return NextResponse.json(
          { error: "offerId_or_eventSlug_required" },
          { status: 400 },
        );
      }
      const faceValue =
        typeof body?.faceValue === "number" && body.faceValue > 0
          ? body.faceValue
          : 2.99;
      sellerPriceCents = Math.round(faceValue * 100);
      productName = `${TIER_LABEL[tier] ?? tier} — ${eventSlug.replace(/-/g, " ")}`;
    }

    const fee = resolveTicketFee({ baseTicketPriceCents: sellerPriceCents });

    const origin = req.nextUrl.origin;
    const resolvedSuccess =
      (typeof body?.successUrl === "string" && body.successUrl.trim()) ||
      `${origin}/tickets?status=success&event=${encodeURIComponent(eventId || eventSlug)}`;
    const resolvedCancel =
      (typeof body?.cancelUrl === "string" && body.cancelUrl.trim()) ||
      `${origin}/tickets?status=cancelled`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: "invalid_redirect_url" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "payments_not_configured" }, { status: 503 });
    }

    const line_items = [
      {
        price_data: {
          currency: "usd",
          unit_amount: fee.sellerPriceCents,
          product_data: {
            name: productName,
            description: `Seller price · ${quantity} ticket(s)`,
          },
        },
        quantity,
      },
      {
        price_data: {
          currency: "usd",
          unit_amount: fee.platformFeeCentsPerTicket,
          product_data: {
            name: "TMI platform fee",
            description: `Fixed fee ladder (${fee.feePolicyId}) — not a percentage`,
          },
        },
        quantity,
      },
    ];

    if (fee.taxCentsPerTicket > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          unit_amount: fee.taxCentsPerTicket,
          product_data: {
            name: "Estimated tax",
            description: "Tax",
          },
        },
        quantity,
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${resolvedSuccess}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancel,
      customer_email: session.user.email || undefined,
      metadata: {
        type: "ticket_purchase",
        offerId: resolvedOfferId,
        eventSlug: eventSlug || eventId,
        eventId: eventId || eventSlug,
        venueSlug,
        tier,
        quantity: String(quantity),
        sellerPriceCents: String(fee.sellerPriceCents),
        platformFeeCents: String(fee.platformFeeCentsPerTicket),
        buyerTotalCents: String(fee.buyerTotalCentsPerTicket * quantity),
        feePolicyId: TICKET_FEE_POLICY_ID,
        buyerId: session.user.id,
        buyerEmail: session.user.email,
      },
    });

    return NextResponse.json({
      ok: true,
      url: stripeSession.url,
      quote: {
        sellerPriceCents: fee.sellerPriceCents,
        platformFeeCents: fee.platformFeeCentsPerTicket,
        buyerTotalCents: fee.buyerTotalCentsPerTicket * quantity,
        hostPayoutCents: fee.hostPayoutCentsPerTicket * quantity,
        feePolicyId: TICKET_FEE_POLICY_ID,
      },
    });
  } catch (err) {
    console.error("[tickets/purchase]", err);
    return NextResponse.json({ error: "purchase_failed" }, { status: 500 });
  }
}
