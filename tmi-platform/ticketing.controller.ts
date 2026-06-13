import { Controller, Post, Body } from '@nestjs/common';
import { TicketingService } from './ticketing.service';

@Controller('ticketing')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  @Post('checkout')
  async processTicketCheckout(
    @Body() body: { 
      skuId: string; 
      userId: string; 
      tier: 'vip' | 'standard'; 
      price: number;
      seatId?: string;
    }
  ) {
    const { skuId, userId, tier, price, seatId } = body;
    return this.ticketingService.createCheckoutSession(skuId, userId, tier, price, seatId);
  }
}