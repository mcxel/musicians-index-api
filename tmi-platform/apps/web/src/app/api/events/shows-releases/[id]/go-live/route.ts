/**
 * POST /api/events/shows-releases/[id]/go-live
 * Opens scheduled Event → LiveSession on the reserved roomId when PRESHOW/LIVE window.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { registerLiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import { persistSessionNow } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import {
  SHOWS_RELEASE_FEED_TYPE,
  getShowsReleasePhase,
  parseShowsReleaseRecord,
  streamCategoryForKind,
  toShowsReleasePublicCard,
  type ShowsReleaseRecord,
} from "@/lib/events/ScheduledEventRegistry";
import { attachDigitalOfferToEvent, publishDigitalOffer } from "@/lib/tickets/DigitalTicketOfferEngine";
import { TICKET_FEE_POLICY_ID } from "@/lib/tickets/TicketFeeResolver";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await getTmiAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: "authentication_required" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const eventId = (id ?? "").trim();
    if (!eventId) {
      return NextResponse.json({ ok: false, error: "eventId_required" }, { status: 400 });
    }

    const feed = await prisma.feedItem.findFirst({
      where: {
        type: SHOWS_RELEASE_FEED_TYPE,
        entityId: eventId,
        userId: auth.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    const record = parseShowsReleaseRecord(feed?.data);
    if (!record || record.performerId !== auth.user.id) {
      return NextResponse.json({ ok: false, error: "event_not_found" }, { status: 404 });
    }

    const phase = getShowsReleasePhase(record);
    if (phase !== "PRESHOW" && phase !== "LIVE" && phase !== "CLOSED") {
      // CLOSED with start in the past handled above; allow early go-live only inside window
    }
    if (phase === "POSTSHOW" || phase === "DRAFT") {
      return NextResponse.json(
        { ok: false, error: "window_closed", phase, message: "Go-live is only available in the PRESHOW / LIVE window." },
        { status: 409 },
      );
    }

    // Strict: PRESHOW or LIVE only (CLOSED = not yet in window)
    if (phase === "CLOSED") {
      return NextResponse.json(
        {
          ok: false,
          error: "window_not_open",
          phase,
          message: "Go-live opens 45 minutes before scheduled start (canonical timezone).",
        },
        { status: 409 },
      );
    }

    const session = registerLiveSession({
      userId: auth.user.id,
      displayName: record.performerName,
      title: record.title,
      category: streamCategoryForKind(record.kind),
      roomId: record.roomId,
      thumbnailUrl: record.artworkUrl ?? undefined,
      privacy: record.ticketRequested ? "PAID_ENTRY" : "PUBLIC",
      entryPriceUsd: record.ticketRequested
        ? record.requestedPriceUsd ?? undefined
        : undefined,
      accentColor: record.kind.includes("RELEASE") ? "#FF8C00" : "#00FFFF",
    });
    await persistSessionNow(session).catch(() => null);

    // Minimal glue: attach online digital ticketing when event is ticketed.
    let digitalOfferId = record.digitalOfferId ?? null;
    if (record.ticketRequested && !digitalOfferId) {
      const priceCents =
        record.onlineTicketPriceCents ??
        Math.round((record.requestedPriceUsd ?? 2.99) * 100);
      const offer = await attachDigitalOfferToEvent({
        eventId,
        ownerId: auth.user.id,
        title: record.title,
        priceCents,
        capacity: record.onlineCapacity ?? record.inventoryCapacity ?? 500,
        artworkUrl: record.artworkUrl,
      });
      try {
        await publishDigitalOffer(offer.id, auth.user.id);
        digitalOfferId = offer.id;
      } catch {
        digitalOfferId = offer.id;
      }
    }

    const updated: ShowsReleaseRecord = {
      ...record,
      previewUrl: session.previewUrl,
      eventOwnerId: record.eventOwnerId ?? auth.user.id,
      performerIds: record.performerIds ?? [auth.user.id],
      onlineTicketPriceCents:
        record.onlineTicketPriceCents ??
        (record.requestedPriceUsd != null
          ? Math.round(record.requestedPriceUsd * 100)
          : null),
      platformFeePolicyId: record.platformFeePolicyId ?? TICKET_FEE_POLICY_ID,
      onlineTicketingPolicy:
        record.onlineTicketingPolicy ??
        (record.ticketRequested ? "ticketed" : "open"),
      digitalOfferId,
      updatedAtIso: new Date().toISOString(),
    };
    if (feed) {
      await prisma.feedItem.update({
        where: { id: feed.id },
        data: { data: updated as object },
      });
    }

    await prisma.event
      .update({
        where: { id: eventId },
        data: { status: "STARTED" },
      })
      .catch(() => null);

    return NextResponse.json({
      ok: true,
      event: toShowsReleasePublicCard(updated),
      roomId: session.roomId,
      liveRoomUrl: `/live/rooms/${encodeURIComponent(session.roomId)}?from=shows-releases&eventId=${encodeURIComponent(eventId)}`,
    });
  } catch (err) {
    console.error("[api/events/shows-releases/go-live]", err);
    return NextResponse.json({ ok: false, error: "go_live_failed" }, { status: 500 });
  }
}
