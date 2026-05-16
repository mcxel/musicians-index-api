// NOTIFICATION DELIVERY ENGINE — Push & In-App Notifications
// Purpose: Track notification state, delivery, read status, and user preferences
// Ensures timely notification delivery and unread state management

import { randomUUID } from 'crypto';

export type NotificationType = 'friend-request' | 'message' | 'article' | 'reward' | 'venue' | 'battle' | 'system';
export type NotificationStatus = 'pending' | 'delivered' | 'read' | 'archived';
export type DeliveryChannel = 'push' | 'in-app' | 'email';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedUserId?: string;
  relatedEntityId?: string; // article ID, venue ID, etc.
  createdAt: string;
  status: NotificationStatus;
  deliveredAt?: string;
  readAt?: string;
  channels: DeliveryChannel[];
  actionUrl?: string;
}

export interface NotificationPreference {
  userId: string;
  enablePush: boolean;
  enableEmail: boolean;
  muteUntil?: string; // ISO timestamp
  disabledTypes: NotificationType[];
}

export interface NotificationStats {
  userId: string;
  unreadCount: number;
  todayCount: number;
  weekCount: number;
  allTimeCount: number;
}

// Notifications registry (userId → array of notifications)
const NOTIFICATIONS = new Map<string, Notification[]>();

// User preferences
const PREFERENCES = new Map<string, NotificationPreference>();

// Delivery log (notificationId → delivery timestamp)
const DELIVERY_LOG = new Map<string, string>();

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreference = {
  userId: '',
  enablePush: true,
  enableEmail: false,
  disabledTypes: [],
};

export class NotificationDeliveryEngine {
  /**
   * Create and send notification
   */
  static async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    options?: {
      relatedUserId?: string;
      relatedEntityId?: string;
      actionUrl?: string;
      channels?: DeliveryChannel[];
    }
  ): Promise<Notification | null> {
    // Check preferences
    const prefs = await this.getPreferences(userId);
    if (prefs.disabledTypes.includes(type)) {
      return null; // User disabled this notification type
    }

    if (prefs.muteUntil && new Date(prefs.muteUntil) > new Date()) {
      return null; // User has notifications muted
    }

    // Create notification
    const notification: Notification = {
      id: randomUUID(),
      userId,
      type,
      title,
      body,
      relatedUserId: options?.relatedUserId,
      relatedEntityId: options?.relatedEntityId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      channels: options?.channels || ['in-app'],
      actionUrl: options?.actionUrl,
    };

    // Store notification
    if (!NOTIFICATIONS.has(userId)) {
      NOTIFICATIONS.set(userId, []);
    }
    NOTIFICATIONS.get(userId)!.push(notification);

    // Attempt delivery
    await this.deliverNotification(notification);

    return notification;
  }

  /**
   * Deliver notification based on channels and preferences
   */
  private static async deliverNotification(notification: Notification): Promise<void> {
    const prefs = await this.getPreferences(notification.userId);

    // In-app is always delivered
    if (notification.channels.includes('in-app')) {
      notification.status = 'delivered';
      notification.deliveredAt = new Date().toISOString();
      DELIVERY_LOG.set(notification.id, notification.deliveredAt);
    }

    // Push notification (if enabled)
    if (notification.channels.includes('push') && prefs.enablePush) {
      // In production: integrate with FCM, APNs, etc.
      notification.status = 'delivered';
      notification.deliveredAt = new Date().toISOString();
    }

    // Email notification (if enabled)
    if (notification.channels.includes('email') && prefs.enableEmail) {
      // In production: integrate with email service
      // For now, skip email delivery
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notifications = NOTIFICATIONS.get(userId);
    if (!notifications) return;

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && notification.status !== 'read') {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
    }
  }

  /**
   * Mark all as read for user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const notifications = NOTIFICATIONS.get(userId);
    if (!notifications) return;

    const now = new Date().toISOString();
    notifications.forEach((n) => {
      if (n.status !== 'read') {
        n.status = 'read';
        n.readAt = now;
      }
    });
  }

  /**
   * Archive notification
   */
  static async archive(notificationId: string, userId: string): Promise<void> {
    const notifications = NOTIFICATIONS.get(userId);
    if (!notifications) return;

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.status = 'archived';
    }
  }

  /**
   * Get notifications for user (with optional filtering)
   */
  static async getNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    let notifications = NOTIFICATIONS.get(userId) || [];

    if (unreadOnly) {
      notifications = notifications.filter(
        (n) => n.status === 'delivered' || n.status === 'pending'
      );
    }

    // Exclude archived
    notifications = notifications.filter((n) => n.status !== 'archived');

    // Sort by createdAt (newest first)
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return notifications.slice(offset, offset + limit);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const notifications = NOTIFICATIONS.get(userId) || [];
    return notifications.filter(
      (n) => n.status === 'delivered' || n.status === 'pending'
    ).length;
  }

  /**
   * Get notification stats
   */
  static async getStats(userId: string): Promise<NotificationStats> {
    const notifications = NOTIFICATIONS.get(userId) || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const unreadCount = notifications.filter(
      (n) => n.status === 'delivered' || n.status === 'pending'
    ).length;

    const todayCount = notifications.filter(
      (n) => new Date(n.createdAt) >= today && n.status !== 'archived'
    ).length;

    const weekCount = notifications.filter(
      (n) => new Date(n.createdAt) >= weekAgo && n.status !== 'archived'
    ).length;

    const allTimeCount = notifications.filter((n) => n.status !== 'archived').length;

    return { userId, unreadCount, todayCount, weekCount, allTimeCount };
  }

  /**
   * Get or create user preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreference> {
    return PREFERENCES.get(userId) || { ...DEFAULT_PREFERENCES, userId };
  }

  /**
   * Update preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    let prefs = PREFERENCES.get(userId);
    if (!prefs) {
      prefs = { ...DEFAULT_PREFERENCES, userId };
      PREFERENCES.set(userId, prefs);
    }

    if (updates.enablePush !== undefined) prefs.enablePush = updates.enablePush;
    if (updates.enableEmail !== undefined) prefs.enableEmail = updates.enableEmail;
    if (updates.muteUntil !== undefined) prefs.muteUntil = updates.muteUntil;
    if (updates.disabledTypes !== undefined) prefs.disabledTypes = updates.disabledTypes;

    return prefs;
  }

  /**
   * Disable notification type
   */
  static async disableType(userId: string, type: NotificationType): Promise<void> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.disabledTypes.includes(type)) {
      prefs.disabledTypes.push(type);
    }
  }

  /**
   * Enable notification type
   */
  static async enableType(userId: string, type: NotificationType): Promise<void> {
    const prefs = await this.getPreferences(userId);
    prefs.disabledTypes = prefs.disabledTypes.filter((t) => t !== type);
  }

  /**
   * Mute notifications until timestamp
   */
  static async muteUntil(userId: string, until: string): Promise<void> {
    const prefs = await this.getPreferences(userId);
    prefs.muteUntil = until;
  }

  /**
   * Unmute notifications
   */
  static async unmute(userId: string): Promise<void> {
    const prefs = await this.getPreferences(userId);
    prefs.muteUntil = undefined;
  }

  /**
   * Delete notification
   */
  static async delete(notificationId: string, userId: string): Promise<void> {
    const notifications = NOTIFICATIONS.get(userId);
    if (!notifications) return;

    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      notifications.splice(index, 1);
    }
  }

  /**
   * Get notifications by type
   */
  static async getByType(userId: string, type: NotificationType): Promise<Notification[]> {
    const notifications = NOTIFICATIONS.get(userId) || [];
    return notifications
      .filter((n) => n.type === type && n.status !== 'archived')
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export default NotificationDeliveryEngine;
