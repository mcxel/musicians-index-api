import type { RoomQueueEntry } from "@/lib/live/RoomResetEngine";
import { resolveVenueTicketTarget } from "@/lib/tickets/VenueTicketResolver";

export type TicketSection = {
  label: string;  // "Floor", "Section A", "Balcony", "VIP"
  priceCents: number;
  total: number;
  available: number;
  status: "on-sale" | "locking-soon" | "sold-out";
};

export type TicketInventoryEntry = {
  ticketId: string;
  eventId: string;
  venueSlug: string;
  venueName: string;
  city: string;
  state: string;
  roomTitle: string;
  startsAt: Date;
  queueLockAt: Date;
  totalInventory: number;
  claimedInventory: number;
  availableInventory: number;
  priceCents: number;
  sections: TicketSection[];
  status: "on-sale" | "locking-soon" | "sold-out";
  route: string;
  printRoute: string;
  eventRoute: string;
  venueRoute: string;
};

function resolvePriceCents(index: number, occupancy: number): number {
  const base = 1200 + index * 300;
  const pressure = Math.round((occupancy / 100) * 500);
  return base + pressure;
}

function buildSections(baseCents: number, totalInventory: number, claimedInventory: number, lockingSoon: boolean, availableInventory: number): TicketSection[] {
  const sectionDefs = [
    { label: "Floor",     share: 0.35, mult: 1.0 },
    { label: "Section A", share: 0.25, mult: 0.8 },
    { label: "Section B", share: 0.25, mult: 0.7 },
    { label: "Balcony",   share: 0.10, mult: 0.6 },
    { label: "VIP",       share: 0.05, mult: 2.2 },
  ];
  let remainingAvail = availableInventory;
  return sectionDefs.map(({ label, share, mult }) => {
    const total    = Math.round(totalInventory * share);
    const claimed  = Math.round(claimedInventory * share);
    const avail    = Math.min(total, Math.max(0, remainingAvail > 0 ? Math.round(total - claimed) : 0));
    remainingAvail = Math.max(0, remainingAvail - avail);
    const sectionStatus: TicketSection["status"] =
      avail === 0 ? "sold-out" : lockingSoon ? "locking-soon" : "on-sale";
    return { label, priceCents: Math.round(baseCents * mult), total, available: avail, status: sectionStatus };
  });
}

export function buildTicketInventorySnapshot(args: {
  now: Date;
  genre: string;
  roomQueue: RoomQueueEntry[];
}): TicketInventoryEntry[] {
  const { now, genre, roomQueue } = args;

  return roomQueue.map((room, index) => {
    const target = resolveVenueTicketTarget({ genre, roomTitle: room.title, slotIndex: index });
    const totalInventory = 140 + index * 40;
    const claimedInventory = Math.min(totalInventory, Math.round(totalInventory * (room.occupancy / 100)));
    const availableInventory = Math.max(0, totalInventory - claimedInventory);
    const queueLockAt = new Date(room.startsAt.getTime() - 6 * 60 * 1000);
    const lockingSoon = availableInventory > 0 && queueLockAt.getTime() - now.getTime() <= 15 * 60 * 1000;

    return {
      ticketId: `tix-${target.eventId}`,
      eventId: target.eventId,
      venueSlug: target.venueSlug,
      venueName: target.venueName,
      city: target.city,
      state: target.state,
      roomTitle: room.title,
      startsAt: room.startsAt,
      queueLockAt,
      totalInventory,
      claimedInventory,
      availableInventory,
      priceCents: resolvePriceCents(index, room.occupancy),
      sections: buildSections(resolvePriceCents(index, room.occupancy), totalInventory, claimedInventory, lockingSoon, availableInventory),
      status: availableInventory === 0 ? "sold-out" : lockingSoon ? "locking-soon" : "on-sale",
      route: target.route,
      printRoute: target.printRoute,
      eventRoute: target.eventRoute,
      venueRoute: target.venueRoute,
    };
  });
}
