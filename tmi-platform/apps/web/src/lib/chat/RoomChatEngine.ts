export type ChatRoomId =
  | "monthly-idol"
  | "monday-night-stage"
  | "deal-or-feud"
  | "name-that-tune"
  | "circle-squares"
  | "cypher-arena"
  | "venue-room";

export type RoomRuntimeState = "FREE_ROAM" | "PRE_SHOW" | "LIVE_SHOW" | "POST_SHOW";

export type ChatRole =
  | "performer"
  | "host"
  | "judge"
  | "audience"
  | "sponsor"
  | "system"
  | "moderator";

export type RoomChatMessage = {
  id: string;
  roomId: ChatRoomId;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: ChatRole;
  text: string;
  timestampMs: number;
  replyToId?: string;
  reaction?: "yay" | "boo" | "fire" | "hype";
};

export type RoomChatConfig = {
  maxBufferedMessages: number;
  maxCharsPerMessage: number;
  performerMirrorLimit: number;
};

const DEFAULT_CONFIG: RoomChatConfig = {
  maxBufferedMessages: 250,
  maxCharsPerMessage: 240,
  performerMirrorLimit: 8,
};

export type RoomChatSnapshot = {
  roomId: ChatRoomId;
  state: RoomRuntimeState;
  messages: RoomChatMessage[];
  lastUpdatedMs: number;
};

import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { ContactActor, ContactTarget } from "@/lib/safety/TeenMessagingPolicyEngine";
import { recordIntentFromMessage } from "@/lib/rooms/CrowdIntentEngine";
import { getRoomPopulation } from "@/lib/rooms/RoomPopulationEngine";

export class RoomChatEngine {
  private readonly config: RoomChatConfig;
  private readonly roomId: ChatRoomId;
  private state: RoomRuntimeState;
  private messages: RoomChatMessage[];

  constructor(roomId: ChatRoomId, initialState: RoomRuntimeState = "FREE_ROAM", config?: Partial<RoomChatConfig>) {
    this.roomId = roomId;
    this.state = initialState;
    this.messages = [];
    this.config = { ...DEFAULT_CONFIG, ...(config ?? {}) };
  }

  setState(nextState: RoomRuntimeState): void {
    this.state = nextState;
  }

  getState(): RoomRuntimeState {
    return this.state;
  }

  pushMessage(input: Omit<RoomChatMessage, "id" | "timestampMs" | "roomId">): RoomChatMessage {
    const actor: ContactActor = {
      userId: input.userId,
      ageClass: "room_public",
    };

    const target: ContactTarget = {
      userId: `room-${this.roomId}`,
      ageClass: "room_public",
    };

    const decision = enforceAdultTeenContactBlock({
      source: `room-chat:${this.roomId}`,
      channel: "room_chat",
      actor,
      target,
    });

    if (!decision.allowed) {
      throw new Error(decision.reason);
    }

    const sanitizedText = input.text.trim().slice(0, this.config.maxCharsPerMessage);
    const message: RoomChatMessage = {
      ...input,
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId: this.roomId,
      timestampMs: Date.now(),
      text: sanitizedText,
    };

    this.messages.push(message);
    if (this.messages.length > this.config.maxBufferedMessages) {
      this.messages = this.messages.slice(this.messages.length - this.config.maxBufferedMessages);
    }

    recordIntentFromMessage(message, {
      heatLevel: getRoomPopulation(this.roomId).heatLevel,
      roomState: this.state,
    });

    return message;
  }

  getMessages(limit?: number): RoomChatMessage[] {
    if (!limit || limit <= 0) {
      return [...this.messages];
    }
    return this.messages.slice(Math.max(0, this.messages.length - limit));
  }

  getSnapshot(): RoomChatSnapshot {
    return {
      roomId: this.roomId,
      state: this.state,
      messages: this.getMessages(),
      lastUpdatedMs: Date.now(),
    };
  }

  clear(): void {
    this.messages = [];
  }
}
