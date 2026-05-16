/**
 * LiveRoomEngine
 * Live room creation and lifecycle management.
 * Covers event, venue, cypher, battle, and contest room types.
 * Distinct from RoomPopulationEngine (which tracks ChatRoomId baselines).
 */

import {
  getLivePresenceSnapshot,
  type LivePresenceSnapshot,
} from "./LivePresenceEngine";

export type LiveRoomType =
  | "event"
  | "venue"
  | "cypher"
  | "battle"
  | "contest";

export type LiveRoomStatus =
  | "scheduled"
  | "open"      // accepting joins, not yet started
  | "live"      // actively running
  | "paused"
  | "closed"    // ended, no more joins
  | "archived";

export type LiveRoomConfig = {
  maxCapacity: number;
  sponsorOverlaysEnabled: boolean;
  tippingEnabled: boolean;
  votingEnabled: boolean;
  reactionsEnabled: boolean;
  recordingEnabled: boolean;
};

export type LiveRoom = {
  roomId: string;
  roomType: LiveRoomType;
  title: string;
  description?: string;
  venueId?: string;
  eventId?: string;
  hostUserId: string;
  status: LiveRoomStatus;
  config: LiveRoomConfig;
  scheduledStartMs?: number;
  openedAtMs?: number;
  startedAtMs?: number;
  closedAtMs?: number;
  createdAtMs: number;
  updatedAtMs: number;
  genre?: string;
  tags: string[];
};

export type LiveRoomSummary = {
  room: LiveRoom;
  presence: LivePresenceSnapshot;
};

// --- defaults per room type ---
const DEFAULT_CONFIG: Record<LiveRoomType, LiveRoomConfig> = {
  event: {
    maxCapacity: 5000,
    sponsorOverlaysEnabled: true,
    tippingEnabled: true,
    votingEnabled: false,
    reactionsEnabled: true,
    recordingEnabled: true,
  },
  venue: {
    maxCapacity: 2000,
    sponsorOverlaysEnabled: true,
    tippingEnabled: true,
    votingEnabled: false,
    reactionsEnabled: true,
    recordingEnabled: true,
  },
  cypher: {
    maxCapacity: 1000,
    sponsorOverlaysEnabled: false,
    tippingEnabled: true,
    votingEnabled: true,
    reactionsEnabled: true,
    recordingEnabled: false,
  },
  battle: {
    maxCapacity: 500,
    sponsorOverlaysEnabled: true,
    tippingEnabled: true,
    votingEnabled: true,
    reactionsEnabled: true,
    recordingEnabled: true,
  },
  contest: {
    maxCapacity: 10000,
    sponsorOverlaysEnabled: true,
    tippingEnabled: false,
    votingEnabled: true,
    reactionsEnabled: true,
    recordingEnabled: true,
  },
};

// --- in-memory store ---
const liveRooms: Map<string, LiveRoom> = new Map();
let roomCounter = 0;

// --- Write API ---

export function createLiveRoom(input: {
  roomType: LiveRoomType;
  title: string;
  hostUserId: string;
  description?: string;
  venueId?: string;
  eventId?: string;
  genre?: string;
  tags?: string[];
  scheduledStartMs?: number;
  configOverrides?: Partial<LiveRoomConfig>;
}): LiveRoom {
  const room: LiveRoom = {
    roomId: `live-room-${++roomCounter}`,
    roomType: input.roomType,
    title: input.title,
    description: input.description,
    venueId: input.venueId,
    eventId: input.eventId,
    hostUserId: input.hostUserId,
    status: input.scheduledStartMs ? "scheduled" : "open",
    config: {
      ...DEFAULT_CONFIG[input.roomType],
      ...(input.configOverrides ?? {}),
    },
    scheduledStartMs: input.scheduledStartMs,
    openedAtMs: input.scheduledStartMs ? undefined : Date.now(),
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
    genre: input.genre,
    tags: input.tags ?? [],
  };
  liveRooms.set(room.roomId, room);
  return room;
}

export function openLiveRoom(roomId: string): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (!room) return undefined;
  if (room.status === "scheduled") {
    room.status = "open";
    room.openedAtMs = Date.now();
    room.updatedAtMs = Date.now();
  }
  return room;
}

export function startLiveRoom(roomId: string): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (!room) return undefined;
  if (room.status === "open" || room.status === "paused") {
    room.status = "live";
    if (!room.startedAtMs) room.startedAtMs = Date.now();
    room.updatedAtMs = Date.now();
  }
  return room;
}

export function pauseLiveRoom(roomId: string): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (room?.status === "live") {
    room.status = "paused";
    room.updatedAtMs = Date.now();
  }
  return room;
}

export function closeLiveRoom(roomId: string): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (room && room.status !== "closed" && room.status !== "archived") {
    room.status = "closed";
    room.closedAtMs = Date.now();
    room.updatedAtMs = Date.now();
  }
  return room;
}

export function archiveLiveRoom(roomId: string): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (room?.status === "closed") {
    room.status = "archived";
    room.updatedAtMs = Date.now();
  }
  return room;
}

export function updateLiveRoomConfig(
  roomId: string,
  overrides: Partial<LiveRoomConfig>,
): LiveRoom | undefined {
  const room = liveRooms.get(roomId);
  if (room) {
    Object.assign(room.config, overrides);
    room.updatedAtMs = Date.now();
  }
  return room;
}

// --- Read API ---

export function getLiveRoom(roomId: string): LiveRoom | undefined {
  return liveRooms.get(roomId);
}

export function getLiveRoomSummary(roomId: string): LiveRoomSummary | undefined {
  const room = liveRooms.get(roomId);
  if (!room) return undefined;
  return { room, presence: getLivePresenceSnapshot(roomId) };
}

export function listLiveRooms(filter?: {
  roomType?: LiveRoomType;
  status?: LiveRoomStatus;
  venueId?: string;
  genre?: string;
}): LiveRoom[] {
  return [...liveRooms.values()].filter((r) => {
    if (filter?.roomType && r.roomType !== filter.roomType) return false;
    if (filter?.status && r.status !== filter.status) return false;
    if (filter?.venueId && r.venueId !== filter.venueId) return false;
    if (filter?.genre && r.genre !== filter.genre) return false;
    return true;
  });
}

export function getActiveLiveRooms(): LiveRoom[] {
  return listLiveRooms({ status: "live" });
}

export function isRoomLive(roomId: string): boolean {
  return liveRooms.get(roomId)?.status === "live";
}
