/**
 * Shared in-process notification store — used by /api/notifications and tip webhook.
 */

export type NotificationType =
  | "system" | "room_joined" | "room_started" | "battle_result" | "battle_invite"
  | "tip_received" | "tip_sent" | "achievement" | "follower" | "mention"
  | "ticket_confirmed" | "payout" | "subscription" | "magazine_drop"
  | "nft_sale" | "beat_purchase" | "moderation" | "bot_alert";

export interface StoredNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  seen: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

const userNotifications = new Map<string, StoredNotification[]>();

export function getOrInitNotifications(userId: string): StoredNotification[] {
  if (!userNotifications.has(userId)) {
    userNotifications.set(userId, [
      {
        id: `notif-welcome-${userId}`,
        type: "system",
        title: "Welcome to TMI",
        body: "Your account is active. Explore live rooms, join cyphers, and start earning.",
        priority: "medium",
        read: false,
        seen: false,
        ts: Date.now() - 60_000,
        href: "/home/1",
        emoji: "🎵",
      },
    ]);
  }
  return userNotifications.get(userId)!;
}

export function pushStoredNotification(
  userId: string,
  input: Omit<StoredNotification, "id" | "read" | "seen" | "ts"> & { id?: string },
): StoredNotification {
  const store = getOrInitNotifications(userId);
  if (/k1\s*flair/i.test(input.title) || /k1\s*flair/i.test(input.body)) {
    throw new Error("Fixture tip notifications rejected");
  }
  const n: StoredNotification = {
    id: input.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: input.type,
    title: input.title,
    body: input.body,
    priority: input.priority,
    read: false,
    seen: false,
    ts: Date.now(),
    href: input.href,
    emoji: input.emoji,
  };
  store.unshift(n);
  if (store.length > 200) store.length = 200;
  return n;
}

export function clearNotifications(userId: string): void {
  userNotifications.set(userId, []);
}
