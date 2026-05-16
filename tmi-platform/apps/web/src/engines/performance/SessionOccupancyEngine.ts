// SessionOccupancyEngine
// Tracks slot state for live sessions: open, reserved (bots), waitlist, overflow, spectators
// Consumed by: Home 5 cypher/battle cards, lobby entry gates, session join flows

export type SlotStatus = "open" | "reserved_bot" | "occupied" | "waitlisted" | "spectator";

export type SessionSlot = {
  slotId: string;
  status: SlotStatus;
  occupantId?: string;
  occupantName?: string;
  isBot: boolean;
  reservedAt?: number; // unix ms
};

export type OccupancySnapshot = {
  sessionId: string;
  capacity: number;
  slots: SessionSlot[];
  waitlist: string[];      // occupantIds in order
  overflowQueue: string[]; // overflow beyond waitlist
  spectatorIds: string[];
  updatedAt: number;
};

export type OccupancySummary = {
  sessionId: string;
  capacity: number;
  openSlots: number;
  occupiedSlots: number;
  reservedBotSlots: number;
  waitlistDepth: number;
  overflowDepth: number;
  spectatorCount: number;
  isFull: boolean;
  hasWaitlist: boolean;
};

// In-memory store keyed by sessionId
const _store: Record<string, OccupancySnapshot> = {};

// ── Slot factory helpers ──────────────────────────────────────────────────────

function makeSlot(slotId: string, status: SlotStatus = "open", isBot = false): SessionSlot {
  return { slotId, status, isBot };
}

function makeSessionSnapshot(sessionId: string, capacity: number, preSeedBots = 0): OccupancySnapshot {
  const slots: SessionSlot[] = Array.from({ length: capacity }, (_, i) => {
    const isBot = i < preSeedBots;
    return makeSlot(`${sessionId}-slot-${i + 1}`, isBot ? "reserved_bot" : "open", isBot);
  });
  return {
    sessionId,
    capacity,
    slots,
    waitlist: [],
    overflowQueue: [],
    spectatorIds: [],
    updatedAt: Date.now(),
  };
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function initSession(sessionId: string, capacity: number, preSeedBots = 0): OccupancySnapshot {
  _store[sessionId] = makeSessionSnapshot(sessionId, capacity, preSeedBots);
  return _store[sessionId];
}

export function getSnapshot(sessionId: string): OccupancySnapshot | undefined {
  return _store[sessionId];
}

export function getOrInitSnapshot(sessionId: string, capacity = 8, preSeedBots = 2): OccupancySnapshot {
  return _store[sessionId] ?? initSession(sessionId, capacity, preSeedBots);
}

export function getSummary(sessionId: string): OccupancySummary {
  const snap = getOrInitSnapshot(sessionId);
  const openSlots = snap.slots.filter((s) => s.status === "open").length;
  const occupiedSlots = snap.slots.filter((s) => s.status === "occupied").length;
  const reservedBotSlots = snap.slots.filter((s) => s.status === "reserved_bot").length;
  return {
    sessionId,
    capacity: snap.capacity,
    openSlots,
    occupiedSlots,
    reservedBotSlots,
    waitlistDepth: snap.waitlist.length,
    overflowDepth: snap.overflowQueue.length,
    spectatorCount: snap.spectatorIds.length,
    isFull: openSlots === 0,
    hasWaitlist: snap.waitlist.length > 0,
  };
}

// ── Slot mutations ────────────────────────────────────────────────────────────

export function joinSession(
  sessionId: string,
  occupantId: string,
  occupantName: string,
  isBot = false,
): "joined" | "waitlisted" | "overflow" | "spectator" {
  const snap = getOrInitSnapshot(sessionId);
  const openSlot = snap.slots.find((s) => s.status === "open");

  if (openSlot) {
    openSlot.status = "occupied";
    openSlot.occupantId = occupantId;
    openSlot.occupantName = occupantName;
    openSlot.isBot = isBot;
    snap.updatedAt = Date.now();
    return "joined";
  }

  if (snap.waitlist.length < snap.capacity) {
    snap.waitlist.push(occupantId);
    snap.updatedAt = Date.now();
    return "waitlisted";
  }

  if (snap.overflowQueue.length < snap.capacity * 2) {
    snap.overflowQueue.push(occupantId);
    snap.updatedAt = Date.now();
    return "overflow";
  }

  snap.spectatorIds.push(occupantId);
  snap.updatedAt = Date.now();
  return "spectator";
}

export function leaveSession(sessionId: string, occupantId: string): boolean {
  const snap = _store[sessionId];
  if (!snap) return false;

  const slot = snap.slots.find((s) => s.occupantId === occupantId);
  if (slot) {
    slot.status = "open";
    slot.occupantId = undefined;
    slot.occupantName = undefined;
    // Promote first waitlisted occupant if any
    if (snap.waitlist.length > 0) {
      const nextId = snap.waitlist.shift()!;
      slot.status = "occupied";
      slot.occupantId = nextId;
    }
    snap.updatedAt = Date.now();
    return true;
  }

  // Remove from waitlist or overflow
  snap.waitlist = snap.waitlist.filter((id) => id !== occupantId);
  snap.overflowQueue = snap.overflowQueue.filter((id) => id !== occupantId);
  snap.spectatorIds = snap.spectatorIds.filter((id) => id !== occupantId);
  snap.updatedAt = Date.now();
  return false;
}

export function reserveBotSlot(sessionId: string, botId: string): boolean {
  const snap = getOrInitSnapshot(sessionId);
  const openSlot = snap.slots.find((s) => s.status === "open");
  if (!openSlot) return false;
  openSlot.status = "reserved_bot";
  openSlot.occupantId = botId;
  openSlot.isBot = true;
  openSlot.reservedAt = Date.now();
  snap.updatedAt = Date.now();
  return true;
}

export function releaseBotSlot(sessionId: string, botId: string): boolean {
  const snap = _store[sessionId];
  if (!snap) return false;
  const slot = snap.slots.find((s) => s.occupantId === botId && s.isBot);
  if (!slot) return false;
  slot.status = "open";
  slot.occupantId = undefined;
  slot.isBot = false;
  slot.reservedAt = undefined;
  snap.updatedAt = Date.now();
  return true;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export function getOpenSlotCount(sessionId: string): number {
  return getOrInitSnapshot(sessionId).slots.filter((s) => s.status === "open").length;
}

export function getOccupantIds(sessionId: string): string[] {
  return getOrInitSnapshot(sessionId)
    .slots.filter((s) => s.status === "occupied" && s.occupantId)
    .map((s) => s.occupantId!);
}

export function isSessionFull(sessionId: string): boolean {
  return getOpenSlotCount(sessionId) === 0;
}

export function getWaitlistPosition(sessionId: string, occupantId: string): number {
  const snap = _store[sessionId];
  if (!snap) return -1;
  const pos = snap.waitlist.indexOf(occupantId);
  return pos === -1 ? -1 : pos + 1;
}

export function clearSession(sessionId: string): void {
  delete _store[sessionId];
}
