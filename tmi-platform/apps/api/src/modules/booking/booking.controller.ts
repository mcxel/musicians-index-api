import { Controller, Get } from '@nestjs/common';
import { BookingService } from './booking.service';

/**
 * BookingController
 * SCAFFOLD: Manages artist booking requests and confirmations.
 */
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'booking' };
  }
}
