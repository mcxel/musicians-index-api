/**
 * ArtistInboxEngine
 * Artist-specific inbox management.
 *
 * Handles:
 * - Fan DMs → artist inbox with priority sorting (tier fans first)
 * - Artist ↔ artist DMs (collabs, beat deals, features)
 * - Message request queue (unverified fans go into requests, not inbox)
 * - Auto-reply templates
 * - DM gate: artist can restrict to subscribers only
 */

import {
  messageThreadEngine,
  type ThreadParticipant,
  type MessageThread,
  type ThreadMessage,
} from "./MessageThreadEngine";

export type ArtistDmPolicy = "open" | "subscribers-only" | "closed";

export interface ArtistInboxConfig {
  artistId: string;
  displayName: string;
  avatarUrl: string;
  dmPolicy: ArtistDmPolicy;
  /** Auto-reply sent when a fan first messages the artist */
  autoReplyText?: string;
  /** User IDs of fans who are confirmed subscribers */
  subscriberIds: Set<string>;
  /** Blocked user IDs */
  blockedIds: Set<string>;
}

export interface MessageRequest {
  requestId: string;
  fromParticipant: ThreadParticipant;
  toArtistId: string;
  previewText: string;
  createdAt: number;
  accepted: boolean;
  declined: boolean;
}

let reqSeq = 0;

class ArtistInboxEngine {
  private configs = new Map<string, ArtistInboxConfig>();
  private requests = new Map<string, MessageRequest[]>(); // artistId → requests

  configure(config: ArtistInboxConfig): void {
    this.configs.set(config.artistId, config);
  }

  getConfig(artistId: string): ArtistInboxConfig | undefined {
    return this.configs.get(artistId);
  }

  /**
   * Fan attempts to DM artist.
   * Returns thread if allowed, or adds to request queue if gated.
   */
  handleFanMessage(
    fan: ThreadParticipant,
    artist: ThreadParticipant,
    body: string
  ): { thread: MessageThread; message: ThreadMessage } | { queued: true; requestId: string } | null {
    const config = this.configs.get(artist.userId);

    if (config?.blockedIds.has(fan.userId)) return null;

    if (config?.dmPolicy === "closed") return null;

    if (
      config?.dmPolicy === "subscribers-only" &&
      !config.subscriberIds.has(fan.userId)
    ) {
      // Queue as message request
      const requestId = `req-${Date.now()}-${++reqSeq}`;
      const request: MessageRequest = {
        requestId,
        fromParticipant: fan,
        toArtistId: artist.userId,
        previewText: body.slice(0, 120),
        createdAt: Date.now(),
        accepted: false,
        declined: false,
      };
      const existing = this.requests.get(artist.userId) ?? [];
      existing.push(request);
      this.requests.set(artist.userId, existing);
      return { queued: true, requestId };
    }

    // Open DM allowed
    const thread = messageThreadEngine.getOrCreateThread(fan, artist, "fan-artist");
    const message = messageThreadEngine.sendMessage({
      threadId: thread.threadId,
      senderId: fan.userId,
      senderName: fan.displayName,
      body,
      type: "text",
    });
    if (!message) return null;

    // Send auto-reply if configured and this is the first message
    if (config?.autoReplyText && thread.messages.length === 1) {
      messageThreadEngine.sendMessage({
        threadId: thread.threadId,
        senderId: artist.userId,
        senderName: artist.displayName,
        body: config.autoReplyText,
        type: "system",
      });
    }

    return { thread, message };
  }

  /**
   * Artist sends a DM to another artist.
   */
  sendArtistToArtist(
    from: ThreadParticipant,
    to: ThreadParticipant,
    body: string
  ): { thread: MessageThread; message: ThreadMessage } | null {
    const thread = messageThreadEngine.getOrCreateThread(from, to, "artist-artist");
    const message = messageThreadEngine.sendMessage({
      threadId: thread.threadId,
      senderId: from.userId,
      senderName: from.displayName,
      body,
      type: "text",
    });
    if (!message) return null;
    return { thread, message };
  }

  /**
   * Accept a message request — opens the DM thread.
   */
  acceptRequest(artistId: string, requestId: string): boolean {
    const reqs = this.requests.get(artistId);
    if (!reqs) return false;
    const req = reqs.find((r) => r.requestId === requestId);
    if (!req) return false;
    req.accepted = true;
    // Promote to active thread
    const config = this.configs.get(artistId);
    if (config) {
      const artist: ThreadParticipant = {
        userId: config.artistId,
        displayName: config.displayName,
        avatarUrl: config.avatarUrl,
        role: "artist",
      };
      messageThreadEngine.getOrCreateThread(req.fromParticipant, artist, "fan-artist");
    }
    return true;
  }

  declineRequest(artistId: string, requestId: string): void {
    const reqs = this.requests.get(artistId);
    const req = reqs?.find((r) => r.requestId === requestId);
    if (req) req.declined = true;
  }

  getPendingRequests(artistId: string): MessageRequest[] {
    return (this.requests.get(artistId) ?? []).filter(
      (r) => !r.accepted && !r.declined
    );
  }

  getInbox(artistId: string): MessageThread[] {
    return messageThreadEngine.getUserThreads(artistId);
  }

  getUnreadCount(artistId: string): number {
    return messageThreadEngine.getUnreadCount(artistId);
  }

  addSubscriber(artistId: string, fanId: string): void {
    this.configs.get(artistId)?.subscriberIds.add(fanId);
  }

  setDmPolicy(artistId: string, policy: ArtistDmPolicy): void {
    const c = this.configs.get(artistId);
    if (c) c.dmPolicy = policy;
  }
}

export const artistInboxEngine = new ArtistInboxEngine();
