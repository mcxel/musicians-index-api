import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattleService {
  constructor(private readonly prisma: PrismaService) {}

  async getBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');
    return battle;
  }

  async castBattleVote(battleId: string, voterId: string, votedFor: number) {
    if (votedFor !== 1 && votedFor !== 2) {
      throw new BadRequestException('votedFor must be 1 or 2');
    }

    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');

    try {
      const updatedBattle = await this.prisma.$transaction(async (tx) => {
        await tx.battleVote.create({
          data: { battleId, voterId, votedFor },
        });

        return tx.battle.update({
          where: { id: battleId },
          data: votedFor === 1
            ? { voteCount1: { increment: 1 } }
            : { voteCount2: { increment: 1 } },
        });
      });

      return {
        success: true,
        battleId,
        votedFor,
        voteCount1: updatedBattle.voteCount1,
        voteCount2: updatedBattle.voteCount2,
      };
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        throw new ConflictException('You have already voted in this battle');
      }
      throw error;
    }
  }
}
