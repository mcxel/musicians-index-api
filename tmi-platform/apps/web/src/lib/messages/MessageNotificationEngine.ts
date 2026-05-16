/**
 * MessageNotificationEngine
 * Unread tracking, push triggers, badge counts, and activity alerts
 * for the messaging layer. Scoped to the DM system only —
 * does NOT touch FanNotificationEngine or room chat.
 */

import { getUnreadCount as getDMUnreadCount } from "./DirectMessageEngine";
import { listConversationsForUser, isConversationMuted } from "./ConversationEngine";

export type MessageAlertType =
  | "new-message"
  | "message-read"
  | "conversation-started"
  | "mention"
  | "reply";

export type MessageNotification = {
  notificationId: string;
  userId: string;
  alertType: MessageAlertType;
  conversationId: string;
  fromUserId: string;
  fromDisplayName: string;
  preview: string;
  createdAtMs: number;
  readAtMs?: number;
  dismissed: boolean;
};

export type MessageBadgeCount = {
  userId: string;
  totalUnread: number;
  unreadByConversation: Record<string, number>;
  hasMentions: boolean;
};

export type PushTrigger = {
  triggerId: string;
  userId: string;
  alertType: MessageAlertType;
  conversationId: string;
  preview: string;
  triggeredAtMs: number;
  delivered: boolean;
};

// --- in-memory stores ---
const notifications: Map<string, MessageNotification[]> = new Map();
const pushQueue: PushTrigger[] = [];
let notifCounter = 0;
let pushCounter = 0;

function getUserNotifications(userId: string): MessageNotification[] {
  if (!notifications.has(userId)) notifications.set(userId, []);
  return notifications.get(userId)!;
}

// --- Write API ---

export function pushMessageNotification(input: {
  userId: string;
  alertType: MessageAlertType;
  conversationId: string;
  fromUserId: string;
  fromDisplayName: string;
  preview: string;
}): MessageNotification {
  const notif: MessageNotification = {
    notificationId: `msg-notif-${++notifCounter}`,
    userId: input.userId,
    alertType: input.alertType,
    conversationId: input.conversationId,
    fromUserId: input.fromUserId,
    fromDisplayName: input.fromDisplayName,
    preview: input.preview.slice(0, 80),
    createdAtMs: Date.now(),
    dismissed: false,
  };

  const list = getUserNotifications(input.userId);
  list.unshift(notif);
  if (list.length > 200) list.splice(200);

  // Queue push trigger (only if not muted)
  if (!isConversationMuted(input.conversationId, input.userId)) {
    pushQueue.push({
      triggerId: `push-${++pushCounter}`,
      userId: input.userId,
      alertType: input.alertType,
      conversationId: input.conversationId,
      preview: notif.preview,
      triggeredAtMs: Date.now(),
      delivered: false,
    });
  }

  return notif;
}

export function markNotificationRead(userId: string, notificationId: string): void {
  const notif = getUserNotifications(userId).find(
    (n) => n.notificationId === notificationId,
  );
  if (notif && !notif.readAtMs) notif.readAtMs = Date.now();
}

export function markAllNotificationsRead(userId: string): void {
  const now = Date.now();
  for (const notif of getUserNotifications(userId)) {
    if (!notif.readAtMs) notif.readAtMs = now;
  }
}

export function dismissNotification(userId: string, notificationId: string): void {
  const notif = getUserNotifications(userId).find(
    (n) => n.notificationId === notificationId,
  );
  if (notif) notif.dismissed = true;
}

export function markPushDelivered(triggerId: string): void {
  const trigger = pushQueue.find((p) => p.triggerId === triggerId);
  if (trigger) trigger.delivered = true;
}

// --- Read API ---

export function getMessageNotifications(
  userId: string,
  unreadOnly = false,
): MessageNotification[] {
  return getUserNotifications(userId).filter((n) => {
    if (n.dismissed) return false;
    if (unreadOnly && n.readAtMs) return false;
    return true;
  });
}

export function getMessageBadgeCount(userId: string): MessageBadgeCount {
  const convos = listConversationsForUser(userId);
  const unreadByConversation: Record<string, number> = {};
  let totalUnread = 0;

  for (const conv of convos) {
    const count = getDMUnreadCount(conv.conversationId, userId);
    if (count > 0) {
      unreadByConversation[conv.conversationId] = count;
      totalUnread += count;
    }
  }

  const hasMentions = getUserNotifications(userId).some(
    (n) => n.alertType === "mention" && !n.readAtMs,
  );

  return {
    userId,
    totalUnread,
    unreadByConversation,
    hasMentions,
  };
}

export function getPendingPushTriggers(userId: string): PushTrigger[] {
  return pushQueue.filter((p) => p.userId === userId && !p.delivered);
}

export function getActivityAlerts(userId: string, limit = 20): MessageNotification[] {
  return getUserNotifications(userId)
    .filter((n) => !n.dismissed && n.alertType !== "message-read")
    .slice(0, Math.max(1, limit));
}
