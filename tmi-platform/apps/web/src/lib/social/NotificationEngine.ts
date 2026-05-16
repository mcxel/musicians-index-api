export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const notificationMap = new Map<string, NotificationItem[]>();

export function pushNotification(userId: string, title: string, body: string): NotificationItem {
  const item: NotificationItem = {
    id: `${userId}:${Date.now()}`,
    userId,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const current = notificationMap.get(userId) ?? [];
  notificationMap.set(userId, [item, ...current]);
  return item;
}

export function listNotifications(userId: string): NotificationItem[] {
  return notificationMap.get(userId) ?? [];
}
