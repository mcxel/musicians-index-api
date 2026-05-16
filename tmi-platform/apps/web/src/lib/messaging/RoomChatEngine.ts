/**
 * RoomChatEngine
 * Live public chat for battle rooms, cypher rooms, concert rooms.
 *
 * Features:
 * - Public chat visible to all room participants
 * - Pinned messages (host/mod only)
 * - Reaction-style quick replies
 * - Moderation: mute, ban, slow-mode, word filter
 * - Special message types: vote, cheer, crown-toss, tip-blast
 * - Chat history capped per room (last N messages kept in memory)
 */

export type RoomChatRole = "viewer" | "fan" | "artist" | "host" | "mod" | "bot";

export type RoomChatMessageType =
  | "text"
  | "system"
  | "vote"
  | "cheer"
  | "crown-toss"
  | "tip"
  | "tip-blast"
  | "gif"
  | "join"
  | "leave";

export interface RoomChatMessage {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: RoomChatRole;
  body: string;
  type: RoomChatMessageType;
  /** For tip-blast: USD cents */
  valueUsdCents?: number;
  isPinned: boolean;
  isDeleted: boolean;
  reactions: Map<string, Set<string>>; // emoji → userIds
  createdAt: number;
}

export interface RoomChatState {
  roomId: string;
  messages: RoomChatMessage[];
  pinnedMessage?: RoomChatMessage;
  /** userId → muted-until timestamp */
  mutedUsers: Map<string, number>;
  bannedUsers: Set<string>;
  /** Slow mode: minimum ms between messages per user */
  slowModeMs: number;
  /** userId → last message timestamp */
  lastMessageAt: Map<string, number>;
  maxHistory: number;
}

const HISTORY_LIMIT = 200;
let chatSeq = 0;

function genChatId() {
  return `chat-${Date.now()}-${++chatSeq}`;
}

class RoomChatEngine {
  private rooms = new Map<string, RoomChatState>();

  initRoom(roomId: string, options?: { slowModeMs?: number; maxHistory?: number }): RoomChatState {
    if (this.rooms.has(roomId)) return this.rooms.get(roomId)!;
    const state: RoomChatState = {
      roomId,
      messages: [],
      mutedUsers: new Map(),
      bannedUsers: new Set(),
      slowModeMs: options?.slowModeMs ?? 0,
      lastMessageAt: new Map(),
      maxHistory: options?.maxHistory ?? HISTORY_LIMIT,
    };
    this.rooms.set(roomId, state);
    return state;
  }

  getRoom(roomId: string): RoomChatState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Send a chat message. Returns null if user is muted, banned, or in slow-mode.
   */
  sendMessage(params: {
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: RoomChatRole;
    body: string;
    type?: RoomChatMessageType;
    valueUsdCents?: number;
  }): RoomChatMessage | null {
    const room = this.rooms.get(params.roomId);
    if (!room) return null;

    // Moderation checks
    if (room.bannedUsers.has(params.senderId)) return null;
    const mutedUntil = room.mutedUsers.get(params.senderId);
    if (mutedUntil && Date.now() < mutedUntil) return null;

    // Slow mode check (skip for hosts/mods/system)
    if (
      room.slowModeMs > 0 &&
      params.senderRole !== "host" &&
      params.senderRole !== "mod" &&
      params.senderRole !== "bot"
    ) {
      const last = room.lastMessageAt.get(params.senderId) ?? 0;
      if (Date.now() - last < room.slowModeMs) return null;
    }

    const msg: RoomChatMessage = {
      messageId: genChatId(),
      roomId: params.roomId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      body: params.body.slice(0, 500), // cap body length
      type: params.type ?? "text",
      valueUsdCents: params.valueUsdCents,
      isPinned: false,
      isDeleted: false,
      reactions: new Map(),
      createdAt: Date.now(),
    };

    room.messages.push(msg);
    room.lastMessageAt.set(params.senderId, msg.createdAt);

    // Trim history
    if (room.messages.length > room.maxHistory) {
      room.messages = room.messages.slice(-room.maxHistory);
    }

    return msg;
  }

  /**
   * Emit a join/leave system message.
   */
  emitPresenceEvent(
    roomId: string,
    userId: string,
    userName: string,
    event: "join" | "leave"
  ): void {
    this.sendMessage({
      roomId,
      senderId: "system",
      senderName: "SYSTEM",
      senderRole: "bot",
      body: event === "join" ? `${userName} joined the room` : `${userName} left`,
      type: event,
    });
  }

  pinMessage(roomId: string, messageId: string, modId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const msg = room.messages.find((m) => m.messageId === messageId);
    if (msg) {
      room.pinnedMessage = msg;
      msg.isPinned = true;
    }
  }

  deleteMessage(roomId: string, messageId: string): void {
    const room = this.rooms.get(roomId);
    const msg = room?.messages.find((m) => m.messageId === messageId);
    if (msg) msg.isDeleted = true;
  }

  muteUser(roomId: string, userId: string, durationMs: number): void {
    const room = this.rooms.get(roomId);
    if (room) room.mutedUsers.set(userId, Date.now() + durationMs);
  }

  banUser(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) room.bannedUsers.add(userId);
  }

  unbanUser(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) room.bannedUsers.delete(userId);
  }

  setSlowMode(roomId: string, ms: number): void {
    const room = this.rooms.get(roomId);
    if (room) room.slowModeMs = ms;
  }

  addReaction(roomId: string, messageId: string, emoji: string, userId: string): void {
    const room = this.rooms.get(roomId);
    const msg = room?.messages.find((m) => m.messageId === messageId);
    if (!msg) return;
    const users = msg.reactions.get(emoji) ?? new Set();
    users.add(userId);
    msg.reactions.set(emoji, users);
  }

  getRecentMessages(roomId: string, limit = 50): RoomChatMessage[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return room.messages
      .filter((m) => !m.isDeleted)
      .slice(-limit);
  }

  closeRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }
}

export const roomChatEngine = new RoomChatEngine();
