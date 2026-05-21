import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JuliusPointsSnapshot } from './JuliusPointsSnapshots';

type SnapshotExtras = Partial<Omit<JuliusPointsSnapshot, 'userId' | 'totalXp' | 'totalRewardPoints' | 'lastSnapshotAt'>>;

@Injectable()
export class JuliusSnapshotService {
  private readonly logger = new Logger(JuliusSnapshotService.name);

  constructor(private prisma: PrismaService) {}

  public async createSnapshot(
    userId: string,
    totalXp: number,
    totalRewardPoints: number,
    extras: SnapshotExtras = {},
  ) {
    try {
      return await (this.prisma as unknown as Record<string, any>).pointSnapshot.upsert({
        where: { userId },
        create: {
          userId,
          totalXp,
          totalRewardPoints,
          bonusPoints: extras.bonusPoints ?? 0,
          seasonPoints: extras.seasonPoints ?? 0,
          level: extras.level ?? 1,
          actionTotals: extras.actionTotals ?? {},
        },
        update: {
          totalXp,
          totalRewardPoints,
          bonusPoints: extras.bonusPoints ?? 0,
          seasonPoints: extras.seasonPoints ?? 0,
          level: extras.level ?? 1,
          actionTotals: extras.actionTotals ?? {},
          lastSnapshotAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Snapshot save failed for ${userId}`, error);
      return null;
    }
  }

  public async restoreFromSnapshot(userId: string) {
    return await (this.prisma as unknown as Record<string, any>).pointSnapshot
      .findUnique({ where: { userId } })
      .catch(() => null);
  }
}
