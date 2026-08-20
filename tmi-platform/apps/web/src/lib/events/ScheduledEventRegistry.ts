/**
 * Minimal scheduled-event glue — canonical timezone windows for flagship shows
 * + Live Online Concerts / World Releases catalog (one registry, many surfaces).
 * Bots and UI read this registry; no parallel ConcertRuntime / ConcertV2 product.
 */

import { getMondayNightStageWindow, type MondayNightStageWindow } from "@/lib/shows/MondayShowtime";
import { getWorldDancePartyWindow, type WorldDancePartyWindow } from "@/lib/dance/WorldDancePartyShowtime";
import { getSlowJamsWindow, type SlowJamsWindow } from "@/lib/radio/SlowJamsShowtime";
import { getShowHosts } from "@/lib/hosts/HostShowAssignmentEngine";

export type ScheduledEventPhase = MondayNightStageWindow["phase"];

export interface ScheduledEventDefinition {
  eventId: string;
  title: string;
  timezone: string;
  /** RRULE-style hint for bots (Monday weekly 8PM ET live window). */
  recurrence: string;
  entryRoute: string;
  hostShowId: string;
}

const MONDAY_NIGHT_STAGE: ScheduledEventDefinition = {
  eventId: "monday-night-stage",
  title: "Monday Night Stage",
  timezone: "America/New_York",
  recurrence: "FREQ=WEEKLY;BYDAY=MO;BYHOUR=20;BYMINUTE=0",
  entryRoute: "/shows/monday-night-stage",
  hostShowId: "monday-night-stage",
};

/** 🌍 Official World Dance Party — all-day Friday ET, bot-only create (Rule 21). */
const WORLD_DANCE_PARTY: ScheduledEventDefinition = {
  eventId: "world-dance-party",
  title: "World Dance Party",
  timezone: "America/New_York",
  recurrence: "FREQ=WEEKLY;BYDAY=FR",
  entryRoute: "/rooms/world-dance-party",
  hostShowId: "world-dance-party",
};

/** Sunday Slow Jams — all-day Sunday ET Stream & Win lounge (Rule 25). */
const SUNDAY_SLOW_JAMS: ScheduledEventDefinition = {
  eventId: "sunday-slow-jams",
  title: "Sunday Slow Jams",
  timezone: "America/New_York",
  recurrence: "FREQ=WEEKLY;BYDAY=SU",
  entryRoute: "/rooms/slow-jams",
  hostShowId: "sunday-slow-jams",
};

const REGISTRY: Record<string, ScheduledEventDefinition> = {
  "monday-night-stage": MONDAY_NIGHT_STAGE,
  "world-dance-party": WORLD_DANCE_PARTY,
  "sunday-slow-jams": SUNDAY_SLOW_JAMS,
};

export function getScheduledEventDefinition(eventId: string): ScheduledEventDefinition | undefined {
  return REGISTRY[eventId];
}

export function getMondayNightStageSchedule(from: Date = new Date()): MondayNightStageWindow & {
  definition: ScheduledEventDefinition;
  hosts: ReturnType<typeof getShowHosts>;
} {
  return {
    ...getMondayNightStageWindow(from),
    definition: MONDAY_NIGHT_STAGE,
    hosts: getShowHosts("monday-night-stage"),
  };
}

/**
 * General entry point — returns the normalized schedule phase for any
 * registered event. Components should call this rather than directly calling
 * event-specific window functions.
 */
export type EventScheduleStatus = ScheduledEventPhase;

export function getEventScheduleStatus(eventId: string, from: Date = new Date()): EventScheduleStatus {
  if (eventId === "monday-night-stage") {
    return getMondayNightStageWindow(from).phase;
  }
  if (eventId === "world-dance-party") {
    const phase = getWorldDancePartyWindow(from).phase;
    if (phase === "LIVE") return "LIVE";
    if (phase === "SUBMIT_OPEN") return "PRESHOW";
    if (phase === "ARCHIVE") return "ARCHIVE";
    return "CLOSED";
  }
  if (eventId === "sunday-slow-jams") {
    const phase = getSlowJamsWindow(from).phase;
    if (phase === "LIVE") return "LIVE";
    if (phase === "SUBMIT_OPEN") return "PRESHOW";
    if (phase === "ARCHIVE") return "ARCHIVE";
    return "CLOSED";
  }
  return "CLOSED";
}

/** Human-readable label for when the event opens next — for countdown UIs. */
export function getEventNextLabel(eventId: string, from: Date = new Date()): string {
  if (eventId === "monday-night-stage") {
    return getMondayNightStageWindow(from).label;
  }
  if (eventId === "world-dance-party") {
    return getWorldDancePartyWindow(from).label;
  }
  if (eventId === "sunday-slow-jams") {
    return getSlowJamsWindow(from).label;
  }
  return "Check back soon";
}

export function getWorldDancePartySchedule(from: Date = new Date()): WorldDancePartyWindow & {
  definition: ScheduledEventDefinition;
} {
  return {
    ...getWorldDancePartyWindow(from),
    definition: WORLD_DANCE_PARTY,
  };
}

export function getSlowJamsSchedule(from: Date = new Date()): SlowJamsWindow & {
  definition: ScheduledEventDefinition;
} {
  return {
    ...getSlowJamsWindow(from),
    definition: SUNDAY_SLOW_JAMS,
  };
}

/** True when the event is live or in preshow (access should be granted). */
export function isEventAccessible(eventId: string, from: Date = new Date()): boolean {
  const phase = getEventScheduleStatus(eventId, from);
  return phase === "LIVE" || phase === "PRESHOW";
}

// ── Live Online Concerts / Shows & Releases (canonical catalog types) ─────────

/** FeedItem.type — durable catalog rows (Rule 8; no parallel ConcertV2 store). */
export const SHOWS_RELEASE_FEED_TYPE = "SHOWS_RELEASE_EVENT" as const;

/** Platform venue slug for online ticket inventory (Rule 17 — platform issues). */
export const TMI_LIVE_ONLINE_VENUE_SLUG = "tmi-live-online";

/**
 * Event kinds — public language uses "Live Online Concerts" for scheduled concerts.
 * Internal Mini vs World matches Rule 21 (⭐ MINI instant / 🌍 WORLD scheduled).
 */
export type ShowsReleaseKind =
  | "MINI_CONCERT"
  | "LIVE_ONLINE_CONCERT"
  | "MINI_RELEASE"
  | "WORLD_RELEASE";

export type ShowsReleasePublishStatus = "DRAFT" | "PUBLISHED" | "CANCELED";

/** Calendar phase — same PRESHOW → LIVE → POSTSHOW pattern as Monday Night Stage. */
export type ShowsReleasePhase = "DRAFT" | "CLOSED" | "PRESHOW" | "LIVE" | "POSTSHOW";

/** Card / marquee status chips (no viewer counts — user lock). */
export type ShowsReleaseCardStatus =
  | "LIVE_NOW"
  | "STARTING_SOON"
  | "TODAY"
  | "UPCOMING"
  | "SOLD_OUT"
  | "FREE"
  | "TICKET_REQUIRED"
  | "ENDED"
  | "REPLAY";

export interface ShowsReleaseSponsorIds {
  presentingSponsorId?: string;
  venueSponsorId?: string;
  equipmentSponsorId?: string;
  releaseSponsorId?: string;
  artistSponsorId?: string;
}

export interface ShowsReleaseRecord {
  eventId: string;
  kind: ShowsReleaseKind;
  title: string;
  description: string;
  artworkUrl: string | null;
  /** Performer user id (artistUserId on Prisma Event). */
  performerId: string;
  performerName: string;
  performerSlug?: string;
  /** Canonical IANA timezone — never device local as source of truth. */
  timezone: string;
  scheduledStartIso: string;
  scheduledEndIso: string | null;
  venueTheme: string | null;
  /** Performer *requests* free vs ticketed — Ticket Engine issues inventory. */
  ticketRequested: boolean;
  /** Requested face value USD when ticketRequested (platform may issue TicketType). */
  requestedPriceUsd: number | null;
  inventoryCapacity: number | null;
  inventoryIssued: number;
  replayAllowed: boolean;
  publishStatus: ShowsReleasePublishStatus;
  roomId: string;
  previewUrl: string | null;
  sponsors: ShowsReleaseSponsorIds;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ShowsReleasePublicCard extends ShowsReleaseRecord {
  phase: ShowsReleasePhase;
  cardStatuses: ShowsReleaseCardStatus[];
  /** Public badge: Live Online Concert | Mini Concert | World Release | Mini Release */
  publicTypeLabel: string;
  authority: "world" | "mini";
  dayTimeLabel: string;
  priceLabel: string;
  primaryCta: "WATCH_NOW" | "GET_TICKET" | "GET_ACCESS" | "REPLAY" | "STARTING_SOON" | "VIEW";
  joinHref: string;
  ticketCheckoutHref: string | null;
}

const PRESHOW_MS = 45 * 60 * 1000;
const STARTING_SOON_MS = 60 * 60 * 1000;
const DEFAULT_LIVE_MS = 3 * 60 * 60 * 1000;

export function isMiniShowsKind(kind: ShowsReleaseKind): boolean {
  return kind === "MINI_CONCERT" || kind === "MINI_RELEASE";
}

export function isReleaseShowsKind(kind: ShowsReleaseKind): boolean {
  return kind === "MINI_RELEASE" || kind === "WORLD_RELEASE";
}

export function publicTypeLabelForKind(kind: ShowsReleaseKind): string {
  switch (kind) {
    case "MINI_CONCERT":
      return "Mini Concert";
    case "LIVE_ONLINE_CONCERT":
      return "Live Online Concert";
    case "MINI_RELEASE":
      return "Mini Release";
    case "WORLD_RELEASE":
      return "World Release";
    default:
      return "Show";
  }
}

export function authorityForKind(kind: ShowsReleaseKind): "world" | "mini" {
  return isMiniShowsKind(kind) ? "mini" : "world";
}

export function streamCategoryForKind(kind: ShowsReleaseKind): "concert" {
  // Discovery maps concert → concerts; releases share the SHOWS & RELEASES wall.
  void kind;
  return "concert";
}

/** Same calendar protocol as Monday Night Stage — timezone wall clock via ISO instants. */
export function getShowsReleasePhase(
  record: Pick<ShowsReleaseRecord, "publishStatus" | "scheduledStartIso" | "scheduledEndIso">,
  from: Date = new Date(),
): ShowsReleasePhase {
  if (record.publishStatus === "DRAFT") return "DRAFT";
  if (record.publishStatus === "CANCELED") return "POSTSHOW";

  const start = Date.parse(record.scheduledStartIso);
  if (!Number.isFinite(start)) return "CLOSED";

  const end = record.scheduledEndIso
    ? Date.parse(record.scheduledEndIso)
    : start + DEFAULT_LIVE_MS;
  const now = from.getTime();
  const liveEnd = Number.isFinite(end) ? end : start + DEFAULT_LIVE_MS;
  const preshowStart = start - PRESHOW_MS;

  if (now >= liveEnd) return "POSTSHOW";
  if (now >= start && now < liveEnd) return "LIVE";
  if (now >= preshowStart && now < start) return "PRESHOW";
  return "CLOSED";
}

function isSameCalendarDayInTz(a: Date, b: Date, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(a) === fmt.format(b);
}

export function formatShowsDayTime(iso: string, timeZone: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "Schedule TBD";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export function computeShowsReleaseCardStatuses(
  record: ShowsReleaseRecord,
  from: Date = new Date(),
): ShowsReleaseCardStatus[] {
  const phase = getShowsReleasePhase(record, from);
  const badges: ShowsReleaseCardStatus[] = [];
  const start = Date.parse(record.scheduledStartIso);
  const now = from.getTime();

  if (phase === "LIVE") badges.push("LIVE_NOW");
  else if (phase === "PRESHOW" || (Number.isFinite(start) && start - now > 0 && start - now <= STARTING_SOON_MS)) {
    badges.push("STARTING_SOON");
  } else if (phase === "POSTSHOW") {
    badges.push(record.replayAllowed ? "REPLAY" : "ENDED");
  } else if (phase === "CLOSED" && Number.isFinite(start)) {
    if (isSameCalendarDayInTz(new Date(start), from, record.timezone)) badges.push("TODAY");
    else badges.push("UPCOMING");
  }

  if (record.ticketRequested) {
    const soldOut =
      typeof record.inventoryCapacity === "number" &&
      record.inventoryCapacity > 0 &&
      record.inventoryIssued >= record.inventoryCapacity;
    if (soldOut) badges.push("SOLD_OUT");
    else badges.push("TICKET_REQUIRED");
  } else {
    badges.push("FREE");
  }

  return badges;
}

export function toShowsReleasePublicCard(
  record: ShowsReleaseRecord,
  from: Date = new Date(),
): ShowsReleasePublicCard {
  const phase = getShowsReleasePhase(record, from);
  const cardStatuses = computeShowsReleaseCardStatuses(record, from);
  const soldOut = cardStatuses.includes("SOLD_OUT");
  const ticketed = record.ticketRequested && !soldOut;
  const priceLabel = !record.ticketRequested
    ? "FREE"
    : soldOut
      ? "SOLD OUT"
      : typeof record.requestedPriceUsd === "number" && record.requestedPriceUsd > 0
        ? `$${record.requestedPriceUsd.toFixed(record.requestedPriceUsd % 1 === 0 ? 0 : 2)}`
        : "TICKET";

  let primaryCta: ShowsReleasePublicCard["primaryCta"] = "VIEW";
  if (phase === "LIVE") primaryCta = ticketed ? "GET_TICKET" : "WATCH_NOW";
  else if (phase === "PRESHOW") primaryCta = ticketed ? "GET_TICKET" : "STARTING_SOON";
  else if (phase === "POSTSHOW" && record.replayAllowed) primaryCta = "REPLAY";
  else if (ticketed) primaryCta = "GET_TICKET";
  else if (phase === "CLOSED") primaryCta = "GET_ACCESS";

  const joinHref =
    phase === "LIVE" || phase === "PRESHOW" || (phase === "POSTSHOW" && record.replayAllowed)
      ? `/live/rooms/${encodeURIComponent(record.roomId)}?from=shows-releases&eventId=${encodeURIComponent(record.eventId)}`
      : `/concerts/${encodeURIComponent(record.eventId)}`;

  const ticketCheckoutHref = ticketed
    ? `/concerts/${encodeURIComponent(record.eventId)}?checkout=1`
    : null;

  return {
    ...record,
    phase,
    cardStatuses,
    publicTypeLabel: publicTypeLabelForKind(record.kind),
    authority: authorityForKind(record.kind),
    dayTimeLabel: formatShowsDayTime(record.scheduledStartIso, record.timezone),
    priceLabel,
    primaryCta,
    joinHref,
    ticketCheckoutHref,
  };
}

export function sortShowsReleaseCards(cards: ShowsReleasePublicCard[]): ShowsReleasePublicCard[] {
  const rank = (c: ShowsReleasePublicCard): number => {
    if (c.phase === "LIVE") return 0;
    if (c.phase === "PRESHOW") return 1;
    if (c.cardStatuses.includes("TODAY")) return 2;
    if (c.phase === "CLOSED") return 3;
    if (c.phase === "POSTSHOW") return 4;
    return 5;
  };
  return [...cards].sort((a, b) => {
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return Date.parse(a.scheduledStartIso) - Date.parse(b.scheduledStartIso);
  });
}

export function parseShowsReleaseRecord(raw: unknown): ShowsReleaseRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const kind = o.kind;
  if (
    kind !== "MINI_CONCERT" &&
    kind !== "LIVE_ONLINE_CONCERT" &&
    kind !== "MINI_RELEASE" &&
    kind !== "WORLD_RELEASE"
  ) {
    return null;
  }
  const eventId = typeof o.eventId === "string" ? o.eventId : "";
  const title = typeof o.title === "string" ? o.title : "";
  const performerId = typeof o.performerId === "string" ? o.performerId : "";
  const scheduledStartIso = typeof o.scheduledStartIso === "string" ? o.scheduledStartIso : "";
  const roomId = typeof o.roomId === "string" ? o.roomId : "";
  if (!eventId || !title || !performerId || !scheduledStartIso || !roomId) return null;

  const sponsors =
    o.sponsors && typeof o.sponsors === "object" ? (o.sponsors as ShowsReleaseSponsorIds) : {};

  return {
    eventId,
    kind,
    title,
    description: typeof o.description === "string" ? o.description : "",
    artworkUrl: typeof o.artworkUrl === "string" ? o.artworkUrl : null,
    performerId,
    performerName: typeof o.performerName === "string" ? o.performerName : "Performer",
    performerSlug: typeof o.performerSlug === "string" ? o.performerSlug : undefined,
    timezone: typeof o.timezone === "string" && o.timezone ? o.timezone : "America/New_York",
    scheduledStartIso,
    scheduledEndIso: typeof o.scheduledEndIso === "string" ? o.scheduledEndIso : null,
    venueTheme: typeof o.venueTheme === "string" ? o.venueTheme : null,
    ticketRequested: o.ticketRequested === true,
    requestedPriceUsd:
      typeof o.requestedPriceUsd === "number" && o.requestedPriceUsd >= 0
        ? o.requestedPriceUsd
        : null,
    inventoryCapacity:
      typeof o.inventoryCapacity === "number" ? o.inventoryCapacity : null,
    inventoryIssued: typeof o.inventoryIssued === "number" ? o.inventoryIssued : 0,
    replayAllowed: o.replayAllowed !== false,
    publishStatus:
      o.publishStatus === "DRAFT" || o.publishStatus === "CANCELED" ? o.publishStatus : "PUBLISHED",
    roomId,
    previewUrl: typeof o.previewUrl === "string" ? o.previewUrl : null,
    sponsors,
    createdAtIso:
      typeof o.createdAtIso === "string" ? o.createdAtIso : new Date().toISOString(),
    updatedAtIso:
      typeof o.updatedAtIso === "string" ? o.updatedAtIso : new Date().toISOString(),
  };
}

export function isShowsOrReleaseDiscoveryCategory(
  category: string | null | undefined,
  categories: readonly string[] = [],
): boolean {
  const pool = new Set([category ?? "", ...categories].map((c) => c.toLowerCase()));
  return pool.has("concerts") || pool.has("releases");
}
