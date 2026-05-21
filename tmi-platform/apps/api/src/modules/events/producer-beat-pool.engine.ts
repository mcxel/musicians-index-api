import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type BeatPoolType =
  | 'BYOB'
  | 'PLATFORM_POOL'
  | 'PRODUCER_SUBMITTED_POOL'
  | 'AUCTION_WINNER_POOL'
  | 'SPONSORED_POOL'
  | 'RANDOM_POOL';

@Injectable()
export class ProducerBeatPoolEngine {
  constructor(private readonly prisma: PrismaService) {}

  async getPool(poolType: BeatPoolType, limit = 20) {
    const beats = await this.prisma.beat.findMany({
      where: {
        status: { in: ['published', 'active'] },
      },
      orderBy: poolType === 'RANDOM_POOL' ? { createdAt: 'desc' } : { playCount: 'desc' },
      take: limit,
    });

    return beats.map((beat) => ({
      id: beat.id,
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      key: beat.key,
      producerId: beat.producerId,
      license: {
        basicPrice: beat.basicPrice,
        premiumPrice: beat.premiumPrice,
        exclusivePrice: beat.exclusivePrice,
      },
      watermarked: !!beat.taggedUrl,
      exclusiveAvailable: !!beat.exclusivePrice,
      poolType,
    }));
  }

  async selectBeatForEvent(args: { eventId: string; beatId: string; poolType: BeatPoolType; selectedBy: string }) {
    const [event, beat] = await Promise.all([
      this.prisma.event.findUnique({ where: { id: args.eventId } }),
      this.prisma.beat.findUnique({ where: { id: args.beatId } }),
    ]);

    if (!event) throw new NotFoundException('Event not found');
    if (!beat) throw new NotFoundException('Beat not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;

    const updated = {
      ...policy,
      uef: {
        ...uef,
        beatInjection: {
          selectedAt: new Date().toISOString(),
          selectedBy: args.selectedBy,
          poolType: args.poolType,
          beat: {
            id: beat.id,
            title: beat.title,
            bpm: beat.bpm,
            key: beat.key,
            genre: beat.genre,
            producerId: beat.producerId,
            license: {
              basicPrice: beat.basicPrice,
              premiumPrice: beat.premiumPrice,
              exclusivePrice: beat.exclusivePrice,
            },
            watermarked: !!beat.taggedUrl,
            exclusiveAvailable: !!beat.exclusivePrice,
          },
        },
      },
    };

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: { refundPolicy: updated as any },
    });
  }

  async getLiveBeat(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    return (policy.uef ?? {}).beatInjection ?? null;
  }
}
