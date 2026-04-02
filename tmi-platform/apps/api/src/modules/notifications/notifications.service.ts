import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsProducerService, NotificationJobData } from './notifications.producer.service';

const SESSION_COOKIE = 'phase11_session';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producerService: NotificationsProducerService,
  ) {}

  // =================================================================
  // == PUBLIC API for other services
  // =================================================================

  /**
   * The main entry point for other services to trigger a notification.
   * It adds a job to the queue, and the processor will handle the rest.
   * @param jobData - The data for the notification job.
   */
  async triggerNotification(jobData: NotificationJobData): Promise<void> {
    await this.producerService.addNotificationJob(jobData);
  }

  // =================================================================
  // == API for the NotificationsController (client-facing)
  // =================================================================

  private async resolveUserId(token: string | undefined): Promise<string> {
    if (!token) throw new UnauthorizedException('Missing session token');
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) throw new UnauthorizedException('Invalid or expired session');
    return session.userId;
  }

  async getNotifications(token: string | undefined, limit: number, cursor?: string) {
    const userId = await this.resolveUserId(token);
    // Note: This fetches from the legacy `Notification` table.
    // A future improvement would be to fetch from the new `InAppNotification` table.
    const items = await this.prisma.notification.findMany({
      where: { userId, ...(cursor ? { id: { lt: cursor } } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { items: data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }

  async markAllRead(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    // Note: This updates the legacy `Notification` table.
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  }

  async markRead(token: string | undefined, id: string) {
    const userId = await this.resolveUserId(token);
    // Note: This updates the legacy `Notification` table.
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
    return { success: true };
  }

  async getPreferences(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const preferences = await this.prisma.notificationPreference.findMany({ where: { userId } });
    return { preferences };
  }

  async updatePreferences(token: string | undefined, prefs: Array<{ type: string; channel: string; enabled: boolean }>) {
    const userId = await this.resolveUserId(token);
    // This uses Prisma's transaction API to ensure all preference updates succeed or fail together.
    const updatePromises = prefs.map((p) =>
      this.prisma.notificationPreference.upsert({
        where: { userId_type_channel: { userId, type: p.type, channel: p.channel } },
        update: { enabled: p.enabled },
        create: { userId, type: p.type, channel: p.channel, enabled: p.enabled },
      }),
    );
    await this.prisma.$transaction(updatePromises);
    return { success: true };
  }
}
