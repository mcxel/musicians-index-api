export interface RuntimeNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAtMs: number;
}

export interface NotificationEngine {
  sendNotification(notification: RuntimeNotification): Promise<void>;
  listNotifications(userId: string): Promise<RuntimeNotification[]>;
}
