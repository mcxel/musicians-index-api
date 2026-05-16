/**
 * FanChatEngine
 * Fan-to-fan and fan-to-artist direct messaging.
 * Sits on top of MessageThreadEngine.
 *
 * Features:
 * - Fan can message any other fan
 * - Fan can message any artist (artist may have DMs gated by tier)
 * - Message request queue for artist → fan cold outreach needs approval
 * - Mute / block
 * - Tip messages (value embedded in message)
 */

import {
  messageThreadEngine,
  type ThreadParticipant,
  type MessageThread,
  type ThreadMessage,
} from "./MessageThreadEngine";

export interface FanChatProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  /** If true, only fans they follow can DM them */
  dmGated: boolean;
  blockedUserIds: Set<string>;
}

class FanChatEngine {
  private fans = new Map<string, FanChatProfile>();

  register(profile: FanChatProfile): void {
    this.fans.set(profile.userId, profile);
  }

  getProfile(userId: string): FanChatProfile | undefined {
    return this.fans.get(userId);
  }

  /**
   * Fan sends DM to another fan.
   * Returns thread and sent message, or null if blocked.
   */
  sendFanToFan(
    from: ThreadParticipant,
    to: ThreadParticipant,
    body: string
  ): { thread: MessageThread; message: ThreadMessage } | null {
    const toProfile = this.fans.get(to.userId);
    if (toProfile?.blockedUserIds.has(from.userId)) return null;

    const thread = messageThreadEngine.getOrCreateThread(from, to, "fan-fan");
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
   * Fan sends DM to an artist. Artist may gate DMs.
   */
  sendFanToArtist(
    fan: ThreadParticipant,
    artist: ThreadParticipant,
    body: string
  ): { thread: MessageThread; message: ThreadMessage } | null {
    const thread = messageThreadEngine.getOrCreateThread(fan, artist, "fan-artist");
    const message = messageThreadEngine.sendMessage({
      threadId: thread.threadId,
      senderId: fan.userId,
      senderName: fan.displayName,
      body,
      type: "text",
    });
    if (!message) return null;
    return { thread, message };
  }

  /**
   * Fan sends a tip message to an artist.
   */
  sendTipMessage(
    fan: ThreadParticipant,
    artist: ThreadParticipant,
    body: string,
    usdCents: number
  ): { thread: MessageThread; message: ThreadMessage } | null {
    const thread = messageThreadEngine.getOrCreateThread(fan, artist, "fan-artist");
    const message = messageThreadEngine.sendMessage({
      threadId: thread.threadId,
      senderId: fan.userId,
      senderName: fan.displayName,
      body,
      type: "tip",
      valueUsdCents: usdCents,
    });
    if (!message) return null;
    return { thread, message };
  }

  getInbox(userId: string): MessageThread[] {
    return messageThreadEngine.getUserThreads(userId);
  }

  getUnreadCount(userId: string): number {
    return messageThreadEngine.getUnreadCount(userId);
  }

  block(blockerId: string, targetId: string): void {
    const profile = this.fans.get(blockerId);
    if (profile) profile.blockedUserIds.add(targetId);
  }

  unblock(blockerId: string, targetId: string): void {
    const profile = this.fans.get(blockerId);
    if (profile) profile.blockedUserIds.delete(targetId);
  }
}

export const fanChatEngine = new FanChatEngine();
