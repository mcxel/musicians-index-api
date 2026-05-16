// GreenRoomEngine — green room management, performer warmup, pre-stage briefing

export type GreenRoomStatus = "idle" | "warmup" | "briefing" | "ready" | "called-to-stage";

export type GreenRoomSlot = {
  performerId: string;
  performerName: string;
  status: GreenRoomStatus;
  enteredAt: number;
  calledAt: number | null;
  notes: string;
  techCheckPassed: boolean;
};

export type GreenRoom = {
  venueSlug: string;
  open: boolean;
  slots: GreenRoomSlot[];
  capacity: number;
  hostCheckinRequired: boolean;
};

const greenRoomRegistry = new Map<string, GreenRoom>();

export function getGreenRoom(venueSlug: string): GreenRoom {
  if (!greenRoomRegistry.has(venueSlug)) {
    greenRoomRegistry.set(venueSlug, {
      venueSlug,
      open: false,
      slots: [],
      capacity: 10,
      hostCheckinRequired: true,
    });
  }
  return greenRoomRegistry.get(venueSlug)!;
}

export function openGreenRoom(venueSlug: string): void {
  getGreenRoom(venueSlug).open = true;
}

export function closeGreenRoom(venueSlug: string): void {
  getGreenRoom(venueSlug).open = false;
}

export function enterGreenRoom(venueSlug: string, performerId: string, performerName: string): GreenRoomSlot | null {
  const room = getGreenRoom(venueSlug);
  if (!room.open || room.slots.length >= room.capacity) return null;
  const existing = room.slots.find((s) => s.performerId === performerId);
  if (existing) return existing;
  const slot: GreenRoomSlot = {
    performerId,
    performerName,
    status: "warmup",
    enteredAt: Date.now(),
    calledAt: null,
    notes: "",
    techCheckPassed: false,
  };
  room.slots.push(slot);
  return slot;
}

export function markTechCheckPassed(venueSlug: string, performerId: string): void {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (slot) {
    slot.techCheckPassed = true;
    slot.status = "ready";
  }
}

export function callPerformerToStage(venueSlug: string, performerId: string): GreenRoomSlot | null {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (!slot) return null;
  slot.status = "called-to-stage";
  slot.calledAt = Date.now();
  return slot;
}

export function exitGreenRoom(venueSlug: string, performerId: string): void {
  const room = getGreenRoom(venueSlug);
  room.slots = room.slots.filter((s) => s.performerId !== performerId);
}

export function addPerformerNote(venueSlug: string, performerId: string, note: string): void {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (slot) slot.notes = note;
}
