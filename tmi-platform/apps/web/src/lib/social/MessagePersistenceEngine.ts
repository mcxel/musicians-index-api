// MESSAGE PERSISTENCE ENGINE — DM Storage & Retrieval
// Purpose: Persist direct messages, threads, delivery state, and read receipts
// Ensures DM history is maintained and searchable

import { randomUUID } from 'crypto';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  threadId: string;
  text: string;
  status: MessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  attachments?: string[];
}

export interface MessageThread {
  id: string;
  participant1: string;
  participant2: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount1: number; // unread by participant1
  unreadCount2: number; // unread by participant2
}

export interface ThreadPreview {
  threadId: string;
  otherUserId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline?: boolean;
}

// Messages storage (threadId → array of messages)
const MESSAGES = new Map<string, DirectMessage[]>();

// Message threads registry (threadId → thread)
const THREADS = new Map<string, MessageThread>();

// User thread index (userId → array of threadIds)
const USER_THREADS = new Map<string, string[]>();

function generateThreadId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join(':');
}

export class MessagePersistenceEngine {
  /**
   * Send direct message
   */
  static async sendMessage(
    fromUserId: string,
    toUserId: string,
    text: string,
    attachments?: string[]
  ): Promise<DirectMessage> {
    const threadId = generateThreadId(fromUserId, toUserId);

    // Ensure thread exists
    await this.ensureThread(fromUserId, toUserId);

    const message: DirectMessage = {
      id: randomUUID(),
      fromUserId,
      toUserId,
      threadId,
      text,
      status: 'sent',
      sentAt: new Date().toISOString(),
      attachments,
    };

    // Store message
    if (!MESSAGES.has(threadId)) {
      MESSAGES.set(threadId, []);
    }
    MESSAGES.get(threadId)!.push(message);

    // Update thread
    const thread = THREADS.get(threadId);
    if (thread) {
      thread.lastMessageAt = new Date().toISOString();
      thread.messageCount += 1;
      thread.unreadCount2 += 1; // Mark as unread for recipient
    }

    return message;
  }

  /**
   * Mark message as delivered
   */
  static async markDelivered(messageId: string, threadId: string): Promise<void> {
    const messages = MESSAGES.get(threadId);
    if (!messages) return;

    const message = messages.find((m) => m.id === messageId);
    if (message) {
      message.status = 'delivered';
      message.deliveredAt = new Date().toISOString();
    }
  }

  /**
   * Mark message as read
   */
  static async markRead(messageId: string, threadId: string): Promise<void> {
    const messages = MESSAGES.get(threadId);
    if (!messages) return;

    const message = messages.find((m) => m.id === messageId);
    if (message && message.status !== 'read') {
      message.status = 'read';
      message.readAt = new Date().toISOString();
    }
  }

  /**
   * Mark all messages in thread as read for user
   */
  static async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    const messages = MESSAGES.get(threadId);
    if (!messages) return;

    // Mark all unread messages from other user as read
    messages.forEach((msg) => {
      if (msg.toUserId === userId && msg.status !== 'read') {
        msg.status = 'read';
        msg.readAt = new Date().toISOString();
      }
    });

    // Update thread unread count
    const thread = THREADS.get(threadId);
    if (thread) {
      const [p1, p2] = threadId.split(':');
      if (p1 === userId) {
        thread.unreadCount1 = 0;
      } else {
        thread.unreadCount2 = 0;
      }
    }
  }

  /**
   * Get message thread
   */
  static async getThread(threadId: string): Promise<MessageThread | null> {
    return THREADS.get(threadId) || null;
  }

  /**
   * Get messages in thread (with optional pagination)
   */
  static async getMessages(
    threadId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<DirectMessage[]> {
    const messages = MESSAGES.get(threadId) || [];
    return messages.slice(Math.max(0, messages.length - offset - limit), messages.length - offset);
  }

  /**
   * Get thread preview for user (for inbox list)
   */
  static async getThreadPreview(threadId: string, forUserId: string): Promise<ThreadPreview | null> {
    const thread = THREADS.get(threadId);
    if (!thread) return null;

    const [p1, p2] = threadId.split(':');
    const otherUserId = p1 === forUserId ? p2 : p1;

    const messages = MESSAGES.get(threadId) || [];
    const lastMessage = messages[messages.length - 1];

    const unreadCount = forUserId === p1 ? thread.unreadCount1 : thread.unreadCount2;

    return {
      threadId,
      otherUserId,
      lastMessage: lastMessage?.text || '',
      lastMessageAt: thread.lastMessageAt,
      unreadCount,
    };
  }

  /**
   * Get user's inbox (all threads)
   */
  static async getInbox(userId: string): Promise<ThreadPreview[]> {
    const threadIds = USER_THREADS.get(userId) || [];

    const previews: ThreadPreview[] = [];

    for (const threadId of threadIds) {
      const preview = await this.getThreadPreview(threadId, userId);
      if (preview) {
        previews.push(preview);
      }
    }

    // Sort by lastMessageAt (newest first)
    previews.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return previews;
  }

  /**
   * Edit message
   */
  static async editMessage(messageId: string, threadId: string, newText: string): Promise<void> {
    const messages = MESSAGES.get(threadId);
    if (!messages) return;

    const message = messages.find((m) => m.id === messageId);
    if (message) {
      message.text = newText;
      message.editedAt = new Date().toISOString();
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(messageId: string, threadId: string): Promise<void> {
    const messages = MESSAGES.get(threadId);
    if (!messages) return;

    const index = messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      messages.splice(index, 1);
    }
  }

  /**
   * Search messages in thread
   */
  static async searchInThread(threadId: string, query: string): Promise<DirectMessage[]> {
    const messages = MESSAGES.get(threadId) || [];
    return messages.filter((m) => m.text.toLowerCase().includes(query.toLowerCase()));
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const threadIds = USER_THREADS.get(userId) || [];
    let totalUnread = 0;

    threadIds.forEach((threadId) => {
      const thread = THREADS.get(threadId);
      if (thread) {
        const [p1] = threadId.split(':');
        const unreadCount = p1 === userId ? thread.unreadCount1 : thread.unreadCount2;
        totalUnread += unreadCount;
      }
    });

    return totalUnread;
  }

  /**
   * Ensure thread exists (internal utility)
   */
  private static async ensureThread(userId1: string, userId2: string): Promise<void> {
    const threadId = generateThreadId(userId1, userId2);

    if (!THREADS.has(threadId)) {
      const thread: MessageThread = {
        id: threadId,
        participant1: userId1,
        participant2: userId2,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
        unreadCount1: 0,
        unreadCount2: 0,
      };

      THREADS.set(threadId, thread);
      MESSAGES.set(threadId, []);

      // Index in user threads
      if (!USER_THREADS.has(userId1)) {
        USER_THREADS.set(userId1, []);
      }
      USER_THREADS.get(userId1)!.push(threadId);

      if (!USER_THREADS.has(userId2)) {
        USER_THREADS.set(userId2, []);
      }
      USER_THREADS.get(userId2)!.push(threadId);
    }
  }

  /**
   * Get message count in thread
   */
  static async getMessageCount(threadId: string): Promise<number> {
    const messages = MESSAGES.get(threadId) || [];
    return messages.length;
  }
}

export default MessagePersistenceEngine;
