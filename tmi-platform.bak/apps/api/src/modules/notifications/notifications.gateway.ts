import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface LiveNotification {
  id: string;
  userId: string;
  type: string; // FRIEND_REQUEST, MESSAGE, ACHIEVEMENT, BOOKING_OFFER, SYSTEM, etc.
  title: string;
  body: string;
  actionUrl?: string;
  meta?: Record<string, unknown>;
  createdAt: number;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // userId -> Set<socketId> (one user can have multiple tabs/devices)
  private userSockets = new Map<string, Set<string>>();

  // socketId -> userId
  private socketUserMap = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Notifications client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUserMap.delete(client.id);
    }
    this.logger.log(`Notifications client disconnected: ${client.id}`);
  }

  @SubscribeMessage('notifications:subscribe')
  handleSubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    // Join a user-specific room for targeted delivery
    client.join(`user:${userId}`);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    this.socketUserMap.set(client.id, userId);

    this.logger.log(`User ${userId} subscribed to notifications (socket: ${client.id})`);
    return { success: true, userId };
  }

  @SubscribeMessage('notifications:unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    client.leave(`user:${userId}`);

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUserMap.delete(client.id);

    return { success: true };
  }

  @SubscribeMessage('notifications:read')
  handleMarkRead(
    @MessageBody() data: { userId: string; notificationId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    // Sync read state across all user's devices
    this.server.to(`user:${data.userId}`).emit('notifications:read:sync', {
      notificationId: data.notificationId,
      readAt: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('notifications:read:all')
  handleMarkAllRead(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(`user:${data.userId}`).emit('notifications:read:all:sync', {
      readAt: Date.now(),
    });
    return { success: true };
  }

  /**
   * Push a live notification to a specific user.
   * Called by NotificationsService when a new notification is created.
   */
  pushToUser(userId: string, notification: LiveNotification) {
    this.server.to(`user:${userId}`).emit('notification:new', {
      ...notification,
      deliveredAt: Date.now(),
    });
    this.logger.debug(`Pushed notification to user ${userId}: ${notification.type}`);
  }

  /**
   * Push a system-wide broadcast notification to all connected users.
   */
  broadcastSystem(notification: Omit<LiveNotification, 'userId'>) {
    this.server.emit('notification:system', {
      ...notification,
      deliveredAt: Date.now(),
    });
    this.logger.log(`System broadcast notification: ${notification.type}`);
  }

  /**
   * Push a notification to multiple users at once (e.g., event reminders).
   */
  pushToUsers(userIds: string[], notification: Omit<LiveNotification, 'userId'>) {
    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit('notification:new', {
        ...notification,
        userId,
        deliveredAt: Date.now(),
      });
    }
  }

  isUserOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
