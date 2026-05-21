import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MomentumDecision = 'PROMOTE_ROOM' | 'BOOST_ROOM' | 'RECOVER_ROOM' | 'HOLD_STEADY';

@Injectable()
export class EventMomentumEngine {
  constructor(private readonly prisma: PrismaService) {}

  evaluateMomentum(input: {
    joinVelocity: number;
    dropVelocity: number;
    audienceGrowthRate: number;
    conversionRate: number;
    retentionRate: number;
  }) {
    const score =
      input.joinVelocity * 0.25 +
      input.audienceGrowthRate * 0.25 +
      input.conversionRate * 0.2 +
      input.retentionRate * 0.2 -
      input.dropVelocity * 0.1;

    let decision: MomentumDecision = 'HOLD_STEADY';
    if (score >= 70) decision = 'PROMOTE_ROOM';
    else if (score < 70 && score >= 40) decision = 'BOOST_ROOM';
    else if (score < 40) decision = 'RECOVER_ROOM';

    return { score, decision };
  }

  async updateEventMomentum(eventId: string, input: {
    joinVelocity: number;
    dropVelocity: number;
    audienceGrowthRate: number;
    conversionRate: number;
    retentionRate: number;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const evaluation = this.evaluateMomentum(input);
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            momentum: {
              ...input,
              ...evaluation,
              evaluatedAt: new Date().toISOString(),
            },
            auditLogs: [
              ...audit,
              {
                action: 'MOMENTUM_EVALUATED',
                at: new Date().toISOString(),
                details: { ...input, ...evaluation },
              },
            ],
          },
        } as any,
      },
    });
  }

  async getEventMomentum(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    return (policy.uef ?? {}).momentum ?? null;
  }

  async getAdminMomentumSnapshot(limit = 50) {
    const events = await this.prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
      take: limit,
      select: { id: true, title: true, startsAt: true, status: true, refundPolicy: true },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      status: event.status,
      momentum: (((event.refundPolicy ?? {}) as Record<string, any>).uef ?? {}).momentum ?? null,
    }));
  }
}
