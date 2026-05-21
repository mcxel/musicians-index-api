import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BeatSubmitDto {
  title: string;
  genre: string;
  bpm: number;
  key?: string;
  tags?: string[];
  basicPrice: number;
  premiumPrice: number;
  exclusivePrice?: number;
  previewUrl?: string;
  taggedUrl?: string;
  battleUsable?: boolean;
  cypherUsable?: boolean;
  enableAuction?: boolean;
}

@Injectable()
export class BeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBeats(filters?: { genre?: string; status?: string }) {
    return this.prisma.beat.findMany({
      where: {
        status: filters?.status ?? 'active',
        ...(filters?.genre ? { genre: filters.genre } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getBeat(id: string) {
    const beat = await this.prisma.beat.findUnique({ where: { id } });
    if (!beat) throw new NotFoundException('Beat not found');
    return beat;
  }

  async submitBeat(producerId: string, dto: BeatSubmitDto) {
    if (!dto.title?.trim()) throw new BadRequestException('Title is required');
    if (!dto.genre?.trim()) throw new BadRequestException('Genre is required');
    if (!dto.bpm || dto.bpm < 40 || dto.bpm > 300) throw new BadRequestException('BPM must be between 40 and 300');
    if (dto.basicPrice < 0) throw new BadRequestException('Price must be non-negative');

    const slug = `${dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;

    const beat = await this.prisma.beat.create({
      data: {
        producerId,
        slug,
        title: dto.title.trim(),
        genre: dto.genre.trim(),
        bpm: Math.round(dto.bpm),
        key: dto.key ?? null,
        tags: dto.tags ?? [],
        basicPrice: Math.round(dto.basicPrice),
        premiumPrice: Math.round(dto.premiumPrice),
        exclusivePrice: dto.exclusivePrice ? Math.round(dto.exclusivePrice) : null,
        previewUrl: dto.previewUrl ?? '',
        taggedUrl: dto.taggedUrl ?? '',
        status: 'pending',
      },
    });

    return { success: true, beatId: beat.id, slug: beat.slug, status: beat.status };
  }

  async approveBeat(beatId: string) {
    const beat = await this.prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) throw new NotFoundException('Beat not found');
    return this.prisma.beat.update({ where: { id: beatId }, data: { status: 'active' } });
  }

  async getProducerBeats(producerId: string) {
    return this.prisma.beat.findMany({
      where: { producerId },
      include: { licenses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProducerStats(producerId: string) {
    const beats = await this.prisma.beat.findMany({
      where: { producerId },
      include: { licenses: true },
    });

    const totalPlays = beats.reduce((a, b) => a + b.playCount, 0);
    const totalLicenses = beats.reduce((a, b) => a + b.licenses.length, 0);
    const totalRevenueCents = beats.reduce(
      (a, b) => a + b.licenses.reduce((la, lic) => la + lic.price, 0),
      0,
    );
    const tmiCutCents = Math.round(totalRevenueCents * 0.30);
    const creatorPayoutCents = totalRevenueCents - tmiCutCents;

    const topBeats = beats
      .map(b => ({
        id: b.id,
        title: b.title,
        plays: b.playCount,
        sales: b.licenses.length,
        revenueCents: b.licenses.reduce((a, l) => a + l.price, 0),
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 5);

    return {
      producerId,
      totalBeats: beats.length,
      totalPlays,
      totalLicenses,
      totalRevenueCents,
      tmiCutCents,
      creatorPayoutCents,
      topBeats,
    };
  }

  async incrementPlayCount(beatId: string) {
    return this.prisma.beat.update({
      where: { id: beatId },
      data: { playCount: { increment: 1 } },
      select: { id: true, playCount: true },
    });
  }
}
