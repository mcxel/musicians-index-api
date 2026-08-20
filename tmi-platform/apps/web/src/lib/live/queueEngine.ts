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
  // Re-mark next-up if we removed the previous next-up
  const waiting = queue.slots.filter((s) => s.status === "waiting");
  const hasNext = queue.slots.some((s) => s.status === "next-up" || s.status === "staging");
  if (!hasNext && waiting.length > 0) waiting[0].status = "next-up";
}

/** Host reject: remove next-up / first waiting request. Returns rejected slot or null. */
export function rejectNextRequest(venueSlug: string): QueueSlot | null {
  const queue = getVenueQueue(venueSlug);
  const target =
    queue.slots.find((s) => s.status === "next-up" || s.status === "staging") ??
    queue.slots.find((s) => s.status === "waiting");
  if (!target) return null;
  target.status = "done";
  const waiting = queue.slots.filter((s) => s.status === "waiting");
  if (waiting.length > 0 && !queue.slots.some((s) => s.status === "next-up")) {
    waiting[0].status = "next-up";
  }
  return target;
}

/** Promote/demote within waiting queue via priority (existing boost path). */
export function reorderQueue(
  venueSlug: string,
  performerId: string,
  direction: "up" | "down",
): QueueSlot | null {
  const queue = getVenueQueue(venueSlug);
  const slot = queue.slots.find((s) => s.performerId === performerId && s.status !== "done");
  if (!slot) return null;
  if (direction === "up") {
    slot.priority = Math.max(1, slot.priority - 1);
    slot.boostedAt = Date.now();
  } else {
    slot.priority = Math.min(20, slot.priority + 1);
  }
  queue.slots.sort((a, b) => a.priority - b.priority || a.requestedAt - b.requestedAt);
  for (const s of queue.slots) {
    if (s.status === "next-up") s.status = "waiting";
  }
  const waiting = queue.slots.filter((s) => s.status === "waiting");
  if (waiting.length > 0) waiting[0].status = "next-up";
  return slot;
}

/** Mark current on-stage performer complete (host remove from stage). */
export function clearOnStage(venueSlug: string): QueueSlot | null {
  const queue = getVenueQueue(venueSlug);
  const onStage = queue.slots.find((s) => s.status === "on-stage");
  if (!onStage) return null;
  onStage.status = "done";
  return onStage;
}

/** 1-based position among active (non-done) slots; null if not queued. */
export function getQueuePosition(venueSlug: string, performerId: string): number | null {
  const active = getVenueQueue(venueSlug).slots.filter((s) => s.status !== "done");
  const idx = active.findIndex((s) => s.performerId === performerId);
  return idx >= 0 ? idx + 1 : null;
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
