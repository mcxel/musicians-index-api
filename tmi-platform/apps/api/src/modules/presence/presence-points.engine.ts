import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const XP_RATES: Record<string, { presence: number; retention: number }> = {
  BATTLE: { presence: 10, retention: 2 },
  CYPHER: { presence: 15, retention: 3 },
  SHOW:   { presence: 5,  retention: 1 },
  VENUE:  { presence: 8,  retention: 2 },
  QUIZ:   { presence: 12, retention: 2 },
};

@Injectable()
export class PresencePointsEngine {
  private readonly logger = new Logger(PresencePointsEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  async awardIntervalXP(userId: string, roomId: string, context: string, joinedAt?: Date) {
    const rate = XP_RATES[context] ?? { presence: 5, retention: 1 };

    let streakMultiplier = 1.0;
    if (joinedAt) {
      const minutesActive = (Date.now() - joinedAt.getTime()) / 60000;
      if (minutesActive >= 120) streakMultiplier = 2.0;
      else if (minutesActive >= 60) streakMultiplier = 1.5;
      else if (minutesActive >= 30) streakMultiplier = 1.25;
    }

    const awardedXp = Math.floor(rate.presence * streakMultiplier);
    const awardedRetentionXp = Math.floor(rate.retention * streakMultiplier);
    const totalPoints = awardedXp + awardedRetentionXp;

    await this.prisma.$transaction(async (tx) => {
      // LedgerEntry records the credit (type CREDIT is the schema enum value)
      await tx.ledgerEntry.create({
        data: {
          userId,
          type: 'CREDIT',
          amount: totalPoints,
          description: `Presence XP — ${context} in ${roomId}`,
          relatedId: roomId,
        },
      });

      // Wallet.availableBalance is the correct field (not `balance`)
      await tx.wallet.upsert({
        where: { userId },
        update: { availableBalance: { increment: totalPoints } },
        create: { userId, availableBalance: totalPoints },
      });
    });

    this.logger.debug(`Awarded ${totalPoints}xp to ${userId} for ${context}`);
    return { awardedXp, awardedRetentionXp, streakMultiplier, context };
  }
}
