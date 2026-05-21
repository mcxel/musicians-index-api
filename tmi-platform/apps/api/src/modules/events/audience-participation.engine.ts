import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AudienceAction =
  | 'vote'
  | 'tip'
  | 'react'
  | 'gift'
  | 'predict_winner'
  | 'join_waitlist'
  | 'sponsor_contestant'
  | 'bet_points'
  | 'challenge_winner';

@Injectable()
export class AudienceParticipationEngine {
  constructor(private readonly prisma: PrismaService) {}

  async recordAction(args: {
    eventId: string;
    actorId: string;
    action: AudienceAction;
    payload?: Record<string, unknown>;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const points = Number(args.payload?.points ?? 0);
    if (args.action === 'bet_points' && points <= 0) {
      throw new BadRequestException('bet_points requires payload.points > 0');
    }

    if (args.action === 'bet_points') {
      await this.prisma.ledgerEntry.create({
        data: {
          userId: args.actorId,
          type: 'DEBIT',
          amount: points,
          description: 'EVENT_BET_POINTS',
          relatedId: args.eventId,
        },
      });
    }

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const audience = (uef.audience ?? {}) as Record<string, any>;
    const actions = Array.isArray(audience.actions) ? audience.actions : [];

    const entry = {
      actorId: args.actorId,
      action: args.action,
      payload: args.payload ?? {},
      createdAt: new Date().toISOString(),
    };

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            audience: {
              ...audience,
              actions: [...actions, entry],
            },
          },
        } as any,
      },
    });
  }

  async getAudienceSummary(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const actions = (((policy.uef ?? {}).audience ?? {}).actions ?? []) as Array<{ action: AudienceAction }>;
    const breakdown = actions.reduce<Record<string, number>>((acc, action) => {
      acc[action.action] = (acc[action.action] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalActions: actions.length,
      breakdown,
    };
  }
}
