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
}
