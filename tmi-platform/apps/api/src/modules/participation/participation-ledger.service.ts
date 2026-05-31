import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParticipationLedgerService {
  private readonly logger = new Logger(ParticipationLedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordParticipation(userId: string, actionType: string, points: number, metadata?: Record<string, any>) {
    try {
      const record = await this.prisma.participationLedger.create({
        data: { userId, actionType, points, metadata: metadata || {} },
      });
      this.logger.log(`Participation recorded: User ${userId} earned ${points} pts for ${actionType}`);
      return record;
    } catch (error) {
      this.logger.error(`Failed to record participation for user ${userId}:`, error);
      throw error;
    }
  }

  async getHistory(userId: string, limit = 50) {
    return this.prisma.participationLedger.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getActiveSessions(userId: string) {
    return this.prisma.participationSession.findMany({ where: { userId, active: true } });
  }
}
