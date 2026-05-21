import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventCareerLedgerEngine {
  constructor(private readonly prisma: PrismaService) {}

  async recordOutcome(args: {
    eventId: string;
    userId: string;
    outcome: 'entered' | 'won' | 'lost' | 'left_early' | 'timed_out' | 'disqualified';
    votesEarned?: number;
    votesCast?: number;
    tipsEarned?: number;
    followersGained?: number;
    ticketsSold?: number;
    replayViews?: number;
    clipsGenerated?: number;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const snapshot = {
      userId: args.userId,
      outcome: args.outcome,
      votesEarned: args.votesEarned ?? 0,
      votesCast: args.votesCast ?? 0,
      tipsEarned: args.tipsEarned ?? 0,
      followersGained: args.followersGained ?? 0,
      ticketsSold: args.ticketsSold ?? 0,
      replayViews: args.replayViews ?? 0,
      clipsGenerated: args.clipsGenerated ?? 0,
      recordedAt: new Date().toISOString(),
    };

    await this.prisma.artistExposureStats.upsert({
      where: { userId: args.userId },
      create: {
        userId: args.userId,
        totalShows: 1,
        totalViews: snapshot.replayViews,
        totalBookings: args.outcome === 'won' ? 1 : 0,
        lastViewedAt: snapshot.replayViews > 0 ? new Date() : null,
      },
      update: {
        totalShows: { increment: 1 },
        totalViews: { increment: snapshot.replayViews },
        totalBookings: { increment: args.outcome === 'won' ? 1 : 0 },
        lastViewedAt: snapshot.replayViews > 0 ? new Date() : undefined,
      },
    });

    await this.prisma.ledgerEntry.create({
      data: {
        userId: args.userId,
        type: 'CREDIT',
        amount: Math.max(0, (snapshot.votesEarned ?? 0) + (snapshot.tipsEarned ?? 0)),
        description: `EVENT_CAREER:${args.outcome}`,
        relatedId: args.eventId,
      },
    });

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const current = Array.isArray(uef.careerLedger) ? uef.careerLedger : [];

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            careerLedger: [...current, snapshot],
          },
        } as any,
      },
    });
  }

  async getCareerLedger(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    return uef.careerLedger ?? [];
  }
}
