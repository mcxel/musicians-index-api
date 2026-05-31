import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UniversalStatsEngine {
  private readonly logger = new Logger(UniversalStatsEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateFanStats(userId: string) {
    this.logger.log(`Calculating Fan stats for user: ${userId}`);
    const ledgers = await this.prisma.participationLedger.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    const totalPoints = ledgers._sum.points || 0;
    return this.prisma.userStats.upsert({
      where: { userId },
      update: { engagementPoints: totalPoints },
      create: { userId, engagementPoints: totalPoints },
    });
  }

  async getLeaderboard(category: string, limit = 100) {
    return this.prisma.userStats.findMany({
      orderBy: { engagementPoints: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, displayName: true, image: true, role: true } },
      },
    });
  }
}
