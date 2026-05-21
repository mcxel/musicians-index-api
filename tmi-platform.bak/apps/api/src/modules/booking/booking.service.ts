import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingRequestStatus } from '@prisma/client';

export interface CreateBookingRequestDto {
  venueProfileId: string;
  venueUserId: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  genres?: string[];
  eventDate: string;
  budgetMin?: number;
  budgetMax?: number;
  eventType?: string;
  note?: string;
}

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(dto: CreateBookingRequestDto) {
    const { venueProfileId, venueUserId, eventDate, latitude, longitude, ...rest } = dto;
    if (!venueProfileId || !venueUserId || !eventDate || latitude === undefined || longitude === undefined) {
      throw new BadRequestException('venueProfileId, venueUserId, eventDate, latitude and longitude are required');
    }
    return this.prisma.bookingRequest.create({
      data: {
        venueProfileId,
        venueUserId,
        latitude,
        longitude,
        eventDate: new Date(eventDate),
        radiusKm: rest.radiusKm ?? 100,
        genres: rest.genres ?? [],
        budgetMin: rest.budgetMin ?? 0,
        budgetMax: rest.budgetMax ?? 0,
        eventType: (rest.eventType as any) ?? 'LOCAL',
        note: rest.note,
        status: 'OPEN',
      },
    });
  }

  async listRequestsForVenue(venueUserId: string) {
    return this.prisma.bookingRequest.findMany({
      where: { venueUserId },
      orderBy: { createdAt: 'desc' },
      include: { offers: { select: { id: true, status: true, artistUserId: true } } },
    });
  }

  async listRequestsForArtist(artistUserId: string) {
    return this.prisma.bookingOffer.findMany({
      where: { artistUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: { id: true, eventDate: true, genres: true, venueProfileId: true, budgetMin: true, budgetMax: true },
        },
      },
    });
  }

  async updateStatus(requestId: string, status: BookingRequestStatus) {
    const allowed: BookingRequestStatus[] = ['OPEN', 'MATCHED', 'CLOSED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const existing = await this.prisma.bookingRequest.findUnique({ where: { id: requestId } });
    if (!existing) throw new NotFoundException(`BookingRequest ${requestId} not found`);
    return this.prisma.bookingRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
}
