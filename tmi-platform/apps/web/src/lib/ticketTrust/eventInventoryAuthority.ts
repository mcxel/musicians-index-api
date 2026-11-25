/**
 * Canonical EventInventory channel authority + capacity-safe mutations.
 * Channels share ONE capacity. Parallel POS pools forbidden.
 */

import { appendFinancialAudit } from "./financialAuditLedger";

export type InventoryChannel =
  | "PUBLIC_ONLINE"
  | "BOX_OFFICE"
  | "PHYSICAL_BLOCK"
  | "WILL_CALL"
  | "PERFORMER_COMP"
  | "PROMOTER_COMP"
  | "VENUE_COMP"
  | "GUEST_LIST"
  | "HELD_RESERVED"
  | "PERFORMER_CREDENTIAL";

export interface ChannelAllocation {
  channel: InventoryChannel;
  capacity: number;
  issued: number;
  available: number;
}

export interface EventInventorySnapshot {
  inventoryKey: string;
  eventId: string;
  totalCapacity: number;
  channels: ChannelAllocation[];
  totalIssued: number;
  totalAllocated: number;
}

/** Pure in-memory inventory for atomic tests + channel math. */
const store = new Map<string, EventInventorySnapshot>();

export function inventoryKeyFor(venueSlug: string, eventId: string, tier: string): string {
  return `${venueSlug}::${eventId}::${tier}`;
}

function emptyChannels(totalCapacity: number): ChannelAllocation[] {
  // Default: all capacity on PUBLIC_ONLINE until explicit allocations exist.
  const channels: InventoryChannel[] = [
    "PUBLIC_ONLINE",
    "BOX_OFFICE",
    "PHYSICAL_BLOCK",
    "WILL_CALL",
    "PERFORMER_COMP",
    "PROMOTER_COMP",
    "VENUE_COMP",
    "GUEST_LIST",
    "HELD_RESERVED",
    "PERFORMER_CREDENTIAL",
  ];
  return channels.map((channel) => ({
    channel,
    capacity: channel === "PUBLIC_ONLINE" ? totalCapacity : 0,
    issued: 0,
    available: channel === "PUBLIC_ONLINE" ? totalCapacity : 0,
  }));
}

export function ensureInventory(input: {
  inventoryKey: string;
  eventId: string;
  totalCapacity: number;
}): EventInventorySnapshot {
  const existing = store.get(input.inventoryKey);
  if (existing) return existing;
  const snap: EventInventorySnapshot = {
    inventoryKey: input.inventoryKey,
    eventId: input.eventId,
    totalCapacity: input.totalCapacity,
    channels: emptyChannels(input.totalCapacity),
    totalIssued: 0,
    totalAllocated: input.totalCapacity,
  };
  store.set(input.inventoryKey, snap);
  return snap;
}

export function allocateChannel(input: {
  inventoryKey: string;
  channel: InventoryChannel;
  capacity: number;
}): EventInventorySnapshot {
  const snap = store.get(input.inventoryKey);
  if (!snap) throw new Error("inventory_not_found");
  if (input.capacity < 0) throw new Error("invalid_capacity");

  const ch = snap.channels.find((c) => c.channel === input.channel)!;
  if (input.capacity < ch.issued) {
    throw new Error("allocation_below_issued");
  }

  // PUBLIC_ONLINE is the residual pool — reallocations carve from it.
  // Capacity math therefore excludes PUBLIC_ONLINE when carving other channels.
  if (input.channel === "PUBLIC_ONLINE") {
    const nonPublic = snap.channels
      .filter((c) => c.channel !== "PUBLIC_ONLINE")
      .reduce((n, c) => n + c.capacity, 0);
    if (nonPublic + input.capacity > snap.totalCapacity) {
      throw new Error("allocation_exceeds_total_capacity");
    }
    ch.capacity = input.capacity;
    ch.available = Math.max(0, ch.capacity - ch.issued);
  } else {
    const fixedOthers = snap.channels
      .filter((c) => c.channel !== input.channel && c.channel !== "PUBLIC_ONLINE")
      .reduce((n, c) => n + c.capacity, 0);
    if (fixedOthers + input.capacity > snap.totalCapacity) {
      throw new Error("allocation_exceeds_total_capacity");
    }
    ch.capacity = input.capacity;
    ch.available = Math.max(0, ch.capacity - ch.issued);
    const publicCh = snap.channels.find((c) => c.channel === "PUBLIC_ONLINE")!;
    const nonPublic = snap.channels
      .filter((c) => c.channel !== "PUBLIC_ONLINE")
      .reduce((n, c) => n + c.capacity, 0);
    publicCh.capacity = Math.max(0, snap.totalCapacity - nonPublic);
    if (publicCh.capacity < publicCh.issued) {
      throw new Error("allocation_would_undersize_public_issued");
    }
    publicCh.available = Math.max(0, publicCh.capacity - publicCh.issued);
  }

  snap.totalAllocated = snap.channels.reduce((n, c) => n + c.capacity, 0);
  return snap;
}

export type IssueResult =
  | { ok: true; snapshot: EventInventorySnapshot }
  | { ok: false; reason: "sold_out" | "channel_sold_out" | "invalid_qty" | "not_found" };

export function issueFromChannel(input: {
  inventoryKey: string;
  channel: InventoryChannel;
  qty: number;
  actor?: string;
  orderId?: string;
  eventId?: string;
}): IssueResult {
  if (!Number.isInteger(input.qty) || input.qty <= 0) {
    return { ok: false, reason: "invalid_qty" };
  }
  const snap = store.get(input.inventoryKey);
  if (!snap) return { ok: false, reason: "not_found" };
  const ch = snap.channels.find((c) => c.channel === input.channel);
  if (!ch) return { ok: false, reason: "not_found" };
  if (ch.issued + input.qty > ch.capacity) {
    return { ok: false, reason: "channel_sold_out" };
  }
  if (snap.totalIssued + input.qty > snap.totalCapacity) {
    return { ok: false, reason: "sold_out" };
  }
  ch.issued += input.qty;
  ch.available = Math.max(0, ch.capacity - ch.issued);
  snap.totalIssued += input.qty;
  appendFinancialAudit({
    actor: input.actor ?? "eventInventoryAuthority.issue",
    action: "INVENTORY_ISSUE",
    amountCents: null,
    orderId: input.orderId,
    eventId: input.eventId ?? snap.eventId,
    reason: `${input.channel}:${input.qty}`,
    metadata: { inventoryKey: input.inventoryKey, channel: input.channel, qty: input.qty },
  });
  return { ok: true, snapshot: snap };
}

export function restoreToChannel(input: {
  inventoryKey: string;
  channel: InventoryChannel;
  qty: number;
  actor?: string;
  orderId?: string;
}): IssueResult {
  if (!Number.isInteger(input.qty) || input.qty <= 0) {
    return { ok: false, reason: "invalid_qty" };
  }
  const snap = store.get(input.inventoryKey);
  if (!snap) return { ok: false, reason: "not_found" };
  const ch = snap.channels.find((c) => c.channel === input.channel);
  if (!ch) return { ok: false, reason: "not_found" };
  const restore = Math.min(input.qty, ch.issued);
  ch.issued -= restore;
  ch.available = Math.max(0, ch.capacity - ch.issued);
  snap.totalIssued = Math.max(0, snap.totalIssued - restore);
  appendFinancialAudit({
    actor: input.actor ?? "eventInventoryAuthority.restore",
    action: "INVENTORY_RESTORE",
    orderId: input.orderId,
    eventId: snap.eventId,
    reason: `${input.channel}:${restore}`,
    metadata: { inventoryKey: input.inventoryKey, channel: input.channel, qty: restore },
  });
  return { ok: true, snapshot: snap };
}

/**
 * Prisma-backed capacity-safe increment for live EventInventory counter.
 * Fixes TICKET-WEBHOOK-EVENTINVENTORY-CAPACITY-01.
 * Returns sold_out if increment would exceed capacity.
 */
export async function incrementEventInventoryAtomic(input: {
  prisma: any;
  key: string;
  qty: number;
  /** Used only when creating the row for the first time. */
  capacityIfCreate: number;
}): Promise<"ok" | "sold_out" | "invalid_qty"> {
  if (!Number.isInteger(input.qty) || input.qty <= 0) return "invalid_qty";
  try {
    return await input.prisma.$transaction(
      async (tx: any) => {
        const record = await tx.eventInventory.findUnique({ where: { key: input.key } });
        if (!record) {
          if (input.qty > input.capacityIfCreate) return "sold_out";
          await tx.eventInventory.create({
            data: { key: input.key, capacity: input.capacityIfCreate, issued: input.qty },
          });
          return "ok";
        }
        if (record.issued + input.qty > record.capacity) return "sold_out";
        const updated = await tx.eventInventory.updateMany({
          where: { key: input.key, issued: { lte: record.capacity - input.qty } },
          data: { issued: { increment: input.qty } },
        });
        if (updated.count === 0) return "sold_out";
        return "ok";
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    return "sold_out";
  }
}

export function getInventorySnapshot(key: string): EventInventorySnapshot | null {
  return store.get(key) ?? null;
}

export function __resetEventInventoryForTests(): void {
  store.clear();
}
