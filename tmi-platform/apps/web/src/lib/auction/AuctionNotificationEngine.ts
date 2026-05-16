import { randomUUID } from 'crypto';

export type AuctionNotificationType = 'outbid' | 'win' | 'closed' | 'refund';

export interface AuctionNotification {
  id: string;
  userId: string;
  auctionId: string;
  type: AuctionNotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS = new Map<string, AuctionNotification[]>();

export class AuctionNotificationEngine {
  static send(userId: string, auctionId: string, type: AuctionNotificationType, title: string, body: string): AuctionNotification {
    const note: AuctionNotification = {
      id: randomUUID(),
      userId,
      auctionId,
      type,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (!NOTIFICATIONS.has(userId)) NOTIFICATIONS.set(userId, []);
    NOTIFICATIONS.get(userId)!.push(note);
    return note;
  }

  static getUserNotifications(userId: string): AuctionNotification[] {
    return NOTIFICATIONS.get(userId) || [];
  }

  static markRead(userId: string, notificationId: string): boolean {
    const list = NOTIFICATIONS.get(userId) || [];
    const item = list.find((n) => n.id === notificationId);
    if (!item) return false;
    item.read = true;
    return true;
  }
}

export default AuctionNotificationEngine;
