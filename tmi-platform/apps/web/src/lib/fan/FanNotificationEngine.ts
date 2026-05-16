/**
 * FanNotificationEngine
 * Live event alerts, performer updates, system notifications for fans.
 */

export type FanNotificationType =
  | "show_starting"
  | "show_live"
  | "performer_online"
  | "performer_giveaway"
  | "achievement_unlocked"
  | "reward_available"
  | "season_pass_expiring"
  | "new_beat_drop"
  | "fan_club_update"
  | "system_announcement"
  | "friend_activity";

export type FanNotification = {
  notificationId: string;
  userId: string;
  type: FanNotificationType;
  title: string;
  body: string;
  iconUrl?: string;
  actionUrl?: string;
  createdAtMs: number;
  readAtMs: number | null;
  dismissed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
};

let _notifSeq = 0;

const PRIORITY_MAP: Record<FanNotificationType, FanNotification["priority"]> = {
  show_starting: "urgent",
  show_live: "high",
  performer_online: "medium",
  performer_giveaway: "high",
  achievement_unlocked: "medium",
  reward_available: "medium",
  season_pass_expiring: "high",
  new_beat_drop: "low",
  fan_club_update: "low",
  system_announcement: "medium",
  friend_activity: "low",
};

export class FanNotificationEngine {
  private readonly notifications: Map<string, FanNotification[]> = new Map();
  private readonly listeners: Array<(notif: FanNotification) => void> = [];

  onNotification(listener: (notif: FanNotification) => void): void {
    this.listeners.push(listener);
  }

  private emit(notif: FanNotification): void {
    for (const l of this.listeners) l(notif);
  }

  push(
    userId: string,
    type: FanNotificationType,
    title: string,
    body: string,
    meta?: { iconUrl?: string; actionUrl?: string },
  ): FanNotification {
    const notif: FanNotification = {
      notificationId: `notif-${Date.now()}-${++_notifSeq}`,
      userId,
      type,
      title,
      body,
      iconUrl: meta?.iconUrl,
      actionUrl: meta?.actionUrl,
      createdAtMs: Date.now(),
      readAtMs: null,
      dismissed: false,
      priority: PRIORITY_MAP[type],
    };

    const existing = this.notifications.get(userId) ?? [];
    existing.unshift(notif); // newest first
    // Cap at 100 per user
    if (existing.length > 100) existing.splice(100);
    this.notifications.set(userId, existing);
    this.emit(notif);
    return notif;
  }

  markRead(userId: string, notificationId: string): void {
    const notif = this.notifications.get(userId)?.find((n) => n.notificationId === notificationId);
    if (notif && !notif.readAtMs) notif.readAtMs = Date.now();
  }

  markAllRead(userId: string): void {
    const now = Date.now();
    for (const notif of this.notifications.get(userId) ?? []) {
      if (!notif.readAtMs) notif.readAtMs = now;
    }
  }

  dismiss(userId: string, notificationId: string): void {
    const notif = this.notifications.get(userId)?.find((n) => n.notificationId === notificationId);
    if (notif) notif.dismissed = true;
  }

  getUnread(userId: string): FanNotification[] {
    return (this.notifications.get(userId) ?? []).filter((n) => !n.readAtMs && !n.dismissed);
  }

  getAll(userId: string): FanNotification[] {
    return (this.notifications.get(userId) ?? []).filter((n) => !n.dismissed);
  }

  getUnreadCount(userId: string): number {
    return this.getUnread(userId).length;
  }

  /** Broadcast to many users at once */
  broadcast(userIds: string[], type: FanNotificationType, title: string, body: string): void {
    for (const userId of userIds) {
      this.push(userId, type, title, body);
    }
  }
}

export const fanNotificationEngine = new FanNotificationEngine();
