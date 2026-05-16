import type { RoomQueueEntry } from "@/lib/live/RoomResetEngine";
import { formatCountdownMs } from "@/lib/live/CountdownResolver";
import {
  buildTicketInventorySnapshot,
  type TicketInventoryEntry,
} from "@/lib/tickets/TicketInventoryEngine";
import { resolveVenueTicketTarget } from "@/lib/tickets/VenueTicketResolver";

export type HomeTicketPromo = {
  title: string;
  href: string;         // buy route
  printRoute: string;   // print preview route
  venueRoute: string;   // venue detail page
  eventRoute: string;   // event detail page
  subtitle: string;
  badge: string;
  priceLabel: string;
  eventId: string;
  venueSlug: string;
};

function toUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function toPromo(now: Date, entry: TicketInventoryEntry): HomeTicketPromo {
  const lockCountdown = formatCountdownMs(entry.queueLockAt.getTime() - now.getTime());
  const statusBadge =
    entry.status === "sold-out"
      ? "SOLD OUT"
      : entry.status === "locking-soon"
      ? "LOCKING SOON"
      : "ON SALE";

  return {
    title: `${entry.venueName} Tickets`,
    href: entry.route,
    printRoute: entry.printRoute,
    venueRoute: entry.venueRoute,
    eventRoute: entry.eventRoute,
    subtitle:
      entry.status === "sold-out"
        ? `${entry.roomTitle} sold out`
        : `Queue lock in ${lockCountdown}`,
    badge: statusBadge,
    priceLabel: `from ${toUsd(entry.priceCents)}`,
    eventId: entry.eventId,
    venueSlug: entry.venueSlug,
  };
}

export function buildHome5TicketPromos(args: {
  now: Date;
  genre: string;
  roomQueue: RoomQueueEntry[];
  limit?: number;
}): HomeTicketPromo[] {
  const { now, genre, roomQueue, limit = 2 } = args;
  const inventory = buildTicketInventorySnapshot({ now, genre, roomQueue });

  const ranked = [...inventory].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { "on-sale": 0, "locking-soon": 1, "sold-out": 2 } as const;
      return order[a.status] - order[b.status];
    }
    return b.availableInventory - a.availableInventory;
  });

  return ranked.slice(0, limit).map((entry) => toPromo(now, entry));
}

// ─── Home3 static event ticket promos ────────────────────────────────────────

type StaticEventDef = {
  eventName: string;
  genre: string;
  roomTitle: string;
  dateDisplay: string;
  priceCents: number;
  statusOverride?: TicketInventoryEntry["status"];
};

const HOME3_EVENTS: StaticEventDef[] = [
  { eventName: "Crown Duel Night",      genre: "Hip-Hop",     roomTitle: "crown-duel-night",      dateDisplay: "Sat 10 May",  priceCents: 4500 },
  { eventName: "Genre Drop Show",       genre: "Electronic",  roomTitle: "genre-drop-show",       dateDisplay: "Fri 9 May",   priceCents: 2000 },
  { eventName: "Monday Night Stage",    genre: "R&B",         roomTitle: "monday-night-stage",    dateDisplay: "Mon 5 May",   priceCents: 0 },
  { eventName: "World Premiere Cypher", genre: "Hip-Hop",     roomTitle: "premiere-cypher",       dateDisplay: "Sun 11 May",  priceCents: 1500 },
];

export function buildHome3TicketPromos(now: Date, limit = 4): HomeTicketPromo[] {
  return HOME3_EVENTS.slice(0, limit).map((def, index) => {
    const target = resolveVenueTicketTarget({ genre: def.genre, roomTitle: def.roomTitle, slotIndex: index });
    const isFree = def.priceCents === 0;
    const status: TicketInventoryEntry["status"] = def.statusOverride ?? "on-sale";
    const badge = status === "sold-out" ? "SOLD OUT" : status === "locking-soon" ? "LOCKING SOON" : isFree ? "FREE" : "ON SALE";
    return {
      title:      def.eventName,
      href:       target.route,
      printRoute: target.printRoute,
      venueRoute: target.venueRoute,
      eventRoute: target.eventRoute,
      subtitle:   `${def.dateDisplay} · ${target.venueName}`,
      badge,
      priceLabel: isFree ? "Free entry" : `from $${(def.priceCents / 100).toFixed(2)}`,
      eventId:    target.eventId,
      venueSlug:  target.venueSlug,
    };
  });
}
