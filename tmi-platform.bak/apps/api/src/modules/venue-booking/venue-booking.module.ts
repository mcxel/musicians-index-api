import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VenueBookingController } from './venue-booking.controller';
import { VenueBookingService } from './venue-booking.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [VenueBookingController],
  providers: [VenueBookingService],
  exports: [VenueBookingService],
})
export class VenueBookingModule {}
