import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { status?: string; artistUserId?: string; venueUserId?: string }) {
    return this.prisma.event.findMany({
      where: {
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.artistUserId && { artistUserId: filters.artistUserId }),
        ...(filters?.venueUserId && { venueUserId: filters.venueUserId }),
      },
      include: {
        ticketTypes: true,
        _count: { select: { tickets: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        _count: { select: { tickets: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(data: {
    title: string;
    description?: string;
    startsAt: Date;
    endsAt?: Date;
    timezone?: string;
    venueName?: string;
    venueCity?: string;
    venueState?: string;
    venueCountry?: string;
    artistUserId?: string;
    venueUserId?: string;
  }) {
    return this.prisma.event.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: { ticketTypes: true },
    });
  }

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date;
    status: string;
    venueName: string;
    venueCity: string;
    venueState: string;
    venueCountry: string;
  }>) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: data as any,
      include: { ticketTypes: true },
    });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' as any },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });
  }

  async getUpcoming(limit = 20) {
    return this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED' as any,
        startsAt: { gte: new Date() },
      },
      include: { ticketTypes: true },
      orderBy: { startsAt: 'asc' },
      take: limit,
    });
  }

  async getAdminMomentum(limit = 50) {
    const events = await this.prisma.event.findMany({
      where: { status: { in: ['PUBLISHED', 'STARTED'] as any[] } },
      include: { ticketTypes: true, _count: { select: { tickets: true } } },
      orderBy: { startsAt: 'asc' },
      take: limit,
    });
    return {
      generatedAt: new Date().toISOString(),
      events,
      totalLive: events.filter((e: any) => e.status === 'STARTED').length,
      totalPublished: events.filter((e: any) => e.status === 'PUBLISHED').length,
    };
  }

  async getBeatPool(poolType: 'PLATFORM_POOL' | 'ARTIST_POOL' | 'CURATED', limit = 20) {
    const beats = await this.prisma.beat.findMany({
      where: { status: 'ACTIVE' as any },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return { poolType, beats, count: beats.length };
  }

  async selectBeatForEvent(params: {
    eventId: string;
    beatId: string;
    poolType: string;
    selectedBy: string;
  }) {
    const event = await this.findOne(params.eventId);
    const beat = await this.prisma.beat.findUnique({ where: { id: params.beatId } });
    if (!beat) throw new NotFoundException('Beat not found');
    return {
      success: true,
      eventId: event.id,
      beatId: beat.id,
      beatTitle: beat.title,
      poolType: params.poolType,
      selectedBy: params.selectedBy,
      selectedAt: new Date().toISOString(),
    };
  }

  async getLiveBeat(eventId: string) {
    const event = await this.findOne(eventId);
    const beats = await this.prisma.beat.findMany({
      where: { status: 'ACTIVE' as any },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const beat = beats[0] ?? null;
    return {
      eventId: event.id,
      beat: beat
        ? { id: beat.id, title: beat.title, bpm: beat.bpm, key: beat.key }
        : null,
    };
  }

  getTemplates() {
    return {
      templates: [
        { key: 'cypher.mini',           name: 'Mini Cypher',          description: 'Quick 30-min cypher round', durationMinutes: 30,  maxEntrants: 8  },
        { key: 'cypher.standard',       name: 'Arena Cypher',         description: 'Full 60-min cypher event',  durationMinutes: 60,  maxEntrants: 16 },
        { key: 'battle.mini',           name: 'Mini Battle',          description: '1v1 quick battle',          durationMinutes: 20,  maxEntrants: 2  },
        { key: 'battle.arena',          name: 'Arena Battle',         description: 'Full tournament bracket',   durationMinutes: 120, maxEntrants: 16 },
        { key: 'dirty-dozens.mini',     name: 'Dirty Dozens Mini',    description: 'Rapid-fire dozen round',    durationMinutes: 45,  maxEntrants: 12 },
        { key: 'dirty-dozens.tournament', name: 'Dirty Dozens Full', description: 'Full 12-round tournament',  durationMinutes: 180, maxEntrants: 12 },
        { key: 'comedy.joke-off-mini',  name: 'Joke-Off Mini',        description: 'Short comedy battle',       durationMinutes: 30,  maxEntrants: 4  },
        { key: 'comedy.night',          name: 'Comedy Night',         description: 'Full comedy showcase',      durationMinutes: 90,  maxEntrants: 8  },
        { key: 'dance.mini-off',        name: 'Dance Mini-Off',       description: 'Quick dance battle',        durationMinutes: 20,  maxEntrants: 4  },
        { key: 'dance.night',           name: 'Dance Night',          description: 'Full dance showcase',       durationMinutes: 90,  maxEntrants: 16 },
      ],
    };
  }

  async activateTemplate(params: {
    userId: string;
    templateKey: string;
    startsAt: Date;
    title?: string;
    description?: string;
  }) {
    const templates = this.getTemplates().templates;
    const template = templates.find((t) => t.key === params.templateKey);
    if (!template) throw new NotFoundException(`Template '${params.templateKey}' not found`);

    const endsAt = new Date(params.startsAt.getTime() + template.durationMinutes * 60 * 1000);

    return this.create({
      title: params.title ?? template.name,
      description: params.description ?? template.description,
      startsAt: params.startsAt,
      endsAt,
      artistUserId: params.userId,
    });
  }
}
