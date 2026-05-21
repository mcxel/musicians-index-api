import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { publishPlatformEvent } from '../../events/event.producer';
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
    const created = await this.prisma.event.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: { ticketTypes: true },
    });

    await publishPlatformEvent({
      id: randomUUID(),
      type: 'room.created',
      timestamp: new Date().toISOString(),
      userId: data.artistUserId,
      metadata: { eventId: created.id, source: 'events.create' },
    });

    return created;
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
    const existing = await this.findOne(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' as any },
    });

    await publishPlatformEvent({
      id: randomUUID(),
      type: 'room.started',
      timestamp: new Date().toISOString(),
      userId: existing.artistUserId ?? undefined,
      metadata: { eventId: id, source: 'events.publish' },
    });

    return updated;
  }

  async cancel(id: string) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });

    await publishPlatformEvent({
      id: randomUUID(),
      type: 'room.ended',
      timestamp: new Date().toISOString(),
      userId: existing.artistUserId ?? undefined,
      metadata: { eventId: id, source: 'events.cancel' },
    });

    return updated;
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

  async emitTestEvent(body: any) {
    const event = {
      id: randomUUID(),
      type: (body?.type || 'points.awarded') as any,
      timestamp: new Date().toISOString(),
      userId: body?.userId,
      metadata: body?.metadata || { amount: 10 },
    };

    await publishPlatformEvent(event);
    return { ok: true, event };
  }
}
