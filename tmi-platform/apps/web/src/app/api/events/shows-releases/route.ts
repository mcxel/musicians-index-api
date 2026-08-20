/**
 * GET/POST /api/events/shows-releases
 * Canonical Shows & Releases catalog — Prisma Event + FeedItem (no ConcertV2).
 * Performers request events; platform creates Event + optional TicketType (Rule 17).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getActiveSessionsDurable } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import {
  SHOWS_RELEASE_FEED_TYPE,
  TMI_LIVE_ONLINE_VENUE_SLUG,
  authorityForKind,
  parseShowsReleaseRecord,
  sortShowsReleaseCards,
  streamCategoryForKind,
  toShowsReleasePublicCard,
  type ShowsReleaseKind,
  type ShowsReleaseRecord,
  type ShowsReleaseSponsorIds,
} from "@/lib/events/ScheduledEventRegistry";

export const dynamic = "force-dynamic";

const GOLD_TIERS = new Set(["GOLD", "PLATINUM", "DIAMOND"]);

function canPublish(tier: string, role: string): boolean {
  const t = tier.toUpperCase();
  const r = role.toUpperCase();
  if (GOLD_TIERS.has(t)) return true;
  if (["ADMIN", "SUPERADMIN", "STAFF", "VENUE", "PROMOTER"].includes(r)) return true;
  return false;
}

function parseKind(raw: unknown): ShowsReleaseKind | null {
  if (
    raw === "MINI_CONCERT" ||
    raw === "LIVE_ONLINE_CONCERT" ||
    raw === "MINI_RELEASE" ||
    raw === "WORLD_RELEASE"
  ) {
    return raw;
  }
  return null;
}

async function listCatalogRecords(opts?: {
  performerId?: string;
  includeDraftsFor?: string;
}): Promise<ShowsReleaseRecord[]> {
  const rows = await prisma.feedItem.findMany({
    where: {
      type: SHOWS_RELEASE_FEED_TYPE,
      ...(opts?.performerId ? { userId: opts.performerId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const out: ShowsReleaseRecord[] = [];
  for (const row of rows) {
    const rec = parseShowsReleaseRecord(row.data);
    if (!rec) continue;
    if (rec.publishStatus === "DRAFT" && opts?.includeDraftsFor !== rec.performerId) {
      continue;
    }
    if (rec.publishStatus === "CANCELED") continue;
    out.push(rec);
  }
  return out;
}

function mergeLivePreview(
  records: ShowsReleaseRecord[],
  sessions: Awaited<ReturnType<typeof getActiveSessionsDurable>>,
): ShowsReleaseRecord[] {
  const byRoom = new Map(sessions.map((s) => [s.roomId, s]));
  const byUser = new Map(sessions.map((s) => [s.userId, s]));
  return records.map((r) => {
    const live = byRoom.get(r.roomId) ?? byUser.get(r.performerId);
    if (!live) return r;
    return {
      ...r,
      roomId: live.roomId || r.roomId,
      previewUrl: live.previewUrl ?? live.thumbnailUrl ?? r.previewUrl,
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const mine = req.nextUrl.searchParams.get("mine") === "1";
    const performerIdParam = req.nextUrl.searchParams.get("performerId")?.trim() || undefined;
    const performerSlug = req.nextUrl.searchParams.get("performerSlug")?.trim() || undefined;
    const auth = await getTmiAuth();
    const performerId = mine && auth?.user.id ? auth.user.id : performerIdParam;

    let records = await listCatalogRecords({
      performerId,
      includeDraftsFor: auth?.user.id,
    });

    if (performerSlug) {
      records = records.filter(
        (r) =>
          r.performerSlug === performerSlug ||
          r.performerId === performerSlug ||
          r.performerName.toLowerCase().replace(/\s+/g, "-") === performerSlug,
      );
    }

    const sessions = await getActiveSessionsDurable().catch(() => []);
    records = mergeLivePreview(records, sessions);

    const cards = sortShowsReleaseCards(records.map((r) => toShowsReleasePublicCard(r)));
    return NextResponse.json({
      ok: true,
      events: cards,
      venueSlug: TMI_LIVE_ONLINE_VENUE_SLUG,
      publicName: "Live Online Concerts",
    });
  } catch (err) {
    console.error("[api/events/shows-releases] GET", err);
    return NextResponse.json({ ok: false, error: "list_failed", events: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTmiAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: "authentication_required" }, { status: 401 });
    }
    if (!canPublish(auth.user.tier, auth.user.role)) {
      return NextResponse.json(
        { ok: false, error: "gold_tier_required", message: "Gold or higher required to publish shows & releases." },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const kind = parseKind(body.kind);
    if (!kind) {
      return NextResponse.json({ ok: false, error: "kind_required" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ ok: false, error: "title_required" }, { status: 400 });
    }

    const timezone =
      typeof body.timezone === "string" && body.timezone.trim()
        ? body.timezone.trim()
        : "America/New_York";

    const isMini = authorityForKind(kind) === "mini";
    let scheduledStart: Date;
    if (typeof body.scheduledStartIso === "string" && body.scheduledStartIso.trim()) {
      scheduledStart = new Date(body.scheduledStartIso);
    } else if (isMini) {
      scheduledStart = new Date();
    } else {
      return NextResponse.json(
        { ok: false, error: "scheduledStartIso_required", message: "Scheduled shows need a start time in the canonical timezone." },
        { status: 400 },
      );
    }
    if (!Number.isFinite(scheduledStart.getTime())) {
      return NextResponse.json({ ok: false, error: "invalid_scheduledStartIso" }, { status: 400 });
    }

    const scheduledEnd =
      typeof body.scheduledEndIso === "string" && body.scheduledEndIso.trim()
        ? new Date(body.scheduledEndIso)
        : new Date(scheduledStart.getTime() + 3 * 60 * 60 * 1000);

    const ticketRequested = body.ticketRequested === true;
    const requestedPriceUsd =
      typeof body.requestedPriceUsd === "number" && body.requestedPriceUsd >= 0
        ? body.requestedPriceUsd
        : ticketRequested
          ? 10
          : null;
    const asDraft = body.asDraft === true;
    const roomId =
      typeof body.roomId === "string" && body.roomId.trim()
        ? body.roomId.trim()
        : `show-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const sponsors: ShowsReleaseSponsorIds =
      body.sponsors && typeof body.sponsors === "object"
        ? (body.sponsors as ShowsReleaseSponsorIds)
        : {};

    // Platform Event Runtime creates the Event record (performer requests, does not mint tickets).
    const event = await prisma.event.create({
      data: {
        title,
        description: typeof body.description === "string" ? body.description : null,
        startsAt: scheduledStart,
        endsAt: Number.isFinite(scheduledEnd.getTime()) ? scheduledEnd : null,
        timezone,
        venueName:
          typeof body.venueTheme === "string" && body.venueTheme.trim()
            ? body.venueTheme.trim()
            : "TMI Live Online",
        artistUserId: auth.user.id,
        status: asDraft ? "DRAFT" : "PUBLISHED",
      },
    });

    // Ticket inventory issued by platform when ticketed (Rule 17).
    if (ticketRequested && !asDraft) {
      const priceCents = Math.round((requestedPriceUsd ?? 10) * 100);
      const capacity =
        typeof body.inventoryCapacity === "number" && body.inventoryCapacity > 0
          ? Math.min(Math.floor(body.inventoryCapacity), 50_000)
          : 500;
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: "STANDARD",
          priceCents,
          currency: "USD",
          quantity: capacity,
        },
      });
      await prisma.eventInventory
        .upsert({
          where: { key: `${TMI_LIVE_ONLINE_VENUE_SLUG}::${event.id}::STANDARD` },
          create: {
            key: `${TMI_LIVE_ONLINE_VENUE_SLUG}::${event.id}::STANDARD`,
            capacity,
            issued: 0,
          },
          update: { capacity },
        })
        .catch(() => null);
    }

    const nowIso = new Date().toISOString();
    const record: ShowsReleaseRecord = {
      eventId: event.id,
      kind,
      title,
      description: typeof body.description === "string" ? body.description : "",
      artworkUrl: typeof body.artworkUrl === "string" ? body.artworkUrl : null,
      performerId: auth.user.id,
      performerName: auth.user.name || auth.user.email.split("@")[0] || "Performer",
      performerSlug:
        typeof body.performerSlug === "string" ? body.performerSlug : undefined,
      timezone,
      scheduledStartIso: scheduledStart.toISOString(),
      scheduledEndIso: Number.isFinite(scheduledEnd.getTime())
        ? scheduledEnd.toISOString()
        : null,
      venueTheme: typeof body.venueTheme === "string" ? body.venueTheme : null,
      ticketRequested,
      requestedPriceUsd: ticketRequested ? requestedPriceUsd : null,
      inventoryCapacity:
        typeof body.inventoryCapacity === "number" ? body.inventoryCapacity : ticketRequested ? 500 : null,
      inventoryIssued: 0,
      replayAllowed: body.replayAllowed !== false,
      publishStatus: asDraft ? "DRAFT" : "PUBLISHED",
      roomId,
      previewUrl: null,
      sponsors,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    await prisma.feedItem.create({
      data: {
        userId: auth.user.id,
        type: SHOWS_RELEASE_FEED_TYPE,
        entityId: event.id,
        entityType: kind,
        data: record as object,
        expiresAt: new Date("2040-01-01T00:00:00Z"),
        weight: isMini ? 6 : 8,
      },
    });

    // Mini kinds with no advance schedule: register live session immediately (Event → LiveSession → roomId).
    let liveRoomUrl: string | null = null;
    if (!asDraft && isMini) {
      const { registerLiveSession } = await import("@/lib/broadcast/globalLiveSessionStore");
      const { persistSessionNow } = await import(
        "@/lib/broadcast/GlobalLiveSessionRegistry.server"
      );
      const session = registerLiveSession({
        userId: auth.user.id,
        displayName: record.performerName,
        title: record.title,
        category: streamCategoryForKind(kind),
        roomId,
        thumbnailUrl: record.artworkUrl ?? undefined,
        privacy: ticketRequested ? "PAID_ENTRY" : "PUBLIC",
        entryPriceUsd: ticketRequested ? requestedPriceUsd ?? undefined : undefined,
        accentColor: isReleaseKind(kind) ? "#FF8C00" : "#00FFFF",
        performerTier: normalizeTier(auth.user.tier),
      });
      await persistSessionNow(session).catch(() => null);
      liveRoomUrl = `/live/rooms/${encodeURIComponent(roomId)}?from=shows-releases&eventId=${encodeURIComponent(event.id)}`;
    }

    return NextResponse.json({
      ok: true,
      event: toShowsReleasePublicCard(record),
      liveRoomUrl,
      venueSlug: TMI_LIVE_ONLINE_VENUE_SLUG,
    });
  } catch (err) {
    console.error("[api/events/shows-releases] POST", err);
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 500 });
  }
}

function isReleaseKind(kind: ShowsReleaseKind): boolean {
  return kind === "MINI_RELEASE" || kind === "WORLD_RELEASE";
}

function normalizeTier(
  tier: string,
): "free" | "silver" | "gold" | "platinum" | "diamond" {
  const t = tier.toLowerCase();
  if (t === "silver" || t === "gold" || t === "platinum" || t === "diamond") return t;
  return "free";
}
