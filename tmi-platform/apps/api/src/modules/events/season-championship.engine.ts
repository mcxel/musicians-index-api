import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeasonChampionshipEngine {
  constructor(private readonly prisma: PrismaService) {}

  async applyEventResult(args: {
    eventId: string;
    userId: string;
    outcome: 'WIN' | 'LOSS' | 'PARTICIPATION';
    crowns?: number;
    medals?: number;
    streak?: number;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const when = event.startsAt ?? new Date();
    const season = await this.prisma.season.findFirst({
      where: {
        startDate: { lte: when },
        endDate: { gte: when },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!season) {
      return {
        applied: false,
        reason: 'No matching season for event date',
      };
    }

    const points = args.outcome === 'WIN' ? 3 : args.outcome === 'LOSS' ? 1 : 2;

    await this.prisma.rankEntry.upsert({
      where: { seasonId_artistId: { seasonId: season.id, artistId: args.userId } },
      create: {
        seasonId: season.id,
        artistId: args.userId,
        points,
      },
      update: {
        points: { increment: points },
      },
    });

    const awardsToCreate: Array<'CROWN' | 'MEDAL'> = [];
    if ((args.crowns ?? 0) > 0) awardsToCreate.push('CROWN');
    if ((args.medals ?? 0) > 0) awardsToCreate.push('MEDAL');

    if (awardsToCreate.length > 0) {
      await this.prisma.seasonAward.createMany({
        data: awardsToCreate.map((awardType) => ({
          seasonId: season.id,
          artistId: args.userId,
          awardType,
        })),
      });
    }

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const standings = Array.isArray(uef.seasonStandings) ? uef.seasonStandings : [];

    await this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            seasonStandings: [
              ...standings,
              {
                userId: args.userId,
                outcome: args.outcome,
                points,
                crowns: args.crowns ?? 0,
                medals: args.medals ?? 0,
                streak: args.streak ?? 0,
                seasonId: season.id,
                recordedAt: new Date().toISOString(),
              },
            ],
          },
        } as any,
      },
    });

    return {
      applied: true,
      seasonId: season.id,
      points,
    };
  }

  async getSeasonStandings(eventId: string, limit = 25) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const season = await this.prisma.season.findFirst({
      where: {
        startDate: { lte: event.startsAt },
        endDate: { gte: event.startsAt },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!season) return { season: null, standings: [] };

    const standings = await this.prisma.rankEntry.findMany({
      where: { seasonId: season.id },
      orderBy: { points: 'desc' },
      take: limit,
    });

    return {
      season,
      standings,
    };
  }
}
