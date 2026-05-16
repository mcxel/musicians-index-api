/**
 * VenuePresenceEngine
 * Manages the shared presence layer for a live room:
 *   - Performer live feed registration
 *   - Audience seat occupancy
 *   - Room energy score
 *   - Billboard portal metadata
 *   - Joinability state
 */

export type RoomType =
  | "battle"
  | "cypher"
  | "dirty-dozens"
  | "concert"
  | "karaoke"
  | "interview"
  | "contest"
  | "sponsor";

export interface PerformerFeed {
  userId: string;
  displayName: string;
  profileImageUrl: string;
  isLive: boolean;
  streamUrl?: string;
  role: "host" | "challenger" | "performer" | "guest";
}

export interface VenueRoomState {
  roomId: string;
  roomType: RoomType;
  title: string;
  genre: string;
  hostUserId: string;
  performers: PerformerFeed[];
  /** Total real + bot seats filled */
  occupancy: number;
  capacity: number;
  realAudienceCount: number;
  botAudienceCount: number;
  energyScore: number;       // 0–100 live energy meter
  tipsTotal: number;         // running tip total in room
  isPublic: boolean;
  isJoinable: boolean;
  createdAt: number;
  lastActivityAt: number;
}

class VenuePresenceEngine {
  private rooms = new Map<string, VenueRoomState>();

  createRoom(
    params: Pick<
      VenueRoomState,
      "roomId" | "roomType" | "title" | "genre" | "hostUserId" | "capacity" | "isPublic"
    >
  ): VenueRoomState {
    const room: VenueRoomState = {
      ...params,
      performers: [],
      occupancy: 0,
      realAudienceCount: 0,
      botAudienceCount: 0,
      energyScore: 0,
      tipsTotal: 0,
      isJoinable: true,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    this.rooms.set(params.roomId, room);
    return room;
  }

  addPerformer(roomId: string, performer: PerformerFeed): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const exists = room.performers.find((p) => p.userId === performer.userId);
    if (!exists) room.performers.push(performer);
    room.lastActivityAt = Date.now();
    return true;
  }

  removePerformer(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.performers = room.performers.filter((p) => p.userId !== userId);
  }

  joinRoom(roomId: string, isBot = false): { ok: boolean; reason?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: "room-not-found" };
    if (!room.isJoinable) return { ok: false, reason: "room-closed" };
    if (room.occupancy >= room.capacity) return { ok: false, reason: "room-full" };

    room.occupancy += 1;
    if (isBot) room.botAudienceCount += 1;
    else room.realAudienceCount += 1;
    room.lastActivityAt = Date.now();
    this.recalcEnergy(roomId);
    return { ok: true };
  }

  leaveRoom(roomId: string, isBot = false): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.occupancy = Math.max(0, room.occupancy - 1);
    if (isBot) room.botAudienceCount = Math.max(0, room.botAudienceCount - 1);
    else room.realAudienceCount = Math.max(0, room.realAudienceCount - 1);
    this.recalcEnergy(roomId);
  }

  recordTip(roomId: string, amount: number): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.tipsTotal += amount;
    room.energyScore = Math.min(100, room.energyScore + 2);
    room.lastActivityAt = Date.now();
  }

  private recalcEnergy(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const occupancyRatio = room.occupancy / Math.max(1, room.capacity);
    const realRatio = room.realAudienceCount / Math.max(1, room.occupancy);
    room.energyScore = Math.round(
      occupancyRatio * 60 + realRatio * 30 + (room.tipsTotal > 0 ? 10 : 0)
    );
  }

  getRoom(roomId: string): VenueRoomState | undefined {
    return this.rooms.get(roomId);
  }

  getPublicRooms(): VenueRoomState[] {
    return [...this.rooms.values()].filter((r) => r.isPublic && r.isJoinable);
  }

  closeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) room.isJoinable = false;
  }
}

export const venuePresenceEngine = new VenuePresenceEngine();
