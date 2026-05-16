import type { RoomChatMessage, ChatRole, RoomRuntimeState } from "./RoomChatEngine";

export type BubbleChatState = "visible" | "fading" | "hidden";

export type FloatingBubble = {
  id: string;
  messageId: string;
  message: RoomChatMessage;
  state: BubbleChatState;
  createdAtMs: number;
  ttlMs: number;
  opacity: number;
  position: { x: number; y: number };
  zIndex: number;
  priority: "host" | "performer" | "judge" | "sponsor" | "crowd";
};

export type BubbleRenderContext = {
  roomRuntimeState: RoomRuntimeState;
  density: number;
  seed: number;
  nowMs: number;
};

const BUBBLE_TTL_MS: Record<BubbleChatState, number> = {
  visible: 4200,
  fading: 600,
  hidden: 0,
};

const PRIORITY_WEIGHTS: Record<ChatRole, number> = {
  host: 100,
  performer: 90,
  judge: 85,
  sponsor: 70,
  audience: 50,
  moderator: 80,
  system: 60,
};

function computeOpacity(bubble: FloatingBubble, nowMs: number): number {
  const ageMs = nowMs - bubble.createdAtMs;
  const remainingMs = bubble.ttlMs - ageMs;

  if (remainingMs > 600) return 1;
  if (remainingMs > 0) return Math.max(0, remainingMs / 600);
  return 0;
}

function computeState(bubble: FloatingBubble, nowMs: number): BubbleChatState {
  const ageMs = nowMs - bubble.createdAtMs;
  if (ageMs > bubble.ttlMs) return "hidden";
  if (ageMs > bubble.ttlMs - 600) return "fading";
  return "visible";
}

export class RoomBubbleChatEngine {
  private bubbles: Map<string, FloatingBubble> = new Map();
  private readonly maxActiveBubbles: number;

  constructor(maxActiveBubbles: number = 32) {
    this.maxActiveBubbles = maxActiveBubbles;
  }

  createBubble(
    message: RoomChatMessage,
    position: { x: number; y: number },
    ttlMs: number,
    nowMs: number,
  ): FloatingBubble {
    const bubble: FloatingBubble = {
      id: `bubble-${message.id}-${Date.now()}`,
      messageId: message.id,
      message,
      state: "visible",
      createdAtMs: nowMs,
      ttlMs,
      opacity: 1,
      position,
      zIndex: PRIORITY_WEIGHTS[message.role],
      priority: this.roleToPriority(message.role),
    };

    this.bubbles.set(bubble.id, bubble);
    this.pruneExcess();

    return bubble;
  }

  private roleToPriority(role: ChatRole): FloatingBubble["priority"] {
    if (role === "host") return "host";
    if (role === "performer") return "performer";
    if (role === "judge") return "judge";
    if (role === "sponsor") return "sponsor";
    return "crowd";
  }

  updateBubble(bubbleId: string, nowMs: number): FloatingBubble | null {
    const bubble = this.bubbles.get(bubbleId);
    if (!bubble) return null;

    bubble.state = computeState(bubble, nowMs);
    bubble.opacity = computeOpacity(bubble, nowMs);

    if (bubble.state === "hidden") {
      this.bubbles.delete(bubbleId);
      return null;
    }

    return bubble;
  }

  getActiveBubbles(nowMs: number): FloatingBubble[] {
    const active: FloatingBubble[] = [];

    for (const [id, bubble] of this.bubbles.entries()) {
      const updated = this.updateBubble(id, nowMs);
      if (updated && updated.state !== "hidden") {
        active.push(updated);
      }
    }

    return active.sort((a, b) => b.zIndex - a.zIndex);
  }

  getBubble(bubbleId: string): FloatingBubble | null {
    return this.bubbles.get(bubbleId) ?? null;
  }

  removeBubble(bubbleId: string): void {
    this.bubbles.delete(bubbleId);
  }

  removeMessageBubbles(messageId: string): void {
    for (const [id, bubble] of this.bubbles.entries()) {
      if (bubble.messageId === messageId) {
        this.bubbles.delete(id);
      }
    }
  }

  clear(): void {
    this.bubbles.clear();
  }

  private pruneExcess(): void {
    if (this.bubbles.size <= this.maxActiveBubbles) return;

    const sorted = Array.from(this.bubbles.values()).sort((a, b) => {
      return a.createdAtMs - b.createdAtMs;
    });

    const toRemove = sorted.length - this.maxActiveBubbles;
    for (let i = 0; i < toRemove; i++) {
      this.bubbles.delete(sorted[i].id);
    }
  }

  getStats(): {
    activeBubbles: number;
    maxCapacity: number;
  } {
    return {
      activeBubbles: this.bubbles.size,
      maxCapacity: this.maxActiveBubbles,
    };
  }
}

export const roomBubbleChatEngine = new RoomBubbleChatEngine();
