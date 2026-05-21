import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JuliusPointAction } from './actions';

export interface LedgerEntry {
  userId: string;
  action: JuliusPointAction;
  xpEarned: number;
  rewardPointsEarned: number;
  bonusPointsEarned?: number;
  seasonPointsEarned?: number;
  contextId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class JuliusLedgerService {
  private readonly logger = new Logger(JuliusLedgerService.name);

  constructor(private prisma: PrismaService) {}

  public async recordTransaction(entry: LedgerEntry): Promise<boolean> {
    try {
      await (this.prisma as unknown as Record<string, any>).pointLedger.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          xpEarned: entry.xpEarned,
          rewardPointsEarned: entry.rewardPointsEarned,
          bonusPointsEarned: entry.bonusPointsEarned ?? 0,
          seasonPointsEarned: entry.seasonPointsEarned ?? 0,
          contextId: entry.contextId,
          metadata: entry.metadata ?? {},
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to record ledger transaction for ${entry.userId}`, error);
      return false;
    }
  }
}