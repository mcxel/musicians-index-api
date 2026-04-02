import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsEngine {
  private readonly logger = new Logger(AnalyticsEngine.name);

  constructor(private prisma: PrismaService) {}

  // Logs a real-time event from the frontend HUD/Widgets
  // analyticsEvent model is pending schema migration — using any cast until added
  async logEvent(eventType: string, entityId: string, userId?: string, metadata?: any) {
    return (this.prisma as any).analyticsEvent.create({
      data: { eventType, entityId, userId, metadata },
    });
  }

  // Automatically calculates chart rankings every hour
  @Cron(CronExpression.EVERY_HOUR)
  async calculateCharts() {
    this.logger.log('Calculating Global TMI Charts...');

    // analyticsEvent / chartRanking models pending schema migration — using any cast
    const topArtists = await (this.prisma as any).analyticsEvent.groupBy({
      by: ['entityId'],
      where: { eventType: { in: ['VOTE_CAST', 'STREAM_WATCHED'] } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 100,
    });

    let currentRank = 1;
    for (const artist of topArtists) {
      if (!artist.entityId) continue;

      await (this.prisma as any).chartRanking.create({
        data: {
          chartName: 'TOP_OVERALL',
          entityId: artist.entityId,
          rank: currentRank,
          score: artist._count.id * 1.5,
        },
      });
      currentRank++;
    }
    this.logger.log('Chart recalculation complete.');
  }
}