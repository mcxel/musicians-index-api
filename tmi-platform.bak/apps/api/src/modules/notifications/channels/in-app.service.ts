import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InAppService {
  constructor(private readonly prisma: PrismaService) {}

  async send(userId: string, title: string, body: string, href?: string) {
    const notification = await this.prisma.inAppNotification.create({
      data: {
        userId,
        title,
        body,
        href,
      },
    });
    // In a real scenario, we might also send a push notification
    // to the client to let it know a new notification is available.
    // This could be done via a WebSocket gateway.
    return notification;
  }
}
