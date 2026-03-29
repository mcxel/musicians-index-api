import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_COOKIE = 'phase11_session';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(token: string | undefined): Promise<string> {
    if (!token) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) throw new UnauthorizedException();
    return session.userId;
  }

  async getNotifications(token: string | undefined, limit: number, cursor?: string) {
    const userId = await this.resolveUserId(token);
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
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  }

  async markRead(token: string | undefined, id: string) {
    const userId = await this.resolveUserId(token);
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
    await Promise.all(
      prefs.map((p) =>
        this.prisma.notificationPreference.upsert({
          where: { userId_type_channel: { userId, type: p.type, channel: p.channel } },
          update: { enabled: p.enabled },
          create: { userId, type: p.type, channel: p.channel, enabled: p.enabled },
        }),
      ),
    );
    return { success: true };
  }
}
