import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type JudgeMode = 'BOT' | 'HUMAN' | 'HYBRID';

@Injectable()
export class JudgeEngine {
  constructor(private readonly prisma: PrismaService) {}

  async upsertJudgeConfig(args: {
    eventId: string;
    mode: JudgeMode;
    crowdWeight: number;
    expertWeight: number;
    botWeight: number;
    judges?: Array<{ judgeId: string; type: 'HUMAN' | 'BOT'; weight?: number }>;
  }) {
    const total = args.crowdWeight + args.expertWeight + args.botWeight;
    if (total !== 100) {
      throw new BadRequestException('Judge weights must sum to 100');
    }

    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            judgeEngine: {
              ...args,
              updatedAt: new Date().toISOString(),
            },
            auditLogs: [
              ...audit,
              {
                action: 'JUDGE_CONFIG_UPDATED',
                at: new Date().toISOString(),
                details: args,
              },
            ],
          },
        } as any,
      },
    });
  }

  async scoreSubmission(args: {
    eventId: string;
    contestantId: string;
    crowdScore: number;
    expertScore: number;
    botScore: number;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const judge = (uef.judgeEngine ?? {}) as Record<string, any>;

    const crowdWeight = Number(judge.crowdWeight ?? 50);
    const expertWeight = Number(judge.expertWeight ?? 30);
    const botWeight = Number(judge.botWeight ?? 20);

    const weighted =
      args.crowdScore * (crowdWeight / 100) +
      args.expertScore * (expertWeight / 100) +
      args.botScore * (botWeight / 100);

    const scores = Array.isArray(judge.scores) ? judge.scores : [];
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            judgeEngine: {
              ...judge,
              scores: [
                ...scores,
                {
                  contestantId: args.contestantId,
                  crowdScore: args.crowdScore,
                  expertScore: args.expertScore,
                  botScore: args.botScore,
                  weightedScore: weighted,
                  at: new Date().toISOString(),
                },
              ],
            },
            auditLogs: [
              ...audit,
              {
                action: 'JUDGE_SCORE_RECORDED',
                at: new Date().toISOString(),
                details: {
                  contestantId: args.contestantId,
                  weightedScore: weighted,
                },
              },
            ],
          },
        } as any,
      },
    });
  }
}
