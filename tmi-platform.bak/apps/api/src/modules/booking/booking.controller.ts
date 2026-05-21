import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookingService, CreateBookingRequestDto } from './booking.service';
import { BookingRequestStatus } from '@prisma/client';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'booking' };
  }

  /** POST /api/booking — venue creates a booking request */
  @Post()
  createRequest(@Body() dto: CreateBookingRequestDto) {
    return this.bookingService.createRequest(dto);
  }

  /**
   * GET /api/booking?venueUserId=xxx  — list requests created by a venue
   * GET /api/booking?artistUserId=xxx — list offers sent to an artist
   */
  @Get()
  listRequests(
    @Query('venueUserId') venueUserId?: string,
    @Query('artistUserId') artistUserId?: string,
  ) {
    if (venueUserId) return this.bookingService.listRequestsForVenue(venueUserId);
    if (artistUserId) return this.bookingService.listRequestsForArtist(artistUserId);
    return [];
  }

  /** PATCH /api/booking/:id — update status (OPEN | MATCHED | CLOSED | CANCELLED) */
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingRequestStatus,
  ) {
    return this.bookingService.updateStatus(id, status);
  }
}
