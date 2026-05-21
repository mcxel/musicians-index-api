import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventPromotionEngine {
  constructor(private readonly prisma: PrismaService) {}

  async schedulePromotion(args: {
    eventId: string;
    phase: 'BEFORE' | 'DURING' | 'AFTER';
    channels: Array<'BILLBOARD' | 'HOMEPAGE_SLOT' | 'FAN_NOTIFICATION' | 'MAGAZINE_AD' | 'ARTIST_NOTIFICATION'>;
    message: string;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const promotion = (uef.promotion ?? {}) as Record<string, any>;
    const jobs = Array.isArray(promotion.jobs) ? promotion.jobs : [];
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    const job = {
      phase: args.phase,
      channels: args.channels,
      message: args.message,
      scheduledAt: new Date().toISOString(),
    };

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            promotion: {
              ...promotion,
              jobs: [...jobs, job],
            },
            auditLogs: [
              ...audit,
              {
                action: 'PROMOTION_JOB_SCHEDULED',
                at: new Date().toISOString(),
                details: job,
              },
            ],
          },
        } as any,
      },
    });
  }

  async getPromotionPlan(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    return (((policy.uef ?? {}).promotion ?? {}).jobs ?? []) as Array<Record<string, any>>;
  }
}
