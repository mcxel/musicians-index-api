/**
 * PlatformNotificationEngine
 * Platform-wide notification records with unread/read state, badge counts, and archive.
 */

import type { NotificationChannel } from "./NotificationRoutingEngine";

export type PlatformNotificationRecipientType =
  | "fan"
  | "artist"
  | "venue"
  | "sponsor"
  | "merchant"
  | "promoter";

export type PlatformNotification = {
  notificationId: string;
  recipientType: PlatformNotificationRecipientType;
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  eventId?: string;
  eventType?: string;
  category?: string;
  createdAtMs: number;
  readAtMs: number | null;
  archivedAtMs: number | null;
  metadata?: Record<string, string | number | boolean>;
};

const notificationsByUser = new Map<string, PlatformNotification[]>();
let notifCounter = 0;

function key(recipientType: PlatformNotificationRecipientType, recipientId: string): string {
  return `${recipientType}:${recipientId}`;
}

function bucket(recipientType: PlatformNotificationRecipientType, recipientId: string): PlatformNotification[] {
  const k = key(recipientType, recipientId);
  if (!notificationsByUser.has(k)) notificationsByUser.set(k, []);
  return notificationsByUser.get(k)!;
}

export function createPlatformNotification(input: {
  recipientType: PlatformNotificationRecipientType;
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  eventId?: string;
  eventType?: string;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}): PlatformNotification {
  const record: PlatformNotification = {
    notificationId: `plat-notif-${++notifCounter}`,
    recipientType: input.recipientType,
    recipientId: input.recipientId,
    channel: input.channel,
    title: input.title,
    body: input.body,
    eventId: input.eventId,
    eventType: input.eventType,
    category: input.category,
    createdAtMs: Date.now(),
    readAtMs: null,
    archivedAtMs: null,
    metadata: input.metadata,
  };

  const list = bucket(input.recipientType, input.recipientId);
  list.unshift(record);
  if (list.length > 500) list.splice(500);
  return record;
}

export function markNotificationRead(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
  notificationId: string,
): void {
  const notification = bucket(recipientType, recipientId).find((n) => n.notificationId === notificationId);
  if (notification && !notification.readAtMs) notification.readAtMs = Date.now();
}

export function markAllNotificationsRead(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
): void {
  const now = Date.now();
  for (const notif of bucket(recipientType, recipientId)) {
    if (!notif.readAtMs && !notif.archivedAtMs) notif.readAtMs = now;
  }
}

export function archiveNotification(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
  notificationId: string,
): void {
  const notification = bucket(recipientType, recipientId).find((n) => n.notificationId === notificationId);
  if (notification && !notification.archivedAtMs) {
    notification.archivedAtMs = Date.now();
  }
}

export function archiveAllNotifications(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
): void {
  const now = Date.now();
  for (const notif of bucket(recipientType, recipientId)) {
    if (!notif.archivedAtMs) notif.archivedAtMs = now;
  }
}

export function getPlatformNotifications(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
  options?: { unreadOnly?: boolean; includeArchived?: boolean; channel?: NotificationChannel; limit?: number },
): PlatformNotification[] {
  const list = bucket(recipientType, recipientId).filter((n) => {
    if (!options?.includeArchived && n.archivedAtMs) return false;
    if (options?.unreadOnly && !!n.readAtMs) return false;
    if (options?.channel && n.channel !== options.channel) return false;
    return true;
  });

  return list.slice(0, Math.max(1, options?.limit ?? 100));
}

export function getBadgeCount(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
): number {
  return bucket(recipientType, recipientId).filter((n) => !n.readAtMs && !n.archivedAtMs).length;
}

export function getUnreadCountsByChannel(
  recipientType: PlatformNotificationRecipientType,
  recipientId: string,
): Record<NotificationChannel, number> {
  const counts: Record<NotificationChannel, number> = {
    inbox: 0,
    push: 0,
    badge: 0,
    activity: 0,
  };

  for (const notif of bucket(recipientType, recipientId)) {
    if (!notif.readAtMs && !notif.archivedAtMs) counts[notif.channel] += 1;
  }

  return counts;
}
