import type { RoomChatMessage, ChatRole } from "./RoomChatEngine";

export type OverflowRailState = "closed" | "open" | "expanding" | "collapsing";

export type OverflowRailEntry = {
  id: string;
  message: RoomChatMessage;
  role: ChatRole;
  displayName: string;
  text: string;
  timestamp: number;
  isNew: boolean;
};

export type OverflowRailSnapshot = {
  state: OverflowRailState;
  messages: OverflowRailEntry[];
  unreadCount: number;
  isOpen: boolean;
  capacity: number;
  density: number;
  enabledReason: "density" | "performer" | "manual" | "off";
};

const DENSITY_THRESHOLD_LIVE = 12;
const DENSITY_THRESHOLD_NORMAL = 18;
const MAX_RAIL_CAPACITY = 50;
const NEW_MESSAGE_TTL_MS = 2000;

export class ChatOverflowRailEngine {
  private messages: OverflowRailEntry[] = [];
  private newMessageIds: Set<string> = new Set();
  private newMessageTimestamps: Map<string, number> = new Map();
  private isOpen: boolean = false;
  private lastSeenTimestamp: number = Date.now();

  constructor() {
    this.messages = [];
    this.newMessageIds = new Set();
  }

  addMessage(message: RoomChatMessage, nowMs: number): OverflowRailEntry {
    const entry: OverflowRailEntry = {
      id: message.id,
      message,
      role: message.role,
      displayName: message.displayName,
      text: message.text,
      timestamp: message.timestampMs,
      isNew: true,
    };

    this.messages.push(entry);
    this.newMessageIds.add(message.id);
    this.newMessageTimestamps.set(message.id, nowMs);

    if (this.messages.length > MAX_RAIL_CAPACITY) {
      const removed = this.messages.shift();
      if (removed) {
        this.newMessageIds.delete(removed.id);
        this.newMessageTimestamps.delete(removed.id);
      }
    }

    return entry;
  }

  updateNewMessageStatus(nowMs: number): void {
    for (const [msgId, createdAt] of this.newMessageTimestamps.entries()) {
      if (nowMs - createdAt > NEW_MESSAGE_TTL_MS) {
        this.newMessageIds.delete(msgId);
        this.newMessageTimestamps.delete(msgId);
      }
    }

    for (const entry of this.messages) {
      entry.isNew = this.newMessageIds.has(entry.id);
    }
  }

  getUnreadCount(): number {
    return Array.from(this.newMessageIds).length;
  }

  open(): void {
    this.isOpen = true;
    this.lastSeenTimestamp = Date.now();
  }

  close(): void {
    this.isOpen = false;
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  getState(density: number, roomState: "PRE_SHOW" | "LIVE_SHOW" | "POST_SHOW"): OverflowRailState {
    if (this.isOpen) return "open";
    return "closed";
  }

  shouldDisplay(density: number, roomState: string): boolean {
    const threshold = roomState === "LIVE_SHOW" ? DENSITY_THRESHOLD_LIVE : DENSITY_THRESHOLD_NORMAL;
    return density >= threshold;
  }

  getEnabledReason(density: number, roomState: string): "density" | "performer" | "off" {
    const threshold = roomState === "LIVE_SHOW" ? DENSITY_THRESHOLD_LIVE : DENSITY_THRESHOLD_NORMAL;

    if (density >= threshold) {
      return "density";
    }

    // Check if any performer messages recent
    const recentPerformer = this.messages.some(
      (m) => m.role === "performer" && Date.now() - m.timestamp < 5000,
    );
    if (recentPerformer) {
      return "performer";
    }

    return "off";
  }

  getSnapshot(
    density: number,
    roomState: "PRE_SHOW" | "LIVE_SHOW" | "POST_SHOW",
  ): OverflowRailSnapshot {
    const reason = this.getEnabledReason(density, roomState);
    const enabled = reason !== "off";

    return {
      state: this.getState(density, roomState),
      messages: this.messages.slice(-40),
      unreadCount: this.getUnreadCount(),
      isOpen: this.isOpen,
      capacity: this.messages.length,
      density,
      enabledReason: enabled ? reason : "off",
    };
  }

  groupByRole(): Record<ChatRole, OverflowRailEntry[]> {
    const grouped: Record<ChatRole, OverflowRailEntry[]> = {
      host: [],
      performer: [],
      judge: [],
      audience: [],
      sponsor: [],
      system: [],
      moderator: [],
    };

    for (const entry of this.messages) {
      grouped[entry.role].push(entry);
    }

    return grouped;
  }

  getRecent(limit: number = 20): OverflowRailEntry[] {
    return this.messages.slice(Math.max(0, this.messages.length - limit));
  }

  clear(): void {
    this.messages = [];
    this.newMessageIds.clear();
    this.newMessageTimestamps.clear();
  }

  getStats(): {
    totalMessages: number;
    unreadMessages: number;
    isOpen: boolean;
    capacity: number;
  } {
    return {
      totalMessages: this.messages.length,
      unreadMessages: this.getUnreadCount(),
      isOpen: this.isOpen,
      capacity: MAX_RAIL_CAPACITY,
    };
  }
}

export const chatOverflowRailEngine = new ChatOverflowRailEngine();
