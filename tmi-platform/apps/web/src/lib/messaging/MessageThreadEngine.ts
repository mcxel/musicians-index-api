/**
 * MessageThreadEngine
 * Core DM thread registry for the TMI platform.
 * Handles all thread types: fan↔fan, fan↔artist, artist↔artist, sponsor↔artist.
 *
 * In-memory singleton. Swap storage layer for DB in production.
 */

export type ParticipantRole = "fan" | "artist" | "sponsor" | "admin";

export interface ThreadParticipant {
  userId: string;
  displayName: string;
  avatarUrl: string;
  role: ParticipantRole;
}

export type MessageType = "text" | "image" | "audio" | "tip" | "gift" | "system";

export interface ThreadMessage {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  type: MessageType;
  /** For tip/gift messages: amount in USD cents */
  valueUsdCents?: number;
  /** For image/audio attachments */
  mediaUrl?: string;
  readBy: Set<string>;
  createdAt: number;
  editedAt?: number;
  deletedAt?: number;
}

export type ThreadKind =
  | "fan-fan"
  | "fan-artist"
  | "artist-artist"
  | "sponsor-artist"
  | "support";

export interface MessageThread {
  threadId: string;
  kind: ThreadKind;
  participants: ThreadParticipant[];
  messages: ThreadMessage[];
  lastMessage?: ThreadMessage;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  isMuted: Set<string>;
  isBlocked: boolean;
}

let msgSeq = 0;
let threadSeq = 0;

function genMsgId() {
  return `msg-${Date.now()}-${++msgSeq}`;
}

function genThreadId(a: string, b: string, kind: ThreadKind) {
  // Deterministic ID for 1:1 threads
  const sorted = [a, b].sort().join(":");
  return `thread-${kind}-${sorted}-${++threadSeq}`;
}

class MessageThreadEngine {
  private threads = new Map<string, MessageThread>();
  /** userId → threadId[] */
  private userThreads = new Map<string, string[]>();

  /**
   * Get or create a 1:1 thread between two users.
   */
  getOrCreateThread(
    a: ThreadParticipant,
    b: ThreadParticipant,
    kind: ThreadKind
  ): MessageThread {
    // Find existing thread with exactly these two participants
    const existingId = this.findExistingThread(a.userId, b.userId, kind);
    if (existingId) return this.threads.get(existingId)!;

    const threadId = genThreadId(a.userId, b.userId, kind);
    const thread: MessageThread = {
      threadId,
      kind,
      participants: [a, b],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false,
      isMuted: new Set(),
      isBlocked: false,
    };
    this.threads.set(threadId, thread);
    this.addUserThread(a.userId, threadId);
    this.addUserThread(b.userId, threadId);
    return thread;
  }

  private findExistingThread(
    userIdA: string,
    userIdB: string,
    kind: ThreadKind
  ): string | undefined {
    const userAThreads = this.userThreads.get(userIdA) ?? [];
    for (const tid of userAThreads) {
      const t = this.threads.get(tid);
      if (!t) continue;
      if (t.kind !== kind) continue;
      const ids = t.participants.map((p) => p.userId);
      if (ids.includes(userIdA) && ids.includes(userIdB)) return tid;
    }
    return undefined;
  }

  private addUserThread(userId: string, threadId: string) {
    const existing = this.userThreads.get(userId) ?? [];
    existing.push(threadId);
    this.userThreads.set(userId, existing);
  }

  /**
   * Send a message into a thread.
   */
  sendMessage(params: {
    threadId: string;
    senderId: string;
    senderName: string;
    body: string;
    type?: MessageType;
    valueUsdCents?: number;
    mediaUrl?: string;
  }): ThreadMessage | null {
    const thread = this.threads.get(params.threadId);
    if (!thread || thread.isBlocked) return null;

    const msg: ThreadMessage = {
      messageId: genMsgId(),
      threadId: params.threadId,
      senderId: params.senderId,
      senderName: params.senderName,
      body: params.body,
      type: params.type ?? "text",
      valueUsdCents: params.valueUsdCents,
      mediaUrl: params.mediaUrl,
      readBy: new Set([params.senderId]),
      createdAt: Date.now(),
    };

    thread.messages.push(msg);
    thread.lastMessage = msg;
    thread.updatedAt = msg.createdAt;
    return msg;
  }

  /**
   * Mark all unread messages in a thread as read by userId.
   */
  markRead(threadId: string, userId: string): void {
    const thread = this.threads.get(threadId);
    if (!thread) return;
    for (const msg of thread.messages) {
      msg.readBy.add(userId);
    }
  }

  getThread(threadId: string): MessageThread | undefined {
    return this.threads.get(threadId);
  }

  /** Get all threads for a user, sorted by most recent */
  getUserThreads(userId: string): MessageThread[] {
    const ids = this.userThreads.get(userId) ?? [];
    return ids
      .map((id) => this.threads.get(id)!)
      .filter(Boolean)
      .filter((t) => !t.isArchived)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** Unread message count for a user across all threads */
  getUnreadCount(userId: string): number {
    return this.getUserThreads(userId).reduce((sum, thread) => {
      const unread = thread.messages.filter(
        (m) => !m.readBy.has(userId) && m.senderId !== userId
      ).length;
      return sum + unread;
    }, 0);
  }

  archiveThread(threadId: string): void {
    const t = this.threads.get(threadId);
    if (t) t.isArchived = true;
  }

  blockThread(threadId: string): void {
    const t = this.threads.get(threadId);
    if (t) t.isBlocked = true;
  }

  muteThread(threadId: string, userId: string): void {
    const t = this.threads.get(threadId);
    if (t) t.isMuted.add(userId);
  }

  deleteMessage(threadId: string, messageId: string, userId: string): void {
    const thread = this.threads.get(threadId);
    if (!thread) return;
    const msg = thread.messages.find(
      (m) => m.messageId === messageId && m.senderId === userId
    );
    if (msg) msg.deletedAt = Date.now();
  }
}

export const messageThreadEngine = new MessageThreadEngine();
