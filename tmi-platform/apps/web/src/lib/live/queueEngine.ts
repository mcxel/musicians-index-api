// QueueEngine — performer queue priority, staging, rotation management

export type QueueSlot = {
  slotId: string;
  performerId: string;
  performerName: string;
  priority: number; // 1 = highest
  requestedAt: number;
  boostedAt: number | null;
  status: "waiting" | "next-up" | "staging" | "on-stage" | "done";
};

export type VenueQueue = {
  venueSlug: string;
  slots: QueueSlot[];
  maxSlots: number;
  paused: boolean;
};

const queueRegistry = new Map<string, VenueQueue>();

function genSlotId(): string {
  return `slot-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getVenueQueue(venueSlug: string): VenueQueue {
  if (!queueRegistry.has(venueSlug)) {
    queueRegistry.set(venueSlug, { venueSlug, slots: [], maxSlots: 20, paused: false });
  }
  return queueRegistry.get(venueSlug)!;
}

export function joinQueue(
  venueSlug: string,
  performerId: string,
  performerName: string,
  priority = 5,
): QueueSlot {
  const queue = getVenueQueue(venueSlug);
  const existing = queue.slots.find((s) => s.performerId === performerId && s.status !== "done");
  if (existing) return existing;

  const slot: QueueSlot = {
    slotId: genSlotId(),
    performerId,
    performerName,
    priority,
    requestedAt: Date.now(),
    boostedAt: null,
    status: "waiting",
  };
  queue.slots.push(slot);
  // Sort by priority then requestedAt
  queue.slots.sort((a, b) => a.priority - b.priority || a.requestedAt - b.requestedAt);
  // Mark next-up
  const waiting = queue.slots.filter((s) => s.status === "waiting");
  if (waiting.length > 0) waiting[0].status = "next-up";
  return slot;
}

export function boostPerformer(venueSlug: string, performerId: string): QueueSlot | null {
  const queue = getVenueQueue(venueSlug);
  const slot = queue.slots.find((s) => s.performerId === performerId && s.status !== "done");
  if (!slot) return null;
  slot.priority = 1;
  slot.boostedAt = Date.now();
  queue.slots.sort((a, b) => a.priority - b.priority || a.requestedAt - b.requestedAt);
  return slot;
}

export function advanceQueue(venueSlug: string): QueueSlot | null {
  const queue = getVenueQueue(venueSlug);
  const nextUp = queue.slots.find((s) => s.status === "next-up" || s.status === "staging");
  if (!nextUp) return null;
  nextUp.status = "on-stage";
  // Promote next waiting
  const waiting = queue.slots.filter((s) => s.status === "waiting");
  if (waiting.length > 0) waiting[0].status = "next-up";
  return nextUp;
}

export function removeFromQueue(venueSlug: string, performerId: string): void {
  const queue = getVenueQueue(venueSlug);
  const slot = queue.slots.find((s) => s.performerId === performerId && s.status !== "done");
  if (slot) slot.status = "done";
}

export function pauseQueue(venueSlug: string): void {
  getVenueQueue(venueSlug).paused = true;
}

export function resumeQueue(venueSlug: string): void {
  getVenueQueue(venueSlug).paused = false;
}

export function getQueueSnapshot(venueSlug: string) {
  const queue = getVenueQueue(venueSlug);
  const activeSlots = queue.slots.filter((s) => s.status !== "done");
  return {
    venueSlug: queue.venueSlug,
    paused: queue.paused,
    count: activeSlots.length,
    maxSlots: queue.maxSlots,
    slots: activeSlots,
  };
}
