import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JuliusPointsEvents } from '../julius/JuliusPointsEvents';

@Injectable()
export class PresencePointsEngine {
  private readonly logger = new Logger(PresencePointsEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: JuliusPointsEvents,
  ) {}

  /**
   * Invoked via cron or websocket heartbeat every 5 minutes.
   * Enforces the "Universal Engagement Law" - everyone earns for staying.
   */
  async awardPresencePoints(roomId: string, activeUserIds: string[]) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true, type: true },
    });

    if (!room) return;

    for (const userId of activeUserIds) {
      this.events.emitPointEvent({
        userId,
        action: 'ROOM_ATTENDANCE_TIME',
        contextId: roomId,
        metadata: { minutes: 5 }
      });
    }
    
    this.logger.log(`Awarded 5-minute presence points to ${activeUserIds.length} users in room ${roomId}`);
  }
}