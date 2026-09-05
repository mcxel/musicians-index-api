export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  getDigitalOffer,
  listDigitalOffersForOwner,
  publishDigitalOffer,
  purchaseDigitalOffer,
  quoteDigitalOffer,
  saveDigitalOfferDraft,
  loadTicketForPreview,
  type DigitalTicketType,
} from "@/lib/tickets/DigitalTicketOfferEngine";
import { getTicketFeePolicy } from "@/lib/tickets/TicketFeeResolver";

const DIGITAL_CREATOR_ROLES = new Set([
  "PERFORMER",
  "BAND",
  "COMEDIAN",
  "DJ",
  "DANCER",
  "VENUE",
  "PROMOTER",
  "ADMIN",
  "SUPERADMIN",
  "OWNER",
]);

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticketId");
  if (ticketId) {
    const preview = await loadTicketForPreview(ticketId);
    if (!preview) {
      return NextResponse.json({ ok: false, error: "ticket_not_found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      ticket: preview.ticket,
      offer: preview.offer,
      feePolicy: getTicketFeePolicy(),
    });
  }

  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const offerId = req.nextUrl.searchParams.get("offerId");
  if (offerId) {
    const offer = await getDigitalOffer(offerId);
    if (!offer) {
      return NextResponse.json({ ok: false, error: "offer_not_found" }, { status: 404 });
    }
    const quote = await quoteDigitalOffer(offerId, 1);
    return NextResponse.json({ ok: true, offer, quote, feePolicy: getTicketFeePolicy() });
  }

  const offers = await listDigitalOffersForOwner(auth.user.id);
  return NextResponse.json({ ok: true, offers, feePolicy: getTicketFeePolicy() });
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const role = (auth.user.role ?? "").toUpperCase();
  const body = await req.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "save";

  if (action === "save" || action === "draft") {
    if (!DIGITAL_CREATOR_ROLES.has(role)) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Only performers and event owners may create digital ticket offers.",
        },
        { status: 403 },
      );
    }

    try {
      const offer = await saveDigitalOfferDraft({
        id: typeof body.id === "string" ? body.id : undefined,
        eventId: typeof body.eventId === "string" ? body.eventId : "",
        ownerId: auth.user.id,
        ticketType: (typeof body.ticketType === "string"
          ? body.ticketType
          : "general") as DigitalTicketType,
        title: typeof body.title === "string" ? body.title : "Digital Ticket",
        artworkAssetId: typeof body.artworkAssetId === "string" ? body.artworkAssetId : null,
        artworkUrl: typeof body.artworkUrl === "string" ? body.artworkUrl : null,
        priceCents:
          typeof body.priceCents === "number"
            ? body.priceCents
            : Math.round((Number(body.price) || 2.99) * 100),
        capacity: typeof body.capacity === "number" ? body.capacity : 100,
        pricingZone: typeof body.pricingZone === "string" ? body.pricingZone : null,
        seatMapId: typeof body.seatMapId === "string" ? body.seatMapId : null,
        saleStart: typeof body.saleStart === "string" ? body.saleStart : null,
        saleEnd: typeof body.saleEnd === "string" ? body.saleEnd : null,
        status: "draft",
      });
      const quote = await quoteDigitalOffer(offer.id, 1);
      return NextResponse.json({
        ok: true,
        offer,
        quote,
        feePolicy: getTicketFeePolicy(),
        next: "review_publish",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "save_failed" },
        { status: 400 },
      );
    }
  }

  if (action === "publish") {
    const offerId = typeof body.offerId === "string" ? body.offerId : "";
    if (!offerId) {
      return NextResponse.json({ error: "offerId_required" }, { status: 400 });
    }
    try {
      const offer = await publishDigitalOffer(offerId, auth.user.id);
      const quote = await quoteDigitalOffer(offer.id, 1);
      return NextResponse.json({
        ok: true,
        offer,
        quote,
        feePolicy: getTicketFeePolicy(),
        message: "Published — buyers can purchase. This is not buyer checkout.",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "publish_failed" },
        { status: 400 },
      );
    }
  }

  if (action === "test_purchase") {
    const offerId = typeof body.offerId === "string" ? body.offerId : "";
    if (!offerId) {
      return NextResponse.json({ error: "offerId_required" }, { status: 400 });
    }
    try {
      const existing = await getDigitalOffer(offerId);
      if (!existing) {
        return NextResponse.json({ error: "offer_not_found" }, { status: 404 });
      }
      if (existing.status === "draft" || existing.status === "review") {
        await publishDigitalOffer(offerId, auth.user.id);
      }
      const result = await purchaseDigitalOffer({
        offerId,
        buyerId: auth.user.id,
        quantity: 1,
        testPurchase: true,
      });
      return NextResponse.json({
        ok: true,
        ...result,
        feePolicy: getTicketFeePolicy(),
        message: "TEST PURCHASE issued — not a live buyer checkout.",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "test_purchase_failed" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
