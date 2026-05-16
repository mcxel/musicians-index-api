export type NotificationType =
  | "battle-invite" | "vote-result" | "revenue-hit" | "new-follower"
  | "tip-received" | "nft-sold" | "beat-licensed" | "room-live"
  | "article-published" | "achievement-unlocked" | "season-reward" | "system";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface DashboardNotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

const queues = new Map<string, DashboardNotification[]>();

function gen(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function pushNotification(
  userId: string,
  input: Omit<DashboardNotification, "id" | "userId" | "read" | "createdAt">,
): DashboardNotification {
  const notification: DashboardNotification = {
    id: gen("notif"),
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  const queue = queues.get(userId) ?? [];
  queue.unshift(notification);
  queues.set(userId, queue.slice(0, 100));
  return notification;
}

export function getNotifications(
  userId: string,
  opts: { unreadOnly?: boolean; type?: NotificationType } = {},
): DashboardNotification[] {
  const queue = queues.get(userId) ?? [];
  const now = new Date().toISOString();
  return queue.filter((n) => {
    if (n.expiresAt && n.expiresAt < now) return false;
    if (opts.unreadOnly && n.read) return false;
    if (opts.type && n.type !== opts.type) return false;
    return true;
  });
}

export function markRead(userId: string, notificationId: string): void {
  const queue = queues.get(userId) ?? [];
  const idx = queue.findIndex((n) => n.id === notificationId);
  if (idx >= 0) queue[idx] = { ...queue[idx], read: true };
}

export function markAllRead(userId: string): void {
  const queue = queues.get(userId) ?? [];
  queues.set(userId, queue.map((n) => ({ ...n, read: true })));
}

export function dismissNotification(userId: string, notificationId: string): void {
  const queue = queues.get(userId) ?? [];
  queues.set(userId, queue.filter((n) => n.id !== notificationId));
}

export function getUnreadCount(userId: string): number {
  return (queues.get(userId) ?? []).filter((n) => !n.read).length;
}

export function clearExpired(userId: string): void {
  const now = new Date().toISOString();
  const queue = (queues.get(userId) ?? []).filter((n) => !n.expiresAt || n.expiresAt > now);
  queues.set(userId, queue);
}

export function seedNotifications(userId: string): void {
  pushNotification(userId, { type: "system",           priority: "medium",   title: "Welcome to TMI",        body: "Your dashboard is ready. Explore your hub." });
  pushNotification(userId, { type: "revenue-hit",       priority: "high",     title: "First Revenue Hit",    body: "Congrats — your first tip came in!", ctaLabel: "View Wallet", ctaRoute: "/wallet" });
  pushNotification(userId, { type: "battle-invite",     priority: "critical", title: "Battle Invite",        body: "You've been challenged to a Song Battle!", ctaLabel: "Accept", ctaRoute: "/song-battle" });
}
