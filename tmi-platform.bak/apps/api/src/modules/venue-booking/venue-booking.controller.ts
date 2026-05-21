import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VenueBookingService, BookingRequestDto, SendOfferDto } from './venue-booking.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('venue-booking')
@UseGuards(AuthGuard)
export class VenueBookingController {
  constructor(private readonly venueBookingService: VenueBookingService) {}

  /**
   * GET /api/venue-booking/recommendations
   * Venue requests ranked artist recommendations.
   */
  @Post('recommendations')
  async getRecommendations(@Body() request: BookingRequestDto) {
    return this.venueBookingService.getRecommendations(request);
  }

  /**
   * POST /api/venue-booking/offer
   * Venue sends a booking offer to an artist.
   */
  @Post('offer')
  async sendOffer(@Body() offer: SendOfferDto) {
    return this.venueBookingService.sendOffer(offer);
  }

  /**
   * POST /api/venue-booking/offer/:offerId/accept
   * Artist accepts a booking offer.
   */
  @Post('offer/:offerId/accept')
  async acceptOffer(@Param('offerId') offerId: string, @Request() req: any) {
    return this.venueBookingService.acceptOffer(offerId, req.user?.id);
  }

  /**
   * POST /api/venue-booking/offer/:offerId/decline
   * Artist declines a booking offer.
   */
  @Post('offer/:offerId/decline')
  async declineOffer(@Param('offerId') offerId: string, @Request() req: any) {
    return this.venueBookingService.declineOffer(offerId, req.user?.id);
  }

  /**
   * GET /api/venue-booking/venue/:venueId/history
   * Get booking history for a venue.
   */
  @Get('venue/:venueId/history')
  async getVenueHistory(@Param('venueId') venueId: string) {
    return this.venueBookingService.getVenueBookingHistory(venueId);
  }

  /**
   * GET /api/venue-booking/venue/:venueId/offers
   * Get pending offers sent by a venue.
   */
  @Get('venue/:venueId/offers')
  async getVenueOffers(@Param('venueId') venueId: string) {
    return this.venueBookingService.getVenuePendingOffers(venueId);
  }

  /**
   * GET /api/venue-booking/artist/history
   * Get booking history for the authenticated artist.
   */
  @Get('artist/history')
  async getArtistHistory(@Request() req: any) {
    return this.venueBookingService.getArtistBookingHistory(req.user?.id);
  }

  /**
   * GET /api/venue-booking/artist/offers
   * Get pending offers for the authenticated artist.
   */
  @Get('artist/offers')
  async getArtistOffers(@Request() req: any) {
    return this.venueBookingService.getArtistPendingOffers(req.user?.id);
  }

  /**
   * GET /api/venue-booking/admin/exposure-report
   * Admin: get exposure balance analytics.
   */
  @Get('admin/exposure-report')
  async getExposureReport() {
    return this.venueBookingService.getExposureBalanceReport();
  }
}
